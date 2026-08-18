const MAX_TASKS = 200;
const MAX_REMINDERS = 200;
const MAX_ITEM_TITLE = 120;
const MAX_REMINDER_FUTURE_MS = 366 * 24 * 60 * 60 * 1000;

const DEFAULT_PROACTIVE_SETTINGS = Object.freeze({
  proactiveEnabled: false,
  startupGreetingEnabled: true,
  dailySummaryEnabled: true,
  dailySummaryTime: '08:30',
  quietHoursEnabled: true,
  quietStart: '22:00',
  quietEnd: '08:00',
  lastDailySummaryDate: ''
});

function cleanTitle(value) {
  const title = String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_ITEM_TITLE);
  if (!title) throw new Error('标题不能为空。');
  return title;
}

function normalizeClock(value, fallback) {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
  if (!match) return fallback;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? `${match[1]}:${match[2]}` : fallback;
}

function normalizeProactiveSettings(value = {}) {
  return {
    proactiveEnabled: value.proactiveEnabled === true,
    startupGreetingEnabled: value.startupGreetingEnabled !== false,
    dailySummaryEnabled: value.dailySummaryEnabled !== false,
    dailySummaryTime: normalizeClock(value.dailySummaryTime, DEFAULT_PROACTIVE_SETTINGS.dailySummaryTime),
    quietHoursEnabled: value.quietHoursEnabled !== false,
    quietStart: normalizeClock(value.quietStart, DEFAULT_PROACTIVE_SETTINGS.quietStart),
    quietEnd: normalizeClock(value.quietEnd, DEFAULT_PROACTIVE_SETTINGS.quietEnd),
    lastDailySummaryDate: /^\d{4}-\d{2}-\d{2}$/.test(String(value.lastDailySummaryDate || '')) ? String(value.lastDailySummaryDate) : ''
  };
}

function normalizeOptionalDueAt(value) {
  if (value === null || value === undefined || value === '') return null;
  const dueAt = Number(value);
  return Number.isFinite(dueAt) ? dueAt : null;
}

function normalizeTask(item) {
  try {
    if (!item?.id) return null;
    const createdAt = Number(item.createdAt) || Date.now();
    return {
      id: String(item.id).slice(0, 100),
      title: cleanTitle(item.title),
      dueAt: normalizeOptionalDueAt(item.dueAt),
      completed: Boolean(item.completed),
      createdAt,
      updatedAt: Number(item.updatedAt) || createdAt
    };
  } catch {
    return null;
  }
}

function normalizeReminder(item) {
  try {
    if (!item?.id) return null;
    const dueAt = Number(item.dueAt);
    if (!Number.isFinite(dueAt)) return null;
    return {
      id: String(item.id).slice(0, 100),
      title: cleanTitle(item.title),
      dueAt,
      createdAt: Number(item.createdAt) || dueAt
    };
  } catch {
    return null;
  }
}

function normalizePlannerStore(value = {}) {
  const tasks = Array.isArray(value.tasks) ? value.tasks.map(normalizeTask).filter(Boolean) : [];
  const reminders = Array.isArray(value.reminders) ? value.reminders.map(normalizeReminder).filter(Boolean) : [];
  return {
    version: 1,
    tasks: tasks.slice(-MAX_TASKS),
    reminders: reminders.slice(-MAX_REMINDERS).sort((left, right) => left.dueAt - right.dueAt)
  };
}

function addTask(store, input, options = {}) {
  const normalized = normalizePlannerStore(store);
  const now = Number(options.now) || Date.now();
  const task = {
    id: String(options.id || '').slice(0, 100),
    title: cleanTitle(input?.title),
    dueAt: normalizeOptionalDueAt(input?.dueAt),
    completed: false,
    createdAt: now,
    updatedAt: now
  };
  if (!task.id) throw new Error('无法生成待办编号。');
  normalized.tasks.push(task);
  normalized.tasks = normalized.tasks.slice(-MAX_TASKS);
  return { store: normalized, task };
}

