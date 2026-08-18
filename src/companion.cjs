const IDLE_FREQUENCIES = ['off', 'low', 'normal', 'high'];
const BUBBLE_FREQUENCIES = ['off', 'low', 'normal'];
const ADDRESS_MODES = ['profile', 'partner', 'commander', 'friend'];
const EVENT_TYPES = ['active', 'touch', 'skill', 'task', 'launch', 'voice', 'focus'];
const MAX_SCORE = 1000;

const DEFAULT_COMPANION_SETTINGS = Object.freeze({
  interactionsEnabled: true,
  idleFrequency: 'normal',
  bubbleFrequency: 'low',
  lowPerformanceMode: false,
  achievementsEnabled: true,
  addressMode: 'profile',
  backgroundMode: 'mini',
  miniClickThrough: false,
  autoHideFullscreen: true,
  autoLowPower: true,
  cursorReactions: true,
  edgeReactions: true,
  sleepAfterMinutes: 10,
  theme: 'red-gold',
  eyeStyle: 'standard',
  coreStyle: 'round',
  shoulderStyle: 'classic',
  haloStyle: 'orbit'
});

const LEVELS = Object.freeze([
  { number: 1, name: '初识', minimum: 0 },
  { number: 2, name: '熟悉', minimum: 40 },
  { number: 3, name: '默契', minimum: 120 },
  { number: 4, name: '信赖', minimum: 260 },
  { number: 5, name: '长久伙伴', minimum: 500 }
]);

const ADDRESS_DEFINITIONS = Object.freeze({
  profile: { value: 'profile', label: '使用记忆中心称呼', minimumLevel: 1 },
  partner: { value: 'partner', label: '搭档', minimumLevel: 2 },
  commander: { value: 'commander', label: '指挥官', minimumLevel: 3 },
  friend: { value: 'friend', label: '老朋友', minimumLevel: 4 }
});

const ACHIEVEMENTS = Object.freeze([
  { id: 'first-touch', title: '初次回应', description: '第一次与 Astra 进行桌宠互动。', collectionTitle: '第一次触碰', collectionCopy: '那一刻，Astra 确认你愿意把它留在桌面上。' },
  { id: 'first-skill', title: '可靠执行', description: '第一次成功完成本地白名单技能。', collectionTitle: '任务回执', collectionCopy: 'Astra 完成了第一次被允许的电脑操作。' },
  { id: 'first-task', title: '今日完成', description: '第一次完成计划中心待办。', collectionTitle: '完成标记', collectionCopy: '一个被勾选的待办，成为共同前进的记录。' },
  { id: 'ten-interactions', title: '渐渐熟悉', description: '累计完成 10 次有效互动。', collectionTitle: '十次回应', collectionCopy: '短暂的互动开始积累成稳定的陪伴。' },
  { id: 'seven-days', title: '一周相伴', description: '在 7 个不同日期使用 Astra。', collectionTitle: '七日轨迹', collectionCopy: '七个不同日期，留下了七个本地足迹。' },
  { id: 'trusted-partner', title: '默契搭档', description: '陪伴值达到 120。', collectionTitle: '默契核心', collectionCopy: 'Astra 已经学会用更熟悉的方式与你并肩工作。' },
  { id: 'first-focus', title: '专注启动', description: '第一次完成专注计时。', collectionTitle: '专注核心', collectionCopy: '一次完整专注，为桌面陪伴增加了稳定节奏。' }
]);

const EVENT_RULES = Object.freeze({
  active: { points: 1, dailyLimit: 1 },
  touch: { points: 2, dailyLimit: 5 },
  skill: { points: 3, dailyLimit: 10 },
  task: { points: 8, dailyLimit: 5 },
  launch: { points: 1, dailyLimit: 5 },
  voice: { points: 4, dailyLimit: 3 },
  focus: { points: 6, dailyLimit: 4 }
});

