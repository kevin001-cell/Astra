const test = require('node:test');
const assert = require('node:assert/strict');
const { scenarioState, scheduledScenario } = require('../src/scenarios.cjs');

test('scenario schedules support overnight ranges', () => {
  const store = { active: 'normal', automatic: true, schedules: [{ scenario: 'sleep', start: '23:00', end: '07:00' }] };
  assert.equal(scheduledScenario(store, new Date('2026-08-18T01:00:00')), 'sleep');
  assert.equal(scenarioState({ active: 'meeting' }).definition.notifications, false);
});
