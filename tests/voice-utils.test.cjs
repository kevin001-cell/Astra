const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateVoiceLevel, voiceStopReason } = require('../app/voice-utils.js');

test('voice level stays normalized', () => {
  assert.deepEqual(calculateVoiceLevel(new Uint8Array([128, 128])), { rms: 0, level: 0 });
  const loud = calculateVoiceLevel(new Uint8Array([0, 255, 0, 255]));
  assert.ok(loud.rms > 0.9);
  assert.equal(loud.level, 1);
});

test('voice activity stops on limits and post-speech silence', () => {
  assert.equal(voiceStopReason({ now: 30000, startedAt: 0 }), 'limit');
  assert.equal(voiceStopReason({ now: 2500, startedAt: 0, heardVoice: true, lastVoiceAt: 1200 }), 'silence');
  assert.equal(voiceStopReason({ now: 800, startedAt: 0, heardVoice: true, lastVoiceAt: 0 }), '');
});
