const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AUDIO_MAX_BYTES,
  audioFilename,
  normalizeApiEndpoint,
  normalizeAudioMimeType,
  parseTranscriptionResponse,
  validateAudioBytes
} = require('../src/audio.cjs');

test('audio endpoints share the configured API base', () => {
  assert.equal(normalizeApiEndpoint('https://api.example.com/v1', 'audio/transcriptions'), 'https://api.example.com/v1/audio/transcriptions');
  assert.equal(normalizeApiEndpoint('https://api.example.com/v1/chat/completions', 'audio/transcriptions'), 'https://api.example.com/v1/audio/transcriptions');
});

test('audio mime types are restricted to supported formats', () => {
  assert.equal(normalizeAudioMimeType('audio/webm;codecs=opus'), 'audio/webm');
  assert.equal(audioFilename('audio/ogg'), 'astra-voice.ogg');
  assert.equal(normalizeAudioMimeType('application/octet-stream'), '');
});

test('audio payload validation rejects empty and oversized recordings', () => {
  assert.throws(() => validateAudioBytes([]), /没有收到录音数据/);
  assert.throws(() => validateAudioBytes(Buffer.alloc(AUDIO_MAX_BYTES + 1)), /录音文件过大/);
  assert.equal(validateAudioBytes([1, 2, 3]).length, 3);
});

test('transcription responses require non-empty text', () => {
  assert.equal(parseTranscriptionResponse({ text: ' 你好 ' }), '你好');
  assert.equal(parseTranscriptionResponse({ transcript: '备用字段' }), '备用字段');
  assert.throws(() => parseTranscriptionResponse({ text: '' }), /没有返回/);
});
