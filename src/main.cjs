const { app, BrowserWindow, clipboard, desktopCapturer, dialog, ipcMain, Menu, Notification, Tray, globalShortcut, nativeImage, net, powerMonitor, safeStorage, screen, session, shell } = require('electron');
const { createHash, randomUUID } = require('node:crypto');
const { execFile, spawn } = require('node:child_process');
const fs = require('node:fs');
const nodeNet = require('node:net');
const os = require('node:os');
const path = require('node:path');
const {
  DEFAULT_TRANSCRIPTION_MODEL,
  audioFilename,
  normalizeApiEndpoint,
  normalizeAudioMimeType,
  parseTranscriptionResponse,
  validateAudioBytes
} = require('./audio.cjs');
const { claimControlChannel } = require('./control-channel.cjs');
const { createSseParser, streamDelta, streamMetrics } = require('./chat-stream.cjs');
const {
  buildCompanionPrompt,
  getCompanionState,
  getPreferredAddress,
  normalizeCompanionStore,
  recordCompanionEvent,
  resetCompanionStore,
  saveCompanionSettings
} = require('./companion.cjs');
const { inspectJsonStorage, readJsonFile, writeJsonFileAtomic } = require('./json-store.cjs');
const { clearFocusHistory, completeFocus, normalizeFocusStore, saveFocusSettings, startFocus, stopFocus } = require('./focus.cjs');
const { buildUserContent, normalizeImageAttachments } = require('./images.cjs');
const { buildKnowledgeContext, normalizeKnowledgeStore, searchKnowledge } = require('./knowledge.cjs');
const {
  TRUSTED_MODEL_CATALOG,
  describeModelDownloadError,
  dynamicStartupTimeoutMs,
  estimateModelMemoryBytes,
  inspectGgufFile,
  managedModelPath,
  modelDownloadErrorDetail,
  modelDirectoryPath,
  recommendedProfileForMemory,
  sanitizeStartupError,
  trustedModelById
} = require('./model-manager.cjs');
const {
  LOCAL_AI_PROFILES,
  buildLocalServerArgs,
  chooseChatBackend,
  describeRuntimeExitCode,
  localAiProfile,
  localAiReady,
  localChatEndpoint,
  localHealthEndpoint,
  missingWindowsRuntimeDlls,
  normalizeLocalAiSettings
} = require('./local-ai.cjs');
const { buildWhisperArgs, normalizeOfflineVoiceSettings, offlineVoiceReady } = require('./offline-voice.cjs');
const { normalizeScenarioStore, scenarioState, scheduledScenario } = require('./scenarios.cjs');
const { createWorkflow, normalizeWorkflowStore, removeWorkflow } = require('./workflows.cjs');
const {
  addMemory,
  buildMemoryPrompt,
  clearMemories,
  normalizeMemoryStore,
  removeMemory,
  saveProfile,
  updateMemory
} = require('./memory.cjs');
const {
  addReminder: addPlannerReminder,
  addTask,
  buildDailySummary,
  buildLocalContext,
  buildStartupGreeting,
  hasReachedDailySummaryTime,
  isQuietTime,
  localDateKey,
  nextQuietEnd,
  normalizePlannerStore,
  normalizeProactiveSettings,
  removeReminder: removePlannerReminder,
  removeTask,
  updateTask
} = require('./proactive.cjs');
const {
  createHistoryEntry,
  normalizeReminder,
  sanitizeClipboardText,
  sanitizeSearchQuery,
  sanitizeVolume
} = require('./skills.cjs');
const {
  ALLOWED_RESTORE_SHORTCUTS,
  buildRelaunchArgs,
  clampWindowPositionToWorkArea,
  formatShortcutLabel,
  getRestoreShortcutCandidates,
  getSafeModeChromiumSwitches,
  redactSensitive,
  sanitizeRestoreShortcut
} = require('./stability.cjs');
const {
  REALTIME_MODELS,
  REALTIME_VAD_MODES,
  REALTIME_VOICES,
  buildRealtimeSession,
  normalizeRealtimeEndpoint,
  sanitizeRealtimeIdleMinutes,
  sanitizeRealtimeMaxMinutes,
  sanitizeRealtimeModel,
  sanitizeRealtimeRuntimeStatus,
  sanitizeRealtimeVadMode,
  sanitizeRealtimeVoice,
  validateOfferSdp
} = require('./realtime.cjs');
const { runWindowsVolume } = require('./windows-volume.cjs');
const {
  FULL_SIZE,
  MINI_SIZE,
  normalizeWindowState,
  restoreBounds,
  sanitizeMode,
  updateWindowState
} = require('./window-state.cjs');

let mainWindow;
let tray;
let isQuitting = false;
let isClickThrough = false;
let clickThroughTimer;
let controlServer;
let restoreRequested = false;
let activeRestoreShortcut = '';
let registeredRestoreShortcuts = [];
let controlPipeListening = false;
const reminderTimers = new Map();
let proactiveTimer;
let startupGreetingDelivered = false;
const storageRecoveryEvents = new Set();
let realtimeRuntimeStatus = sanitizeRealtimeRuntimeStatus();
let companionRuntimeStatus = { state: 'idle', animation: '', recovering: false, updatedAt: '' };
let currentWindowMode = 'full';
let windowStateSaveTimer;
let previousRunCrashed = false;
let environmentTimer;
let contextCheckCounter = 0;
let lastContextSnapshot = { processName: '', fullScreen: false, batteryPercent: -1, charging: false };
let lastEnvironmentSnapshot = {};
let lastCursorSample;
let fullscreenSuppressed = false;
let focusTimer;
let scenarioTimer;
let localServerProcess;
let localServerSettings;
let localServerStatus = { state: 'stopped', phase: 'stopped', pid: 0, error: '', startedAt: 0, model: '', activePort: 0, restartAttempts: 0 };
let localServerLastUsedAt = 0;
let localServerStopTimer;
let localServerStableTimer;
let localServerRestartAttempts = 0;
let localModelInspectionCache;
let localRuntimeSelfTestCache;
let modelDownloadTask;
let modelDownloadState = { state: 'idle', modelId: '', receivedBytes: 0, totalBytes: 0, speedBytesPerSecond: 0, error: '', filePath: '' };
const activeChatStreams = new Map();
const expectedLocalServerExits = new WeakSet();

const APP_NAME = 'Astra Desktop';
const IS_SMOKE_TEST = process.env.ASTRA_SMOKE_TEST === '1';
const IS_SAFE_MODE = process.argv.includes('--safe-mode') || process.env.ASTRA_SAFE_MODE === '1';
const SOFTWARE_RENDERING_MODE = IS_SMOKE_TEST || IS_SAFE_MODE;
const STARTED_AT = new Date().toISOString();
const LOG_MAX_BYTES = 1024 * 1024;
const MAX_SKILL_HISTORY = 80;
const MAX_FILE_SEARCH_RESULTS = 30;
const MAX_FILE_SEARCH_ENTRIES = 12000;
const MAX_TIMER_DELAY = 2147480000;
const API_KEY_MASK = '••••••••••••';
if (SOFTWARE_RENDERING_MODE) {
  app.disableHardwareAcceleration();
  for (const chromiumSwitch of getSafeModeChromiumSwitches()) app.commandLine.appendSwitch(chromiumSwitch);
}
if (IS_SMOKE_TEST) {
  app.setPath('userData', path.join(app.getPath('temp'), `astra-desktop-smoke-${process.pid}`));
}
const CONTROL_PIPE = '\\\\.\\pipe\\astra-desktop-control-v2';
const CLICK_THROUGH_AUTO_RESTORE_SECONDS = 20;
const SYSTEM_PROMPT = [
  '你是 Astra，一位简洁、可靠、友好的中文桌面助手。',
  '回答应直接、短小、可执行。',
  '你不能声称已经执行电脑操作，除非客户端明确告诉你工具执行成功。',
  '遇到删除文件、支付、发送消息、安装软件等高风险请求时，必须要求用户确认。'
].join('');
const SKILL_DEFINITIONS = [
  { id: 'clipboard', name: '剪贴板', description: '读取或写入文本剪贴板', risk: 'low' },
  { id: 'screenshot', name: '屏幕截图', description: '保存当前鼠标所在屏幕截图', risk: 'low' },
  { id: 'volume', name: '系统音量', description: '读取、设置或切换静音', risk: 'low' },
  { id: 'files', name: '文件搜索', description: '搜索桌面、文档和下载目录', risk: 'low' },
  { id: 'reminders', name: '持久提醒', description: '重启后仍然保留本地提醒', risk: 'low' }
];

function logFilePath() {
  return path.join(app.getPath('userData'), 'logs', 'astra.log');
}

function writeLog(level, event, details = {}) {
  try {
    const filePath = logFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > LOG_MAX_BYTES) {
      const previousPath = path.join(path.dirname(filePath), 'astra.previous.log');
      fs.rmSync(previousPath, { force: true });
      fs.renameSync(filePath, previousPath);
    }
    fs.appendFileSync(filePath, `${JSON.stringify({
      time: new Date().toISOString(),
      level,
      event,
      pid: process.pid,
      details: redactSensitive(details)
    })}\n`, 'utf8');
  } catch (error) {
    console.error('Astra log write failed:', error);
  }
}

function joinIfPresent(basePath, ...parts) {
  return basePath ? path.join(basePath, ...parts) : null;
}

