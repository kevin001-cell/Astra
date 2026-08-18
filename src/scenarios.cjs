const SCENARIOS = Object.freeze({
  normal: { value: 'normal', label: '普通模式', speakReplies: true, bubbles: true, animations: true, notifications: true, preferredWindowMode: 'full' },
  work: { value: 'work', label: '工作模式', speakReplies: false, bubbles: false, animations: false, notifications: true, preferredWindowMode: 'mini' },
  leisure: { value: 'leisure', label: '休闲模式', speakReplies: true, bubbles: true, animations: true, notifications: true, preferredWindowMode: 'mini' },
  game: { value: 'game', label: '游戏模式', speakReplies: false, bubbles: false, animations: false, notifications: false, preferredWindowMode: 'hidden' },
  meeting: { value: 'meeting', label: '会议模式', speakReplies: false, bubbles: false, animations: false, notifications: false, preferredWindowMode: 'mini' },
  sleep: { value: 'sleep', label: '睡眠模式', speakReplies: false, bubbles: false, animations: false, notifications: false, preferredWindowMode: 'hidden' }
});

function normalizeScenarioStore(value = {}) {
  const active = SCENARIOS[value.active] ? value.active : 'normal';
  return {
    version: 1,
    active,
    automatic: value.automatic === true,
    schedules: Array.isArray(value.schedules) ? value.schedules.flatMap(item => {
      if (!SCENARIOS[item?.scenario] || !/^\d{2}:\d{2}$/.test(item.start || '') || !/^\d{2}:\d{2}$/.test(item.end || '')) return [];
      return [{ scenario: item.scenario, start: item.start, end: item.end, enabled: item.enabled !== false }];
    }).slice(0, 12) : []
  };
}

function scenarioState(value) {
  const store = normalizeScenarioStore(value);
  return { ...store, definition: SCENARIOS[store.active], options: Object.values(SCENARIOS) };
}

function scheduledScenario(value, date = new Date()) {
  const store = normalizeScenarioStore(value);
  if (!store.automatic) return store.active;
  const minutes = date.getHours() * 60 + date.getMinutes();
  for (const schedule of store.schedules.filter(item => item.enabled)) {
    const [startHour, startMinute] = schedule.start.split(':').map(Number);
    const [endHour, endMinute] = schedule.end.split(':').map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const matches = start <= end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
    if (matches) return schedule.scenario;
  }
  return store.active;
}

module.exports = { SCENARIOS, normalizeScenarioStore, scenarioState, scheduledScenario };
