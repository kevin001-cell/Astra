const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_RESTORE_SHORTCUT,
  buildRelaunchArgs,
  clampWindowPositionToWorkArea,
  getSafeModeChromiumSwitches,
  getRestoreShortcutCandidates,
  redactSensitive,
  sanitizeRestoreShortcut
} = require('../src/stability.cjs');

test('invalid restore shortcuts fall back safely', () => {
  assert.equal(sanitizeRestoreShortcut('Ctrl+Q'), DEFAULT_RESTORE_SHORTCUT);
  assert.equal(sanitizeRestoreShortcut('Alt+Shift+A'), 'Alt+Shift+A');
});

test('configured shortcut is first and emergency shortcuts remain available', () => {
  const shortcuts = getRestoreShortcutCandidates('CommandOrControl+Alt+A');
  assert.equal(shortcuts[0], 'CommandOrControl+Alt+A');
  assert.ok(shortcuts.includes(DEFAULT_RESTORE_SHORTCUT));
  assert.equal(new Set(shortcuts).size, shortcuts.length);
});

test('safe-mode relaunch arguments never duplicate mode flags', () => {
  assert.deepEqual(
    buildRelaunchArgs(['app.asar', '--safe-mode', '--normal-mode'], true),
    ['app.asar', '--safe-mode']
  );
  assert.deepEqual(buildRelaunchArgs(['app.asar', '--safe-mode'], false), ['app.asar']);
});

test('safe mode uses a fixed Chromium switch allowlist', () => {
  assert.deepEqual(getSafeModeChromiumSwitches(), ['disable-gpu', 'disable-gpu-compositing']);
  assert.doesNotMatch(getSafeModeChromiumSwitches().join(' '), /sandbox|remote-debugging|command/i);
});

test('window dragging stays inside negative and positive monitor work areas', () => {
  assert.deepEqual(
    clampWindowPositionToWorkArea({ x: -3000, y: -200 }, { width: 430, height: 690 }, { x: -1920, y: 0, width: 1920, height: 1040 }),
    { x: -1920, y: 0 }
  );
  assert.deepEqual(
    clampWindowPositionToWorkArea({ x: 5000, y: 2000 }, { width: 430, height: 690 }, { x: 1920, y: 0, width: 2560, height: 1400 }),
    { x: 4050, y: 710 }
  );
});

test('diagnostic data redacts common secrets', () => {
  const redacted = redactSensitive({
    apiKey: 'secret-key',
    nested: { Authorization: 'Bearer token-value' },
    message: 'Authorization: Bearer another-token'
  });
  assert.equal(redacted.apiKey, '[REDACTED]');
  assert.equal(redacted.nested.Authorization, '[REDACTED]');
  assert.doesNotMatch(redacted.message, /another-token/);
});