const DETECTED_APP_CANDIDATES = [
  {
    id: 'wechat',
    name: '微信',
    keywords: ['微信', 'wechat'],
    paths: [
      joinIfPresent(process.env.ProgramFiles, 'Tencent', 'WeChat', 'WeChat.exe'),
      joinIfPresent(process.env['ProgramFiles(x86)'], 'Tencent', 'WeChat', 'WeChat.exe'),
      joinIfPresent(process.env.LOCALAPPDATA, 'Tencent', 'WeChat', 'WeChat.exe')
    ]
  },
  {
    id: 'qq',
    name: 'QQ',
    keywords: ['qq', '腾讯qq'],
    paths: [
      joinIfPresent(process.env.ProgramFiles, 'Tencent', 'QQNT', 'QQ.exe'),
      joinIfPresent(process.env['ProgramFiles(x86)'], 'Tencent', 'QQNT', 'QQ.exe'),
      joinIfPresent(process.env['ProgramFiles(x86)'], 'Tencent', 'QQ', 'Bin', 'QQ.exe'),
      joinIfPresent(process.env.LOCALAPPDATA, 'Programs', 'QQ', 'QQ.exe')
    ]
  },
  {
    id: 'vscode',
    name: 'VS Code',
    keywords: ['vs code', 'vscode', 'visual studio code', '代码编辑器'],
    paths: [
      joinIfPresent(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      joinIfPresent(process.env.ProgramFiles, 'Microsoft VS Code', 'Code.exe'),
      joinIfPresent(process.env['ProgramFiles(x86)'], 'Microsoft VS Code', 'Code.exe')
    ]
  }
];

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function remindersPath() {
  return path.join(app.getPath('userData'), 'reminders.json');
}

function plannerPath() {
  return path.join(app.getPath('userData'), 'planner.json');
}

function skillHistoryPath() {
  return path.join(app.getPath('userData'), 'skill-history.json');
}

function memoryPath() {
  return path.join(app.getPath('userData'), 'memory.json');
}

function companionPath() {
  return path.join(app.getPath('userData'), 'companion.json');
}

function focusPath() {
  return path.join(app.getPath('userData'), 'focus.json');
}

function localAiPath() {
  return path.join(app.getPath('userData'), 'local-ai.json');
}

function localAiRuntimePath() {
  return path.join(app.getPath('userData'), 'local-ai-runtime.json');
}

function localModelDirectory() {
  return modelDirectoryPath(app.getPath('documents'));
}

function offlineVoicePath() {
  return path.join(app.getPath('userData'), 'offline-voice.json');
}

function knowledgePath() {
  return path.join(app.getPath('userData'), 'knowledge.json');
}

function scenariosPath() {
  return path.join(app.getPath('userData'), 'scenarios.json');
}

function workflowsPath() {
  return path.join(app.getPath('userData'), 'workflows.json');
}

function windowStatePath() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function runtimeStatePath() {
  return path.join(app.getPath('userData'), 'runtime-state.json');
}

function volumeHelperPath() {
  return app.isPackaged ? path.join(process.resourcesPath, 'volume-helper.exe') : path.join(__dirname, '..', 'build', 'volume-helper.exe');
}

function contextHelperPath() {
  return app.isPackaged ? path.join(process.resourcesPath, 'context-helper.exe') : path.join(__dirname, '..', 'build', 'context-helper.exe');
}

function bundledLlamaRuntimePath() {
  return app.isPackaged ? path.join(process.resourcesPath, 'local-runtime', 'llama', 'llama-server.exe') : path.join(__dirname, '..', 'build', 'local-runtime', 'llama', 'llama-server.exe');
}

function bundledWhisperRuntimePath() {
  return app.isPackaged ? path.join(process.resourcesPath, 'local-runtime', 'whisper', 'Release', 'whisper-cli.exe') : path.join(__dirname, '..', 'build', 'local-runtime', 'whisper', 'Release', 'whisper-cli.exe');
}

function readJsonArray(filePath) {
  const value = readStoredJson(filePath, []);
  return Array.isArray(value) ? value : [];
}

function writeJsonArray(filePath, value) {
  writeJsonFileAtomic(filePath, value);
}

function readStoredJson(filePath, fallback) {
  const result = readJsonFile(filePath, fallback);
  if (result.recovered) {
    writeJsonFileAtomic(filePath, result.value);
    if (!storageRecoveryEvents.has(filePath)) {
      storageRecoveryEvents.add(filePath);
      writeLog('warn', 'json-storage-recovered', { file: path.basename(filePath), source: result.source });
    }
  }
  return result.value;
}

function readSettingsFile() {
  return readStoredJson(settingsPath(), {});
}

function writeSettingsFile(settings) {
  writeJsonFileAtomic(settingsPath(), settings);
}

function readMemoryStore() {
  return normalizeMemoryStore(readStoredJson(memoryPath(), {}));
}

function writeMemoryStore(store) {
  const normalized = normalizeMemoryStore(store);
  writeJsonFileAtomic(memoryPath(), normalized);
  return normalized;
}

function readCompanionStore() {
  return normalizeCompanionStore(readStoredJson(companionPath(), {}));
}

function writeCompanionStore(store) {
  const normalized = normalizeCompanionStore(store);
  writeJsonFileAtomic(companionPath(), normalized);
  return normalized;
}

function readFocusStore() {
  return normalizeFocusStore(readStoredJson(focusPath(), {}));
}

function writeFocusStore(store) {
  const normalized = normalizeFocusStore(store);
  writeJsonFileAtomic(focusPath(), normalized);
  return normalized;
}

function readLocalAiSettings() {
  const settings = normalizeLocalAiSettings(readStoredJson(localAiPath(), {}));
  if ((!settings.runtimePath || !fs.existsSync(settings.runtimePath)) && fs.existsSync(bundledLlamaRuntimePath())) settings.runtimePath = bundledLlamaRuntimePath();
  return settings;
}

function writeLocalAiSettings(settings) {
  const normalized = normalizeLocalAiSettings(settings);
  if (localModelInspectionCache?.filePath !== normalized.modelPath) localModelInspectionCache = undefined;
  writeJsonFileAtomic(localAiPath(), normalized);
  return normalized;
}

function readLocalAiRuntimeRecord() {
  const value = readStoredJson(localAiRuntimePath(), {});
  return {
    lastError: sanitizeStartupError(value.lastError),
    lastErrorAt: String(value.lastErrorAt || '').slice(0, 40),
    model: path.basename(String(value.model || '')).slice(0, 180)
  };
}

function writeLocalAiRuntimeError(error, modelPath = '') {
  const message = sanitizeStartupError(error instanceof Error ? error.message : error);
  if (!message) return;
  writeJsonFileAtomic(localAiRuntimePath(), { lastError: message, lastErrorAt: new Date().toISOString(), model: path.basename(String(modelPath || '')) });
}

function clearLocalAiRuntimeError() {
  fs.rmSync(localAiRuntimePath(), { force: true });
  fs.rmSync(`${localAiRuntimePath()}.bak`, { force: true });
}

function readOfflineVoiceSettings() {
  const settings = normalizeOfflineVoiceSettings(readStoredJson(offlineVoicePath(), {}));
  if ((!settings.runtimePath || !fs.existsSync(settings.runtimePath)) && fs.existsSync(bundledWhisperRuntimePath())) settings.runtimePath = bundledWhisperRuntimePath();
  return settings;
}

function writeOfflineVoiceSettings(settings) {
  const normalized = normalizeOfflineVoiceSettings(settings);
  writeJsonFileAtomic(offlineVoicePath(), normalized);
  return normalized;
}

function readKnowledgeStore() {
  return normalizeKnowledgeStore(readStoredJson(knowledgePath(), {}));
}

function writeKnowledgeStore(store) {
  const normalized = normalizeKnowledgeStore(store);
  writeJsonFileAtomic(knowledgePath(), normalized);
  return normalized;
}

function readScenarioStore() {
  return normalizeScenarioStore(readStoredJson(scenariosPath(), {}));
}

function writeScenarioStore(store) {
  const normalized = normalizeScenarioStore(store);
  writeJsonFileAtomic(scenariosPath(), normalized);
  return normalized;
}

function readWorkflowStore() {
  return normalizeWorkflowStore(readStoredJson(workflowsPath(), {}));
}

function writeWorkflowStore(store) {
  const normalized = normalizeWorkflowStore(store);
  writeJsonFileAtomic(workflowsPath(), normalized);
  return normalized;
}

function readWindowState() {
  const primaryWorkArea = app.isReady() ? screen.getPrimaryDisplay().workArea : undefined;
  return normalizeWindowState(readStoredJson(windowStatePath(), {}), primaryWorkArea);
}

function writeWindowState(store) {
  const normalized = normalizeWindowState(store, app.isReady() ? screen.getPrimaryDisplay().workArea : undefined);
  writeJsonFileAtomic(windowStatePath(), normalized);
  return normalized;
}

function markRuntimeState(cleanExit) {
  writeJsonFileAtomic(runtimeStatePath(), {
    cleanExit: cleanExit === true,
    pid: process.pid,
    version: app.getVersion(),
    updatedAt: new Date().toISOString()
  });
}

function companionPublicState(store = readCompanionStore()) {
  const state = getCompanionState(store);
  const memory = readMemoryStore();
  return {
    ...state,
    preferredAddress: getPreferredAddress(store, memory.profile.displayName)
  };
}

function emitCompanionUpdate(result, eventType = '') {
  const payload = {
    state: companionPublicState(result.store),
    eventType,
    scoreDelta: result.scoreDelta || 0,
    newlyUnlocked: result.newlyUnlocked || []
  };
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('companion:updated', payload);
  return payload;
}

function recordCompanionActivity(type, key = '') {
  const result = recordCompanionEvent(readCompanionStore(), { type, key });
  if (result.changed || result.newlyUnlocked.length) {
    writeCompanionStore(result.store);
    emitCompanionUpdate(result, type);
  }
  return { ...result, state: companionPublicState(result.store) };
}

function saveLocalCompanionSettings(settings) {
  const result = saveCompanionSettings(readCompanionStore(), settings || {});
  writeCompanionStore(result.store);
  writeLog('info', 'companion-settings-saved', result.store.settings);
  emitCompanionUpdate({ ...result, scoreDelta: 0 }, 'settings');
  return companionPublicState(result.store);
}

function resetLocalCompanion() {
  const store = resetCompanionStore(readCompanionStore());
  writeCompanionStore(store);
  writeLog('info', 'companion-progress-reset');
  emitCompanionUpdate({ store, scoreDelta: 0, newlyUnlocked: [] }, 'reset');
  return companionPublicState(store);
}

function readPlannerStore() {
  return normalizePlannerStore(readStoredJson(plannerPath(), () => ({ reminders: readJsonArray(remindersPath()) })));
}

function writePlannerStore(store) {
  const normalized = normalizePlannerStore(store);
  writeJsonFileAtomic(plannerPath(), normalized);
  return normalized;
}

function getPlannerState() {
  const store = readPlannerStore();
  return {
    ...store,
    settings: normalizeProactiveSettings(readSettingsFile()),
    summary: buildDailySummary(store)
  };
}

function addLocalTask(input) {
  const result = addTask(readPlannerStore(), input || {}, { id: randomUUID() });
  writePlannerStore(result.store);
  writeLog('info', 'planner-task-added', { taskId: result.task.id, hasDueAt: Boolean(result.task.dueAt) });
  return { task: result.task, state: getPlannerState() };
}

function updateLocalTask(id, patch) {
  const currentStore = readPlannerStore();
  const previous = currentStore.tasks.find(task => task.id === String(id || ''));
  const result = updateTask(currentStore, id, patch || {});
  writePlannerStore(result.store);
  writeLog('info', 'planner-task-updated', { taskId: result.task.id, completed: result.task.completed, hasDueAt: Boolean(result.task.dueAt) });
  if (!previous?.completed && result.task.completed) recordCompanionActivity('task', `task:${result.task.id}`);
  if (!previous?.completed && result.task.completed) {
    const recent = result.store.tasks.filter(task => task.completed).sort((left, right) => right.updatedAt - left.updatedAt).slice(0, 3);
    if (recent.length === 3 && recent[0].updatedAt - recent[2].updatedAt <= 10 * 60 * 1000) mainWindow?.webContents.send('companion:action', { phase: 'success', kind: 'task', id: 'task-streak' });
  }
  return { task: result.task, state: getPlannerState() };
}

function removeLocalTask(id) {
  const result = removeTask(readPlannerStore(), id);
  writePlannerStore(result.store);
  writeLog('info', 'planner-task-removed', { taskId: String(id || '').slice(0, 100), removed: result.removed });
  return { removed: result.removed, state: getPlannerState() };
}

function getMemoryState() {
  return readMemoryStore();
}

function addLocalMemory(input) {
  const result = addMemory(readMemoryStore(), input, { id: randomUUID() });
  writeMemoryStore(result.store);
  writeLog('info', result.created ? 'memory-added' : 'memory-refreshed', {
    id: result.memory.id,
    category: result.memory.category,
    characters: result.memory.text.length,
    pinned: result.memory.pinned
  });
  return { memory: result.memory, created: result.created, state: result.store };
}

function updateLocalMemory(id, patch) {
  const result = updateMemory(readMemoryStore(), id, patch || {});
  writeMemoryStore(result.store);
  writeLog('info', 'memory-updated', {
    id: result.memory.id,
    category: result.memory.category,
    characters: result.memory.text.length,
    pinned: result.memory.pinned
  });
  return { memory: result.memory, state: result.store };
}

function removeLocalMemory(id) {
  const result = removeMemory(readMemoryStore(), id);
  writeMemoryStore(result.store);
  writeLog('info', 'memory-removed', { id: String(id || '').slice(0, 100), removed: result.removed });
  return { removed: result.removed, state: result.store };
}

function clearLocalMemories() {
  const result = clearMemories(readMemoryStore());
  writeMemoryStore(result.store);
  writeLog('info', 'memory-cleared', { removed: result.removed });
  return { removed: result.removed, state: result.store };
}

function saveLocalProfile(profile) {
  const store = saveProfile(readMemoryStore(), profile || {});
  writeMemoryStore(store);
  writeLog('info', 'memory-profile-saved', {
    hasDisplayName: Boolean(store.profile.displayName),
    personalityMode: store.profile.personalityMode,
    responseStyle: store.profile.responseStyle
  });
  return store;
}

function sanitizeCustomApps(apps) {
  if (!Array.isArray(apps)) return [];
  return apps.slice(0, 30).flatMap(item => {
    const executablePath = path.resolve(String(item?.path || ''));
    const name = String(item?.name || path.basename(executablePath, path.extname(executablePath))).trim().slice(0, 40);
    if (!item?.id || !name || path.extname(executablePath).toLowerCase() !== '.exe') return [];
    return [{
      id: String(item.id).slice(0, 80),
      name,
      path: executablePath,
      keywords: [name.toLowerCase(), path.basename(executablePath, '.exe').toLowerCase()],
      source: 'custom'
    }];
  });
}

function listWhitelistedApps() {
  const builtIns = [{
    id: 'browser',
    name: '默认浏览器',
    path: 'Windows 默认浏览器',
    keywords: ['浏览器', '默认浏览器', 'browser'],
    source: 'builtin',
    available: true
  }];
  const detected = DETECTED_APP_CANDIDATES.flatMap(candidate => {
    const executablePath = candidate.paths.find(candidatePath => candidatePath && fs.existsSync(candidatePath));
    return executablePath ? [{ ...candidate, path: executablePath, source: 'detected', available: true }] : [];
  });
  const custom = sanitizeCustomApps(readSettingsFile().customApps).map(item => ({ ...item, available: fs.existsSync(item.path) }));
  const seenPaths = new Set(detected.map(item => item.path.toLowerCase()));
  return [...builtIns, ...detected, ...custom.filter(item => {
    const normalizedPath = item.path.toLowerCase();
    if (seenPaths.has(normalizedPath)) return false;
    seenPaths.add(normalizedPath);
    return true;
  })];
}

async function addWhitelistApp() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '添加允许 Astra 打开的应用',
    properties: ['openFile'],
    filters: [{ name: 'Windows 应用程序', extensions: ['exe'] }]
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true, apps: listWhitelistedApps() };

  const executablePath = path.resolve(result.filePaths[0]);
  if (path.extname(executablePath).toLowerCase() !== '.exe' || !fs.existsSync(executablePath)) {
    throw new Error('只能添加存在的 Windows EXE 文件。');
  }

  const settings = readSettingsFile();
  const currentApps = sanitizeCustomApps(settings.customApps);
  const duplicate = listWhitelistedApps().find(item => item.path.toLowerCase() === executablePath.toLowerCase());
  if (!duplicate) {
    currentApps.push({
      id: `custom-${randomUUID()}`,
      name: path.basename(executablePath, '.exe').slice(0, 40),
      path: executablePath
    });
    settings.customApps = currentApps;
    writeSettingsFile(settings);
  }
  return { canceled: false, apps: listWhitelistedApps(), selectedId: duplicate?.id || currentApps.at(-1)?.id };
}

function removeWhitelistApp(appId) {
  const settings = readSettingsFile();
  settings.customApps = sanitizeCustomApps(settings.customApps).filter(item => item.id !== appId).map(item => ({
    id: item.id,
    name: item.name,
    path: item.path
  }));
  writeSettingsFile(settings);
  return listWhitelistedApps();
}

function decryptApiKey(settings = readSettingsFile()) {
  let apiKey = '';
  if (settings.apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
    try {
      apiKey = safeStorage.decryptString(Buffer.from(settings.apiKeyEncrypted, 'base64'));
    } catch {
      apiKey = '';
    }
  }
  return apiKey;
}

function sanitizeMediaDeviceId(value) {
  return String(value || '').trim().slice(0, 512);
}

function publicSettings(settings = readSettingsFile()) {
  const apiKey = decryptApiKey(settings);

  return {
    endpoint: settings.endpoint || '',
    model: settings.model || '',
    apiKey: apiKey ? API_KEY_MASK : '',
    apiKeyConfigured: Boolean(apiKey),
    speakReplies: settings.speakReplies !== false,
    transcriptionModel: settings.transcriptionModel || DEFAULT_TRANSCRIPTION_MODEL,
    realtimeEnabled: settings.realtimeEnabled === true,
    voiceSkillBridgeEnabled: settings.voiceSkillBridgeEnabled === true,
    realtimeAutoConnect: settings.realtimeAutoConnect === true,
    realtimeReconnectEnabled: settings.realtimeReconnectEnabled !== false,
    realtimeIdleMinutes: sanitizeRealtimeIdleMinutes(settings.realtimeIdleMinutes),
    realtimeMaxMinutes: sanitizeRealtimeMaxMinutes(settings.realtimeMaxMinutes),
    realtimeInputDeviceId: sanitizeMediaDeviceId(settings.realtimeInputDeviceId),
    realtimeOutputDeviceId: sanitizeMediaDeviceId(settings.realtimeOutputDeviceId),
    realtimeModel: sanitizeRealtimeModel(settings.realtimeModel),
    realtimeVoice: sanitizeRealtimeVoice(settings.realtimeVoice),
    realtimeVadMode: sanitizeRealtimeVadMode(settings.realtimeVadMode),
    realtimeModelOptions: REALTIME_MODELS,
    realtimeVoiceOptions: REALTIME_VOICES,
    realtimeVadModeOptions: REALTIME_VAD_MODES,
    launchAtLogin: app.getLoginItemSettings().openAtLogin,
    restoreShortcut: sanitizeRestoreShortcut(settings.restoreShortcut),
    restoreShortcutOptions: ALLOWED_RESTORE_SHORTCUTS.map(value => ({ value, label: formatShortcutLabel(value) })),
    safeMode: IS_SAFE_MODE,
    softwareRendering: SOFTWARE_RENDERING_MODE,
    onboardingCompleted: settings.onboardingCompleted === true,
    updateManifestUrl: String(settings.updateManifestUrl || '').slice(0, 1000),
    ...normalizeProactiveSettings(settings)
  };
}

function availableDiskBytes(directory) {
  try {
    fs.mkdirSync(directory, { recursive: true });
    const stats = fs.statfsSync(directory);
    return Number(stats.bavail) * Number(stats.bsize);
  } catch {
    return 0;
  }
}

function localModelCompatibility(settings) {
  if (!settings.modelPath || !fs.existsSync(settings.modelPath)) return { valid: false, error: '尚未选择 GGUF 模型。' };
  let stat;
  try {
    stat = fs.statSync(settings.modelPath);
    if (!localModelInspectionCache || localModelInspectionCache.filePath !== settings.modelPath || localModelInspectionCache.size !== stat.size || localModelInspectionCache.mtimeMs !== stat.mtimeMs) {
      localModelInspectionCache = { filePath: settings.modelPath, size: stat.size, mtimeMs: stat.mtimeMs, inspection: inspectGgufFile(settings.modelPath) };
    }
  } catch (error) {
    return { valid: false, error: `无法读取模型文件：${sanitizeStartupError(error)}` };
  }
  const inspection = localModelInspectionCache.inspection;
  if (!inspection.valid) return inspection;
  const estimatedMemoryBytes = estimateModelMemoryBytes(inspection.sizeBytes, settings.profile);
  const freeMemoryBytes = os.freemem();
  const totalMemoryBytes = os.totalmem();
  return {
    ...inspection,
    estimatedMemoryBytes,
    freeMemoryBytes,
    totalMemoryBytes,
    memoryRisk: estimatedMemoryBytes > totalMemoryBytes * 0.92 ? 'blocked' : estimatedMemoryBytes > freeMemoryBytes * 1.15 ? 'warning' : 'ok',
    warning: inspection.hasChatTemplate ? '' : '未在模型头部检测到聊天模板，启动后将继续进行模板诊断。'
  };
}

function localAiPublicState() {
  const settings = readLocalAiSettings();
  const memoryGb = os.totalmem() / 1024 / 1024 / 1024;
  const directory = localModelDirectory();
  const voiceSettings = readOfflineVoiceSettings();
  fs.mkdirSync(directory, { recursive: true });
  const catalog = TRUSTED_MODEL_CATALOG.map(item => {
    const filePath = managedModelPath(directory, item.fileName);
    const selectedPath = item.kind === 'voice' ? voiceSettings.modelPath : settings.modelPath;
    return { ...item, filePath, installed: Boolean(filePath && fs.existsSync(filePath)), selected: filePath === selectedPath };
  });
  return {
    settings,
    profiles: LOCAL_AI_PROFILES,
    ready: localAiReady(settings) && fs.existsSync(settings.runtimePath) && fs.existsSync(settings.modelPath),
    visionReady: localAiReady(settings) && Boolean(settings.mmprojPath && fs.existsSync(settings.mmprojPath)),
    runtime: { ...localServerStatus },
    runtimeRecord: readLocalAiRuntimeRecord(),
    compatibility: localModelCompatibility(settings),
    systemMemoryGb: Math.round(memoryGb * 10) / 10,
    freeMemoryGb: Math.round(os.freemem() / 1024 ** 3 * 10) / 10,
    recommendedProfile: recommendedProfileForMemory(memoryGb),
    setupWizardRecommended: !settings.modelPath && !settings.wizardDismissed,
    modelDirectory: directory,
    availableDiskBytes: availableDiskBytes(directory),
    catalog,
    download: { ...modelDownloadState }
  };
}

function offlineVoicePublicState() {
  const settings = readOfflineVoiceSettings();
  return { settings, ready: offlineVoiceReady(settings) && fs.existsSync(settings.runtimePath) && fs.existsSync(settings.modelPath) };
}

