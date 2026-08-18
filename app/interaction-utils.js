(function exposeInteractionUtils(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.astraInteraction = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const COMMANDS = Object.freeze([
    { id: 'calculator', command: '/计算器', label: '打开计算器', hint: '固定白名单工具', mode: 'send', value: '打开计算器' },
    { id: 'screenshot', command: '/截图', label: '进行屏幕截图', hint: '需要用户主动触发', mode: 'action', value: 'screenshot' },
    { id: 'reminder', command: '/提醒', label: '创建提醒', hint: '补充时间和内容后发送', mode: 'insert', value: '提醒我 10 分钟后 ' },
    { id: 'focus', command: '/专注', label: '打开专注陪伴', hint: '番茄钟与休息提醒', mode: 'action', value: 'focus' },
    { id: 'voice', command: '/语音', label: '开始语音输入', hint: '使用当前语音配置', mode: 'action', value: 'voice' },
    { id: 'mini', command: '/迷你', label: '切换迷你桌宠', hint: '保留当前对话状态', mode: 'action', value: 'mini' },
    { id: 'settings', command: '/设置', label: '打开设置', hint: 'AI、语音与安全选项', mode: 'action', value: 'settings' }
  ]);

  function commandSuggestions(query, limit = 6) {
    const normalized = String(query || '').trim().toLowerCase();
    if (!normalized.startsWith('/')) return [];
    return COMMANDS.filter(item => `${item.command} ${item.label}`.toLowerCase().includes(normalized)).slice(0, Math.max(1, Math.min(8, Number(limit) || 6)));
  }

  function historySelection(history, currentIndex, direction) {
    const entries = Array.isArray(history) ? history.filter(Boolean) : [];
    if (!entries.length) return { index: -1, value: '' };
    const index = Number.isInteger(currentIndex) ? currentIndex : entries.length;
    const next = direction < 0 ? Math.max(0, index - 1) : Math.min(entries.length, index + 1);
    return { index: next, value: next === entries.length ? '' : entries[next] };
  }

  function classifyDragFeedback(value = {}) {
    const bounds = value.bounds || {};
    const workArea = value.workArea || {};
    const tolerance = 12;
    const edges = [];
    const hasWorkArea = Number(workArea.width) > 0 && Number(workArea.height) > 0;
    if (hasWorkArea && Math.abs(Number(bounds.x) - Number(workArea.x)) <= tolerance) edges.push('left');
    if (hasWorkArea && Math.abs(Number(bounds.x) + Number(bounds.width) - (Number(workArea.x) + Number(workArea.width))) <= tolerance) edges.push('right');
    if (hasWorkArea && Math.abs(Number(bounds.y) - Number(workArea.y)) <= tolerance) edges.push('top');
    if (hasWorkArea && Math.abs(Number(bounds.y) + Number(bounds.height) - (Number(workArea.y) + Number(workArea.height))) <= tolerance) edges.push('bottom');
    if (edges.length) {
      const edge = edges.includes('bottom') ? 'bottom' : edges[0];
      return { kind: 'edge', edge, motion: edge === 'bottom' ? 'stretch' : 'look', message: edge === 'bottom' ? '这里适合坐一会儿。' : '已在屏幕边缘停稳。' };
    }
    const speed = Math.max(0, Number(value.maxSpeed) || 0);
    const distance = Math.max(0, Number(value.distance) || 0);
    if (speed >= 1400 || distance >= 260) return { kind: 'heavy', edge: '', motion: 'shake', message: '落地有点快，不过状态正常。' };
    return { kind: 'light', edge: '', motion: 'nod', message: '位置调整好了。' };
  }

  function normalizedAngleDelta(current, previous) {
    let delta = current - previous;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
  }

  function proximityReaction(previous = {}, snapshot = {}, now = Date.now()) {
    const state = {
      nearby: previous.nearby === true,
      nearSince: Number(previous.nearSince) || 0,
      lastFastAt: Number(previous.lastFastAt) || 0,
      lastDwellAt: Number(previous.lastDwellAt) || 0,
      lastCircleAt: Number(previous.lastCircleAt) || 0,
      lastAngle: Number.isFinite(previous.lastAngle) ? previous.lastAngle : null,
      angleTravel: Math.max(0, Number(previous.angleTravel) || 0)
    };
    const nearby = snapshot.nearby === true;
    if (!nearby) return { state: { ...state, nearby: false, nearSince: 0, lastAngle: null, angleTravel: 0 }, event: state.nearby ? 'leave' : '' };
    if (!state.nearby) {
      state.nearby = true;
      state.nearSince = now;
      state.angleTravel = 0;
    }
    const angle = Math.atan2(Number(snapshot.lookY) || 0, Number(snapshot.lookX) || 0);
    if (state.lastAngle !== null) state.angleTravel += Math.abs(normalizedAngleDelta(angle, state.lastAngle));
    state.lastAngle = angle;
    if (snapshot.fast === true && now - state.lastFastAt >= 5000) {
      state.lastFastAt = now;
      return { state, event: 'fast' };
    }
    if (state.angleTravel >= 4.8 && (!state.lastCircleAt || now - state.lastCircleAt >= 30000)) {
      state.lastCircleAt = now;
      state.angleTravel = 0;
      return { state, event: 'circle' };
    }
    if (now - state.nearSince >= 3000 && (!state.lastDwellAt || now - state.lastDwellAt >= 30000)) {
      state.lastDwellAt = now;
      return { state, event: 'dwell' };
    }
    return { state, event: previous.nearby ? '' : 'enter' };
  }

  return { COMMANDS, commandSuggestions, historySelection, classifyDragFeedback, proximityReaction };
});
