const test = require('node:test');
const assert = require('node:assert/strict');
const { commandSuggestions, historySelection, classifyDragFeedback, proximityReaction } = require('../app/interaction-utils.js');

test('slash commands stay inside the fixed interaction catalog', () => {
  assert.deepEqual(commandSuggestions('/计算').map(item => item.id), ['calculator']);
  assert.equal(commandSuggestions('计算器').length, 0);
  assert.ok(commandSuggestions('/').every(item => ['send', 'insert', 'action'].includes(item.mode)));
});

test('message history navigation returns drafts at the end', () => {
  const history = ['第一条', '第二条'];
  assert.deepEqual(historySelection(history, 2, -1), { index: 1, value: '第二条' });
  assert.deepEqual(historySelection(history, 1, -1), { index: 0, value: '第一条' });
  assert.deepEqual(historySelection(history, 1, 1), { index: 2, value: '' });
});

test('drag feedback distinguishes edge, heavy and light placement', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1040 };
  assert.equal(classifyDragFeedback({ bounds: { x: 0, y: 200, width: 220, height: 260 }, workArea }).kind, 'edge');
  assert.equal(classifyDragFeedback({ bounds: { x: 400, y: 200, width: 220, height: 260 }, workArea, maxSpeed: 1800 }).kind, 'heavy');
  assert.equal(classifyDragFeedback({ bounds: { x: 400, y: 200, width: 220, height: 260 }, workArea, distance: 80 }).kind, 'light');
});

test('proximity reactions use entry, dwell and fast cooldowns', () => {
  let result = proximityReaction({}, { nearby: true, lookX: 1, lookY: 0 }, 1000);
  assert.equal(result.event, 'enter');
  result = proximityReaction(result.state, { nearby: true, lookX: 0, lookY: 1 }, 4500);
  assert.equal(result.event, 'dwell');
  result = proximityReaction(result.state, { nearby: true, fast: true, lookX: -1, lookY: 0 }, 7000);
  assert.equal(result.event, 'fast');
  result = proximityReaction(result.state, { nearby: true, fast: true, lookX: 0, lookY: -1 }, 8000);
  assert.notEqual(result.event, 'fast');
});
