const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SEARCH_PROVIDERS,
  SEARCH_TIMEOUT_MS,
  MAX_SEARCH_RESULTS,
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
} = require('../src/web-search.cjs');

test('search settings normalize to fixed provider whitelist and default off', () => {
  assert.deepEqual(normalizeSearchSettings({}), { webSearchEnabled: false, searchProvider: 'bocha' });
  assert.equal(normalizeSearchSettings({ webSearchEnabled: true, searchProvider: 'tavily' }).searchProvider, 'tavily');
  assert.equal(normalizeSearchSettings({ webSearchEnabled: 'yes', searchProvider: 'google' }).webSearchEnabled, false);
  assert.equal(normalizeSearchSettings({ searchProvider: 'google' }).searchProvider, 'bocha');
  assert.ok(SEARCH_PROVIDERS.bocha.endpoint.startsWith('https://'));
  assert.ok(SEARCH_PROVIDERS.tavily.endpoint.startsWith('https://'));
  assert.ok(SEARCH_TIMEOUT_MS >= 4000 && SEARCH_TIMEOUT_MS <= 30000);
  assert.equal(MAX_SEARCH_RESULTS, 5);
});

test('search intent only triggers on explicit search wording', () => {
  assert.equal(containsSearchIntent('帮我搜索今天的新闻'), true);
  assert.equal(containsSearchIntent('搜一下附近的咖啡店'), true);
  assert.equal(containsSearchIntent('查一下天气'), true);
  assert.equal(containsSearchIntent('search for qwen3 release'), true);
  assert.equal(containsSearchIntent('你好'), false);
  assert.equal(containsSearchIntent('打开记事本'), false);
  assert.equal(containsSearchIntent(''), false);
});

test('search query strips trigger wording and clamps length', () => {
  assert.equal(buildSearchQuery('帮我搜索一下Qwen3 最新版本'), 'Qwen3 最新版本');
  assert.equal(buildSearchQuery('查一下天气'), '天气');
  assert.equal(buildSearchQuery('搜索'), '');
  assert.equal(buildSearchQuery('你好'), '你好');
  assert.ok(buildSearchQuery(`搜索${'A'.repeat(300)}`.slice(2)).length <= 120);
});

test('provider request uses fixed endpoint and bearer key', () => {
  const bocha = buildProviderRequest('bocha', { query: '天气', apiKey: 'k1', count: MAX_SEARCH_RESULTS });
  assert.equal(bocha.url, SEARCH_PROVIDERS.bocha.endpoint);
  assert.equal(bocha.headers.Authorization, 'Bearer k1');
  assert.equal(bocha.body.query, '天气');
  assert.equal(bocha.body.count, MAX_SEARCH_RESULTS);
  assert.equal(bocha.body.summary, true);

  const tavily = buildProviderRequest('tavily', { query: '天气', apiKey: 'k2', count: MAX_SEARCH_RESULTS });
  assert.equal(tavily.url, SEARCH_PROVIDERS.tavily.endpoint);
  assert.equal(tavily.headers.Authorization, 'Bearer k2');
  assert.equal(tavily.body.max_results, MAX_SEARCH_RESULTS);

  assert.equal(buildProviderRequest('bocha', { query: '', apiKey: 'k1' }), null);
  assert.equal(buildProviderRequest('bocha', { query: '天气', apiKey: '' }), null);
  assert.equal(buildProviderRequest('google', { query: '天气', apiKey: 'k1' }), null);
});

test('provider response parses bocha and tavily shapes into normalized results', () => {
  const bocha = parseProviderResponse('bocha', {
    data: { webPages: { value: [{ name: 'Astra 官网', url: 'https://astra.example.com', snippet: '短摘要', summary: '完整摘要' }] } }
  });
  assert.equal(bocha.length, 1);
  assert.equal(bocha[0].title, 'Astra 官网');
  assert.equal(bocha[0].snippet, '完整摘要');

  const tavily = parseProviderResponse('tavily', {
    results: [{ title: 'Tavily 结果', url: 'https://t.example.com', content: '正文内容' }]
  });
  assert.equal(tavily[0].snippet, '正文内容');

  assert.deepEqual(parseProviderResponse('bocha', {}), []);
  assert.deepEqual(parseProviderResponse('bocha', null), []);
  assert.deepEqual(parseProviderResponse('unknown', { results: [{ title: 'x', url: 'y' }] }), []);
});