function saveSettings(nextSettings) {
  const current = readSettingsFile();
  const proactiveSettings = normalizeProactiveSettings({ ...current, ...nextSettings });
  const saved = {
    ...current,
    ...proactiveSettings,
    endpoint: String(nextSettings.endpoint || '').trim(),
    model: String(nextSettings.model || '').trim(),
    speakReplies: nextSettings.speakReplies !== false,
    transcriptionModel: String(nextSettings.transcriptionModel || DEFAULT_TRANSCRIPTION_MODEL).trim().slice(0, 100),
    realtimeEnabled: nextSettings.realtimeEnabled === true,
    voiceSkillBridgeEnabled: nextSettings.voiceSkillBridgeEnabled === true,
    realtimeAutoConnect: nextSettings.realtimeAutoConnect === true,
    realtimeReconnectEnabled: nextSettings.realtimeReconnectEnabled !== false,
    realtimeIdleMinutes: sanitizeRealtimeIdleMinutes(nextSettings.realtimeIdleMinutes),
    realtimeMaxMinutes: sanitizeRealtimeMaxMinutes(nextSettings.realtimeMaxMinutes),
    realtimeInputDeviceId: sanitizeMediaDeviceId(nextSettings.realtimeInputDeviceId),
    realtimeOutputDeviceId: sanitizeMediaDeviceId(nextSettings.realtimeOutputDeviceId),
    realtimeModel: sanitizeRealtimeModel(nextSettings.realtimeModel),
    realtimeVoice: sanitizeRealtimeVoice(nextSettings.realtimeVoice),
    realtimeVadMode: sanitizeRealtimeVadMode(nextSettings.realtimeVadMode),
    restoreShortcut: sanitizeRestoreShortcut(nextSettings.restoreShortcut),
    onboardingCompleted: current.onboardingCompleted === true,
    updateManifestUrl: String(nextSettings.updateManifestUrl || current.updateManifestUrl || '').trim().slice(0, 1000)
  };

  if (typeof nextSettings.apiKey === 'string' && nextSettings.apiKey !== API_KEY_MASK) {
    if (nextSettings.apiKey && safeStorage.isEncryptionAvailable()) {
      saved.apiKeyEncrypted = safeStorage.encryptString(nextSettings.apiKey).toString('base64');
    } else if (!nextSettings.apiKey) {
      delete saved.apiKeyEncrypted;
    }
  }

  writeSettingsFile(saved);
  app.setLoginItemSettings({ openAtLogin: Boolean(nextSettings.launchAtLogin) });
  if (app.isReady() && !IS_SMOKE_TEST) registerRestoreShortcuts(saved.restoreShortcut);
  if (app.isReady()) {
    rearmAllReminders();
    evaluateProactiveAssistant();
  }
  writeLog('info', 'settings-saved', {
    hasEndpoint: Boolean(saved.endpoint),
    hasModel: Boolean(saved.model),
    speakReplies: saved.speakReplies,
    transcriptionModel: saved.transcriptionModel,
    realtimeEnabled: saved.realtimeEnabled,
    voiceSkillBridgeEnabled: saved.voiceSkillBridgeEnabled,
    realtimeAutoConnect: saved.realtimeAutoConnect,
    realtimeReconnectEnabled: saved.realtimeReconnectEnabled,
    realtimeIdleMinutes: saved.realtimeIdleMinutes,
    realtimeMaxMinutes: saved.realtimeMaxMinutes,
    realtimeModel: saved.realtimeModel,
    realtimeVoice: saved.realtimeVoice,
    realtimeVadMode: saved.realtimeVadMode,
    launchAtLogin: Boolean(nextSettings.launchAtLogin),
    restoreShortcut: saved.restoreShortcut,
    proactiveEnabled: saved.proactiveEnabled,
    quietHoursEnabled: saved.quietHoursEnabled
  });
  return publicSettings(saved);
}

async function claimControlPipe() {
  const result = await claimControlChannel(CONTROL_PIPE, () => {
    writeLog('info', 'control-pipe-restore');
    restoreWindow('second-launch');
  }, {
    onEvent: (event, details) => {
      const levels = { 'server-error': 'error', 'secondary-error': 'warn', 'secondary-timeout': 'warn' };
      writeLog(levels[event] || 'info', `control-pipe-${event}`, details);
    }
  });
  if (result.isPrimary && result.server) {
    controlServer = result.server;
    controlPipeListening = true;
  }
  return result.isPrimary;
}

function terminateLegacyInstances() {
  if (IS_SMOKE_TEST || process.platform !== 'win32') return Promise.resolve();
  return new Promise(resolve => {
    execFile('tasklist.exe', ['/FI', 'IMAGENAME eq Astra Desktop.exe', '/FO', 'CSV', '/NH'], { windowsHide: true, timeout: 5000 }, (_error, stdout = '') => {
      for (const line of stdout.split(/\r?\n/)) {
        const match = line.match(/^"Astra Desktop\.exe","(\d+)"/i);
        const processId = Number(match?.[1]);
        if (!processId || processId === process.pid) continue;
        try {
          process.kill(processId);
          writeLog('warn', 'legacy-process-terminated', { processId });
        } catch {
          // The process may already have exited.
        }
      }
      setTimeout(resolve, 300);
    });
  });
}

function createWindow() {
  const storedState = readWindowState();
  const startupMode = previousRunCrashed ? 'full' : sanitizeMode(storedState.mode, 'full');
  const visibleMode = startupMode === 'hidden' ? sanitizeMode(storedState.lastVisibleMode, 'mini') : startupMode;
  const desiredBounds = visibleMode === 'mini' ? storedState.miniBounds : storedState.fullBounds;
  const restored = restoreBounds(desiredBounds, screen.getAllDisplays(), storedState.displayId);
  currentWindowMode = startupMode;
  mainWindow = new BrowserWindow({
    x: restored.x,
    y: restored.y,
    width: restored.width,
    height: restored.height,
    minWidth: 390,
    minHeight: 560,
    maxWidth: 520,
    maxHeight: 820,
    transparent: !IS_SAFE_MODE,
    frame: false,
    resizable: true,
    alwaysOnTop: !IS_SAFE_MODE,
    skipTaskbar: false,
    show: false,
    backgroundColor: IS_SAFE_MODE ? '#07131c' : '#00000000',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (!IS_SAFE_MODE) mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  mainWindow.webContents.on('did-finish-load', () => setTimeout(evaluateProactiveAssistant, 500));
  mainWindow.once('ready-to-show', () => {
    writeLog('info', 'window-ready', { safeMode: IS_SAFE_MODE });
    if (previousRunCrashed) {
      setWindowMode('full', 'crash-recovery');
      emitProactiveMessage('recovery', '检测到上次异常退出，已恢复完整界面和上次安全位置。');
    } else if (restoreRequested) {
      restoreWindow('ready');
    } else if (!IS_SMOKE_TEST) {
      setWindowMode(startupMode, 'startup');
    }
  });
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    writeLog('error', 'renderer-gone', details);
    markRuntimeState(false);
  });
  mainWindow.webContents.on('unresponsive', () => writeLog('warn', 'renderer-unresponsive'));
  mainWindow.webContents.on('responsive', () => writeLog('info', 'renderer-responsive'));
  if (IS_SMOKE_TEST) {
    mainWindow.webContents.once('did-finish-load', async () => {
      try {
        const result = await mainWindow.webContents.executeJavaScript(`(async () => {
          const apps = await window.astra.listApps();
          const planner = await window.astra.getPlanner();
          const companion = await window.astra.getCompanion();
          const diagnostics = await window.astra.getDiagnostics();
          return {
            title: document.title,
            hasAvatar: Boolean(document.querySelector('#avatar')),
            hasComposer: Boolean(document.querySelector('#chatForm')),
            hasSettings: Boolean(document.querySelector('#settingsForm')),
            hasPlanner: Boolean(document.querySelector('#plannerOverlay')),
            hasCompanion: Boolean(document.querySelector('#companionOverlay')),
            bridgeReady: Boolean(window.astra),
            appCount: apps.length,
            plannerTaskCount: planner.tasks.length,
            companionLevel: companion.level.number,
            softwareRendering: diagnostics.graphics.softwareRendering,
            storageRecoverable: Object.values(diagnostics.storage).every(item => item.recoverable)
          };
        })()`);
        if (process.env.ASTRA_SMOKE_RESULT_PATH) {
          fs.writeFileSync(process.env.ASTRA_SMOKE_RESULT_PATH, JSON.stringify(result, null, 2), 'utf8');
        }
        console.log(`ASTRA_SMOKE_OK ${JSON.stringify(result)}`);
        app.exit(0);
      } catch (error) {
        if (process.env.ASTRA_SMOKE_RESULT_PATH) {
          fs.writeFileSync(process.env.ASTRA_SMOKE_RESULT_PATH, JSON.stringify({ error: error.message }, null, 2), 'utf8');
        }
        console.error('ASTRA_SMOKE_FAILED', error);
        app.exit(1);
      }
    });
  }
  mainWindow.on('close', event => {
    if (!isQuitting) {
      event.preventDefault();
      applyBackgroundMode('close');
    }
  });
  mainWindow.on('move', scheduleWindowStateSave);
  mainWindow.on('resize', scheduleWindowStateSave);
}

function scheduleWindowStateSave() {
  clearTimeout(windowStateSaveTimer);
  windowStateSaveTimer = setTimeout(saveCurrentWindowState, 250);
}

function saveCurrentWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return readWindowState();
  const bounds = mainWindow.getBounds();
  const display = screen.getDisplayMatching(bounds);
  const stored = readWindowState();
  const modeForBounds = currentWindowMode === 'hidden' ? stored.lastVisibleMode : currentWindowMode;
  return writeWindowState(updateWindowState(stored, modeForBounds, bounds, display));
}

function setWindowMode(mode, reason = 'manual') {
  const nextMode = sanitizeMode(mode, 'full');
  if (!mainWindow || mainWindow.isDestroyed()) return { mode: nextMode, deferred: true };
  if (currentWindowMode !== 'hidden') saveCurrentWindowState();
  const stored = readWindowState();
  if (nextMode === 'hidden') {
    const display = screen.getDisplayMatching(mainWindow.getBounds());
    writeWindowState(updateWindowState(stored, 'hidden', mainWindow.getBounds(), display));
    currentWindowMode = 'hidden';
    mainWindow.hide();
  } else {
    const size = nextMode === 'mini' ? MINI_SIZE : FULL_SIZE;
    const desired = nextMode === 'mini' ? stored.miniBounds : stored.fullBounds;
    const restored = restoreBounds({ ...desired, ...size }, screen.getAllDisplays(), stored.displayId);
    mainWindow.setResizable(nextMode === 'full');
    mainWindow.setMinimumSize(nextMode === 'full' ? 390 : MINI_SIZE.width, nextMode === 'full' ? 560 : MINI_SIZE.height);
    mainWindow.setMaximumSize(nextMode === 'full' ? 520 : MINI_SIZE.width, nextMode === 'full' ? 820 : MINI_SIZE.height);
    mainWindow.setBounds({ x: restored.x, y: restored.y, width: size.width, height: size.height }, false);
    mainWindow.setSkipTaskbar(nextMode === 'mini');
    currentWindowMode = nextMode;
    mainWindow.show();
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (nextMode === 'full') mainWindow.focus();
    const display = screen.getDisplayMatching(mainWindow.getBounds());
    writeWindowState(updateWindowState(stored, nextMode, mainWindow.getBounds(), display));
    if (nextMode === 'mini' && readCompanionStore().settings.miniClickThrough) setClickThrough(true);
  }
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isLoadingMainFrame()) {
    mainWindow.webContents.send('window:mode-changed', { mode: nextMode, reason, clickThrough: isClickThrough });
  }
  writeLog('info', 'window-mode-changed', { mode: nextMode, reason });
  updateTrayMenu();
  return { mode: nextMode, reason, clickThrough: isClickThrough };
}

function applyBackgroundMode(reason = 'background') {
  const preference = readCompanionStore().settings.backgroundMode;
  return setWindowMode(preference === 'hidden' ? 'hidden' : 'mini', reason);
}

function readForegroundContext() {
  if (process.platform !== 'win32' || !fs.existsSync(contextHelperPath())) return Promise.resolve(lastContextSnapshot);
  return new Promise(resolve => {
    execFile(contextHelperPath(), [], { windowsHide: true, timeout: 1800 }, (error, stdout = '') => {
      if (error) return resolve(lastContextSnapshot);
      try {
        const value = JSON.parse(stdout.trim());
        lastContextSnapshot = {
          processName: String(value.processName || '').slice(0, 120),
          fullScreen: value.fullScreen === true,
          batteryPercent: Math.max(-1, Math.min(100, Number(value.batteryPercent) || 0)),
          charging: value.charging === true
        };
      } catch {}
      resolve(lastContextSnapshot);
    });
  });
}

function cursorEnvironment() {
  if (!mainWindow || mainWindow.isDestroyed()) return { nearby: false, fast: false, edge: '' };
  const now = Date.now();
  const point = screen.getCursorScreenPoint();
  const bounds = mainWindow.getBounds();
  const closestX = Math.max(bounds.x, Math.min(point.x, bounds.x + bounds.width));
  const closestY = Math.max(bounds.y, Math.min(point.y, bounds.y + bounds.height));
  const distance = Math.hypot(point.x - closestX, point.y - closestY);
  const speed = lastCursorSample ? Math.hypot(point.x - lastCursorSample.x, point.y - lastCursorSample.y) / Math.max(1, now - lastCursorSample.at) * 1000 : 0;
  lastCursorSample = { ...point, at: now };
  const display = screen.getDisplayMatching(bounds);
  const area = display.workArea;
  const edge = Math.abs(bounds.x - area.x) <= 8 ? 'left'
    : Math.abs(bounds.x + bounds.width - (area.x + area.width)) <= 8 ? 'right'
      : Math.abs(bounds.y - area.y) <= 8 ? 'top'
        : Math.abs(bounds.y + bounds.height - (area.y + area.height)) <= 8 ? 'bottom' : '';
  return {
    nearby: distance <= 90,
    fast: distance <= 140 && speed >= 1200,
    edge,
    lookX: Math.max(-1, Math.min(1, (point.x - (bounds.x + bounds.width / 2)) / Math.max(1, bounds.width))),
    lookY: Math.max(-1, Math.min(1, (point.y - (bounds.y + bounds.height / 2)) / Math.max(1, bounds.height)))
  };
}

async function evaluateEnvironment() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  contextCheckCounter += 1;
  const context = contextCheckCounter % 2 === 0 ? await readForegroundContext() : lastContextSnapshot;
  const settings = readCompanionStore().settings;
  const idleSeconds = powerMonitor.getSystemIdleTime();
  const onBattery = powerMonitor.isOnBatteryPower();
  const online = net.isOnline();
  const cursor = cursorEnvironment();
  const snapshot = {
    period: new Date().getHours() < 6 ? 'late-night' : new Date().getHours() < 9 ? 'morning' : new Date().getHours() < 18 ? 'day' : new Date().getHours() < 22 ? 'evening' : 'night',
    onBattery,
    batteryPercent: context.batteryPercent,
    lowBattery: onBattery && context.batteryPercent >= 0 && context.batteryPercent <= 20,
    charging: context.charging,
    online,
    idle: settings.sleepAfterMinutes > 0 && idleSeconds >= settings.sleepAfterMinutes * 60,
    engineer: /^code\.exe$/i.test(context.processName),
    fullScreen: context.fullScreen,
    lowPerformance: settings.lowPerformanceMode || (settings.autoLowPower && onBattery),
    cursor: settings.cursorReactions ? cursor : { nearby: false, fast: false, lookX: 0, lookY: 0 },
    edge: settings.edgeReactions ? cursor.edge : ''
  };
  if (settings.autoHideFullscreen && context.fullScreen && currentWindowMode === 'mini' && !fullscreenSuppressed) {
    fullscreenSuppressed = true;
    mainWindow.hide();
  } else if (fullscreenSuppressed && !context.fullScreen) {
    fullscreenSuppressed = false;
    if (currentWindowMode === 'mini') mainWindow.showInactive();
  }
  if (JSON.stringify(snapshot) !== JSON.stringify(lastEnvironmentSnapshot)) {
    lastEnvironmentSnapshot = snapshot;
    mainWindow.webContents.send('environment:changed', snapshot);
  }
}

function startEnvironmentMonitor() {
  clearInterval(environmentTimer);
  environmentTimer = setInterval(() => evaluateEnvironment().catch(error => writeLog('warn', 'environment-check-failed', { message: error.message })), 1000);
  evaluateEnvironment().catch(() => {});
}

function emitModelDownloadState(patch = {}) {
  modelDownloadState = { ...modelDownloadState, ...patch };
  mainWindow?.webContents.send('model-download:status', { ...modelDownloadState });
  return { ...modelDownloadState };
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const input = fs.createReadStream(filePath);
    input.on('data', chunk => hash.update(chunk));
    input.on('error', reject);
    input.on('end', () => resolve(hash.digest('hex')));
  });
}

function applyTrustedModelSettings(item, targetPath) {
  if (item.kind === 'voice') {
    const current = readOfflineVoiceSettings();
    writeOfflineVoiceSettings({ ...current, enabled: true, modelPath: targetPath });
  } else {
    const current = readLocalAiSettings();
    writeLocalAiSettings({ ...current, enabled: true, mode: 'local', modelPath: targetPath, profile: item.profile, wizardDismissed: true });
  }
}