function updateTask(store, id, patch, options = {}) {
  const normalized = normalizePlannerStore(store);
  const task = normalized.tasks.find(item => item.id === String(id || ''));
  if (!task) throw new Error('没有找到该待办。');
  if (Object.hasOwn(patch || {}, 'title')) task.title = cleanTitle(patch.title);
  if (Object.hasOwn(patch || {}, 'dueAt')) task.dueAt = normalizeOptionalDueAt(patch.dueAt);
  if (Object.hasOwn(patch || {}, 'completed')) task.completed = Boolean(patch.completed);
  task.updatedAt = Number(options.now) || Date.now();
  return { store: normalized, task };
}

function removeTask(store, id) {
  const normalized = normalizePlannerStore(store);
  const previousLength = normalized.tasks.length;
  normalized.tasks = normalized.tasks.filter(item => item.id !== String(id || ''));
  return { store: normalized, removed: normalized.tasks.length !== previousLength };
}

function addReminder(store, input, options = {}) {
  const normalized = normalizePlannerStore(store);
  const now = Number(options.now) || Date.now();
  const dueAt = Number(input?.dueAt);
  if (!Number.isFinite(dueAt) || dueAt <= now + 1000) throw new Error('提醒时间必须晚于当前时间。');
  if (dueAt - now > MAX_REMINDER_FUTURE_MS) throw new Error('提醒时间不能超过一年。');
  const reminder = {
    id: String(options.id || '').slice(0, 100),
    title: cleanTitle(input?.title),
    dueAt,
    createdAt: now
  };
  if (!reminder.id) throw new Error('无法生成提醒编号。');
  normalized.reminders.push(reminder);
  normalized.reminders = normalized.reminders.slice(-MAX_REMINDERS).sort((left, right) => left.dueAt - right.dueAt);
  return { store: normalized, reminder };
}

function removeReminder(store, id) {
  const normalized = normalizePlannerStore(store);
  const previousLength = normalized.reminders.length;
  normalized.reminders = normalized.reminders.filter(item => item.id !== String(id || ''));
  return { store: normalized, removed: normalized.reminders.length !== previousLength };
}

function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function minutesOfDay(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

function clockMinutes(value) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function isQuietTime(value = new Date(), settings = {}) {
  const normalized = normalizeProactiveSettings(settings);
  if (!normalized.quietHoursEnabled) return false;
  const start = clockMinutes(normalized.quietStart);
  const end = clockMinutes(normalized.quietEnd);
  if (start === end) return false;
  const current = minutesOfDay(value);
  return start < end ? current >= start && current < end : current >= start || current < end;
}

function nextQuietEnd(value = new Date(), settings = {}) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  const normalized = normalizeProactiveSettings(settings);
  if (!isQuietTime(date, normalized)) return date.getTime();
  const [endHour, endMinute] = normalized.quietEnd.split(':').map(Number);
  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);
  if (end.getTime() <= date.getTime()) end.setDate(end.getDate() + 1);
  return end.getTime();
}

function hasReachedDailySummaryTime(value = new Date(), settings = {}) {
  const normalized = normalizeProactiveSettings(settings);
  return minutesOfDay(value) >= clockMinutes(normalized.dailySummaryTime);
}

function timePeriodLabel(value = new Date()) {
  const hour = (value instanceof Date ? value : new Date(value)).getHours();
  if (hour < 6) return '深夜';
  if (hour < 9) return '早晨';
  if (hour < 12) return '上午';
  if (hour < 14) return '中午';
  if (hour < 18) return '下午';
  if (hour < 22) return '晚上';
  return '深夜';
}

function formatItemTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

function todayPendingTasks(store, now = new Date()) {
  const normalized = normalizePlannerStore(store);
  const today = localDateKey(now);
  return normalized.tasks.filter(task => !task.completed && task.dueAt && localDateKey(task.dueAt) === today);
}