test('search results are capped, truncated and deduplicated', () => {
  const many = Array.from({ length: 9 }, (_, index) => ({
    title: `结果${index}`,
    url: index % 2 ? 'https://same.example.com' : `https://site-${index}.example.com`,
    snippet: 'B'.repeat(500)
  }));
  const normalized = normalizeSearchResults(many);
  assert.equal(normalized.length, MAX_SEARCH_RESULTS);
  assert.ok(normalized.every(item => item.snippet.length <= 300));
  const urls = normalized.map(item => item.url);
  assert.equal(new Set(urls).size, urls.length, 'duplicate urls should be removed');
  assert.deepEqual(normalizeSearchResults([{ title: '', url: '', snippet: 'x' }]), []);
  assert.deepEqual(normalizeSearchResults('bad'), []);
});

test('search context mirrors knowledge style and clamps size', () => {
  assert.equal(buildSearchContext([]), '');
  const context = buildSearchContext([{ title: '新闻', url: 'https://n.example.com', snippet: '今天发生了什么' }]);
  assert.match(context, /以下内容来自联网搜索/);
  assert.match(context, /\[来源 1：新闻\]/);
  assert.match(context, /今天发生了什么/);
  assert.ok(buildSearchContext([{ title: 't', url: 'https://n.example.com', snippet: 'x' }], 40).length <= 40);
});

test('source footnote lists numbered plain-text sources', () => {
  assert.equal(buildSourceFootnote([]), '');
  const footnote = buildSourceFootnote([
    { title: '新闻', url: 'https://n.example.com', snippet: 'x' },
    { title: '另一篇', url: 'https://m.example.com', snippet: 'y' }
  ]);
  assert.match(footnote, /^来源：/);
  assert.match(footnote, /1\. 新闻 https:\/\/n\.example\.com/);
  assert.match(footnote, /2\. 另一篇 https:\/\/m\.example\.com/);
});

test('network errors classify into actionable hints', () => {
  assert.match(classifyNetworkError({ name: 'TimeoutError' }), /超时/);
  assert.match(classifyNetworkError({ code: 'ENOTFOUND' }), /解析|DNS/);
  assert.match(classifyNetworkError({ code: 'ECONNREFUSED' }), /连接/);
  assert.match(classifyNetworkError(new Error('unable to verify the first certificate')), /证书/);
  assert.match(classifyNetworkError(new Error('socket hang up')), /网络/);
});

test('searchWeb returns normalized results with injected fetch', async () => {
  const fetchOk = async () => ({
    ok: true,
    json: async () => ({ data: { webPages: { value: [{ name: '结果', url: 'https://r.example.com', snippet: '内容' }] } } })
  });
  const ok = await searchWeb({ providerId: 'bocha', apiKey: 'k1', query: 'Astra' }, fetchOk);
  assert.equal(ok.error, '');
  assert.equal(ok.results.length, 1);
  assert.equal(ok.results[0].url, 'https://r.example.com');

  const fetchUnauthorized = async () => ({ ok: false, status: 401, text: async () => 'invalid key' });
  const denied = await searchWeb({ providerId: 'bocha', apiKey: 'bad', query: 'Astra' }, fetchUnauthorized);
  assert.equal(denied.results.length, 0);
  assert.match(denied.error, /401|Key/i);

  const fetchDns = async () => { const error = new Error('getaddrinfo failed'); error.code = 'ENOTFOUND'; throw error; };
  const offline = await searchWeb({ providerId: 'bocha', apiKey: 'k1', query: 'Astra' }, fetchDns);
  assert.deepEqual(offline.results, []);
  assert.match(offline.error, /解析|DNS/);

  const fetchBadPayload = async () => ({ ok: true, json: async () => ({}) });
  const empty = await searchWeb({ providerId: 'bocha', apiKey: 'k1', query: 'Astra' }, fetchBadPayload);
  assert.equal(empty.error, '');
  assert.deepEqual(empty.results, []);
});
