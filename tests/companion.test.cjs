const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildCompanionPrompt,
  getCompanionState,
  normalizeCompanionStore,
  recordCompanionEvent,
  resetCompanionStore,
  saveCompanionSettings
} = require('../src/companion.cjs');

test('companion storage normalizes to local opt-in settings', () => {
  const store = normalizeCompanionStore({ score: 9999, settings: { idleFrequency: 'invalid' } }, new Date('2026-08-18T00:00:00Z'));
  assert.equal(store.score, 1000);
  assert.equal(store.settings.idleFrequency, 'normal');
  assert.equal(store.settings.interactionsEnabled, true);
  assert.equal(store.settings.achievementsEnabled, true);
});

test('daily caps prevent farming repeated touch events', () => {
  let store = {};
  for (let index = 0; index < 8; index += 1) {
    store = recordCompanionEvent(store, { type: 'touch' }, { now: new Date(`2026-08-18T00:0${index}:00Z`) }).store;
  }
  const state = getCompanionState(store, new Date('2026-08-18T01:00:00Z'));
  assert.equal(state.counters.touch, 5);
  assert.equal(state.score, 10);
});

test('task keys are idempotent and unlock local achievements', () => {
  const now = new Date('2026-08-18T02:00:00Z');
  const first = recordCompanionEvent({}, { type: 'task', key: 'task:one' }, { now });
  const second = recordCompanionEvent(first.store, { type: 'task', key: 'task:one' }, { now });
  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.equal(getCompanionState(second.store, now).achievements.find(item => item.id === 'first-task').unlocked, true);
});

test('achievement system can be disabled without stopping growth', () => {
  let store = saveCompanionSettings({}, { achievementsEnabled: false }, { now: new Date('2026-08-18T00:00:00Z') }).store;
  store = recordCompanionEvent(store, { type: 'touch' }, { now: new Date('2026-08-18T01:00:00Z') }).store;
  assert.equal(store.score, 2);
  assert.equal(store.unlockedAchievements.length, 0);
  store = saveCompanionSettings(store, { achievementsEnabled: true }, { now: new Date('2026-08-18T02:00:00Z') }).store;
  assert.equal(store.unlockedAchievements.includes('first-touch'), true);
});

test('address modes unlock by companionship level', () => {
  assert.throws(() => saveCompanionSettings({}, { addressMode: 'commander' }), /尚未解锁/);
  let store = {};
  for (let day = 1; day <= 20; day += 1) {
    const date = new Date(2026, 7, day, 12, 0);
    store = recordCompanionEvent(store, { type: 'task', key: `task:${day}` }, { now: date }).store;
  }
  const saved = saveCompanionSettings(store, { addressMode: 'commander' }, { now: new Date(2026, 7, 21) }).store;
  assert.match(buildCompanionPrompt(saved, '托尼'), /指挥官/);
});

test('reset clears progress but preserves controls', () => {
  let store = saveCompanionSettings({}, { lowPerformanceMode: true, idleFrequency: 'low' }).store;
  store = recordCompanionEvent(store, { type: 'skill' }).store;
  const reset = resetCompanionStore(store, { now: new Date('2026-08-18T03:00:00Z') });
  assert.equal(reset.score, 0);
  assert.equal(reset.settings.lowPerformanceMode, true);
  assert.equal(reset.settings.idleFrequency, 'low');
});

test('cosmetics and mini mode settings stay allowlisted', () => {
  const result = saveCompanionSettings({}, { theme: 'black-purple', backgroundMode: 'hidden', sleepAfterMinutes: 30 }).store;
  assert.equal(result.settings.theme, 'black-purple');
  assert.equal(result.settings.backgroundMode, 'hidden');
  assert.equal(result.settings.sleepAfterMinutes, 30);
  assert.throws(() => saveCompanionSettings({}, { eyeStyle: 'visor' }), /尚未解锁/);
});
