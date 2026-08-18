const { clampWindowPositionToWorkArea } = require('./stability.cjs');

const FULL_SIZE = Object.freeze({ width: 430, height: 690 });
const MINI_SIZE = Object.freeze({ width: 184, height: 224 });

function sanitizeMode(value, fallback = 'full') {
  return ['full', 'mini', 'hidden'].includes(value) ? value : fallback;
}

function normalizeBounds(value, fallback) {
  return {
    x: Number.isFinite(Number(value?.x)) ? Math.round(Number(value.x)) : fallback.x,
    y: Number.isFinite(Number(value?.y)) ? Math.round(Number(value.y)) : fallback.y,
    width: Math.max(120, Math.min(900, Math.round(Number(value?.width) || fallback.width))),
    height: Math.max(140, Math.min(1000, Math.round(Number(value?.height) || fallback.height)))
  };
}

function defaultBounds(size, workArea = { x: 0, y: 0, width: 1920, height: 1080 }) {
  return {
    x: workArea.x + Math.max(0, workArea.width - size.width - 24),
    y: workArea.y + Math.max(0, workArea.height - size.height - 24),
    width: size.width,
    height: size.height
  };
}

function normalizeWindowState(value = {}, workArea) {
  const fullFallback = defaultBounds(FULL_SIZE, workArea);
  const miniFallback = defaultBounds(MINI_SIZE, workArea);
  const mode = sanitizeMode(value.mode);
  return {
    version: 1,
    mode,
    lastVisibleMode: sanitizeMode(value.lastVisibleMode, mode === 'hidden' ? 'mini' : mode),
    fullBounds: normalizeBounds(value.fullBounds, fullFallback),
    miniBounds: normalizeBounds(value.miniBounds, miniFallback),
    displayId: String(value.displayId || ''),
    scaleFactor: Math.max(.5, Math.min(4, Number(value.scaleFactor) || 1)),
    updatedAt: Number.isFinite(Date.parse(value.updatedAt)) ? new Date(value.updatedAt).toISOString() : new Date(0).toISOString()
  };
}

function distanceToDisplay(bounds, display) {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const area = display.workArea;
  const closestX = Math.max(area.x, Math.min(centerX, area.x + area.width));
  const closestY = Math.max(area.y, Math.min(centerY, area.y + area.height));
  return Math.hypot(centerX - closestX, centerY - closestY);
}

function restoreBounds(bounds, displays, preferredDisplayId = '') {
  const available = Array.isArray(displays) && displays.length ? displays : [{ id: 'default', scaleFactor: 1, workArea: { x: 0, y: 0, width: 1920, height: 1080 } }];
  const display = available.find(item => String(item.id) === String(preferredDisplayId)) || [...available].sort((left, right) => distanceToDisplay(bounds, left) - distanceToDisplay(bounds, right))[0];
  const position = clampWindowPositionToWorkArea(bounds, bounds, display.workArea);
  return { ...bounds, ...position, displayId: String(display.id), scaleFactor: display.scaleFactor || 1 };
}

function updateWindowState(value, mode, bounds, display = {}) {
  const state = normalizeWindowState(value, display.workArea);
  const nextMode = sanitizeMode(mode, state.mode);
  if (nextMode === 'full') state.fullBounds = normalizeBounds(bounds, state.fullBounds);
  if (nextMode === 'mini') state.miniBounds = normalizeBounds(bounds, state.miniBounds);
  state.mode = nextMode;
  if (nextMode !== 'hidden') state.lastVisibleMode = nextMode;
  state.displayId = String(display.id || state.displayId);
  state.scaleFactor = Math.max(.5, Math.min(4, Number(display.scaleFactor) || state.scaleFactor));
  state.updatedAt = new Date().toISOString();
  return state;
}

module.exports = {
  FULL_SIZE,
  MINI_SIZE,
  normalizeBounds,
  normalizeWindowState,
  restoreBounds,
  sanitizeMode,
  updateWindowState
};