async function selectTrustedModel(modelId) {
  const item = trustedModelById(modelId);
  if (!item) throw new Error('只能选择 Astra 可信清单中的模型。');
  const targetPath = managedModelPath(localModelDirectory(), item.fileName);
  if (!targetPath || !fs.existsSync(targetPath)) throw new Error('模型尚未下载完成。');
  const hash = await sha256File(targetPath);
  if (hash.toLowerCase() !== item.sha256) throw new Error('模型 SHA256 与可信清单不一致，请删除后重新下载。');
  applyTrustedModelSettings(item, targetPath);
  clearLocalAiRuntimeError();
  return localAiPublicState();
}

async function runTrustedModelDownload(item, task) {
  const directory = localModelDirectory();
  fs.mkdirSync(directory, { recursive: true });
  const targetPath = managedModelPath(directory, item.fileName);
  if (!targetPath) throw new Error('模型目标路径无效。');
  const partialPath = `${targetPath}.part`;
  const existingBytes = fs.existsSync(partialPath) ? fs.statSync(partialPath).size : 0;
  const remainingEstimate = Math.max(0, item.sizeBytes - existingBytes);
  const diskBytes = availableDiskBytes(directory);
  if (diskBytes && diskBytes < remainingEstimate + 512 * 1024 ** 2) throw new Error('模型目录可用空间不足，请至少预留模型大小外加 512 MB。');
  emitModelDownloadState({ state: existingBytes ? 'resuming' : 'downloading', modelId: item.id, receivedBytes: existingBytes, totalBytes: item.sizeBytes, speedBytesPerSecond: 0, error: '', filePath: targetPath });
  const headers = existingBytes ? { Range: `bytes=${existingBytes}-` } : {};
  const response = await net.fetch(item.url, { headers, redirect: 'follow', signal: task.controller.signal });
  if (!response.ok || !response.body) throw new Error(`模型下载服务返回 ${response.status}。`);
  let append = existingBytes > 0 && response.status === 206;
  let receivedBytes = append ? existingBytes : 0;
  const contentRange = response.headers.get('content-range') || '';
  const rangeTotal = Number((contentRange.match(/\/(\d+)$/) || [])[1]);
  const contentLength = Number(response.headers.get('content-length'));
  const totalBytes = Number.isFinite(rangeTotal) && rangeTotal > 0 ? rangeTotal : Number.isFinite(contentLength) && contentLength > 0 ? receivedBytes + contentLength : item.sizeBytes;
  if (existingBytes && !append) fs.rmSync(partialPath, { force: true });
  const output = fs.createWriteStream(partialPath, { flags: append ? 'a' : 'w' });
  const reader = response.body.getReader();
  const startedAt = Date.now();
  let lastUpdateAt = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (task.action !== 'download') { const error = new Error('Download interrupted'); error.name = 'AbortError'; throw error; }
      const chunk = Buffer.from(value);
      if (!output.write(chunk)) await new Promise(resolve => output.once('drain', resolve));
      receivedBytes += chunk.length;
      const now = Date.now();
      if (now - lastUpdateAt >= 250) {
        emitModelDownloadState({ state: 'downloading', receivedBytes, totalBytes, speedBytesPerSecond: Math.round((receivedBytes - (append ? existingBytes : 0)) / Math.max(1, (now - startedAt) / 1000)) });
        lastUpdateAt = now;
      }
    }
    await new Promise((resolve, reject) => output.end(error => error ? reject(error) : resolve()));
  } catch (error) {
    output.destroy();
    throw error;
  }
  emitModelDownloadState({ state: 'verifying', receivedBytes, totalBytes, speedBytesPerSecond: 0 });
  const hash = await sha256File(partialPath);
  if (hash.toLowerCase() !== item.sha256) {
    fs.rmSync(partialPath, { force: true });
    const error = new Error('模型 SHA256 校验失败，已删除不完整文件。');
    error.code = 'MODEL_HASH_MISMATCH';
    error.expectedHash = item.sha256;
    error.actualHash = hash.toLowerCase();
    throw error;
  }
  fs.rmSync(targetPath, { force: true });
  fs.renameSync(partialPath, targetPath);
  applyTrustedModelSettings(item, targetPath);
  clearLocalAiRuntimeError();
  emitModelDownloadState({ state: 'completed', receivedBytes: fs.statSync(targetPath).size, totalBytes: fs.statSync(targetPath).size, speedBytesPerSecond: 0, error: '', filePath: targetPath });
  mainWindow?.webContents.send('local-ai:status', localAiPublicState());
}

function startTrustedModelDownload(modelId) {
  const item = trustedModelById(modelId);
  if (!item) throw new Error('只能下载 Astra 内置可信清单中的模型。');
  if (modelDownloadTask) throw new Error('已有模型下载任务正在运行。');
  const task = { modelId: item.id, action: 'download', controller: new AbortController() };
  modelDownloadTask = task;
  const initialState = emitModelDownloadState({ state: 'starting', modelId: item.id, receivedBytes: 0, totalBytes: item.sizeBytes, speedBytesPerSecond: 0, error: '', filePath: managedModelPath(localModelDirectory(), item.fileName) });
  void runTrustedModelDownload(item, task).catch(error => {
    if (task.action === 'pause') emitModelDownloadState({ state: 'paused', speedBytesPerSecond: 0, error: '' });
    else if (task.action === 'cancel') {
      const targetPath = managedModelPath(localModelDirectory(), item.fileName);
      fs.rmSync(`${targetPath}.part`, { force: true });
      emitModelDownloadState({ state: 'cancelled', receivedBytes: 0, totalBytes: item.sizeBytes, speedBytesPerSecond: 0, error: '', filePath: targetPath });
    } else {
      const message = describeModelDownloadError(error);
      emitModelDownloadState({ state: 'failed', speedBytesPerSecond: 0, error: message });
      writeLog('warn', 'model-download-failed', { modelId: item.id, message, detail: modelDownloadErrorDetail(error), expectedHash: error.expectedHash, actualHash: error.actualHash });
    }
  }).finally(() => {
    if (modelDownloadTask === task) modelDownloadTask = undefined;
  });
  return initialState;
}

function pauseTrustedModelDownload() {
  if (!modelDownloadTask) return { ...modelDownloadState };
  modelDownloadTask.action = 'pause';
  modelDownloadTask.controller.abort();
  return emitModelDownloadState({ state: 'pausing', speedBytesPerSecond: 0 });
}

function cancelTrustedModelDownload(modelId) {
  const item = trustedModelById(modelId || modelDownloadState.modelId);
  if (!item) throw new Error('找不到要取消的可信模型。');
  if (modelDownloadTask) {
    modelDownloadTask.action = 'cancel';
    modelDownloadTask.controller.abort();
    return emitModelDownloadState({ state: 'cancelling', speedBytesPerSecond: 0 });
  }
  const targetPath = managedModelPath(localModelDirectory(), item.fileName);
  fs.rmSync(`${targetPath}.part`, { force: true });
  return emitModelDownloadState({ state: 'cancelled', modelId: item.id, receivedBytes: 0, totalBytes: item.sizeBytes, speedBytesPerSecond: 0, error: '', filePath: targetPath });
}

async function inspectCurrentLocalModel() {
  const settings = readLocalAiSettings();
  const inspection = localModelCompatibility(settings);
  if (!inspection.valid) return inspection;
  const sha256 = await sha256File(settings.modelPath);
  const trusted = TRUSTED_MODEL_CATALOG.find(item => item.sha256 === sha256.toLowerCase());
  return { ...inspection, sha256, trustedModelId: trusted?.id || '', trusted: Boolean(trusted) };
}

function deleteTrustedModel(modelId) {
  const item = trustedModelById(modelId);
  if (!item) throw new Error('只能删除 Astra 管理目录中的可信模型。');
  const targetPath = managedModelPath(localModelDirectory(), item.fileName);
  if (!targetPath) throw new Error('模型路径无效。');
  const settings = readLocalAiSettings();
  const voiceSettings = readOfflineVoiceSettings();
  if (item.kind === 'chat' && path.resolve(settings.modelPath || '') === targetPath) {
    stopLocalServer('model-delete');
    writeLocalAiSettings({ ...settings, modelPath: '', enabled: false });
  }
  if (item.kind === 'voice' && path.resolve(voiceSettings.modelPath || '') === targetPath) writeOfflineVoiceSettings({ ...voiceSettings, modelPath: '', enabled: false });
  fs.rmSync(targetPath, { force: true });
  fs.rmSync(`${targetPath}.part`, { force: true });
  emitModelDownloadState({ state: 'idle', modelId: '', receivedBytes: 0, totalBytes: 0, speedBytesPerSecond: 0, error: '', filePath: '' });
  return localAiPublicState();
}

function localServerHealthy(settings = localServerSettings || readLocalAiSettings()) {
  return fetch(localHealthEndpoint(settings), { signal: AbortSignal.timeout(1200) })
    .then(response => response.ok)
    .catch(() => false);
}

function portAvailable(port) {
  return new Promise(resolve => {
    const server = nodeNet.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen({ host: '127.0.0.1', port }, () => server.close(() => resolve(true)));
  });
}

async function findAvailableLocalPort(preferredPort) {
  for (let offset = 0; offset < 20; offset += 1) {
    const port = preferredPort + offset;
    if (port <= 60000 && await portAvailable(port)) return port;
  }
  throw new Error('找不到可用的本地模型端口，请关闭其他 llama-server 后重试。');
}

function updateLocalServerStatus(patch) {
  localServerStatus = { ...localServerStatus, ...patch };
  mainWindow?.webContents.send('local-ai:status', localAiPublicState());
}

function failLocalServer(error, settings = readLocalAiSettings()) {
  const message = sanitizeStartupError(error instanceof Error ? error.message : error) || '本地模型启动失败。';
  writeLocalAiRuntimeError(message, settings.modelPath);
  updateLocalServerStatus({ state: 'failed', phase: 'failed', pid: 0, error: message, restartAttempts: localServerRestartAttempts });
  return new Error(message);
}

function stopLocalServer(reason = 'manual', resetRestartAttempts = true) {
  clearTimeout(localServerStopTimer);
  clearTimeout(localServerStableTimer);
  localServerStopTimer = undefined;
  localServerStableTimer = undefined;
  if (resetRestartAttempts) localServerRestartAttempts = 0;
  if (localServerProcess && !localServerProcess.killed) {
    expectedLocalServerExits.add(localServerProcess);
    localServerProcess.kill();
  }
  localServerProcess = undefined;
  localServerSettings = undefined;
  localServerStatus = { state: 'stopped', phase: 'stopped', pid: 0, error: '', startedAt: 0, model: '', activePort: 0, restartAttempts: localServerRestartAttempts, reason };
  mainWindow?.webContents.send('local-ai:status', localAiPublicState());
}

function scheduleLocalServerStop(settings = readLocalAiSettings()) {
  clearTimeout(localServerStopTimer);
  if (!settings.keepAliveMinutes) return;
  localServerStopTimer = setTimeout(() => {
    if (Date.now() - localServerLastUsedAt >= settings.keepAliveMinutes * 60000) stopLocalServer('idle');
  }, settings.keepAliveMinutes * 60000 + 1000);
}

function updateServerPhaseFromOutput(chunk) {
  const text = String(chunk || '').toLowerCase();
  const phase = /chat template|template.*error|failed.*template/.test(text) ? 'diagnosing-template'
    : /allocat|kv cache|buffer size|host buffer/.test(text) ? 'allocating-memory'
      : /load_model|loading model|llama_model_loader|loading tensors/.test(text) ? 'loading-model'
        : /listening|main loop|model loaded/.test(text) ? 'waiting-health' : '';
  if (phase && phase !== localServerStatus.phase) updateLocalServerStatus({ phase });
}

async function warmLocalServer(settings) {
  const response = await fetch(localChatEndpoint(settings), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'local-model', messages: [{ role: 'user', content: '你好' }], temperature: 0, max_tokens: 1, stream: false }),
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) {
    const detail = sanitizeStartupError(await response.text());
    if (/template/i.test(detail)) throw new Error(`模型聊天模板诊断失败：${detail.slice(-300)}`);
    throw new Error(`模型预热失败：${response.status} ${detail.slice(-240)}`);
  }
  await response.arrayBuffer();
}

function verifyLocalRuntime(runtimePath) {
  const bundledRuntime = path.resolve(runtimePath) === path.resolve(bundledLlamaRuntimePath());
  if (process.platform === 'win32' && bundledRuntime) {
    const missingDlls = missingWindowsRuntimeDlls(runtimePath);
    if (missingDlls.length) {
      const message = `本地运行时缺少随附组件：${missingDlls.join('、')}。请重新安装 Astra Desktop。`;
      writeLog('error', 'local-runtime-self-test-failed', { runtime: path.basename(runtimePath), missingDlls });
      return Promise.reject(new Error(message));
    }
  }
  const stat = fs.statSync(runtimePath);
  if (localRuntimeSelfTestCache?.runtimePath === runtimePath && localRuntimeSelfTestCache.size === stat.size && localRuntimeSelfTestCache.mtimeMs === stat.mtimeMs) {
    if (localRuntimeSelfTestCache.error) return Promise.reject(new Error(localRuntimeSelfTestCache.error));
    return Promise.resolve();
  }
  if (bundledRuntime) {
    localRuntimeSelfTestCache = { runtimePath, size: stat.size, mtimeMs: stat.mtimeMs, error: '', output: 'bundled-runtime-files-verified' };
    writeLog('info', 'local-runtime-self-test-passed', { runtime: path.basename(runtimePath), method: 'bundled-files' });
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const child = spawn(runtimePath, ['--version'], { cwd: path.dirname(runtimePath), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let settled = false;
    let timedOut = false;
    const selfTestTimeoutMs = 30000;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, selfTestTimeoutMs);
    child.stdout.on('data', chunk => { output = `${output}${chunk}`.slice(-800); });
    child.stderr.on('data', chunk => { output = `${output}${chunk}`.slice(-800); });
    child.once('error', error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const message = `本地运行时自检失败：${sanitizeStartupError(error)}`;
      localRuntimeSelfTestCache = { runtimePath, size: stat.size, mtimeMs: stat.mtimeMs, error: message };
      writeLog('error', 'local-runtime-self-test-failed', { runtime: path.basename(runtimePath), message });
      reject(new Error(message));
    });
    child.once('exit', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) {
        localRuntimeSelfTestCache = { runtimePath, size: stat.size, mtimeMs: stat.mtimeMs, error: '', output: sanitizeStartupError(output) };
        resolve();
        return;
      }
      const message = `本地运行时自检失败：${timedOut ? '外部运行时 30 秒内没有完成版本检查。' : describeRuntimeExitCode(code)}${output ? ` ${sanitizeStartupError(output)}` : ''}`;
      localRuntimeSelfTestCache = { runtimePath, size: stat.size, mtimeMs: stat.mtimeMs, error: message };
      writeLog('error', 'local-runtime-self-test-failed', { runtime: path.basename(runtimePath), code, timedOut, output: sanitizeStartupError(output), message });
      reject(new Error(message));
    });
  });
}

