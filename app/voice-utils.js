(function exposeVoiceUtils(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.astraVoice = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  function calculateVoiceLevel(samples) {
    if (!samples?.length) return { rms: 0, level: 0 };
    let total = 0;
    for (const sample of samples) {
      const normalized = (sample - 128) / 128;
      total += normalized * normalized;
    }
    const rms = Math.sqrt(total / samples.length);
    return { rms, level: Math.min(1, Math.max(0, (rms - 0.008) * 14)) };
  }

  function voiceStopReason(state) {
    const now = Number(state?.now) || 0;
    const startedAt = Number(state?.startedAt) || 0;
    if (now - startedAt >= 30000) return 'limit';
    if (state?.heardVoice && now - Number(state.lastVoiceAt || 0) >= 1200 && now - startedAt >= 900) return 'silence';
    return '';
  }

  return { calculateVoiceLevel, voiceStopReason };
});
