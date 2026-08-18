const test = require('node:test');
const assert = require('node:assert/strict');
const { completeFocus, normalizeFocusStore, startFocus } = require('../src/focus.cjs');

test('focus survives normalization and completes', () => {
  const started = startFocus({}, { minutes: 25 }, 1000);
  assert.equal(normalizeFocusStore(started).active.dueAt, 1501000);
  const result = completeFocus(started, 1501000);
  assert.equal(result.completed.type, 'focus');
  assert.equal(result.store.history.length, 1);
});
