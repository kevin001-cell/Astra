const fs = require('node:fs');
const path = require('node:path');

const LOCAL_AI_MODES = ['auto', 'online', 'local', 'rules'];
const LOCAL_AI_PROFILES = Object.freeze([
  { value: 'light', label: '轻量模式', contextSize: 2048, maxTokens: 384, description: '适合 8 GB 内存和 1B–2B Q4 模型' },
  { value: 'balanced', label: '均衡模式', contextSize: 4096, maxTokens: 640, description: '适合 16 GB 内存和 3B–4B Q4 模型' },
  { value: 'quality', label: '质量模式', contextSize: 6144, maxTokens: 900, description: '适合 24 GB 以上内存和 7B–8B Q4 模型' }
]);
const REQUIRED_WINDOWS_RUNTIME_DLLS = Object.freeze(['msvcp140.dll', 'vcruntime140.dll', 'vcruntime140_1.dll']);

const DEFAULT_LOCAL_AI_SETTINGS = Object.freeze({
  mode: 'auto',
  enabled: false,
  runtimePath: '',
  modelPath: '',
  mmprojPath: '',
  profile: 'balanced',
  threads: 4,
  gpuLayers: 0,
  port: 39271,
  autoStart: true,
  keepAliveMinutes: 10,
  wizardDismissed: false
});

function clampInteger(value, fallback, minimum, maximum) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}

function normalizeExecutablePath(value, expectedNames) {
  const filePath = String(value || '').trim().slice(0, 1000);
  if (!filePath) return '';
  const fileName = path.basename(filePath).toLowerCase();
  return expectedNames.includes(fileName) ? filePath : '';
}

function normalizeModelPath(value) {
  const filePath = String(value || '').trim().slice(0, 1000);
  return filePath && path.extname(filePath).toLowerCase() === '.gguf' ? filePath : '';
}

function normalizeLocalAiSettings(value = {}) {
  const profile = LOCAL_AI_PROFILES.some(item => item.value === value.profile) ? value.profile : DEFAULT_LOCAL_AI_SETTINGS.profile;
  return {
    mode: LOCAL_AI_MODES.includes(value.mode) ? value.mode : DEFAULT_LOCAL_AI_SETTINGS.mode,
    enabled: value.enabled === true,
    runtimePath: normalizeExecutablePath(value.runtimePath, ['llama-server.exe', 'llama-server']),
    modelPath: normalizeModelPath(value.modelPath),
    mmprojPath: normalizeModelPath(value.mmprojPath),
    profile,
    threads: clampInteger(value.threads, DEFAULT_LOCAL_AI_SETTINGS.threads, 1, 32),
    gpuLayers: clampInteger(value.gpuLayers, DEFAULT_LOCAL_AI_SETTINGS.gpuLayers, 0, 999),
    port: clampInteger(value.port, DEFAULT_LOCAL_AI_SETTINGS.port, 20000, 60000),
    autoStart: value.autoStart !== false,
    keepAliveMinutes: clampInteger(value.keepAliveMinutes, DEFAULT_LOCAL_AI_SETTINGS.keepAliveMinutes, 0, 120),
    wizardDismissed: value.wizardDismissed === true
  };
}

function localAiProfile(value) {
  const settings = normalizeLocalAiSettings(value);
  return LOCAL_AI_PROFILES.find(item => item.value === settings.profile) || LOCAL_AI_PROFILES[1];
}

function buildLocalServerArgs(value) {
  const settings = normalizeLocalAiSettings(value);
  if (!settings.runtimePath || !settings.modelPath) throw new Error('请先选择 llama-server 和 GGUF 模型。');
  const profile = localAiProfile(settings);
  const args = [
    '--model', settings.modelPath,
    '--host', '127.0.0.1',
    '--port', String(settings.port),
    '--ctx-size', String(profile.contextSize),
    '--threads', String(settings.threads),
    '--n-gpu-layers', String(settings.gpuLayers),
    '--parallel', '1',
    '--no-webui'
  ];
  if (settings.mmprojPath) args.push('--mmproj', settings.mmprojPath);
  return args;
}

function localChatEndpoint(value) {
  const settings = normalizeLocalAiSettings(value);
  return `http://127.0.0.1:${settings.port}/v1/chat/completions`;
}

function localHealthEndpoint(value) {
  const settings = normalizeLocalAiSettings(value);
  return `http://127.0.0.1:${settings.port}/health`;
}

function localAiReady(value) {
  const settings = normalizeLocalAiSettings(value);
  return settings.enabled && Boolean(settings.runtimePath && settings.modelPath);
}

function chooseChatBackend(value, onlineReady, hasImages = false) {
  const settings = normalizeLocalAiSettings(value);
  const localReady = localAiReady(settings) && (!hasImages || Boolean(settings.mmprojPath));
  if (settings.mode === 'rules') return 'rules';
  if (settings.mode === 'online') return onlineReady ? 'online' : 'rules';
  if (settings.mode === 'local') return localReady ? 'local' : 'rules';
  if (onlineReady) return 'online';
  return localReady ? 'local' : 'rules';
}

function missingWindowsRuntimeDlls(runtimePath, fileExists = fs.existsSync) {
  const directory = path.dirname(String(runtimePath || ''));
  return REQUIRED_WINDOWS_RUNTIME_DLLS.filter(fileName => !fileExists(path.join(directory, fileName)));
}

function describeRuntimeExitCode(value) {
  const code = Number(value);
  if (!Number.isFinite(code)) return '运行时进程未返回退出码。';
  const unsigned = code >>> 0;
  if (unsigned === 0xc0000022) return 'Windows 应用控制或安全策略拒绝启动本地运行时。';
  if (unsigned === 0xc000001d) return '运行时包含当前 CPU 不支持的指令。请更换兼容的 CPU 版 llama-server。';
  if (unsigned === 0xc0000135) return '运行时缺少所需 DLL 或 Microsoft Visual C++ 运行库。';
  if (unsigned === 0xc000007b) return '运行时或依赖 DLL 的 32/64 位架构不匹配。';
  if (unsigned === 0xc0000142) return '运行时 DLL 初始化失败。';
  return `运行时进程退出：${code}`;
}

module.exports = {
  DEFAULT_LOCAL_AI_SETTINGS,
  LOCAL_AI_MODES,
  LOCAL_AI_PROFILES,
  REQUIRED_WINDOWS_RUNTIME_DLLS,
  buildLocalServerArgs,
  chooseChatBackend,
  describeRuntimeExitCode,
  localAiProfile,
  localAiReady,
  localChatEndpoint,
  localHealthEndpoint,
  missingWindowsRuntimeDlls,
  normalizeLocalAiSettings,
  normalizeModelPath
};