async function ensureLocalServer(options = {}) {
  const settings = readLocalAiSettings();
  if (!localAiReady(settings)) throw new Error('本地模型尚未配置。');
  if (!fs.existsSync(settings.runtimePath)) throw new Error('找不到 llama-server，请重新选择本地运行时。');
  if (!fs.existsSync(settings.modelPath)) throw new Error('找不到 GGUF 模型，请重新选择模型。');
  await verifyLocalRuntime(settings.runtimePath);
  const compatibility = localModelCompatibility(settings);
  if (!compatibility.valid) throw new Error(compatibility.error || 'GGUF 模型检查失败。');
  if (compatibility.memoryRisk === 'blocked') throw new Error('预计模型内存占用接近或超过物理内存，请选择更小的量化模型。');
  const modelBytes = compatibility.sizeBytes || fs.statSync(settings.modelPath).size;
  const startupTimeoutMs = dynamicStartupTimeoutMs(modelBytes);
  if (localServerSettings && await localServerHealthy(localServerSettings)) {
    localServerLastUsedAt = Date.now();
    scheduleLocalServerStop(localServerSettings);
    return localServerSettings;
  }
  if (localServerProcess && ['starting', 'restarting'].includes(localServerStatus.state)) {
    const deadline = Date.now() + startupTimeoutMs;
    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (localServerSettings && await localServerHealthy(localServerSettings)) return localServerSettings;
      if (localServerStatus.state === 'failed') throw new Error(localServerStatus.error || '本地模型启动失败。');
    }
    throw new Error('本地模型启动超时。');
  }
  if (!options.restart) localServerRestartAttempts = 0;
  updateLocalServerStatus({ state: options.restart ? 'restarting' : 'starting', phase: 'checking-resources', pid: 0, error: '', startedAt: Date.now(), model: path.basename(settings.modelPath), activePort: 0, restartAttempts: localServerRestartAttempts, memoryRisk: compatibility.memoryRisk, estimatedMemoryBytes: compatibility.estimatedMemoryBytes, startupTimeoutMs });
  const activePort = await findAvailableLocalPort(settings.port);
  const runtimeSettings = { ...settings, port: activePort };
  localServerSettings = runtimeSettings;
  updateLocalServerStatus({ phase: 'loading-model', activePort });
  const processReference = spawn(settings.runtimePath, buildLocalServerArgs(runtimeSettings), {
    cwd: path.dirname(settings.runtimePath),
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  localServerProcess = processReference;
  updateLocalServerStatus({ pid: processReference.pid || 0 });
  let recentError = '';
  processReference.stdout.on('data', chunk => updateServerPhaseFromOutput(chunk));
  processReference.stderr.on('data', chunk => {
    recentError = `${recentError}${chunk}`.slice(-2400);
    updateServerPhaseFromOutput(chunk);
  });
  processReference.on('error', error => failLocalServer(error, settings));
  processReference.on('exit', code => {
    if (localServerProcess === processReference) localServerProcess = undefined;
    const unexpected = !isQuitting && !expectedLocalServerExits.has(processReference);
    if (!unexpected) return;
    const message = sanitizeStartupError(recentError || `llama-server 已退出：${code ?? 'unknown'}`);
    writeLocalAiRuntimeError(message, settings.modelPath);
    if (localServerRestartAttempts < 1) {
      localServerRestartAttempts += 1;
      localServerSettings = undefined;
      updateLocalServerStatus({ state: 'restarting', phase: 'restarting', pid: 0, error: message, restartAttempts: localServerRestartAttempts });
      setTimeout(() => ensureLocalServer({ restart: true }).catch(error => failLocalServer(error, settings)), 1500);
    } else {
      localServerSettings = undefined;
      failLocalServer(message, settings);
    }
  });
  const deadline = Date.now() + startupTimeoutMs;
  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (localServerSettings && localServerSettings !== runtimeSettings && await localServerHealthy(localServerSettings)) return localServerSettings;
    if (localServerProcess !== processReference) {
      if (localServerStatus.state === 'failed') throw new Error(localServerStatus.error || '本地模型启动失败。');
      continue;
    }
    if (await localServerHealthy(runtimeSettings)) {
      try {
        updateLocalServerStatus({ phase: 'warming-up' });
        await warmLocalServer(runtimeSettings);
        clearLocalAiRuntimeError();
        localServerLastUsedAt = Date.now();
        scheduleLocalServerStop(runtimeSettings);
        updateLocalServerStatus({ state: 'ready', phase: 'ready', error: '', restartAttempts: localServerRestartAttempts });
        clearTimeout(localServerStableTimer);
        localServerStableTimer = setTimeout(() => { localServerRestartAttempts = 0; updateLocalServerStatus({ restartAttempts: 0 }); }, 5 * 60000);
        return runtimeSettings;
      } catch (error) {
        stopLocalServer('warmup-failed', false);
        throw failLocalServer(error, settings);
      }
    }
    if (localServerStatus.state === 'failed') throw new Error(localServerStatus.error || '本地模型启动失败。');
  }
  stopLocalServer('timeout', false);
  throw failLocalServer(`本地模型启动超时。${recentError ? ` ${recentError.slice(-360)}` : ''}`, settings);
}

