const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWhisperArgs, normalizeOfflineVoiceSettings } = require('../src/offline-voice.cjs');

test('offline voice restricts runtime and model types', () => {
  assert.equal(normalizeOfflineVoiceSettings({ runtimePath: 'powershell.exe', modelPath: 'x.gguf' }).runtimePath, '');
  const args = buildWhisperArgs({ runtimePath: 'C:\\w\\whisper-cli.exe', modelPath: 'C:\\w\\ggml-small.bin' }, 'C:\\temp\\voice.wav');
  assert.equal(args[0], '-m');
  assert.equal(args[2], '-f');
});