function upcomingReminders(store, now = new Date(), hours = 24) {
  const normalized = normalizePlannerStore(store);
  const current = now instanceof Date ? now.getTime() : Number(now);
  const limit = current + hours * 60 * 60 * 1000;
  return normalized.reminders.filter(reminder => reminder.dueAt >= current && reminder.dueAt <= limit);
}

function buildDailySummary(store, now = new Date()) {
  const normalized = normalizePlannerStore(store);
  const todayTasks = todayPendingTasks(normalized, now);
  const reminders = upcomingReminders(normalized, now, 24);
  const undatedTasks = normalized.tasks.filter(task => !task.completed && !task.dueAt).slice(0, 5);
  const lines = [`${timePeriodLabel(now)}好。今天有 ${todayTasks.length} 项定期待办，未来 24 小时有 ${reminders.length} 个提醒。`];
  for (const task of todayTasks.slice(0, 5)) lines.push(`- 待办：${task.title}${task.dueAt ? `（${formatItemTime(task.dueAt)}）` : ''}`);
  for (const reminder of reminders.slice(0, 5)) lines.push(`- 提醒：${reminder.title}（${formatItemTime(reminder.dueAt)}）`);
  if (!todayTasks.length && !reminders.length && undatedTasks.length) lines.push(`未定期待办：${undatedTasks.map(task => task.title).join('、')}`);
  if (!todayTasks.length && !reminders.length && !undatedTasks.length) lines.push('今天暂时没有需要处理的本地计划。');
  return lines.join('\n').slice(0, 1600);
}

function buildStartupGreeting(store, now = new Date(), displayName = '') {
  const normalized = normalizePlannerStore(store);
  const pendingCount = normalized.tasks.filter(task => !task.completed).length;
  const reminderCount = upcomingReminders(normalized, now, 24).length;
  const name = String(displayName || '').trim().slice(0, 40);
  const parts = [`${name ? `${name}，` : ''}${timePeriodLabel(now)}好，Astra 已上线。`];
  if (pendingCount || reminderCount) parts.push(`当前有 ${pendingCount} 项未完成待办，未来 24 小时有 ${reminderCount} 个提醒。`);
  else parts.push('当前没有待处理的本地计划。');
  return parts.join('');
}

function buildLocalContext(store, now = new Date(), maxCharacters = 1400) {
  const normalized = normalizePlannerStore(store);
  const pendingTasks = normalized.tasks.filter(task => !task.completed).sort((left, right) => (left.dueAt || Number.MAX_SAFE_INTEGER) - (right.dueAt || Number.MAX_SAFE_INTEGER));
  const reminders = upcomingReminders(normalized, now, 48);
  const lines = [
    '以下上下文仅来自用户在 Astra 本地计划中心中明确创建的内容，不包含任何窗口或应用内容。',
    `当前时间：${new Date(now).toLocaleString('zh-CN', { hour12: false })}（${timePeriodLabel(now)}）`,
    `未完成待办：${pendingTasks.length} 项；未来 48 小时提醒：${reminders.length} 个。`
  ];
  for (const task of pendingTasks.slice(0, 8)) lines.push(`- 待办：${task.title}${task.dueAt ? `；时间 ${formatItemTime(task.dueAt)}` : '；未设时间'}`);
  for (const reminder of reminders.slice(0, 8)) lines.push(`- 提醒：${reminder.title}；时间 ${formatItemTime(reminder.dueAt)}`);
  return lines.join('\n').slice(0, Math.max(300, Math.min(3000, maxCharacters)));
}

module.exports = {
  DEFAULT_PROACTIVE_SETTINGS,
  MAX_REMINDERS,
  MAX_TASKS,
  addReminder,
  addTask,
  buildDailySummary,
  buildLocalContext,
  buildStartupGreeting,
  hasReachedDailySummaryTime,
  isQuietTime,
  localDateKey,
  nextQuietEnd,
  normalizePlannerStore,
  normalizeProactiveSettings,
  removeReminder,
  removeTask,
  timePeriodLabel,
  todayPendingTasks,
  upcomingReminders,
  updateTask
};