async function requestLocalChat(message, history, images, systemPrompt) {
  const settings = await ensureLocalServer();
  if (images.length && !settings.mmprojPath) throw new Error('本地图片理解需要选择与模型匹配的 mmproj GGUF 文件。');
  const profile = localAiProfile(settings);
  const response = await fetch(localChatEndpoint(settings), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'local-model',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-8).map(item => ({ role: item.role, content: String(item.content).slice(0, 3500) })),
        { role: 'user', content: buildUserContent(message, images) }
      ],
      temperature: 0.7,
      max_tokens: profile.maxTokens,
      stream: false
    }),
    signal: AbortSignal.timeout(120000)
  });
  if (!response.ok) throw new Error(`本地模型返回 ${response.status}: ${(await response.text()).slice(0, 220)}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('本地模型没有返回可显示的文字。');
  localServerLastUsedAt = Date.now();
  scheduleLocalServerStop(settings);
  return { text: text.trim(), mode: images.length ? 'local-vision' : 'local' };
}

function buildChatRequestContext(message, history, rawImages = []) {
  const settings = publicSettings();
  const apiKey = decryptApiKey();
  const memoryStore = readMemoryStore();
  const plannerStore = readPlannerStore();
  const companionStore = readCompanionStore();
  const images = normalizeImageAttachments(rawImages);
  const knowledgeResults = searchKnowledge(readKnowledgeStore(), message, 5);
  const knowledgeContext = buildKnowledgeContext(knowledgeResults);
  const onlineReady = Boolean(settings.endpoint && settings.model && apiKey);
  const localSettings = readLocalAiSettings();
  const backend = chooseChatBackend(localSettings, onlineReady, images.length > 0);
  const systemPrompt = `${SYSTEM_PROMPT}\n\n${buildMemoryPrompt(memoryStore)}\n\n${buildCompanionPrompt(companionStore, memoryStore.profile.displayName)}\n\n${buildLocalContext(plannerStore)}${knowledgeContext ? `\n\n${knowledgeContext}` : ''}`;
  return { settings, apiKey, memoryStore, plannerStore, images, backend, systemPrompt, history };
}

async function requestLocalChatStream(message, history, images, systemPrompt, controller, onDelta) {
  const settings = await ensureLocalServer();
  if (images.length && !settings.mmprojPath) throw new Error('本地图片理解需要选择与模型匹配的 mmproj GGUF 文件。');
  const profile = localAiProfile(settings);
  const startedAt = Date.now();
  let firstTokenAt = 0;
  let text = '';
  let finalPayload = {};
  const response = await fetch(localChatEndpoint(settings), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'local-model',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-8).map(item => ({ role: item.role, content: String(item.content).slice(0, 3500) })),
        { role: 'user', content: buildUserContent(message, images) }
      ],
      temperature: 0.7,
      max_tokens: profile.maxTokens,
      stream: true,
      stream_options: { include_usage: true }
    }),
    signal: controller.signal
  });
  if (!response.ok || !response.body) throw new Error(`本地模型返回 ${response.status}: ${(await response.text()).slice(0, 220)}`);
  const decoder = new TextDecoder();
  const parser = createSseParser(data => {
    if (data === '[DONE]') return;
    let payload;
    try { payload = JSON.parse(data); } catch { return; }
    finalPayload = payload?.usage || payload?.timings ? { ...finalPayload, ...payload } : finalPayload;
    const delta = streamDelta(payload);
    if (!delta) return;
    if (!firstTokenAt) firstTokenAt = Date.now();
    text += delta;
    onDelta(delta, streamMetrics(payload, startedAt, firstTokenAt, profile.contextSize, text));
  });
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true }));
  }
  parser.push(decoder.decode());
  parser.finish();
  if (!text.trim()) throw new Error('本地模型没有返回可显示的文字。');
  localServerLastUsedAt = Date.now();
  scheduleLocalServerStop(settings);
  return { text: text.trim(), mode: images.length ? 'local-vision' : 'local', metrics: streamMetrics(finalPayload, startedAt, firstTokenAt, profile.contextSize, text) };
}

function emitChatStreamEvent(sender, requestId, payload) {
  if (!sender.isDestroyed()) sender.send('chat:stream-event', { requestId, ...payload });
}

async function executeChatStream(entry, payload) {
  const message = String(payload?.message || '').slice(0, 8000);
  const history = Array.isArray(payload?.history) ? payload.history : [];
  const context = buildChatRequestContext(message, history, payload?.images);
  emitChatStreamEvent(entry.sender, entry.requestId, { type: 'started', mode: context.backend });
  if (context.backend === 'rules') {
    if (context.images.length) throw new Error(localAiReady(readLocalAiSettings()) ? '本地图片理解需要选择匹配的 mmproj GGUF 文件；图片不会自动上传。' : '图片对话需要在线视觉模型，或本地多模态模型和 mmproj 文件。');
    const text = offlineReply(message, context.memoryStore, context.plannerStore, searchKnowledge(readKnowledgeStore(), message, 5));
    emitChatStreamEvent(entry.sender, entry.requestId, { type: 'delta', text });
    emitChatStreamEvent(entry.sender, entry.requestId, { type: 'done', text, mode: 'offline', metrics: {} });
    return;
  }
  if (context.backend === 'local') {
    const timeout = setTimeout(() => { entry.timeout = true; entry.controller.abort(); }, 120000);
    try {
      const result = await requestLocalChatStream(message, history, context.images, context.systemPrompt, entry.controller, (text, metrics) => emitChatStreamEvent(entry.sender, entry.requestId, { type: 'delta', text, metrics }));
      emitChatStreamEvent(entry.sender, entry.requestId, { type: 'done', ...result });
    } finally {
      clearTimeout(timeout);
    }
    return;
  }
  const result = await requestChat(message, history, context.images);
  emitChatStreamEvent(entry.sender, entry.requestId, { type: 'delta', text: result.text });
  emitChatStreamEvent(entry.sender, entry.requestId, { type: 'done', ...result, metrics: {} });
}

function startChatStream(sender, payload) {
  for (const entry of activeChatStreams.values()) {
    if (entry.sender.id === sender.id) {
      entry.cancelReason = 'replaced';
      entry.controller.abort();
    }
  }
  const requestId = randomUUID();
  const entry = { requestId, sender, controller: new AbortController(), cancelReason: '', timeout: false };
  activeChatStreams.set(requestId, entry);
  setImmediate(() => void executeChatStream(entry, payload).catch(async error => {
    if (entry.controller.signal.aborted) {
      emitChatStreamEvent(sender, requestId, { type: entry.timeout ? 'error' : 'cancelled', error: entry.timeout ? '本地生成超过 120 秒，已停止。' : '' });
      return;
    }
    let recovered = false;
    if (localServerStatus.state === 'failed' || localServerStatus.state === 'restarting') {
      try { await ensureLocalServer({ restart: true }); recovered = true; } catch {}
    }
    emitChatStreamEvent(sender, requestId, { type: 'error', error: `${sanitizeStartupError(error) || '对话失败。'}${recovered ? ' 本地模型已自动恢复，请重新发送；Astra 未重复提交上一条问题。' : ''}` });
  }).finally(() => {
    if (activeChatStreams.get(requestId) === entry) activeChatStreams.delete(requestId);
  }));
  return { requestId };
}

function stopChatStream(requestId) {
  const id = String(requestId || '').slice(0, 80);
  const entry = activeChatStreams.get(id);
  if (!entry) return { stopped: false };
  entry.cancelReason = 'user';
  entry.controller.abort();
  return { stopped: true };
}

async function selectExecutable(title, names) {
  const result = await dialog.showOpenDialog(mainWindow, { title, properties: ['openFile'], filters: [{ name: 'Windows 程序', extensions: ['exe'] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true, path: '' };
  const selected = result.filePaths[0];
  if (!names.includes(path.basename(selected).toLowerCase())) throw new Error(`请选择 ${names.join(' 或 ')}。`);
  return { canceled: false, path: selected };
}

async function selectModel(title, extension) {
  const result = await dialog.showOpenDialog(mainWindow, { title, properties: ['openFile'], filters: [{ name: `${extension.toUpperCase()} 模型`, extensions: [extension] }] });
  return result.canceled || !result.filePaths[0] ? { canceled: true, path: '' } : { canceled: false, path: result.filePaths[0] };
}

async function transcribeOfflineAudio(payload) {
  const settings = readOfflineVoiceSettings();
  if (!offlineVoiceReady(settings)) throw new Error('离线语音尚未配置。');
  if (!fs.existsSync(settings.runtimePath) || !fs.existsSync(settings.modelPath)) throw new Error('离线语音运行时或模型文件已移动。');
  const mimeType = normalizeAudioMimeType(payload?.mimeType);
  if (mimeType !== 'audio/wav') throw new Error('离线语音需要 16 kHz 单声道 WAV 音频。');
  const bytes = validateAudioBytes(payload?.audio);
  const root = path.resolve(app.getPath('temp'));
  const tempDir = fs.mkdtempSync(path.join(root, 'astra-whisper-'));
  const wavPath = path.join(tempDir, 'input.wav');
  fs.writeFileSync(wavPath, bytes);
  try {
    return await new Promise((resolve, reject) => {
      execFile(settings.runtimePath, buildWhisperArgs(settings, wavPath), { cwd: path.dirname(settings.runtimePath), windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout = '', stderr = '') => {
        if (error) return reject(new Error(`离线语音识别失败：${String(stderr || error.message).slice(-320)}`));
        const text = String(stdout).replace(/^\s*\[[^\]]+\]\s*/gm, '').trim();
        if (!text) return reject(new Error('离线语音没有识别到文字。'));
        resolve({ text: text.slice(0, 8000), mode: 'offline-local' });
      });
    });
  } finally {
    const resolved = path.resolve(tempDir);
    if (resolved.startsWith(`${root}${path.sep}`)) fs.rmSync(resolved, { recursive: true, force: true });
  }
}

async function importKnowledgeFiles() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '导入本地知识文件', properties: ['openFile', 'multiSelections'],
    filters: [{ name: '文本知识文件', extensions: ['txt', 'md', 'markdown', 'csv', 'json', 'log'] }]
  });
  if (result.canceled) return { canceled: true, state: readKnowledgeStore() };
  const store = readKnowledgeStore();
  for (const filePath of result.filePaths.slice(0, 20)) {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw new Error(`${path.basename(filePath)} 超过 2 MB 或不是普通文件。`);
    const text = fs.readFileSync(filePath, 'utf8').replace(/\0/g, '').trim();
    if (!text) continue;
    store.documents = store.documents.filter(item => item.name !== path.basename(filePath));
    store.documents.push({ id: randomUUID(), name: path.basename(filePath), type: path.extname(filePath).slice(1), text, importedAt: Date.now() });
  }
  return { canceled: false, state: writeKnowledgeStore(store) };
}

function emitScenarioUpdate(reason = 'manual') {
  const state = scenarioState(readScenarioStore());
  mainWindow?.webContents.send('scenario:updated', { reason, state });
  return state;
}

function evaluateScenarioSchedule() {
  const store = readScenarioStore();
  const next = scheduledScenario(store);
  if (next !== store.active) {
    store.active = next;
    writeScenarioStore(store);
    emitScenarioUpdate('schedule');
  }
}

function focusPublicState() {
  const store = readFocusStore();
  return { ...store, now: Date.now(), remainingMs: store.active ? Math.max(0, store.active.dueAt - Date.now()) : 0 };
}

function emitFocusUpdate(type = 'update') {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('focus:updated', { type, state: focusPublicState() });
}

function evaluateFocus() {
  const result = completeFocus(readFocusStore(), Date.now());
  if (!result.completed) return;
  writeFocusStore(result.store);
  if (result.completed.type === 'focus') recordCompanionActivity('focus', `focus:${result.completed.startedAt}`);
  emitFocusUpdate('completed');
  emitProactiveMessage('focus', result.completed.type === 'focus' ? '专注完成。做得很好，起来活动和喝点水吧。' : '休息结束，可以开始下一轮专注了。');
  if (scenarioState(readScenarioStore()).definition.notifications && Notification.isSupported()) new Notification({ title: 'Astra 专注陪伴', body: result.completed.type === 'focus' ? '专注完成，准备休息一下。' : '休息结束。' }).show();
}

function startFocusMonitor() {
  clearInterval(focusTimer);
  focusTimer = setInterval(evaluateFocus, 1000);
  evaluateFocus();
}

function safeSettingsForExport() {
  const settings = readSettingsFile();
  const { apiKeyEncrypted, ...safe } = settings;
  return safe;
}

async function exportLocalData() {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出 Astra 本地数据',
    defaultPath: path.join(app.getPath('documents'), `Astra-Backup-${new Date().toISOString().slice(0, 10)}.json`),
    filters: [{ name: 'JSON 备份', extensions: ['json'] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  const data = {
    format: 'astra-backup-v1',
    exportedAt: new Date().toISOString(),
    version: app.getVersion(),
    settings: safeSettingsForExport(),
    memory: readMemoryStore(),
    planner: readPlannerStore(),
    companion: readCompanionStore(),
    focus: readFocusStore(),
    localAi: readLocalAiSettings(),
    offlineVoice: readOfflineVoiceSettings(),
    knowledge: readKnowledgeStore(),
    scenarios: readScenarioStore(),
    workflows: readWorkflowStore()
  };
  fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8');
  return { canceled: false, filePath: result.filePath };
}

async function importLocalData() {
  const result = await dialog.showOpenDialog(mainWindow, { title: '恢复 Astra 本地数据', properties: ['openFile'], filters: [{ name: 'JSON 备份', extensions: ['json'] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
  if (data?.format !== 'astra-backup-v1') throw new Error('这不是 Astra 支持的备份文件。');
  const current = readSettingsFile();
  writeSettingsFile({ ...current, ...normalizeProactiveSettings(data.settings || {}), onboardingCompleted: true, apiKeyEncrypted: current.apiKeyEncrypted });
  writeMemoryStore(data.memory || {});
  writePlannerStore(data.planner || {});
  writeCompanionStore(data.companion || {});
  writeFocusStore(data.focus || {});
  writeLocalAiSettings(data.localAi || {});
  writeOfflineVoiceSettings(data.offlineVoice || {});
  writeKnowledgeStore(data.knowledge || {});
  writeScenarioStore(data.scenarios || {});
  writeWorkflowStore(data.workflows || {});
  rearmAllReminders();
  emitCompanionUpdate({ store: readCompanionStore(), scoreDelta: 0, newlyUnlocked: [] }, 'restore');
  emitFocusUpdate('restore');
  return { canceled: false };
}

function clearLocalData() {
  const fixedFiles = [settingsPath(), memoryPath(), plannerPath(), remindersPath(), skillHistoryPath(), companionPath(), focusPath(), localAiPath(), localAiRuntimePath(), offlineVoicePath(), knowledgePath(), scenariosPath(), workflowsPath(), windowStatePath(), runtimeStatePath()];
  for (const filePath of fixedFiles) {
    fs.rmSync(filePath, { force: true });
    fs.rmSync(`${filePath}.bak`, { force: true });
  }
  return { ok: true };
}

async function checkForUpdates() {
  const manifestUrl = String(readSettingsFile().updateManifestUrl || '').trim();
  if (!manifestUrl) throw new Error('请先填写 HTTPS 更新清单地址。自动下载默认关闭。');
  const parsed = new URL(manifestUrl);
  if (parsed.protocol !== 'https:') throw new Error('更新清单必须使用 HTTPS。');
  const response = await fetch(parsed, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`更新检查失败：${response.status}`);
  const manifest = await response.json();
  return {
    currentVersion: app.getVersion(),
    latestVersion: String(manifest.version || '').slice(0, 40),
    notes: String(manifest.notes || '').slice(0, 2000),
    downloadUrl: /^https:\/\//i.test(manifest.downloadUrl || '') ? String(manifest.downloadUrl).slice(0, 2000) : ''
  };
}

function configureMediaPermissions() {
  session.defaultSession.setPermissionCheckHandler((webContents, permission, _requestingOrigin, details) => {
    const isMainWindow = Boolean(webContents && mainWindow && webContents.id === mainWindow.webContents.id);
    const requestsAudio = !details?.mediaType || details.mediaType === 'audio';
    return isMainWindow && permission === 'media' && requestsAudio;
  });
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const isMainWindow = Boolean(webContents && mainWindow && webContents.id === mainWindow.webContents.id);
    const requestsAudio = !details?.mediaTypes?.length || details.mediaTypes.every(type => type === 'audio');
    callback(isMainWindow && permission === 'media' && requestsAudio);
  });
}

function setClickThrough(enabled) {
  const nextState = Boolean(enabled);
  if (nextState && IS_SAFE_MODE) throw new Error('安全模式已禁用鼠标穿透。请恢复普通模式后再使用。');
  clearTimeout(clickThroughTimer);
  isClickThrough = nextState;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setIgnoreMouseEvents(nextState, { forward: true });
  }
  if (nextState) {
    clickThroughTimer = setTimeout(() => restoreWindow('automatic'), CLICK_THROUGH_AUTO_RESTORE_SECONDS * 1000);
  }
  writeLog('info', 'click-through-changed', { enabled: nextState });
  updateTrayMenu();
  return {
    enabled: nextState,
    shortcut: formatShortcutLabel(activeRestoreShortcut),
    autoRestoreSeconds: CLICK_THROUGH_AUTO_RESTORE_SECONDS
  };
}

function clampWindowPosition(rawX, rawY) {
  if (!mainWindow || mainWindow.isDestroyed()) throw new Error('主窗口当前不可用。');
  const bounds = mainWindow.getBounds();
  const x = Math.max(-100000, Math.min(100000, Math.round(Number(rawX) || 0)));
  const y = Math.max(-100000, Math.min(100000, Math.round(Number(rawY) || 0)));
  const center = { x: x + Math.round(bounds.width / 2), y: y + Math.round(bounds.height / 2) };
  const display = screen.getDisplayNearestPoint(center);
  const area = display.workArea;
  return { ...clampWindowPositionToWorkArea({ x, y }, bounds, area), displayId: String(display.id) };
}

function moveWindowTo(rawX, rawY) {
  const position = clampWindowPosition(rawX, rawY);
  mainWindow.setPosition(position.x, position.y, false);
  return { ...mainWindow.getBounds(), displayId: position.displayId };
}

function windowDragState() {
  if (!mainWindow || mainWindow.isDestroyed()) throw new Error('主窗口当前不可用。');
  const bounds = mainWindow.getBounds();
  const display = screen.getDisplayMatching(bounds);
  return { ...bounds, displayId: String(display.id), scaleFactor: display.scaleFactor, workArea: { ...display.workArea } };
}

function restoreWindow(reason = 'manual') {
  restoreRequested = true;
  if (!mainWindow || mainWindow.isDestroyed()) {
    writeLog('warn', 'restore-deferred', { reason });
    return;
  }
  restoreRequested = false;
  setClickThrough(false);
  setWindowMode('full', reason);
  mainWindow.moveTop();
  writeLog('info', 'window-restored', { reason });
  mainWindow.webContents.send('window:interaction-restored', { reason, shortcut: activeRestoreShortcut });
}

function updateTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '显示完整对话界面', click: () => restoreWindow('tray') },
    { label: '显示迷你桌宠', click: () => setWindowMode('mini', 'tray') },
    { label: '完全隐藏', click: () => setWindowMode('hidden', 'tray') },
    { label: isClickThrough ? '关闭鼠标穿透' : '开启鼠标穿透', click: () => setClickThrough(!isClickThrough) },
    { label: '打开日志目录', click: () => shell.showItemInFolder(logFilePath()) },
    { label: IS_SAFE_MODE ? '退出安全模式并重启' : '以安全模式重启', click: () => restartInMode(!IS_SAFE_MODE) },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, '..', 'build', 'icon.ico'));
  tray = new Tray(trayIcon);
  tray.setToolTip(APP_NAME);
  updateTrayMenu();
  tray.on('double-click', () => restoreWindow('tray'));
}

function registerRestoreShortcuts(configuredShortcut = readSettingsFile().restoreShortcut) {
  globalShortcut.unregisterAll();
  activeRestoreShortcut = '';
  registeredRestoreShortcuts = getRestoreShortcutCandidates(configuredShortcut).map(shortcut => {
    const registered = globalShortcut.register(shortcut, () => restoreWindow('shortcut'));
    if (registered && !activeRestoreShortcut) activeRestoreShortcut = shortcut;
    return { shortcut, label: formatShortcutLabel(shortcut), registered };
  });
  writeLog(activeRestoreShortcut ? 'info' : 'error', 'restore-shortcuts-registered', {
    configuredShortcut: sanitizeRestoreShortcut(configuredShortcut),
    activeRestoreShortcut,
    registrations: registeredRestoreShortcuts
  });
  return registeredRestoreShortcuts;
}

function listMatchingProcesses() {
  if (process.platform !== 'win32' || !app.isPackaged) return Promise.resolve([process.pid]);
  const executableName = path.basename(process.execPath).replaceAll("'", "''");
  const command = `$name='${executableName}'; @(Get-CimInstance Win32_Process -Filter "Name='$name'" | Where-Object { $_.CommandLine -notmatch '--type=' } | Select-Object -ExpandProperty ProcessId) -join ','`;
  return new Promise(resolve => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], { windowsHide: true, timeout: 5000 }, (_error, stdout = '') => {
      const processIds = stdout.trim().split(',').map(Number).filter(Number.isInteger);
      resolve(processIds.length ? processIds : [process.pid]);
    });
  });
}

async function getDiagnostics() {
  const processIds = await listMatchingProcesses();
  const windowAvailable = Boolean(mainWindow && !mainWindow.isDestroyed());
  const settings = publicSettings();
  const plannerStore = readPlannerStore();
  const memoryStore = readMemoryStore();
  const companionState = companionPublicState();
  return {
    generatedAt: new Date().toISOString(),
    startedAt: STARTED_AT,
    app: {
      name: APP_NAME,
      version: app.getVersion(),
      packaged: app.isPackaged,
      safeMode: IS_SAFE_MODE,
      executable: process.execPath
    },
    runtime: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform,
      release: os.release(),
      arch: process.arch
    },
    graphics: {
      softwareRendering: SOFTWARE_RENDERING_MODE,
      hardwareAccelerationDisabled: SOFTWARE_RENDERING_MODE,
      disableGpuSwitch: app.commandLine.hasSwitch('disable-gpu'),
      disableGpuCompositingSwitch: app.commandLine.hasSwitch('disable-gpu-compositing')
    },
    process: {
      currentId: process.pid,
      matchingIds: processIds,
      matchingCount: processIds.length,
      browserWindowCount: BrowserWindow.getAllWindows().length
    },
    window: {
      available: windowAvailable,
      visible: windowAvailable && mainWindow.isVisible(),
      focused: windowAvailable && mainWindow.isFocused(),
      minimized: windowAvailable && mainWindow.isMinimized(),
      clickThrough: isClickThrough,
      mode: currentWindowMode,
      fullscreenSuppressed
    },
    recovery: {
      configuredShortcut: sanitizeRestoreShortcut(readSettingsFile().restoreShortcut),
      activeShortcut: activeRestoreShortcut,
      shortcuts: registeredRestoreShortcuts,
      autoRestoreSeconds: CLICK_THROUGH_AUTO_RESTORE_SECONDS,
      controlPipeListening
    },
    voice: {
      transcriptionConfigured: Boolean(settings.endpoint && settings.apiKeyConfigured),
      transcriptionModel: settings.transcriptionModel,
      realtimeConfigured: Boolean(settings.realtimeEnabled && settings.endpoint && settings.apiKeyConfigured),
      skillBridgeEnabled: settings.voiceSkillBridgeEnabled === true,
      realtimeModel: settings.realtimeModel,
      realtimeVoice: settings.realtimeVoice,
      realtimeVadMode: settings.realtimeVadMode,
      runtime: realtimeRuntimeStatus
    },
    skills: {
      registered: SKILL_DEFINITIONS.length,
      pendingReminders: listReminders().length,
      volumeHelperAvailable: fs.existsSync(volumeHelperPath())
    },
    planner: {
      tasks: plannerStore.tasks.length,
      pendingTasks: plannerStore.tasks.filter(task => !task.completed).length,
      proactive: normalizeProactiveSettings(readSettingsFile())
    },
    memory: {
      count: memoryStore.memories.length,
      hasDisplayName: Boolean(memoryStore.profile.displayName)
    },
    companion: {
      score: companionState.score,
      level: companionState.level,
      runtime: companionRuntimeStatus
    },
    localAi: localAiPublicState(),
    offlineVoice: offlineVoicePublicState(),
    knowledge: { documents: readKnowledgeStore().documents.length },
    scenario: scenarioState(readScenarioStore()),
    workflows: { count: readWorkflowStore().workflows.length },
    storage: {
      settings: inspectJsonStorage(settingsPath()),
      memory: inspectJsonStorage(memoryPath()),
      planner: inspectJsonStorage(plannerPath()),
      companion: inspectJsonStorage(companionPath()),
      windowState: inspectJsonStorage(windowStatePath()),
      runtimeState: inspectJsonStorage(runtimeStatePath()),
      localAi: inspectJsonStorage(localAiPath()),
      localAiRuntime: inspectJsonStorage(localAiRuntimePath()),
      offlineVoice: inspectJsonStorage(offlineVoicePath()),
      knowledge: inspectJsonStorage(knowledgePath()),
      scenarios: inspectJsonStorage(scenariosPath()),
      workflows: inspectJsonStorage(workflowsPath())
    },
    paths: {
      userData: app.getPath('userData'),
      log: logFilePath()
    }
  };
}

async function exportDiagnostics() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出 Astra 诊断报告',
    defaultPath: path.join(app.getPath('documents'), `Astra-Diagnostics-${timestamp}.txt`),
    filters: [{ name: '文本报告', extensions: ['txt'] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };

  const diagnostics = await getDiagnostics();
  let logs = '暂无日志。';
  try {
    logs = fs.readFileSync(logFilePath(), 'utf8');
  } catch {
    // The diagnostics summary is still useful without log lines.
  }
  const report = [
    'Astra Desktop 诊断报告',
    '此报告不会包含 API Key。',
    '',
    JSON.stringify(redactSensitive(diagnostics), null, 2),
    '',
    '--- Recent Logs ---',
    String(redactSensitive(logs)).slice(-LOG_MAX_BYTES)
  ].join('\n');
  fs.writeFileSync(result.filePath, report, 'utf8');
  writeLog('info', 'diagnostics-exported', { filePath: result.filePath });
  return { canceled: false, filePath: result.filePath };
}

function restartInMode(safeMode) {
  writeLog('info', 'restart-requested', { safeMode });
  isQuitting = true;
  app.relaunch({ args: buildRelaunchArgs(process.argv.slice(1), safeMode) });
  app.exit(0);
}

function normalizeChatEndpoint(baseUrl) {
  return normalizeApiEndpoint(baseUrl, 'chat/completions');
}

function offlineReply(message, memoryStore = readMemoryStore(), plannerStore = readPlannerStore(), knowledgeResults = []) {
  const text = message.trim();
  const displayName = memoryStore.profile.displayName;
  if (/你好|嗨|hello/i.test(text)) return `${displayName ? `${displayName}，` : ''}你好，我是 Astra。你可以让我打开应用、使用技能，或让我记住你明确指定的信息。`;
  if (/你是谁|名字/.test(text)) return '我是 Astra，你的桌面助手原型。当前可以离线回应基础问题，也可以连接兼容的 AI 接口。';
  if (/时间|几点/.test(text)) return `现在是 ${new Date().toLocaleString('zh-CN', { hour12: false })}。`;
  if (/今日摘要|今天.*(安排|待办)|有什么提醒|我的计划/.test(text)) return buildDailySummary(plannerStore);
  if (/帮助|会什么/.test(text)) return '试试输入“打开 VS Code”、“截图”、“提醒我 5 分钟后喝水”、“记住我喜欢蓝色”或“你记得什么”。';
  if (knowledgeResults.length) return `我在本地知识库中找到了相关内容，但当前没有可用模型进行归纳：\n\n${knowledgeResults.slice(0, 2).map(item => `【${item.name}】${item.text.slice(0, 420)}`).join('\n\n')}`;
  return '我现在处于离线基础模式。请配置本地 GGUF 模型，或填写兼容接口地址、模型名称和 API Key，以启用完整对话。';
}

async function requestChat(message, history, rawImages = []) {
  const settings = publicSettings();
  const apiKey = decryptApiKey();
  const memoryStore = readMemoryStore();
  const plannerStore = readPlannerStore();
  const companionStore = readCompanionStore();
  const images = normalizeImageAttachments(rawImages);
  const knowledgeResults = searchKnowledge(readKnowledgeStore(), message, 5);
  const knowledgeContext = buildKnowledgeContext(knowledgeResults);
  const onlineReady = Boolean(settings.endpoint && settings.model && apiKey);
  const localSettings = readLocalAiSettings();
  const backend = chooseChatBackend(localSettings, onlineReady, images.length > 0);
  const systemPrompt = `${SYSTEM_PROMPT}\n\n${buildMemoryPrompt(memoryStore)}\n\n${buildCompanionPrompt(companionStore, memoryStore.profile.displayName)}\n\n${buildLocalContext(plannerStore)}${knowledgeContext ? `\n\n${knowledgeContext}` : ''}`;
  if (backend === 'local') return requestLocalChat(message, history, images, systemPrompt);
  if (backend === 'rules') {
    if (images.length) throw new Error(localAiReady(localSettings) ? '本地图片理解需要选择匹配的 mmproj GGUF 文件；图片不会自动上传。' : '图片对话需要在线视觉模型，或本地多模态模型和 mmproj 文件。');
    return { text: offlineReply(message, memoryStore, plannerStore, knowledgeResults), mode: 'offline' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(normalizeChatEndpoint(settings.endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10).map(item => ({ role: item.role, content: String(item.content).slice(0, 4000) })),
          { role: 'user', content: buildUserContent(message, images) }
        ],
        temperature: 0.7
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = await response.text();
      if (images.length && [400, 404, 415, 422].includes(response.status)) throw new Error('当前模型或兼容接口可能不支持图片输入，请更换支持视觉的模型。');
      throw new Error(`AI 服务返回 ${response.status}: ${detail.slice(0, 180)}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('AI 服务没有返回可显示的文字。');
    return { text: text.trim(), mode: 'online' };
  } finally {
    clearTimeout(timeout);
  }
}

