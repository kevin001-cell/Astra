const test = require('node:test');
const assert = require('node:assert/strict');
const { buildKnowledgeContext, chunkText, searchKnowledge } = require('../src/knowledge.cjs');

test('knowledge chunks and ranks explicit local documents', () => {
  assert.ok(chunkText('A'.repeat(2000)).length > 1);
  const results = searchKnowledge({ documents: [{ id: '1', name: '说明.md', text: 'Astra 本地知识库不会自动扫描硬盘。用户需要主动导入文件。' }] }, '知识库如何导入');
  assert.equal(results[0].name, '说明.md');
  assert.match(buildKnowledgeContext(results), /来源 1/);
});
