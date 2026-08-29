const SEARCH_PROVIDERS = Object.freeze({
  bocha: { id: 'bocha', label: '博查搜索', endpoint: 'https://api.bochaai.com/v1/web-search' },
  tavily: { id: 'tavily', label: 'Tavily', endpoint: 'https://api.tavily.com/search' }
});
const MAX_SEARCH_RESULTS = 5;
const MAX_SNIPPET_CHARS = 300;
const MAX_TITLE_CHARS = 80;
const MAX_URL_CHARS = 400;
const MAX_QUERY_CHARS = 120;
const MAX_SEARCH_CONTEXT_CHARS = 4000;
const SEARCH_TIMEOUT_MS = 8000;

const SEARCH_INTENT_PATTERN = /(帮我搜|搜索|搜一下|搜一搜|查一下|查查|查询|帮我查|上网查|百度一下|google一下|search\s?(for|the|it)?|look\s?up)/i;

function normalizeSearchSettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const provider = String(source.searchProvider || '').trim().toLowerCase();
  return {
    webSearchEnabled: source.webSearchEnabled === true,
    searchProvider: Object.hasOwn(SEARCH_PROVIDERS, provider) ? provider : 'bocha'
  };
}

function containsSearchIntent(message = '') {
  return SEARCH_INTENT_PATTERN.test(String(message || ''));
}

function buildSearchQuery(message = '') {
  const cleaned = String(message || '')
    .replace(/^(帮我|请|麻烦|麻烦你)?(上网)?(搜索|搜一下|搜一搜|查一下|查查|查询|查找|帮我查)(一下|看看|下)?/g, '')
    .replace(/^(帮我|请)?(search|look\s?up)(\s+(for|the|it))?\s*/gi, '')
    .replace(/^[？?，,。.\s—-]+|[？?，,。.\s—-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, MAX_QUERY_CHARS);
}

function buildProviderRequest(providerId, { query, apiKey, count } = {}) {
  const provider = SEARCH_PROVIDERS[String(providerId)];
  const cleanQuery = String(query || '').trim();
  const cleanKey = String(apiKey || '').trim();
  if (!provider || !cleanQuery || !cleanKey) return null;
  const size = Math.max(1, Math.min(MAX_SEARCH_RESULTS, Number(count) || MAX_SEARCH_RESULTS));
  if (provider.id === 'bocha') {
    return {
      url: provider.endpoint,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleanKey}` },
      body: { query: cleanQuery, freshness: 'noLimit', summary: true, count: size }
    };
  }
  return {
    url: provider.endpoint,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleanKey}` },
    body: { query: cleanQuery, max_results: size, search_depth: 'basic' }
  };
}

function parseProviderResponse(providerId, data) {
  const payload = data && typeof data === 'object' ? data : {};
  let raw = [];
  if (String(providerId) === 'bocha') raw = payload?.data?.webPages?.value;
  else if (String(providerId) === 'tavily') raw = payload.results;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap(item => {
    const title = String(item?.name || item?.title || '').trim();
    const url = String(item?.url || '').trim();
    const snippet = String(item?.summary || item?.snippet || item?.content || '').trim();
    if (!title || !url) return [];
    return [{ title, url, snippet }];
  });
}

function normalizeSearchResults(results) {
  if (!Array.isArray(results)) return [];
  const seen = new Set();
  const normalized = [];
  for (const item of results) {
    const title = String(item?.title || '').trim().slice(0, MAX_TITLE_CHARS);
    const url = String(item?.url || '').trim().slice(0, MAX_URL_CHARS);
    const snippet = String(item?.snippet || '').trim().slice(0, MAX_SNIPPET_CHARS);
    if (!title || !url || seen.has(url)) continue;
    seen.add(url);
    normalized.push({ title, url, snippet });
    if (normalized.length >= MAX_SEARCH_RESULTS) break;
  }
  return normalized;
}

function buildSearchContext(results, maximum = MAX_SEARCH_CONTEXT_CHARS) {
  if (!Array.isArray(results) || !results.length) return '';
  const lines = ['以下内容来自联网搜索，可能不完整或过期。回答时应参考这些结果并注明来源编号；与结果矛盾时明确说明。'];
  results.forEach((item, index) => lines.push(`[来源 ${index + 1}：${item.title}]\n${item.snippet || item.url}`));
  return lines.join('\n\n').slice(0, Math.max(1, maximum));
}

function buildSourceFootnote(results) {
  if (!Array.isArray(results) || !results.length) return '';
  const lines = results.map((item, index) => `${index + 1}. ${item.title} ${item.url}`);
  return `来源：\n${lines.join('\n')}`;
}

function classifyNetworkError(error) {
  const code = String(error?.code || '').toUpperCase();
  const name = String(error?.name || '');
  const message = String(error?.message || '').toLowerCase();
  if (name === 'TimeoutError' || name === 'AbortError' || message.includes('timeout') || message.includes('aborted')) return '联网搜索超时，请检查网络后重试。';
  if (['ENOTFOUND', 'EAI_AGAIN', 'ENOTCONN'].includes(code) || message.includes('getaddrinfo')) return '无法解析搜索服务地址，请检查网络或代理设置。';
  if (['ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT'].includes(code)) return '无法连接搜索服务，请检查网络或代理设置。';
  if (message.includes('socket hang up') || message.includes('network') || message.includes('fetch failed')) return '网络连接中断，请检查网络或代理设置。';
  if (message.includes('certificate') || message.includes('ssl') || message.includes('tls')) return '搜索服务证书校验失败，请检查系统时间或代理。';
  return `联网搜索失败：${String(error?.message || '未知网络错误').slice(0, 160)}`;
}

async function searchWeb({ providerId, apiKey, query, count } = {}, fetchImpl = fetch) {
  const request = buildProviderRequest(providerId, { query, apiKey, count });
  if (!request) return { results: [], error: '联网搜索未配置完整，请检查服务商和 API Key 设置。' };
  try {
    const response = await fetchImpl(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body),
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS)
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { results: [], error: `搜索服务返回 ${response.status}：${detail.slice(0, 160) || '请确认 API Key 是否有效。'}` };
    }
    const data = await response.json().catch(() => null);
    return { results: normalizeSearchResults(parseProviderResponse(providerId, data)), error: '' };
  } catch (error) {
    return { results: [], error: classifyNetworkError(error) };
  }
}

module.exports = {
  SEARCH_PROVIDERS,
  SEARCH_TIMEOUT_MS,
  MAX_SEARCH_RESULTS,
  MAX_SNIPPET_CHARS,
  MAX_QUERY_CHARS,
  MAX_SEARCH_CONTEXT_CHARS,
  normalizeSearchSettings,
  containsSearchIntent,
  buildSearchQuery,
  buildProviderRequest,
  parseProviderResponse,
  normalizeSearchResults,
  buildSearchContext,
  buildSourceFootnote,
  classifyNetworkError,
  searchWeb
};
