const ACTION_TYPES = Object.freeze(['open-tool', 'open-app', 'set-volume', 'start-focus', 'set-scenario', 'set-window-mode', 'show-summary']);
const WINDOW_MODES = ['full', 'mini', 'hidden'];

function normalizeWorkflowAction(value = {}) {
  const type = ACTION_TYPES.includes(value.type) ? value.type : '';
  if (!type) return null;
  if (type === 'open-tool') return { type, id: ['browser', 'notepad', 'calculator', 'downloads', 'settings'].includes(value.id) ? value.id : '' };
  if (type === 'open-app') return { type, id: String(value.id || '').slice(0, 100) };
  if (type === 'set-volume') return { type, value: Math.max(0, Math.min(100, Math.round(Number(value.value) || 0))) };
  if (type === 'start-focus') return { type, minutes: Math.max(1, Math.min(180, Math.round(Number(value.minutes) || 25))) };
  if (type === 'set-scenario') return { type, id: ['normal', 'work', 'leisure', 'game', 'meeting', 'sleep'].includes(value.id) ? value.id : 'normal' };
  if (type === 'set-window-mode') return { type, id: WINDOW_MODES.includes(value.id) ? value.id : 'full' };
  return { type: 'show-summary' };
}

function normalizeWorkflowStore(value = {}) {
  const workflows = Array.isArray(value.workflows) ? value.workflows.flatMap(item => {
    const id = String(item?.id || '').slice(0, 100);
    const name = String(item?.name || '').trim().slice(0, 60);
    const actions = Array.isArray(item?.actions) ? item.actions.map(normalizeWorkflowAction).filter(action => action && !Object.values(action).includes('')).slice(0, 8) : [];
    if (!id || !name || !actions.length) return [];
    return [{ id, name, enabled: item.enabled !== false, confirmBeforeRun: item.confirmBeforeRun !== false, actions, createdAt: Number(item.createdAt) || Date.now(), updatedAt: Number(item.updatedAt) || Date.now() }];
  }).slice(0, 30) : [];
  return { version: 1, workflows };
}

function createWorkflow(value, input, id, now = Date.now()) {
  const store = normalizeWorkflowStore(value);
  const workflow = normalizeWorkflowStore({ workflows: [{ ...input, id, createdAt: now, updatedAt: now }] }).workflows[0];
  if (!workflow) throw new Error('工作流至少需要一个有效白名单动作。');
  store.workflows.push(workflow);
  return { store: normalizeWorkflowStore(store), workflow };
}

function removeWorkflow(value, id) {
  const store = normalizeWorkflowStore(value);
  const before = store.workflows.length;
  store.workflows = store.workflows.filter(item => item.id !== String(id || ''));
  return { store, removed: store.workflows.length !== before };
}

module.exports = { ACTION_TYPES, createWorkflow, normalizeWorkflowAction, normalizeWorkflowStore, removeWorkflow };
