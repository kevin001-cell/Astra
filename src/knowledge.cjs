const MAX_DOCUMENTS = 80;
const MAX_CHUNKS = 2400;
const MAX_TEXT_CHARACTERS = 2_000_000;

function normalizeKnowledgeStore(value = {}) {
  const documents = Array.isArray(value.documents) ? value.documents.flatMap(item => {
    const id = String(item?.id || '').slice(0, 100);
    const name = String(item?.name || '').trim().slice(0, 160);
    const text = String(item?.text || '').slice(0, MAX_TEXT_CHARACTERS);
    if (!id || !name || !text) return [];
    return [{ id, name, type: String(item.type || 'text').slice(0, 30), text, importedAt: Number(item.importedAt) || Date.now() }];
  }).slice(-MAX_DOCUMENTS) : [];
  return { version: 1, documents };
}

function chunkText(text, size = 900, overlap = 140) {
  const source = String(text || '').replace(/\r/g, '').trim();
  const chunks = [];
  let offset = 0;
  while (offset < source.length && chunks.length < MAX_CHUNKS) {
    let end = Math.min(source.length, offset + size);
    if (end < source.length) {
      const boundary = Math.max(source.lastIndexOf('\n', end), source.lastIndexOf('。', end), source.lastIndexOf('；', end));
      if (boundary > offset + Math.floor(size * .55)) end = boundary + 1;
    }
    chunks.push({ text: source.slice(offset, end).trim(), offset });
    if (end >= source.length) break;
    offset = Math.max(offset + 1, end - overlap);
  }
  return chunks.filter(item => item.text);
}

function queryTerms(value) {
  const text = String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const words = text.split(/\s+/).filter(item => item.length >= 2);
  const chinese = [...text.replace(/[^\p{Script=Han}]/gu, '')];
  for (let index = 0; index < chinese.length - 1; index += 1) words.push(chinese[index] + chinese[index + 1]);
  return [...new Set(words)].slice(0, 40);
}

function searchKnowledge(value, query, limit = 6) {
  const store = normalizeKnowledgeStore(value);
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const results = [];
  for (const document of store.documents) {
    for (const chunk of chunkText(document.text)) {
      const haystack = chunk.text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const occurrences = haystack.split(term).length - 1;
        score += occurrences * (term.length >= 4 ? 3 : 1);
      }
      if (score) results.push({ documentId: document.id, name: document.name, offset: chunk.offset, score, text: chunk.text });
    }
  }
  return results.sort((left, right) => right.score - left.score || left.offset - right.offset).slice(0, Math.max(1, Math.min(12, limit)));
}

function buildKnowledgeContext(results, maximum = 5000) {
  if (!Array.isArray(results) || !results.length) return '';
  const lines = ['以下内容来自用户主动导入的本地知识库。回答时应标明来源文件；找不到答案时明确说明。'];
  results.forEach((item, index) => lines.push(`[来源 ${index + 1}：${item.name}，位置 ${item.offset}]\n${item.text}`));
  return lines.join('\n\n').slice(0, maximum);
}

module.exports = { MAX_DOCUMENTS, buildKnowledgeContext, chunkText, normalizeKnowledgeStore, queryTerms, searchKnowledge };
