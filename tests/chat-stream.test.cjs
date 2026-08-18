const test = require('node:test');
const assert = require('node:assert/strict');
const { createSseParser, streamDelta, streamMetrics } = require('../src/chat-stream.cjs');

test('SSE parser keeps split chunks and emits complete data blocks', () => {
  const events = [];
  const parser = createSseParser(value => events.push(value));
  parser.push('data: {"choices":[{"delta":{"content":"你');
  parser.push('好"}}]}\n\ndata: [DONE]\n\n');
  assert.equal(events.length, 2);
  assert.equal(streamDelta(JSON.parse(events[0])), '你好');
  assert.equal(events[1], '[DONE]');
});

test('stream metrics prefer server usage and stay bounded', () => {
  const metrics = streamMetrics({ usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }, timings: { predicted_per_second: 12.34 } }, 1000, 1200, 4096, '回答');
  assert.equal(metrics.firstTokenMs, 200);
  assert.equal(metrics.tokensPerSecond, 12.3);
  assert.equal(metrics.contextTokens, 15);
  assert.equal(metrics.contextSize, 4096);
});
