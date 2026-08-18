function createSseParser(onEvent) {
  let buffer = '';
  return {
    push(value) {
      buffer += String(value || '').replace(/\r\n/g, '\n');
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';
      for (const block of blocks) {
        const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (data) onEvent(data);
      }
    },
    finish() {
      const data = buffer.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
      buffer = '';
      if (data) onEvent(data);
    }
  };
}

function streamDelta(value) {
  const delta = value?.choices?.[0]?.delta?.content;
  if (typeof delta === 'string') return delta;
  if (Array.isArray(delta)) return delta.map(item => typeof item === 'string' ? item : item?.text || '').join('');
  return '';
}

function streamMetrics(value, startedAt, firstTokenAt, contextSize, text = '') {
  const usage = value?.usage || {};
  const timings = value?.timings || {};
  const completionTokens = Number(usage.completion_tokens || timings.predicted_n || Math.ceil(String(text || '').length / 2));
  const promptTokens = Number(usage.prompt_tokens || timings.prompt_n || 0);
  const elapsedSeconds = Math.max(0.001, (Date.now() - Number(firstTokenAt || startedAt || Date.now())) / 1000);
  const predictedPerSecond = Number(timings.predicted_per_second || 0);
  return {
    firstTokenMs: firstTokenAt ? Math.max(0, firstTokenAt - startedAt) : 0,
    tokensPerSecond: Math.round((predictedPerSecond || completionTokens / elapsedSeconds) * 10) / 10,
    promptTokens,
    completionTokens,
    contextTokens: Number(usage.total_tokens || promptTokens + completionTokens || Math.ceil(String(text || '').length / 2)),
    contextSize: Number(contextSize || 0)
  };
}

module.exports = { createSseParser, streamDelta, streamMetrics };
