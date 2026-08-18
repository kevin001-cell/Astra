const MAX_CLIPBOARD_CHARACTERS = 20000;
const MAX_SEARCH_QUERY_CHARACTERS = 80;
const MAX_REMINDER_MINUTES = 43200;

function sanitizeClipboardText(value) {
  return String(value || '').slice(0, MAX_CLIPBOARD_CHARACTERS);
}

function sanitizeSearchQuery(value) {
  const query = String(value || '').trim().replace(/[<>:"|?*]/g, '').slice(0, MAX_SEARCH_QUERY_CHARACTERS);
  if (!query) throw new Error('请输入要搜索的文件名。');
  return query;
}

function sanitizeVolume(value) {
  const volume = Math.round(Number(value));
  if (!Number.isFinite(volume)) throw new Error('请输入 0 到 100 之间的音量。');
  return Math.min(100, Math.max(0, volume));
}

function normalizeReminder(minutes, title, now = Date.now()) {
  const safeMinutes = Math.min(Math.max(Number(minutes) || 0, 0.05), MAX_REMINDER_MINUTES);
  const safeTitle = String(title || 'Astra 提醒').trim().slice(0, 100) || 'Astra 提醒';
  return {
    minutes: safeMinutes,
    title: safeTitle,
    dueAt: now + safeMinutes * 60 * 1000
  };
}

function createHistoryEntry(skillId, ok, detail = {}, now = new Date()) {
  return {
    time: now.toISOString(),
    skillId: String(skillId || '').slice(0, 80),
    ok: Boolean(ok),
    detail
  };
}

module.exports = {
  MAX_CLIPBOARD_CHARACTERS,
  MAX_REMINDER_MINUTES,
  MAX_SEARCH_QUERY_CHARACTERS,
  createHistoryEntry,
  normalizeReminder,
  sanitizeClipboardText,
  sanitizeSearchQuery,
  sanitizeVolume
};
