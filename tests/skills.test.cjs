const test = require('node:test');
const assert = require('node:assert/strict');
const { createHistoryEntry, normalizeReminder, sanitizeClipboardText, sanitizeSearchQuery, sanitizeVolume } = require('../src/skills.cjs');
const { parseVolumeOutput, validateVolumeAction } = require('../src/windows-volume.cjs');

test('skill inputs stay inside fixed limits', () => {
  assert.equal(sanitizeVolume(140), 100);
  assert.equal(sanitizeVolume(-5), 0);
  assert.equal(sanitizeSearchQuery('  report*.pdf  '), 'report.pdf');
  assert.equal(sanitizeClipboardText('x'.repeat(25000)).length, 20000);
});

test('reminders produce bounded persistent due times', () => {
  const reminder = normalizeReminder(5, '喝水', 1000);
  assert.equal(reminder.title, '喝水');
  assert.equal(reminder.dueAt, 301000);
});

test('skill history avoids implicit payload storage', () => {
  const entry = createHistoryEntry('clipboard.read', true, { characters: 10 }, new Date('2026-08-17T00:00:00Z'));
  assert.deepEqual(entry, { time: '2026-08-17T00:00:00.000Z', skillId: 'clipboard.read', ok: true, detail: { characters: 10 } });
});

test('volume commands and output are validated', () => {
  assert.equal(validateVolumeAction('toggle'), 'toggle');
  assert.throws(() => validateVolumeAction('shell'), /不支持/);
  assert.deepEqual(parseVolumeOutput('{"volume":42,"muted":false}'), { volume: 42, muted: false });
});
