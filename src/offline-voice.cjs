const path = require('node:path');

const DEFAULT_OFFLINE_VOICE_SETTINGS = Object.freeze({ enabled: false, runtimePath: '', modelPath: '', language: 'zh', threads: 4 });

function normalizeOfflineVoiceSettings(value = {}) {
  const runtimePath = String(value.runtimePath || '').trim().slice(0, 1000);
  const modelPath = String(value.modelPath || '').trim().slice(0, 1000);
  const language = ['zh', 'auto', 'en'].includes(value.language) ? value.language : 'zh';
  return {
    enabled: value.enabled === true,
    runtimePath: ['whisper-cli.exe', 'main.exe', 'whisper-cli'].includes(path.basename(runtimePath).toLowerCase()) ? runtimePath : '',
    modelPath: path.extname(modelPath).toLowerCase() === '.bin' ? modelPath : '',
    language,
    threads: Math.max(1, Math.min(32, Math.round(Number(value.threads) || 4)))
  };
}

function buildWhisperArgs(value, wavPath) {
  const settings = normalizeOfflineVoiceSettings(value);
  if (!settings.runtimePath || !settings.modelPath) throw new Error('请先选择 whisper-cli 和 Whisper 模型。');
  return ['-m', settings.modelPath, '-f', wavPath, '-l', settings.language, '-t', String(settings.threads), '-nt', '-np'];
}

function offlineVoiceReady(value) {
  const settings = normalizeOfflineVoiceSettings(value);
  return settings.enabled && Boolean(settings.runtimePath && settings.modelPath);
}

module.exports = { DEFAULT_OFFLINE_VOICE_SETTINGS, buildWhisperArgs, normalizeOfflineVoiceSettings, offlineVoiceReady };
