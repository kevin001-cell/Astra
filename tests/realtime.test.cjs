const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildRealtimeSession,
  normalizeRealtimeEndpoint,
  realtimeReconnectDelay,
  sanitizeRealtimeIdleMinutes,
  sanitizeRealtimeMaxMinutes,
  sanitizeRealtimeModel,
  sanitizeRealtimeRuntimeStatus,
  sanitizeRealtimeVadMode,
  sanitizeRealtimeVoice,
  validateOfferSdp
} = require('../src/realtime.cjs');

test('realtime endpoint shares the configured API base', () => {
  assert.equal(normalizeRealtimeEndpoint('https://api.openai.com/v1'), 'https://api.openai.com/v1/realtime/calls');
  assert.equal(normalizeRealtimeEndpoint('https://api.openai.com/v1/chat/completions'), 'https://api.openai.com/v1/realtime/calls');
  assert.equal(normalizeRealtimeEndpoint('https://api.openai.com/v1/realtime/calls'), 'https://api.openai.com/v1/realtime/calls');
});

test('realtime settings are restricted to supported values', () => {
  assert.equal(sanitizeRealtimeModel('arbitrary-model'), 'gpt-realtime');
  assert.equal(sanitizeRealtimeVoice('unknown'), 'marin');
  assert.equal(sanitizeRealtimeVadMode('instant'), 'natural');
});

test('realtime session enables audio, transcription, VAD and interruption', () => {
  const session = buildRealtimeSession({
    realtimeModel: 'gpt-realtime-mini',
    realtimeVoice: 'cedar',
    realtimeVadMode: 'fast',
    transcriptionModel: 'gpt-4o-mini-transcribe'
  }, '保持简洁。');
  assert.equal(session.type, 'realtime');
  assert.equal(session.model, 'gpt-realtime-mini');
  assert.deepEqual(session.output_modalities, ['audio']);
  assert.equal(session.audio.input.transcription.language, 'zh');
  assert.equal(session.audio.input.turn_detection.eagerness, 'high');
  assert.equal(session.audio.input.turn_detection.interrupt_response, true);
  assert.equal(session.audio.output.voice, 'cedar');
});

test('offer SDP must contain an audio media section', () => {
  const valid = 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n';
  assert.equal(validateOfferSdp(valid), valid);
  assert.throws(() => validateOfferSdp('v=0\r\ns=-\r\n'), /有效/);
});

test('stability limits use bounded values and backoff', () => {
  assert.equal(sanitizeRealtimeIdleMinutes(5), 5);
  assert.equal(sanitizeRealtimeIdleMinutes(99), 10);
  assert.equal(sanitizeRealtimeMaxMinutes(60), 60);
  assert.equal(sanitizeRealtimeMaxMinutes(0), 30);
  assert.deepEqual([1, 2, 3, 9].map(realtimeReconnectDelay), [1000, 3000, 7000, 7000]);
});

test('runtime diagnostics exclude arbitrary fields and bound errors', () => {
  const status = sanitizeRealtimeRuntimeStatus({
    state: 'reconnecting',
    reconnectAttempts: 99,
    handshakeMs: 999999,
    lastError: `network\n${'x'.repeat(300)}`,
    transcript: 'must not be retained'
  });
  assert.equal(status.state, 'reconnecting');
  assert.equal(status.reconnectAttempts, 3);
  assert.equal(status.handshakeMs, 60000);
  assert.equal(status.lastError.includes('\n'), false);
  assert.equal('transcript' in status, false);
});
