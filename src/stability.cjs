const DEFAULT_RESTORE_SHORTCUT = 'CommandOrControl+Shift+Space';
const EMERGENCY_RESTORE_SHORTCUTS = [
  DEFAULT_RESTORE_SHORTCUT,
  'CommandOrControl+Alt+Space',
  'Alt+Shift+A'
];
const ALLOWED_RESTORE_SHORTCUTS = [
  ...EMERGENCY_RESTORE_SHORTCUTS,
  'CommandOrControl+Shift+A',
  'CommandOrControl+Alt+A'
];
const SAFE_MODE_CHROMIUM_SWITCHES = ['disable-gpu', 'disable-gpu-compositing'];

function sanitizeRestoreShortcut(value) {
  return ALLOWED_RESTORE_SHORTCUTS.includes(value) ? value : DEFAULT_RESTORE_SHORTCUT;
}

function getRestoreShortcutCandidates(value) {
  return [...new Set([sanitizeRestoreShortcut(value), ...EMERGENCY_RESTORE_SHORTCUTS])];
}

function formatShortcutLabel(value) {
  return String(value || '')
    .replace('CommandOrControl', 'Ctrl')
    .replaceAll('+', ' + ');
}

function buildRelaunchArgs(argv, safeMode) {
  const args = Array.isArray(argv) ? argv.filter(arg => arg !== '--safe-mode' && arg !== '--normal-mode') : [];
  if (safeMode) args.push('--safe-mode');
  return args;
}

function getSafeModeChromiumSwitches() {
  return [...SAFE_MODE_CHROMIUM_SWITCHES];
}

function clampWindowPositionToWorkArea(position = {}, size = {}, workArea = {}) {
  const areaX = Number.isFinite(Number(workArea.x)) ? Math.round(Number(workArea.x)) : 0;
  const areaY = Number.isFinite(Number(workArea.y)) ? Math.round(Number(workArea.y)) : 0;
  const areaWidth = Math.max(1, Math.round(Number(workArea.width) || 1));
  const areaHeight = Math.max(1, Math.round(Number(workArea.height) || 1));
  const width = Math.max(1, Math.round(Number(size.width) || 1));
  const height = Math.max(1, Math.round(Number(size.height) || 1));
  const x = Math.max(-100000, Math.min(100000, Math.round(Number(position.x) || 0)));
  const y = Math.max(-100000, Math.min(100000, Math.round(Number(position.y) || 0)));
  return {
    x: Math.max(areaX, Math.min(x, areaX + Math.max(0, areaWidth - width))),
    y: Math.max(areaY, Math.min(y, areaY + Math.max(0, areaHeight - height)))
  };
}

function redactSensitive(value) {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /api.?key|authorization|token|secret/i.test(key) ? '[REDACTED]' : redactSensitive(item)
    ]));
  }
  if (typeof value !== 'string') return value;
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(/(api[_ -]?key["']?\s*[:=]\s*["']?)[^\s,"'}]+/gi, '$1[REDACTED]');
}

module.exports = {
  ALLOWED_RESTORE_SHORTCUTS,
  DEFAULT_RESTORE_SHORTCUT,
  EMERGENCY_RESTORE_SHORTCUTS,
  buildRelaunchArgs,
  clampWindowPositionToWorkArea,
  formatShortcutLabel,
  getSafeModeChromiumSwitches,
  getRestoreShortcutCandidates,
  redactSensitive,
  sanitizeRestoreShortcut
};
