const test = require('node:test');
const assert = require('node:assert/strict');
const {
  addReminder,
  addTask,
  buildDailySummary,
  buildLocalContext,
  hasReachedDailySummaryTime,
  isQuietTime,
  nextQuietEnd,
  normalizePlannerStore,
  normalizeProactiveSettings,
  removeReminder,
  updateTask
} = require('../src/proactive.cjs');

test('proactive settings default to explicit opt-in', () => {
  const settings = normalizeProactiveSettings({ dailySummaryTime: '99:99', quietStart: '22:30', quietEnd: '07:15' });
  assert.equal(settings.proactiveEnabled, false);
  assert.equal(settings.dailySummaryTime, '08:30');
  assert.equal(settings.quietStart, '22:30');
  assert.equal(hasReachedDailySummaryTime(new Date(2026, 7, 18, 9, 0), settings), true);
});

test('quiet hours support overnight ranges', () => {
  const settings = { quietHoursEnabled: true, quietStart: '22:00', quietEnd: '08:00' };
  assert.equal(isQuietTime(new Date(2026, 7, 18, 23, 0), settings), true);
  assert.equal(isQuietTime(new Date(2026, 7, 18, 7, 30), settings), true);
  assert.equal(isQuietTime(new Date(2026, 7, 18, 12, 0), settings), false);
  assert.equal(new Date(nextQuietEnd(new Date(2026, 7, 18, 23, 0), settings)).getDate(), 19);
});

test('tasks can be added updated and normalized', () => {
  const created = addTask({}, { title: ' 完成 0.4.0 ', dueAt: Date.UTC(2026, 7, 18, 10) }, { id: 'task-1', now: 1000 });
  const updated = updateTask(created.store, 'task-1', { completed: true, title: '发布 0.4.0' }, { now: 2000 });
  assert.equal(updated.task.completed, true);
  assert.equal(updated.task.title, '发布 0.4.0');
  assert.equal(normalizePlannerStore(updated.store).tasks.length, 1);
});

test('absolute reminders are bounded and removable', () => {
  const now = Date.UTC(2026, 7, 18, 0, 0);
  const created = addReminder({}, { title: '喝水', dueAt: now + 60_000 }, { id: 'reminder-1', now });
  assert.equal(created.reminder.title, '喝水');
  assert.equal(removeReminder(created.store, 'reminder-1').removed, true);
  assert.throws(() => addReminder({}, { title: '过去', dueAt: now }, { id: 'bad', now }), /晚于当前时间/);
});

test('daily summary and AI context only use local planner items', () => {
  const now = new Date(2026, 7, 18, 9, 0);
  let store = addTask({}, { title: '写进度说明', dueAt: new Date(2026, 7, 18, 11, 0).getTime() }, { id: 'task', now: now.getTime() }).store;
  store = addReminder(store, { title: '喝水', dueAt: new Date(2026, 7, 18, 10, 0).getTime() }, { id: 'reminder', now: now.getTime() }).store;
  assert.match(buildDailySummary(store, now), /写进度说明/);
  const context = buildLocalContext(store, now, 800);
  assert.match(context, /不包含任何窗口或应用内容/);
  assert.match(context, /喝水/);
  assert.ok(context.length <= 800);
});
