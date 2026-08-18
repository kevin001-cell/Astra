const test = require('node:test');
const assert = require('node:assert/strict');
const { MINI_SIZE, normalizeWindowState, restoreBounds, updateWindowState } = require('../src/window-state.cjs');

test('window state keeps full and mini bounds separately', () => {
  let state = normalizeWindowState({}, { x: 0, y: 0, width: 1920, height: 1040 });
  state = updateWindowState(state, 'full', { x: 100, y: 80, width: 450, height: 720 }, { id: 1, scaleFactor: 1 });
  state = updateWindowState(state, 'mini', { x: 1600, y: 780, ...MINI_SIZE }, { id: 1, scaleFactor: 1 });
  assert.equal(state.fullBounds.width, 450);
  assert.equal(state.miniBounds.width, MINI_SIZE.width);
  assert.equal(state.lastVisibleMode, 'mini');
});

test('saved mini bounds recover onto an available monitor', () => {
  const restored = restoreBounds(
    { x: 6000, y: 3000, ...MINI_SIZE },
    [{ id: 2, scaleFactor: 1.5, workArea: { x: 1920, y: 0, width: 2560, height: 1400 } }],
    'missing'
  );
  assert.equal(restored.x, 4296);
  assert.equal(restored.y, 1176);
  assert.equal(restored.displayId, '2');
});