const COSMETIC_OPTIONS = Object.freeze({
  themes: [
    { value: 'red-gold', label: '赤金机甲' },
    { value: 'blue-silver', label: '蓝银守卫' },
    { value: 'black-purple', label: '黑紫夜巡' }
  ],
  eyes: [
    { value: 'standard', label: '标准光眼' },
    { value: 'visor', label: '战术目镜', achievement: 'first-touch' },
    { value: 'narrow', label: '专注锐眼', achievement: 'first-skill' }
  ],
  cores: [
    { value: 'round', label: '圆形核心' },
    { value: 'diamond', label: '菱形核心', achievement: 'first-skill' },
    { value: 'pulse', label: '脉冲核心', achievement: 'first-focus' }
  ],
  shoulders: [
    { value: 'classic', label: '经典肩甲' },
    { value: 'guard', label: '重装肩甲', achievement: 'first-task' },
    { value: 'wing', label: '翼形肩甲', achievement: 'ten-interactions' }
  ],
  halos: [
    { value: 'orbit', label: '轨道光环' },
    { value: 'ring', label: '守护圆环', achievement: 'seven-days' },
    { value: 'none', label: '关闭光环' }
  ]
});

function clampInteger(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

function sanitizeChoice(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

function dateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(value.getTime())) return dateKey(new Date());
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoDate(value, fallback) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : fallback;
}

function normalizeCompanionSettings(value = {}) {
  return {
    interactionsEnabled: value.interactionsEnabled !== false,
    idleFrequency: sanitizeChoice(value.idleFrequency, IDLE_FREQUENCIES, DEFAULT_COMPANION_SETTINGS.idleFrequency),
    bubbleFrequency: sanitizeChoice(value.bubbleFrequency, BUBBLE_FREQUENCIES, DEFAULT_COMPANION_SETTINGS.bubbleFrequency),
    lowPerformanceMode: value.lowPerformanceMode === true,
    achievementsEnabled: value.achievementsEnabled !== false,
    addressMode: sanitizeChoice(value.addressMode, ADDRESS_MODES, DEFAULT_COMPANION_SETTINGS.addressMode),
    backgroundMode: sanitizeChoice(value.backgroundMode, ['mini', 'hidden'], DEFAULT_COMPANION_SETTINGS.backgroundMode),
    miniClickThrough: value.miniClickThrough === true,
    autoHideFullscreen: value.autoHideFullscreen !== false,
    autoLowPower: value.autoLowPower !== false,
    cursorReactions: value.cursorReactions !== false,
    edgeReactions: value.edgeReactions !== false,
    sleepAfterMinutes: sanitizeChoice(Number(value.sleepAfterMinutes), [0, 5, 10, 20, 30], DEFAULT_COMPANION_SETTINGS.sleepAfterMinutes),
    theme: sanitizeChoice(value.theme, COSMETIC_OPTIONS.themes.map(item => item.value), DEFAULT_COMPANION_SETTINGS.theme),
    eyeStyle: sanitizeChoice(value.eyeStyle, COSMETIC_OPTIONS.eyes.map(item => item.value), DEFAULT_COMPANION_SETTINGS.eyeStyle),
    coreStyle: sanitizeChoice(value.coreStyle, COSMETIC_OPTIONS.cores.map(item => item.value), DEFAULT_COMPANION_SETTINGS.coreStyle),
    shoulderStyle: sanitizeChoice(value.shoulderStyle, COSMETIC_OPTIONS.shoulders.map(item => item.value), DEFAULT_COMPANION_SETTINGS.shoulderStyle),
    haloStyle: sanitizeChoice(value.haloStyle, COSMETIC_OPTIONS.halos.map(item => item.value), DEFAULT_COMPANION_SETTINGS.haloStyle)
  };
}

function emptyCounters() {
  return { active: 0, touch: 0, skill: 0, task: 0, launch: 0, voice: 0, focus: 0 };
}

function normalizeCounters(value = {}) {
  return Object.fromEntries(EVENT_TYPES.map(type => [type, clampInteger(value[type], 0, 100000)]));
}

function knownAchievementIds(value) {
  const allowed = new Set(ACHIEVEMENTS.map(item => item.id));
  return [...new Set(Array.isArray(value) ? value.map(String).filter(id => allowed.has(id)) : [])];
}