async function transcribeAudio(payload) {
  const settings = publicSettings();
  const apiKey = decryptApiKey();
  if (!settings.endpoint || !apiKey) throw new Error('请先在设置中填写兼容接口地址和 API Key。');
  const mimeType = normalizeAudioMimeType(payload?.mimeType);
  if (!mimeType) throw new Error('当前录音格式不受支持，请改用 WebM、WAV、MP3、MP4 或 OGG。');
  const audioBytes = validateAudioBytes(payload?.audio);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  const form = new FormData();
  form.append('file', new Blob([audioBytes], { type: mimeType }), audioFilename(mimeType));
  form.append('model', settings.transcriptionModel || DEFAULT_TRANSCRIPTION_MODEL);
  form.append('language', 'zh');
  writeLog('info', 'voice-transcription-started', { bytes: audioBytes.length, mimeType, model: settings.transcriptionModel });
  try {
    const response = await fetch(normalizeApiEndpoint(settings.endpoint, 'audio/transcriptions'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`语音服务返回 ${response.status}: ${detail.slice(0, 180)}`);
    }
    const text = parseTranscriptionResponse(await response.json());
    writeLog('info', 'voice-transcription-completed', { characters: text.length });
    return { text };
  } catch (error) {
    writeLog('error', 'voice-transcription-failed', { name: error.name, message: error.message });
    if (error.name === 'AbortError') throw new Error('语音转写超时，请检查网络或缩短录音。');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function createRealtimeCall(payload) {
  const settings = publicSettings();
  if (!settings.realtimeEnabled) throw new Error('请先在设置中开启实时语音。');
  if (!settings.endpoint || !settings.apiKeyConfigured) throw new Error('请先配置支持 Realtime API 的接口地址和 API Key。');

  const apiKey = decryptApiKey();
  if (!apiKey) throw new Error('API Key 无法解密，请在设置中重新填写。');

  const endpoint = normalizeRealtimeEndpoint(settings.endpoint);
  let parsedEndpoint;
  try {
    parsedEndpoint = new URL(endpoint);
  } catch {
    throw new Error('实时语音接口地址无效。');
  }
  const localHttp = parsedEndpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(parsedEndpoint.hostname);
  if (parsedEndpoint.protocol !== 'https:' && !localHttp) throw new Error('实时语音接口必须使用 HTTPS，本机服务除外。');

  const offerSdp = validateOfferSdp(payload?.sdp);
  const memoryStore = readMemoryStore();
  const plannerStore = readPlannerStore();
  const instructions = `${SYSTEM_PROMPT}\n\n${buildMemoryPrompt(memoryStore)}\n\n${buildLocalContext(plannerStore)}\n\n实时语音会话只用于自然对话，不要声称已执行电脑操作。需要操作电脑时，请提示用户改用文字或按住说话模式，以便经过本地白名单验证。`;
  const realtimeSession = buildRealtimeSession(settings, instructions);
  const form = new FormData();
  form.append('sdp', offerSdp);
  form.append('session', JSON.stringify(realtimeSession));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  writeLog('info', 'realtime-call-started', {
    endpoint: parsedEndpoint.origin,
    model: realtimeSession.model,
    voice: realtimeSession.audio.output.voice,
    vadMode: settings.realtimeVadMode
  });
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`实时语音服务返回 ${response.status}: ${detail.slice(0, 180)}`);
    }
    const answerSdp = validateOfferSdp(await response.text());
    writeLog('info', 'realtime-call-connected', { model: realtimeSession.model });
    return {
      sdp: answerSdp,
      model: realtimeSession.model,
      voice: realtimeSession.audio.output.voice
    };
  } catch (error) {
    writeLog('error', 'realtime-call-failed', { name: error.name, message: error.message });
    if (error.name === 'AbortError') throw new Error('实时语音连接超时，请检查网络和接口配置。');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function appendSkillHistory(skillId, ok, detail = {}) {
  const history = readJsonArray(skillHistoryPath());
  history.push(createHistoryEntry(skillId, ok, redactSensitive(detail)));
  writeJsonArray(skillHistoryPath(), history.slice(-MAX_SKILL_HISTORY));
}

function listReminders() {
  return readPlannerStore().reminders;
}

function removeReminder(reminderId) {
  const timer = reminderTimers.get(reminderId);
  if (timer) clearTimeout(timer);
  reminderTimers.delete(reminderId);
  const result = removePlannerReminder(readPlannerStore(), reminderId);
  writePlannerStore(result.store);
  return result.store.reminders;
}

function fireReminder(reminder) {
  const settings = normalizeProactiveSettings(readSettingsFile());
  if (isQuietTime(new Date(), settings)) {
    armReminder(reminder);
    writeLog('info', 'reminder-deferred-quiet-hours', { reminderId: reminder.id, quietEnd: settings.quietEnd });
    return;
  }
  if (!scenarioState(readScenarioStore()).definition.notifications) {
    const timer = setTimeout(() => fireReminder(reminder), 60000);
    reminderTimers.set(reminder.id, timer);
    writeLog('info', 'reminder-deferred-scenario', { reminderId: reminder.id, scenario: readScenarioStore().active });
    return;
  }
  reminderTimers.delete(reminder.id);
  if (Notification.isSupported()) {
    const notification = new Notification({ title: 'Astra 提醒', body: reminder.title });
    notification.on('click', () => restoreWindow('notification'));
    notification.show();
  }
  emitProactiveMessage('reminder', `提醒时间到了：${reminder.title}`);
  removeReminder(reminder.id);
  appendSkillHistory('reminders.fire', true, { reminderId: reminder.id });
  writeLog('info', 'reminder-fired', { reminderId: reminder.id });
}

function armReminder(reminder) {
  const existingTimer = reminderTimers.get(reminder.id);
  if (existingTimer) clearTimeout(existingTimer);
  const arm = () => {
    const now = Date.now();
    const settings = normalizeProactiveSettings(readSettingsFile());
    const target = reminder.dueAt <= now && isQuietTime(new Date(now), settings) ? nextQuietEnd(new Date(now), settings) : reminder.dueAt;
    const remaining = target - now;
    if (remaining <= 0) {
      fireReminder(reminder);
      return;
    }
    const timer = setTimeout(remaining > MAX_TIMER_DELAY ? arm : () => fireReminder(reminder), Math.min(remaining, MAX_TIMER_DELAY));
    reminderTimers.set(reminder.id, timer);
  };
  arm();
}

function loadPersistentReminders() {
  const hadPlannerFile = fs.existsSync(plannerPath());
  writePlannerStore(readPlannerStore());
  if (!hadPlannerFile) fs.rmSync(remindersPath(), { force: true });
  for (const reminder of listReminders()) armReminder(reminder);
  writeLog('info', 'reminders-loaded', { count: reminderTimers.size });
}

function rearmAllReminders() {
  for (const timer of reminderTimers.values()) clearTimeout(timer);
  reminderTimers.clear();
  for (const reminder of listReminders()) armReminder(reminder);
}

function scheduleAbsoluteReminder(dueAt, title) {
  const result = addPlannerReminder(readPlannerStore(), { dueAt, title }, { id: randomUUID() });
  writePlannerStore(result.store);
  armReminder(result.reminder);
  appendSkillHistory('reminders.schedule', true, { reminderId: result.reminder.id, dueAt: result.reminder.dueAt });
  writeLog('info', 'reminder-scheduled', { reminderId: result.reminder.id, dueAt: result.reminder.dueAt });
  return { ...result.reminder, persisted: true };
}

function scheduleReminder(minutes, title) {
  const normalized = normalizeReminder(minutes, title);
  return { ...scheduleAbsoluteReminder(normalized.dueAt, normalized.title), minutes: normalized.minutes };
}

function cancelReminder(reminderId) {
  const id = String(reminderId || '');
  if (!listReminders().some(item => item.id === id)) throw new Error('没有找到该提醒。');
  const reminders = removeReminder(id);
  appendSkillHistory('reminders.cancel', true, { reminderId: id });
  return { ok: true, reminders };
}

function saveProactiveSettings(input) {
  const current = readSettingsFile();
  const settings = normalizeProactiveSettings({ ...current, ...input });
  writeSettingsFile({ ...current, ...settings });
  rearmAllReminders();
  writeLog('info', 'proactive-settings-saved', {
    proactiveEnabled: settings.proactiveEnabled,
    dailySummaryEnabled: settings.dailySummaryEnabled,
    quietHoursEnabled: settings.quietHoursEnabled
  });
  evaluateProactiveAssistant();
  return getPlannerState();
}

function emitProactiveMessage(type, text) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoadingMainFrame()) return false;
  mainWindow.webContents.send('proactive:message', { type, text: String(text || '').slice(0, 2000), createdAt: Date.now() });
  return true;
}

function evaluateProactiveAssistant() {
  const settingsFile = readSettingsFile();
  const settings = normalizeProactiveSettings(settingsFile);
  if (!settings.proactiveEnabled || isQuietTime(new Date(), settings)) return;
  const store = readPlannerStore();
  const memory = readMemoryStore();
  if (settings.startupGreetingEnabled && !startupGreetingDelivered) {
    startupGreetingDelivered = emitProactiveMessage('greeting', buildStartupGreeting(store, new Date(), getPreferredAddress(readCompanionStore(), memory.profile.displayName)));
  }
  const today = localDateKey();
  if (settings.dailySummaryEnabled && settings.lastDailySummaryDate !== today && hasReachedDailySummaryTime(new Date(), settings)) {
    const summary = buildDailySummary(store);
    if (!emitProactiveMessage('summary', summary)) return;
    writeSettingsFile({ ...settingsFile, ...settings, lastDailySummaryDate: today });
    if (Notification.isSupported()) {
      const notification = new Notification({ title: 'Astra 每日摘要', body: summary.replace(/\n/g, ' ').slice(0, 220) });
      notification.on('click', () => restoreWindow('notification'));
      notification.show();
    }
    writeLog('info', 'daily-summary-delivered', { date: today });
  }
}

function startProactiveAssistant() {
  clearInterval(proactiveTimer);
  proactiveTimer = setInterval(evaluateProactiveAssistant, 60 * 1000);
  setTimeout(evaluateProactiveAssistant, 700);
}

async function captureScreenshot() {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const thumbnailSize = {
    width: Math.max(1, Math.round(display.size.width * display.scaleFactor)),
    height: Math.max(1, Math.round(display.size.height * display.scaleFactor))
  };
  const wasVisible = Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible());
  const wasFocused = wasVisible && mainWindow.isFocused();
  if (wasVisible) mainWindow.hide();
  await new Promise(resolve => setTimeout(resolve, 180));
  try {
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize });
    const source = sources.find(item => String(item.display_id) === String(display.id)) || sources[0];
    if (!source || source.thumbnail.isEmpty()) throw new Error('没有获取到可保存的屏幕画面。');
    const folder = path.join(app.getPath('pictures'), 'Astra Screenshots');
    fs.mkdirSync(folder, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(folder, `Astra-${timestamp}.png`);
    fs.writeFileSync(filePath, source.thumbnail.toPNG());
    return { filePath, displayId: String(display.id) };
  } finally {
    if (wasVisible && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      if (wasFocused) mainWindow.focus();
      mainWindow.moveTop();
    }
  }
}

