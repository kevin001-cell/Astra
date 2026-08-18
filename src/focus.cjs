const MAX_HISTORY = 200;

function clampMinutes(value, fallback, minimum = 1, maximum = 180) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}

function normalizeFocusStore(value = {}) {
  const history = Array.isArray(value.history) ? value.history.flatMap(item => {
    const startedAt = Number(item?.startedAt);
    const completedAt = Number(item?.completedAt);
    if (!Number.isFinite(startedAt) || !Number.isFinite(completedAt)) return [];
    return [{ type: item.type === 'break' ? 'break' : 'focus', startedAt, completedAt, minutes: clampMinutes(item.minutes, 25) }];
  }).slice(-MAX_HISTORY) : [];
  const activeStartedAt = Number(value.active?.startedAt);
  const activeDueAt = Number(value.active?.dueAt);
  const active = Number.isFinite(activeStartedAt) && Number.isFinite(activeDueAt) && activeDueAt > activeStartedAt ? {
    type: value.active.type === 'break' ? 'break' : 'focus',
    startedAt: activeStartedAt,
    dueAt: activeDueAt,
    minutes: clampMinutes(value.active.minutes, 25)
  } : null;
  return {
    version: 1,
    settings: {
      focusMinutes: clampMinutes(value.settings?.focusMinutes, 25),
      breakMinutes: clampMinutes(value.settings?.breakMinutes, 5),
      waterMinutes: clampMinutes(value.settings?.waterMinutes, 60, 15, 240),
      waterEnabled: value.settings?.waterEnabled !== false
    },
    active,
    history,
    lastWaterAt: Number(value.lastWaterAt) || Date.now()
  };
}

function startFocus(value, input = {}, now = Date.now()) {
  const store = normalizeFocusStore(value);
  const type = input.type === 'break' ? 'break' : 'focus';
  const fallback = type === 'break' ? store.settings.breakMinutes : store.settings.focusMinutes;
  const minutes = clampMinutes(input.minutes, fallback);
  store.active = { type, minutes, startedAt: now, dueAt: now + minutes * 60000 };
  return store;
}

function stopFocus(value) {
  const store = normalizeFocusStore(value);
  store.active = null;
  return store;
}

function completeFocus(value, now = Date.now()) {
  const store = normalizeFocusStore(value);
  if (!store.active || store.active.dueAt > now) return { store, completed: null };
  const completed = { type: store.active.type, startedAt: store.active.startedAt, completedAt: now, minutes: store.active.minutes };
  store.history.push(completed);
  store.history = store.history.slice(-MAX_HISTORY);
  store.active = null;
  return { store, completed };
}

function saveFocusSettings(value, patch = {}) {
  const store = normalizeFocusStore(value);
  store.settings = normalizeFocusStore({ settings: { ...store.settings, ...patch } }).settings;
  return store;
}

function clearFocusHistory(value) {
  const store = normalizeFocusStore(value);
  store.history = [];
  return store;
}

module.exports = { clearFocusHistory, completeFocus, normalizeFocusStore, saveFocusSettings, startFocus, stopFocus };