function normalizeCompanionStore(value = {}, now = new Date()) {
  const nowIso = now.toISOString();
  const today = dateKey(now);
  const activeDates = [...new Set(Array.isArray(value.activeDates) ? value.activeDates.filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item)) : [])].slice(-90);
  const unlockedAchievements = knownAchievementIds(value.unlockedAchievements);
  const collectionIds = new Set();
  const collection = Array.isArray(value.collection)
    ? value.collection.flatMap(item => {
      const id = String(item?.id || '');
      if (!unlockedAchievements.includes(id) || collectionIds.has(id)) return [];
      collectionIds.add(id);
      return [{ id, unlockedAt: isoDate(item.unlockedAt, nowIso) }];
    }).slice(-ACHIEVEMENTS.length)
    : [];
  const dailyDate = /^\d{4}-\d{2}-\d{2}$/.test(value.daily?.date || '') ? value.daily.date : today;
  const daily = dailyDate === today ? { date: today, ...normalizeCounters(value.daily) } : { date: today, ...emptyCounters() };
  return {
    version: 1,
    settings: normalizeCompanionSettings(value.settings),
    score: clampInteger(value.score, 0, MAX_SCORE),
    counters: normalizeCounters(value.counters),
    daily,
    activeDates,
    unlockedAchievements,
    collection,
    completedKeys: [...new Set(Array.isArray(value.completedKeys) ? value.completedKeys.map(String).filter(Boolean) : [])].slice(-200),
    firstSeenAt: isoDate(value.firstSeenAt, nowIso),
    lastSeenAt: isoDate(value.lastSeenAt, nowIso),
    lastEventAt: value.lastEventAt ? isoDate(value.lastEventAt, nowIso) : ''
  };
}

function getCompanionLevel(score) {
  const safeScore = clampInteger(score, 0, MAX_SCORE);
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (safeScore >= level.minimum) current = level;
  }
  const next = LEVELS.find(level => level.number === current.number + 1);
  const span = next ? next.minimum - current.minimum : 1;
  return {
    number: current.number,
    name: current.name,
    minimum: current.minimum,
    nextMinimum: next?.minimum ?? MAX_SCORE,
    progress: next ? Math.max(0, Math.min(1, (safeScore - current.minimum) / span)) : 1
  };
}

function totalInteractions(counters) {
  return counters.touch + counters.skill + counters.task + counters.launch + counters.voice + counters.focus;
}

function achievementSatisfied(id, store) {
  if (id === 'first-touch') return store.counters.touch >= 1;
  if (id === 'first-skill') return store.counters.skill >= 1;
  if (id === 'first-task') return store.counters.task >= 1;
  if (id === 'ten-interactions') return totalInteractions(store.counters) >= 10;
  if (id === 'seven-days') return store.activeDates.length >= 7;
  if (id === 'trusted-partner') return store.score >= 120;
  if (id === 'first-focus') return store.counters.focus >= 1;
  return false;
}

function cosmeticState(store) {
  return Object.fromEntries(Object.entries(COSMETIC_OPTIONS).map(([group, options]) => [group, options.map(item => ({
    ...item,
    unlocked: !item.achievement || store.unlockedAchievements.includes(item.achievement)
  }))]));
}

function validateCosmeticSelection(store, settings) {
  const groups = [
    ['eyeStyle', 'eyes'],
    ['coreStyle', 'cores'],
    ['shoulderStyle', 'shoulders'],
    ['haloStyle', 'halos']
  ];
  const options = cosmeticState(store);
  for (const [setting, group] of groups) {
    const selected = options[group].find(item => item.value === settings[setting]);
    if (selected && !selected.unlocked) throw new Error('当前成就尚未解锁这个装扮。');
  }
}

function unlockAchievements(store, now) {
  if (!store.settings.achievementsEnabled) return [];
  const unlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (store.unlockedAchievements.includes(achievement.id) || !achievementSatisfied(achievement.id, store)) continue;
    store.unlockedAchievements.push(achievement.id);
    store.collection.push({ id: achievement.id, unlockedAt: now.toISOString() });
    unlocked.push(achievement);
  }
  return unlocked;
}