async function searchAllowedFiles(rawQuery) {
  const query = sanitizeSearchQuery(rawQuery);
  const normalizedQuery = query.toLocaleLowerCase('zh-CN');
  const roots = [...new Set([app.getPath('desktop'), app.getPath('documents'), app.getPath('downloads')])]
    .filter(root => root && fs.existsSync(root));
  const queue = roots.map(root => ({ directory: root, depth: 0 }));
  const results = [];
  let scannedEntries = 0;

  while (queue.length && results.length < MAX_FILE_SEARCH_RESULTS && scannedEntries < MAX_FILE_SEARCH_ENTRIES) {
    const current = queue.shift();
    let entries;
    try {
      entries = await fs.promises.readdir(current.directory, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (results.length >= MAX_FILE_SEARCH_RESULTS || scannedEntries >= MAX_FILE_SEARCH_ENTRIES) break;
      scannedEntries += 1;
      if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
      const entryPath = path.join(current.directory, entry.name);
      if (entry.isDirectory()) {
        if (current.depth < 5 && !/^(node_modules|appdata|windows|program files)$/i.test(entry.name)) {
          queue.push({ directory: entryPath, depth: current.depth + 1 });
        }
        continue;
      }
      if (entry.isFile() && entry.name.toLocaleLowerCase('zh-CN').includes(normalizedQuery)) {
        results.push({ name: entry.name, path: entryPath, folder: current.directory });
      }
    }
  }

  results.sort((left, right) => {
    const leftStarts = left.name.toLocaleLowerCase('zh-CN').startsWith(normalizedQuery) ? 0 : 1;
    const rightStarts = right.name.toLocaleLowerCase('zh-CN').startsWith(normalizedQuery) ? 0 : 1;
    return leftStarts - rightStarts || left.name.localeCompare(right.name, 'zh-CN');
  });
  return { query, results, scannedEntries, roots };
}

const skillHandlers = {
  'clipboard.read': async () => {
    const text = clipboard.readText();
    return { text: text.slice(0, 4000), characters: text.length, truncated: text.length > 4000 };
  },
  'clipboard.write': async payload => {
    const text = sanitizeClipboardText(payload?.text);
    if (!text) throw new Error('没有可写入剪贴板的文字。');
    clipboard.writeText(text);
    return { characters: text.length };
  },
  screenshot: () => captureScreenshot(),
  'volume.get': () => runWindowsVolume(volumeHelperPath(), 'get'),
  'volume.set': payload => runWindowsVolume(volumeHelperPath(), 'set', sanitizeVolume(payload?.value)),
  'volume.mute': () => runWindowsVolume(volumeHelperPath(), 'mute'),
  'volume.unmute': () => runWindowsVolume(volumeHelperPath(), 'unmute'),
  'volume.toggle': () => runWindowsVolume(volumeHelperPath(), 'toggle'),
  'files.search': payload => searchAllowedFiles(payload?.query),
  'reminders.list': async () => ({ reminders: listReminders() }),
  'reminders.cancel': async payload => cancelReminder(payload?.id)
};

function historyDetail(skillId, result) {
  if (skillId === 'clipboard.read' || skillId === 'clipboard.write') return { characters: result.characters };
  if (skillId === 'files.search') return { results: result.results.length, scannedEntries: result.scannedEntries };
  if (skillId === 'screenshot') return { saved: true };
  if (skillId.startsWith('volume.')) return { volume: result.volume, muted: result.muted };
  return { ok: true };
}

async function runSkill(skillId, payload = {}) {
  const id = String(skillId || '');
  const handler = skillHandlers[id];
  if (!handler) throw new Error('该技能不在允许列表中。');
  writeLog('info', 'skill-started', { skillId: id });
  mainWindow?.webContents.send('companion:action', { phase: 'start', kind: 'skill', id });
  try {
    const result = await handler(payload);
    appendSkillHistory(id, true, historyDetail(id, result));
    writeLog('info', 'skill-completed', { skillId: id });
    mainWindow?.webContents.send('companion:action', { phase: 'success', kind: 'skill', id });
    recordCompanionActivity('skill');
    return result;
  } catch (error) {
    appendSkillHistory(id, false, { error: String(error.message).slice(0, 160) });
    writeLog('error', 'skill-failed', { skillId: id, message: error.message });
    mainWindow?.webContents.send('companion:action', { phase: 'error', kind: 'skill', id });
    throw error;
  }
}

function getSkillCenterState() {
  return {
    skills: SKILL_DEFINITIONS,
    history: readJsonArray(skillHistoryPath()).slice(-20).reverse(),
    reminders: listReminders()
  };
}

const toolHandlers = {
  browser: () => shell.openExternal('https://www.bing.com'),
  notepad: () => spawn('notepad.exe', [], { detached: true, stdio: 'ignore' }).unref(),
  calculator: () => spawn('calc.exe', [], { detached: true, stdio: 'ignore' }).unref(),
  downloads: () => shell.openPath(app.getPath('downloads')),
  settings: () => shell.openExternal('ms-settings:')
};

async function launchWhitelistedApp(appId) {
  mainWindow?.webContents.send('companion:action', { phase: 'start', kind: 'app', id: appId });
  try {
    if (toolHandlers[appId]) {
      await toolHandlers[appId]();
    } else {
      const selectedApp = listWhitelistedApps().find(item => item.id === appId && item.source !== 'builtin');
      if (!selectedApp || !selectedApp.available || !fs.existsSync(selectedApp.path) || path.extname(selectedApp.path).toLowerCase() !== '.exe') {
        throw new Error('该应用不在允许列表中，或程序文件已被移动。');
      }
      spawn(selectedApp.path, [], { detached: true, stdio: 'ignore', windowsHide: false }).unref();
    }
    mainWindow?.webContents.send('companion:action', { phase: 'success', kind: 'app', id: appId });
    recordCompanionActivity('launch');
    return { ok: true, appId };
  } catch (error) {
    mainWindow?.webContents.send('companion:action', { phase: 'error', kind: 'app', id: appId });
    throw error;
  }
}

async function executeWorkflow(workflowId, confirmed = false) {
  const workflow = readWorkflowStore().workflows.find(item => item.id === String(workflowId || '') && item.enabled);
  if (!workflow) throw new Error('没有找到可执行的工作流。');
  if (workflow.confirmBeforeRun && !confirmed) return { confirmationRequired: true, workflow };
  const results = [];
  mainWindow?.webContents.send('companion:action', { phase: 'start', kind: 'workflow', id: workflow.id });
  try {
    for (const action of workflow.actions) {
      if (action.type === 'open-tool') {
        const handler = toolHandlers[action.id];
        if (!handler) throw new Error('工作流包含不可用工具。');
        await handler();
      } else if (action.type === 'open-app') {
        await launchWhitelistedApp(action.id);
      } else if (action.type === 'set-volume') {
        await runWindowsVolume(volumeHelperPath(), 'set', action.value);
      } else if (action.type === 'start-focus') {
        writeFocusStore(startFocus(readFocusStore(), { type: 'focus', minutes: action.minutes }));
        emitFocusUpdate('workflow');
      } else if (action.type === 'set-scenario') {
        const store = readScenarioStore();
        store.active = action.id;
        writeScenarioStore(store);
        emitScenarioUpdate('workflow');
      } else if (action.type === 'set-window-mode') {
        setWindowMode(action.id, 'workflow');
      } else if (action.type === 'show-summary') {
        emitProactiveMessage('summary', buildDailySummary(readPlannerStore()));
      }
      results.push({ type: action.type, ok: true });
    }
    mainWindow?.webContents.send('companion:action', { phase: 'success', kind: 'workflow', id: workflow.id });
    return { ok: true, workflow, results };
  } catch (error) {
    mainWindow?.webContents.send('companion:action', { phase: 'error', kind: 'workflow', id: workflow.id });
    throw error;
  }
}

async function searchWeb(query) {
  const safeQuery = String(query || '').trim().slice(0, 200);
  if (!safeQuery) throw new Error('请输入要搜索的内容。');
  await shell.openExternal(`https://www.bing.com/search?q=${encodeURIComponent(safeQuery)}`);
  return { ok: true, query: safeQuery };
}

async function bootstrap() {
  writeLog('info', 'startup-begin', {
    version: app.getVersion(),
    safeMode: IS_SAFE_MODE,
    packaged: app.isPackaged,
    argv: process.argv.map(arg => path.basename(arg))
  });
  const isPrimaryProcess = await claimControlPipe();
  if (!isPrimaryProcess) {
    writeLog('info', 'startup-secondary-exit');
    app.exit(0);
    return;
  }

  await terminateLegacyInstances();
  const hasSingleInstanceLock = app.requestSingleInstanceLock();
  if (!hasSingleInstanceLock) {
    controlServer?.close();
    controlPipeListening = false;
    writeLog('warn', 'single-instance-lock-denied');
    app.exit(0);
    return;
  }

  app.on('second-instance', () => {
    writeLog('info', 'electron-second-instance');
    restoreWindow('second-instance');
  });
  await app.whenReady();
  app.setAppUserModelId('com.witstek.astra.desktop');
  previousRunCrashed = readStoredJson(runtimeStatePath(), { cleanExit: true }).cleanExit === false;
  markRuntimeState(false);
  createWindow();
  configureMediaPermissions();
  loadPersistentReminders();
  recordCompanionActivity('active');
  if (!IS_SMOKE_TEST) {
    createTray();
    registerRestoreShortcuts();
    startProactiveAssistant();
    startEnvironmentMonitor();
    startFocusMonitor();
    scenarioTimer = setInterval(evaluateScenarioSchedule, 30000);
    evaluateScenarioSchedule();
    const localSettings = readLocalAiSettings();
    if (localSettings.autoStart && localAiReady(localSettings)) ensureLocalServer().catch(error => writeLog('warn', 'local-ai-autostart-failed', { message: error.message }));
  }
  writeLog('info', 'startup-ready', { safeMode: IS_SAFE_MODE });
}

bootstrap().catch(error => {
  console.error('Astra startup failed:', error);
  writeLog('error', 'startup-failed', { message: error.message, stack: error.stack });
  app.exit(1);
});

app.on('activate', () => restoreWindow('activate'));
app.on('before-quit', () => {
  isQuitting = true;
  clearTimeout(windowStateSaveTimer);
  saveCurrentWindowState();
  markRuntimeState(true);
  clearTimeout(clickThroughTimer);
  clearInterval(proactiveTimer);
  clearInterval(environmentTimer);
  clearInterval(focusTimer);
  clearInterval(scenarioTimer);
  stopLocalServer('quit');
  if (modelDownloadTask) { modelDownloadTask.action = 'pause'; modelDownloadTask.controller.abort(); }
  for (const entry of activeChatStreams.values()) entry.controller.abort();
  activeChatStreams.clear();
  controlServer?.close();
  controlPipeListening = false;
  for (const timer of reminderTimers.values()) clearTimeout(timer);
  reminderTimers.clear();
  writeLog('info', 'before-quit');
});
app.on('will-quit', () => globalShortcut.unregisterAll());

process.on('unhandledRejection', reason => {
  writeLog('error', 'unhandled-rejection', { reason: reason instanceof Error ? reason.stack : String(reason) });
});

ipcMain.handle('settings:get', () => publicSettings());
ipcMain.handle('settings:save', (_event, settings) => saveSettings(settings || {}));
ipcMain.handle('diagnostics:get', () => getDiagnostics());
ipcMain.handle('diagnostics:export', () => exportDiagnostics());
ipcMain.handle('app:restart-safe-mode', () => restartInMode(true));
ipcMain.handle('app:restart-normal-mode', () => restartInMode(false));
ipcMain.handle('chat:send', (_event, payload) => requestChat(String(payload?.message || '').slice(0, 8000), Array.isArray(payload?.history) ? payload.history : [], payload?.images));
ipcMain.handle('chat:stream-start', (event, payload) => startChatStream(event.sender, payload || {}));
ipcMain.handle('chat:stream-stop', (_event, requestId) => stopChatStream(requestId));
ipcMain.handle('local-ai:get', () => localAiPublicState());
ipcMain.handle('local-ai:save', (_event, payload) => { stopLocalServer('settings'); const settings = writeLocalAiSettings(payload || {}); return { ...localAiPublicState(), settings }; });
ipcMain.handle('local-ai:select-runtime', () => selectExecutable('选择 llama-server', ['llama-server.exe']));
ipcMain.handle('local-ai:select-model', () => selectModel('选择 GGUF 本地对话模型', 'gguf'));
ipcMain.handle('local-ai:select-mmproj', () => selectModel('选择多模态 mmproj GGUF 文件', 'gguf'));
ipcMain.handle('local-ai:start', async () => { localServerRestartAttempts = 0; await ensureLocalServer(); return localAiPublicState(); });
ipcMain.handle('local-ai:stop', () => { stopLocalServer('renderer'); return localAiPublicState(); });
ipcMain.handle('local-ai:wizard-dismiss', () => { const settings = readLocalAiSettings(); writeLocalAiSettings({ ...settings, wizardDismissed: true }); return localAiPublicState(); });
ipcMain.handle('model-manager:download', (_event, modelId) => startTrustedModelDownload(modelId));
ipcMain.handle('model-manager:select', (_event, modelId) => selectTrustedModel(modelId));
ipcMain.handle('model-manager:pause', () => pauseTrustedModelDownload());
ipcMain.handle('model-manager:resume', (_event, modelId) => startTrustedModelDownload(modelId || modelDownloadState.modelId));
ipcMain.handle('model-manager:cancel', (_event, modelId) => cancelTrustedModelDownload(modelId));
ipcMain.handle('model-manager:inspect', () => inspectCurrentLocalModel());
ipcMain.handle('model-manager:open-directory', () => { fs.mkdirSync(localModelDirectory(), { recursive: true }); return shell.openPath(localModelDirectory()); });
ipcMain.handle('model-manager:delete', (_event, modelId) => deleteTrustedModel(modelId));
ipcMain.handle('offline-voice:get', () => offlineVoicePublicState());
ipcMain.handle('offline-voice:save', (_event, payload) => { const settings = writeOfflineVoiceSettings(payload || {}); return { ...offlineVoicePublicState(), settings }; });
ipcMain.handle('offline-voice:select-runtime', () => selectExecutable('选择 whisper-cli', ['whisper-cli.exe', 'main.exe']));
ipcMain.handle('offline-voice:select-model', () => selectModel('选择 Whisper BIN 模型', 'bin'));
ipcMain.handle('offline-voice:transcribe', (_event, payload) => transcribeOfflineAudio(payload || {}));
ipcMain.handle('knowledge:get', () => readKnowledgeStore());
ipcMain.handle('knowledge:import', () => importKnowledgeFiles());
ipcMain.handle('knowledge:remove', (_event, id) => { const store = readKnowledgeStore(); store.documents = store.documents.filter(item => item.id !== String(id || '')); return writeKnowledgeStore(store); });
ipcMain.handle('knowledge:clear', () => writeKnowledgeStore({ documents: [] }));
ipcMain.handle('knowledge:search', (_event, query) => searchKnowledge(readKnowledgeStore(), String(query || '').slice(0, 500), 8));
ipcMain.handle('scenario:get', () => scenarioState(readScenarioStore()));
ipcMain.handle('scenario:set', (_event, id) => { const store = readScenarioStore(); store.active = String(id || ''); writeScenarioStore(store); return emitScenarioUpdate('manual'); });
ipcMain.handle('scenario:save', (_event, payload) => { writeScenarioStore(payload || {}); return emitScenarioUpdate('settings'); });
ipcMain.handle('workflows:get', () => readWorkflowStore());
ipcMain.handle('workflows:add', (_event, payload) => { const result = createWorkflow(readWorkflowStore(), payload || {}, randomUUID()); writeWorkflowStore(result.store); return { workflow: result.workflow, state: readWorkflowStore() }; });
ipcMain.handle('workflows:remove', (_event, id) => { const result = removeWorkflow(readWorkflowStore(), id); writeWorkflowStore(result.store); return { removed: result.removed, state: readWorkflowStore() }; });
ipcMain.handle('workflows:run', (_event, payload) => executeWorkflow(payload?.id, payload?.confirmed === true));
ipcMain.handle('focus:get', () => focusPublicState());
ipcMain.handle('focus:start', (_event, payload) => { const store = writeFocusStore(startFocus(readFocusStore(), payload || {})); emitFocusUpdate('started'); return { ...store, now: Date.now(), remainingMs: store.active.dueAt - Date.now() }; });
ipcMain.handle('focus:stop', () => { const store = writeFocusStore(stopFocus(readFocusStore())); emitFocusUpdate('stopped'); return focusPublicState(); });
ipcMain.handle('focus:save-settings', (_event, payload) => { writeFocusStore(saveFocusSettings(readFocusStore(), payload || {})); return focusPublicState(); });
ipcMain.handle('focus:clear-history', () => { writeFocusStore(clearFocusHistory(readFocusStore())); return focusPublicState(); });
ipcMain.handle('data:export', () => exportLocalData());
ipcMain.handle('data:import', () => importLocalData());
ipcMain.handle('data:clear', () => clearLocalData());
ipcMain.handle('app:complete-onboarding', () => { const settings = readSettingsFile(); writeSettingsFile({ ...settings, onboardingCompleted: true }); return publicSettings(); });
ipcMain.handle('app:check-updates', () => checkForUpdates());
ipcMain.handle('memory:get', () => getMemoryState());
ipcMain.handle('memory:add', (_event, payload) => addLocalMemory(payload || {}));
ipcMain.handle('memory:update', (_event, payload) => updateLocalMemory(String(payload?.id || ''), payload?.patch || {}));
ipcMain.handle('memory:remove', (_event, id) => removeLocalMemory(String(id || '')));
ipcMain.handle('memory:clear', () => clearLocalMemories());
ipcMain.handle('memory:save-profile', (_event, profile) => saveLocalProfile(profile || {}));
ipcMain.handle('companion:get', () => companionPublicState());
ipcMain.handle('companion:save-settings', (_event, payload) => saveLocalCompanionSettings(payload || {}));
ipcMain.handle('companion:record-event', (_event, payload) => recordCompanionActivity(String(payload?.type || ''), String(payload?.key || '')));
ipcMain.handle('companion:reset', () => resetLocalCompanion());
ipcMain.on('companion:runtime-status', (event, payload) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return;
  companionRuntimeStatus = {
    state: String(payload?.state || 'idle').slice(0, 40),
    animation: String(payload?.animation || '').slice(0, 60),
    recovering: payload?.recovering === true,
    updatedAt: new Date().toISOString()
  };
});
ipcMain.handle('planner:get', () => getPlannerState());
ipcMain.handle('planner:add-task', (_event, payload) => addLocalTask(payload || {}));
ipcMain.handle('planner:update-task', (_event, payload) => updateLocalTask(String(payload?.id || ''), payload?.patch || {}));
ipcMain.handle('planner:remove-task', (_event, id) => removeLocalTask(String(id || '')));
ipcMain.handle('planner:add-reminder', (_event, payload) => ({ reminder: scheduleAbsoluteReminder(payload?.dueAt, payload?.title), state: getPlannerState() }));
ipcMain.handle('planner:cancel-reminder', (_event, id) => ({ ...cancelReminder(String(id || '')), state: getPlannerState() }));
ipcMain.handle('planner:save-settings', (_event, payload) => saveProactiveSettings(payload || {}));
ipcMain.handle('planner:summary', () => buildDailySummary(readPlannerStore()));
ipcMain.handle('voice:transcribe', (_event, payload) => transcribeAudio(payload || {}));
ipcMain.handle('realtime:create-call', (event, payload) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error('拒绝未知窗口创建实时语音会话。');
  return createRealtimeCall(payload || {});
});
ipcMain.on('realtime:status', (event, payload) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return;
  const previous = realtimeRuntimeStatus;
  realtimeRuntimeStatus = sanitizeRealtimeRuntimeStatus(redactSensitive(payload || {}));
  if (previous.state !== realtimeRuntimeStatus.state || previous.lastError !== realtimeRuntimeStatus.lastError) {
    writeLog(realtimeRuntimeStatus.state === 'failed' ? 'warn' : 'info', 'realtime-runtime-status', realtimeRuntimeStatus);
  }
});
ipcMain.handle('skills:get', () => getSkillCenterState());
ipcMain.handle('skills:run', (_event, payload) => runSkill(payload?.skillId, payload?.input || {}));
ipcMain.handle('tool:run', async (_event, toolId) => {
  const handler = toolHandlers[toolId];
  if (!handler) throw new Error('该工具不在允许列表中。');
  mainWindow?.webContents.send('companion:action', { phase: 'start', kind: 'tool', id: toolId });
  try {
    await handler();
    mainWindow?.webContents.send('companion:action', { phase: 'success', kind: 'tool', id: toolId });
    recordCompanionActivity('launch');
    return { ok: true, toolId };
  } catch (error) {
    mainWindow?.webContents.send('companion:action', { phase: 'error', kind: 'tool', id: toolId });
    throw error;
  }
});
ipcMain.handle('apps:list', () => listWhitelistedApps());
ipcMain.handle('apps:add', () => addWhitelistApp());
ipcMain.handle('apps:remove', (_event, appId) => removeWhitelistApp(String(appId || '')));
ipcMain.handle('apps:launch', (_event, appId) => launchWhitelistedApp(String(appId || '')));
ipcMain.handle('web:search', (_event, query) => searchWeb(query));
ipcMain.handle('reminder:schedule', (_event, payload) => scheduleReminder(payload?.minutes, payload?.title));
ipcMain.on('window:minimize', () => applyBackgroundMode('minimize'));
ipcMain.on('window:close', () => applyBackgroundMode('close-button'));
ipcMain.handle('window:get-mode', () => ({ mode: currentWindowMode, clickThrough: isClickThrough }));
ipcMain.handle('window:set-mode', (_event, mode) => setWindowMode(mode, 'renderer'));
ipcMain.handle('window:restore-full', () => restoreWindow('mini-double-click'));
ipcMain.handle('window:set-click-through', (_event, enabled) => setClickThrough(enabled));
ipcMain.handle('window:drag-state', event => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error('拒绝未知窗口读取位置。');
  return windowDragState();
});
ipcMain.handle('window:move-to', (event, payload) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error('拒绝未知窗口移动主界面。');
  return moveWindowTo(payload?.x, payload?.y);
});