function recordCompanionEvent(value, event = {}, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  const store = normalizeCompanionStore(value, now);
  const type = sanitizeChoice(event.type, EVENT_TYPES, '');
  if (!type) throw new Error('未知的陪伴事件。');
  const eventKey = String(event.key || '').trim().slice(0, 160);
  if (eventKey && store.completedKeys.includes(eventKey)) return { store, changed: false, scoreDelta: 0, newlyUnlocked: [] };
  const rule = EVENT_RULES[type];
  if (store.daily[type] >= rule.dailyLimit) return { store, changed: false, scoreDelta: 0, newlyUnlocked: [] };

  const today = dateKey(now);
  store.daily[type] += 1;
  store.counters[type] += 1;
  store.score = Math.min(MAX_SCORE, store.score + rule.points);
  store.lastSeenAt = now.toISOString();
  store.lastEventAt = now.toISOString();
  if (!store.activeDates.includes(today)) store.activeDates.push(today);
  store.activeDates = store.activeDates.slice(-90);
  if (eventKey) {
    store.completedKeys.push(eventKey);
    store.completedKeys = store.completedKeys.slice(-200);
  }
  const newlyUnlocked = unlockAchievements(store, now);
  return { store, changed: true, scoreDelta: rule.points, newlyUnlocked };
}

function saveCompanionSettings(value, patch = {}, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  const store = normalizeCompanionStore(value, now);
  const nextSettings = normalizeCompanionSettings({ ...store.settings, ...patch });
  const level = getCompanionLevel(store.score);
  const requestedAddress = String(patch.addressMode || nextSettings.addressMode);
  const definition = ADDRESS_DEFINITIONS[requestedAddress];
  if (definition && definition.minimumLevel > level.number) throw new Error('当前陪伴等级尚未解锁这个称呼。');
  store.settings = nextSettings;
  validateCosmeticSelection(store, nextSettings);
  store.lastSeenAt = now.toISOString();
  const newlyUnlocked = unlockAchievements(store, now);
  return { store, newlyUnlocked };
}

function resetCompanionStore(value, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  const settings = normalizeCompanionSettings(value?.settings);
  return normalizeCompanionStore({ settings, firstSeenAt: now.toISOString(), lastSeenAt: now.toISOString() }, now);
}

function getCompanionState(value, now = new Date()) {
  const store = normalizeCompanionStore(value, now);
  const level = getCompanionLevel(store.score);
  const achievements = ACHIEVEMENTS.map(item => ({ ...item, unlocked: store.unlockedAchievements.includes(item.id) }));
  const collection = store.collection.flatMap(entry => {
    const definition = ACHIEVEMENTS.find(item => item.id === entry.id);
    return definition ? [{ id: entry.id, title: definition.collectionTitle, copy: definition.collectionCopy, unlockedAt: entry.unlockedAt }] : [];
  });
  return {
    version: store.version,
    settings: store.settings,
    score: store.score,
    level,
    counters: store.counters,
    activeDays: store.activeDates.length,
    totalInteractions: totalInteractions(store.counters),
    achievements,
    collection,
    availableAddressModes: Object.values(ADDRESS_DEFINITIONS).map(item => ({ ...item, unlocked: item.minimumLevel <= level.number })),
    cosmetics: cosmeticState(store),
    firstSeenAt: store.firstSeenAt,
    lastSeenAt: store.lastSeenAt
  };
}

function getPreferredAddress(value, displayName = '') {
  const store = normalizeCompanionStore(value);
  if (store.settings.addressMode === 'profile') return String(displayName || '').trim();
  return ADDRESS_DEFINITIONS[store.settings.addressMode]?.label || String(displayName || '').trim();
}

function buildCompanionPrompt(value, displayName = '') {
  const address = getPreferredAddress(value, displayName);
  if (!address) return '陪伴系统：不使用额外称呼。';
  return `陪伴系统：用户主动选择了称呼“${address}”。只在自然、不过度频繁的情况下使用。`;
}

module.exports = {
  ACHIEVEMENTS,
  ADDRESS_DEFINITIONS,
  COSMETIC_OPTIONS,
  DEFAULT_COMPANION_SETTINGS,
  EVENT_RULES,
  LEVELS,
  buildCompanionPrompt,
  dateKey,
  getCompanionLevel,
  getCompanionState,
  getPreferredAddress,
  normalizeCompanionSettings,
  normalizeCompanionStore,
  recordCompanionEvent,
  resetCompanionStore,
  saveCompanionSettings
};
