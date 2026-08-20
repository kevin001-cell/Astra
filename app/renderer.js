const api = window.astra;
const interaction = window.astraInteraction;

const avatar = document.querySelector('#avatar');
const assistantState = document.querySelector('#assistantState');
const connectionStatus = document.querySelector('#connectionStatus');
const messagesElement = document.querySelector('#messages');
const chatForm = document.querySelector('#chatForm');
const messageInput = document.querySelector('#messageInput');
const sendButton = document.querySelector('#sendButton');
const stopGenerationButton = document.querySelector('#stopGenerationButton');
const micButton = document.querySelector('#micButton');
const realtimeButton = document.querySelector('#realtimeButton');
const realtimeAudio = document.querySelector('#realtimeAudio');
const settingsOverlay = document.querySelector('#settingsOverlay');
const appsOverlay = document.querySelector('#appsOverlay');
const skillsOverlay = document.querySelector('#skillsOverlay');
const memoryOverlay = document.querySelector('#memoryOverlay');
const plannerOverlay = document.querySelector('#plannerOverlay');
const companionOverlay = document.querySelector('#companionOverlay');
const focusOverlay = document.querySelector('#focusOverlay');
const intelligenceOverlay = document.querySelector('#intelligenceOverlay');
const onboardingOverlay = document.querySelector('#onboardingOverlay');
const imagePreviewList = document.querySelector('#imagePreviewList');
const imageInput = document.querySelector('#imageInput');
const updateManifestInput = document.querySelector('#updateManifestInput');
const companionBubble = document.querySelector('#companionBubble');
const interactionCue = document.querySelector('#interactionCue');
const quickWheel = document.querySelector('#quickWheel');
const commandPalette = document.querySelector('#commandPalette');
const companionSettingsForm = document.querySelector('#companionSettingsForm');
const companionInteractionsInput = document.querySelector('#companionInteractionsInput');
const companionIdleFrequencyInput = document.querySelector('#companionIdleFrequencyInput');
const companionBubbleFrequencyInput = document.querySelector('#companionBubbleFrequencyInput');
const companionLowPerformanceInput = document.querySelector('#companionLowPerformanceInput');
const companionAchievementsInput = document.querySelector('#companionAchievementsInput');
const companionAddressInput = document.querySelector('#companionAddressInput');
const companionBackgroundModeInput = document.querySelector('#companionBackgroundModeInput');
const companionSleepInput = document.querySelector('#companionSleepInput');
const companionMiniClickThroughInput = document.querySelector('#companionMiniClickThroughInput');
const companionFullscreenInput = document.querySelector('#companionFullscreenInput');
const companionBatteryInput = document.querySelector('#companionBatteryInput');
const companionReactionsInput = document.querySelector('#companionReactionsInput');
const companionThemeInput = document.querySelector('#companionThemeInput');
const companionEyeInput = document.querySelector('#companionEyeInput');
const companionCoreInput = document.querySelector('#companionCoreInput');
const companionShoulderInput = document.querySelector('#companionShoulderInput');
const companionHaloInput = document.querySelector('#companionHaloInput');
const companionLevelName = document.querySelector('#companionLevelName');
const companionScoreText = document.querySelector('#companionScoreText');
const companionAddressPreview = document.querySelector('#companionAddressPreview');
const companionProgressFill = document.querySelector('#companionProgressFill');
const companionStats = document.querySelector('#companionStats');
const companionCollectionList = document.querySelector('#companionCollectionList');
const companionAchievementList = document.querySelector('#companionAchievementList');
const appList = document.querySelector('#appList');
const skillList = document.querySelector('#skillList');
const skillResults = document.querySelector('#skillResults');
const skillHistory = document.querySelector('#skillHistory');
const volumeStatus = document.querySelector('#volumeStatus');
const fileSearchForm = document.querySelector('#fileSearchForm');
const fileSearchInput = document.querySelector('#fileSearchInput');
const memoryProfileForm = document.querySelector('#memoryProfileForm');
const memoryDisplayNameInput = document.querySelector('#memoryDisplayNameInput');
const memoryPersonalityInput = document.querySelector('#memoryPersonalityInput');
const memoryResponseStyleInput = document.querySelector('#memoryResponseStyleInput');
const memoryAddForm = document.querySelector('#memoryAddForm');
const memoryAddInput = document.querySelector('#memoryAddInput');
const memoryCategoryInput = document.querySelector('#memoryCategoryInput');
const memoryCount = document.querySelector('#memoryCount');
const memoryList = document.querySelector('#memoryList');
const proactiveSettingsForm = document.querySelector('#proactiveSettingsForm');
const proactiveEnabledInput = document.querySelector('#proactiveEnabledInput');
const startupGreetingInput = document.querySelector('#startupGreetingInput');
const dailySummaryInput = document.querySelector('#dailySummaryInput');
const dailySummaryTimeInput = document.querySelector('#dailySummaryTimeInput');
const quietHoursInput = document.querySelector('#quietHoursInput');
const quietStartInput = document.querySelector('#quietStartInput');
const quietEndInput = document.querySelector('#quietEndInput');
const plannerSummary = document.querySelector('#plannerSummary');
const taskAddForm = document.querySelector('#taskAddForm');
const taskTitleInput = document.querySelector('#taskTitleInput');
const taskDueInput = document.querySelector('#taskDueInput');
const taskCount = document.querySelector('#taskCount');
const taskList = document.querySelector('#taskList');
const reminderAddForm = document.querySelector('#reminderAddForm');
const reminderTitleInput = document.querySelector('#reminderTitleInput');
const reminderDueInput = document.querySelector('#reminderDueInput');
const reminderCount = document.querySelector('#reminderCount');
const plannerReminderList = document.querySelector('#plannerReminderList');
const settingsForm = document.querySelector('#settingsForm');
const endpointInput = document.querySelector('#endpointInput');
const modelInput = document.querySelector('#modelInput');
const transcriptionModelInput = document.querySelector('#transcriptionModelInput');
const realtimeEnabledInput = document.querySelector('#realtimeEnabledInput');
const realtimeAutoConnectInput = document.querySelector('#realtimeAutoConnectInput');
const realtimeReconnectInput = document.querySelector('#realtimeReconnectInput');
const voiceSkillBridgeInput = document.querySelector('#voiceSkillBridgeInput');
const realtimeModelInput = document.querySelector('#realtimeModelInput');
const realtimeVoiceInput = document.querySelector('#realtimeVoiceInput');
const realtimeVadModeInput = document.querySelector('#realtimeVadModeInput');
const realtimeIdleMinutesInput = document.querySelector('#realtimeIdleMinutesInput');
const realtimeMaxMinutesInput = document.querySelector('#realtimeMaxMinutesInput');
const realtimeInputDeviceInput = document.querySelector('#realtimeInputDeviceInput');
const realtimeOutputDeviceInput = document.querySelector('#realtimeOutputDeviceInput');
const refreshAudioDevicesButton = document.querySelector('#refreshAudioDevicesButton');
const apiKeyInput = document.querySelector('#apiKeyInput');
const speakRepliesInput = document.querySelector('#speakRepliesInput');
const launchAtLoginInput = document.querySelector('#launchAtLoginInput');
const restoreShortcutInput = document.querySelector('#restoreShortcutInput');
const restoreShortcutHint = document.querySelector('#restoreShortcutHint');
const diagnosticsGrid = document.querySelector('#diagnosticsGrid');
const refreshDiagnosticsButton = document.querySelector('#refreshDiagnosticsButton');
const exportDiagnosticsButton = document.querySelector('#exportDiagnosticsButton');
const safeModeButton = document.querySelector('#safeModeButton');
const clickThroughButton = document.querySelector('#clickThroughButton');
const voiceInputHint = document.querySelector('#voiceInputHint');
const toast = document.querySelector('#toast');
const localAiForm = document.querySelector('#localAiForm');
const localAiEnabledInput = document.querySelector('#localAiEnabledInput');
const localAiModeInput = document.querySelector('#localAiModeInput');
const localAiProfileInput = document.querySelector('#localAiProfileInput');
const localAiThreadsInput = document.querySelector('#localAiThreadsInput');
const localAiGpuInput = document.querySelector('#localAiGpuInput');
const recommendGpuLayersButton = document.querySelector('#recommendGpuLayersButton');
const gpuRecommendationDetails = document.querySelector('#gpuRecommendationDetails');
const localAiRuntimeInput = document.querySelector('#localAiRuntimeInput');
const localAiModelInput = document.querySelector('#localAiModelInput');
const localAiMmprojInput = document.querySelector('#localAiMmprojInput');
const localAiStatus = document.querySelector('#localAiStatus');
const localAiRuntimeDetails = document.querySelector('#localAiRuntimeDetails');
const modelDeploymentPanel = document.querySelector('#modelDeploymentPanel');
const modelDeploymentSummary = document.querySelector('#modelDeploymentSummary');
const modelCatalog = document.querySelector('#modelCatalog');
const modelDownloadPanel = document.querySelector('#modelDownloadPanel');
const modelDownloadStatus = document.querySelector('#modelDownloadStatus');
const modelDownloadPercent = document.querySelector('#modelDownloadPercent');
const modelDownloadProgress = document.querySelector('#modelDownloadProgress');
const pauseModelDownloadButton = document.querySelector('#pauseModelDownloadButton');
const resumeModelDownloadButton = document.querySelector('#resumeModelDownloadButton');
const cancelModelDownloadButton = document.querySelector('#cancelModelDownloadButton');
const deleteManagedModelButton = document.querySelector('#deleteManagedModelButton');
const modelInspectionResult = document.querySelector('#modelInspectionResult');
const offlineVoiceForm = document.querySelector('#offlineVoiceForm');
const offlineVoiceEnabledInput = document.querySelector('#offlineVoiceEnabledInput');
const offlineVoiceRuntimeInput = document.querySelector('#offlineVoiceRuntimeInput');
const offlineVoiceModelInput = document.querySelector('#offlineVoiceModelInput');
const offlineVoiceStatus = document.querySelector('#offlineVoiceStatus');
const knowledgeList = document.querySelector('#knowledgeList');
const knowledgeResults = document.querySelector('#knowledgeResults');
const knowledgeSearchInput = document.querySelector('#knowledgeSearchInput');
const scenarioSelect = document.querySelector('#scenarioSelect');
const scenarioAutomaticInput = document.querySelector('#scenarioAutomaticInput');
const workflowForm = document.querySelector('#workflowForm');
const workflowNameInput = document.querySelector('#workflowNameInput');
const workflowActionOne = document.querySelector('#workflowActionOne');
const workflowActionTwo = document.querySelector('#workflowActionTwo');
const workflowActionThree = document.querySelector('#workflowActionThree');
const workflowActionFour = document.querySelector('#workflowActionFour');
const workflowConfirmInput = document.querySelector('#workflowConfirmInput');
const workflowList = document.querySelector('#workflowList');

let history = [];
let currentSettings = { speakReplies: true };
let currentWindowMode = 'full';
let pendingImages = [];
let focusState = { active: null, history: [], settings: {} };
let environmentState = {};
let localAiState = { settings: {}, profiles: [], runtime: {} };
let offlineVoiceState = { settings: {}, ready: false };
let knowledgeState = { documents: [] };
let scenarioStoreState = { active: 'normal', definition: {}, options: [], automatic: false, schedules: [] };
let workflowState = { workflows: [] };
let whitelistedApps = [];
let busy = false;
let activeChatRequestId = '';
let activeChatMessage;
let activeChatText = '';
let activeChatMetrics = {};
let activeChatCompletion;
let activeChatCompletionResolve;
let toastTimer;
let speechRecognition;
let voiceSession;
let voicePressActive = false;
let fallbackRecognitionActive = false;
let fallbackRecognitionRequested = false;
let voiceTranscribing = false;
let realtimeSession;
let realtimeConnectAttempt = 0;
let realtimeReconnectAttempts = 0;
let realtimeReconnectTimer;
let realtimeManualStop = false;
let pendingVoiceSkillConfirmation;
let pendingVoiceSkillTimer;
let speechMutedRealtimeSession;
const realtimeMessageElements = new Map();
const committedRealtimeMessages = new Set();
let skillCenterState = { skills: [], history: [], reminders: [] };
let memoryState = { profile: { displayName: '', personalityMode: 'jarvis', responseStyle: 'concise' }, memories: [] };
let plannerState = { tasks: [], reminders: [], settings: {}, summary: '' };
let companionState = {
  settings: { interactionsEnabled: true, idleFrequency: 'normal', bubbleFrequency: 'low', lowPerformanceMode: false, achievementsEnabled: true, addressMode: 'profile' },
  score: 0,
  level: { number: 1, name: '初识', progress: 0, nextMinimum: 40 },
  counters: {},
  achievements: [],
  collection: [],
  availableAddressModes: [],
  preferredAddress: ''
};
let currentVolumeState;
let assistantStateTimer;
let companionBubbleTimer;
let companionIdleTimer;
let companionMotionTimer;
let companionMotionWatchdog;
let currentAssistantState = 'idle';
let currentAssistantLabel = '随时待命';
let currentCompanionMotion = '';
let lastStateChangeAt = 0;
let lastMotionAt = 0;
let interactionCueTimer;
let quickWheelOpen = false;
let sentMessageHistory = [];
let messageHistoryIndex = 0;
let commandPaletteIndex = 0;
let visibleCommandItems = [];
let proximityState = {};
let lastProximitySnapshot = {};
let proximityDwellTimer;
let headHoverTimer;
let lastHeadPatAt = 0;
let lastAvatarTapAt = 0;
let rapidAvatarTapCount = 0;

const ASSISTANT_STATE_CLASSES = ['idle', 'listening', 'thinking', 'speaking', 'executing', 'success', 'error', 'sleepy', 'dragging', 'interacting'];
const ASSISTANT_STATE_PRIORITIES = { idle: 0, sleepy: 10, interacting: 20, thinking: 40, listening: 50, executing: 60, speaking: 70, dragging: 80, success: 90, error: 90 };

function reportCompanionRuntime(recovering = false) {
  api.reportCompanionRuntime({ state: currentAssistantState, animation: currentCompanionMotion, recovering });
}

function restingAssistantState() {
  return realtimeSession ? { state: 'listening', label: '实时聆听中' } : { state: 'idle', label: '随时待命' };
}

function setAssistantState(state, label, options = {}) {
  const nextState = ASSISTANT_STATE_CLASSES.includes(state) ? state : 'idle';
  const nextLabel = String(label || '').slice(0, 40) || '随时待命';
  const now = Date.now();
  const priority = options.priority ?? ASSISTANT_STATE_PRIORITIES[nextState] ?? 0;
  const currentPriority = ASSISTANT_STATE_PRIORITIES[currentAssistantState] ?? 0;
  if (!options.force && options.duration && assistantStateTimer && priority < currentPriority) return false;
  if (!options.force && currentAssistantState === nextState && currentAssistantLabel === nextLabel && now - lastStateChangeAt < 180) return false;
  clearTimeout(assistantStateTimer);
  assistantStateTimer = undefined;
  avatar.classList.remove(...ASSISTANT_STATE_CLASSES);
  avatar.classList.add(nextState);
  assistantState.textContent = nextLabel;
  currentAssistantState = nextState;
  currentAssistantLabel = nextLabel;
  lastStateChangeAt = now;
  reportCompanionRuntime(false);
  if (options.duration) {
    assistantStateTimer = setTimeout(() => {
      assistantStateTimer = undefined;
      const resting = restingAssistantState();
      setAssistantState(resting.state, resting.label, { force: true });
    }, options.duration);
  }
  return true;
}

function clearCompanionMotion(recovering = false) {
  clearTimeout(companionMotionTimer);
  clearTimeout(companionMotionWatchdog);
  companionMotionTimer = undefined;
  companionMotionWatchdog = undefined;
  for (const className of [...avatar.classList]) {
    if (className.startsWith('motion-')) avatar.classList.remove(className);
  }
  currentCompanionMotion = '';
  reportCompanionRuntime(recovering);
}

function playCompanionMotion(name, duration = 1000, options = {}) {
  if (scenarioStoreState.definition?.animations === false && !options.force) return false;
  if (!name || (companionState.settings.lowPerformanceMode && options.idle)) return false;
  const now = Date.now();
  if (currentCompanionMotion === name && now - lastMotionAt < 500) return false;
  clearCompanionMotion(false);
  currentCompanionMotion = name;
  lastMotionAt = now;
  avatar.classList.add(`motion-${name}`);
  reportCompanionRuntime(false);
  companionMotionTimer = setTimeout(() => clearCompanionMotion(false), duration);
  companionMotionWatchdog = setTimeout(() => {
    clearCompanionMotion(true);
    const resting = restingAssistantState();
    setAssistantState(resting.state, resting.label, { force: true });
  }, duration + 1800);
  return true;
}

function setInteractionLayer(layer) {
  document.body.dataset.interactionLayer = ['glance', 'bubble', 'full'].includes(layer) ? layer : 'glance';
}

function showInteractionCue(kind = 'look', duration = 850) {
  clearTimeout(interactionCueTimer);
  interactionCue.className = 'interaction-cue hidden';
  void interactionCue.offsetWidth;
  interactionCue.className = `interaction-cue cue-${kind}`;
  setInteractionLayer('glance');
  interactionCueTimer = setTimeout(() => interactionCue.classList.add('hidden'), Math.max(300, duration));
}

function hideCompanionBubble() {
  clearTimeout(companionBubbleTimer);
  companionBubble.classList.add('hidden');
  companionBubble.classList.remove('interactive');
  setInteractionLayer(currentWindowMode === 'full' ? 'full' : 'glance');
}

function showCompanionBubble(message, options = {}) {
  if (scenarioStoreState.definition?.bubbles === false && !options.force) return;
  if (!options.force && companionState.settings.bubbleFrequency === 'off') return;
  clearTimeout(companionBubbleTimer);
  companionBubble.replaceChildren();
  const copy = document.createElement('p');
  copy.textContent = String(message || '').slice(0, 120);
  companionBubble.append(copy);
  const actions = Array.isArray(options.actions) ? options.actions.slice(0, 3) : [];
  if (actions.length) {
    const actionRow = document.createElement('div');
    actionRow.className = 'bubble-actions';
    for (const action of actions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(action.label || '确定').slice(0, 12);
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (action.keepOpen !== true) hideCompanionBubble();
        Promise.resolve(action.onClick?.()).catch(error => showToast(error.message, 4200));
      });
      actionRow.append(button);
    }
    companionBubble.append(actionRow);
    companionBubble.classList.add('interactive');
  } else {
    companionBubble.classList.remove('interactive');
  }
  companionBubble.classList.remove('hidden');
  setInteractionLayer('bubble');
  companionBubbleTimer = setTimeout(hideCompanionBubble, options.duration || (actions.length ? 5200 : 3200));
}

async function openFullInteraction(callback) {
  if (currentWindowMode !== 'full') await api.restoreFullWindow();
  setInteractionLayer('full');
  setTimeout(() => {
    callback?.();
    if (!callback) messageInput.focus();
  }, 100);
}

function closeQuickWheel() {
  quickWheelOpen = false;
  quickWheel.classList.add('hidden');
}

function openQuickWheel(clientX, clientY) {
  if (companionState.settings.interactionsEnabled === false) return;
  const stage = avatar.closest('.assistant-stage');
  const bounds = stage.getBoundingClientRect();
  const radius = 84;
  const x = Math.max(radius, Math.min(bounds.width - radius, clientX - bounds.left));
  const y = Math.max(radius, Math.min(bounds.height - radius, clientY - bounds.top));
  quickWheel.style.setProperty('--wheel-x', `${x}px`);
  quickWheel.style.setProperty('--wheel-y', `${y}px`);
  quickWheel.classList.remove('hidden');
  quickWheelOpen = true;
  showInteractionCue('attention', 700);
  quickWheel.querySelector('button')?.focus();
}

async function executeQuickWheelAction(action) {
  closeQuickWheel();
  if (action === 'chat') return openFullInteraction(() => messageInput.focus());
  if (action === 'voice') return openFullInteraction(() => {
    micButton.focus();
    showCompanionBubble('按住麦克风按钮开始说话，松开后识别。', { force: true, duration: 4200 });
  });
  if (action === 'screenshot') return runTool('screenshot', '屏幕截图');
  if (action === 'reminder') return openFullInteraction(openPlanner);
  if (action === 'focus') return openFullInteraction(async () => {
    focusOverlay.classList.remove('hidden');
    focusState = await api.getFocus();
    renderFocus();
  });
  if (action === 'clickthrough') return clickThroughButton.click();
  if (action === 'mini') return currentWindowMode === 'mini' ? api.restoreFullWindow() : api.setWindowMode('mini');
  if (action === 'hide') return api.setWindowMode('hidden');
}

function overlaysAreClosed() {
  return [settingsOverlay, appsOverlay, skillsOverlay, memoryOverlay, plannerOverlay, companionOverlay, focusOverlay, intelligenceOverlay].every(element => element.classList.contains('hidden'));
}

function renderImagePreviews() {
  imagePreviewList.replaceChildren();
  imagePreviewList.classList.toggle('hidden', !pendingImages.length);
  pendingImages.forEach((image, index) => {
    const item = document.createElement('span');
    const preview = document.createElement('img');
    preview.src = image.dataUrl;
    preview.alt = image.name;
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = '×'; remove.addEventListener('click', () => { pendingImages.splice(index, 1); renderImagePreviews(); });
    item.append(preview, remove); imagePreviewList.append(item);
  });
}

async function compressImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('只允许添加图片文件。');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return { name: file.name || 'pasted-image.jpg', dataUrl: canvas.toDataURL('image/jpeg', .82) };
}

async function addImageFiles(files) {
  for (const file of [...files].slice(0, 4 - pendingImages.length)) pendingImages.push(await compressImage(file));
  renderImagePreviews();
}

function scheduleCompanionIdleMotion() {
  clearTimeout(companionIdleTimer);
  const frequency = companionState.settings.idleFrequency || 'normal';
  if (frequency === 'off') return;
  const ranges = { low: [42000, 68000], normal: [22000, 39000], high: [10000, 18000] };
  const range = ranges[frequency] || ranges.normal;
  const performanceFactor = companionState.settings.lowPerformanceMode ? 1.8 : 1;
  const delay = Math.round((range[0] + Math.random() * (range[1] - range[0])) * performanceFactor);
  companionIdleTimer = setTimeout(() => {
    if (document.visibilityState === 'visible' && currentAssistantState === 'idle' && overlaysAreClosed()) {
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 6) {
        setAssistantState('sleepy', '夜间低打扰', { duration: 2600, priority: 10 });
        playCompanionMotion('nod', 900, { idle: true });
      } else {
        const motions = ['look', 'stretch', 'nod'];
        playCompanionMotion(motions[Math.floor(Math.random() * motions.length)], 1600, { idle: true });
      }
      const bubbleChance = companionState.settings.bubbleFrequency === 'normal' ? .46 : .2;
      if (Math.random() < bubbleChance) {
        const address = companionState.preferredAddress ? `，${companionState.preferredAddress}` : '';
        const messages = [`我在这里${address}。`, '需要时叫我一声。', '当前一切正常。', '记得适当休息。'];
        showCompanionBubble(messages[Math.floor(Math.random() * messages.length)]);
      }
    }
    scheduleCompanionIdleMotion();
  }, delay);
}

function showToast(message, duration = 2600) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

function shortcutLabel(value) {
  return currentSettings.restoreShortcutOptions?.find(item => item.value === value)?.label || String(value || '').replace('CommandOrControl', 'Ctrl').replaceAll('+', ' + ');
}

function updateRecoveryUi() {
  const selectedShortcut = currentSettings.restoreShortcut || 'CommandOrControl+Shift+Space';
  restoreShortcutInput.replaceChildren();
  for (const option of currentSettings.restoreShortcutOptions || []) {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.label;
    restoreShortcutInput.append(element);
  }
  restoreShortcutInput.value = selectedShortcut;
  restoreShortcutHint.textContent = `恢复操作：${shortcutLabel(selectedShortcut)}，或托盘“显示并恢复操作”`;
  clickThroughButton.disabled = Boolean(currentSettings.safeMode);
  clickThroughButton.title = currentSettings.safeMode ? '安全模式已禁用鼠标穿透' : '鼠标穿透';
  safeModeButton.textContent = currentSettings.safeMode ? '退出安全模式并重启' : '以安全模式重启';
  const onlineVoiceReady = Boolean(currentSettings.endpoint && currentSettings.apiKeyConfigured);
  const localVoiceReady = offlineVoiceState.ready === true;
  const realtimeReady = Boolean(currentSettings.realtimeEnabled && onlineVoiceReady);
  if (!realtimeSession) {
    voiceInputHint.textContent = realtimeReady ? currentSettings.voiceSkillBridgeEnabled ? '可开始实时通话；白名单语音命令会先请求确认' : '可开始实时通话；按住麦克风仍使用普通识别' : onlineVoiceReady ? '按住麦克风说话，松开或静音后在线识别' : localVoiceReady ? '按住麦克风说话，录音只在本机使用 Whisper 识别' : '未配置转写服务，麦克风不可用；请在设置中填写接口地址和 API Key，或配置离线语音';
  }
  realtimeButton.disabled = !realtimeReady;
  realtimeButton.title = realtimeReady ? '开始低延迟双向语音会话' : '请先在设置中开启实时语音并配置接口';
}

function replaceSelectOptions(select, values, selectedValue) {
  select.replaceChildren();
  for (const value of values || []) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
  select.value = selectedValue || select.options[0]?.value || '';
}

function populateAudioDeviceSelect(select, devices, kind, selectedValue) {
  const previousValue = selectedValue || select.value;
  select.replaceChildren();
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '系统默认';
  select.append(defaultOption);
  devices.filter(device => device.kind === kind).forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `${kind === 'audioinput' ? '麦克风' : '扬声器'} ${index + 1}`;
    select.append(option);
  });
  if (previousValue && !Array.from(select.options).some(option => option.value === previousValue)) {
    const unavailableOption = document.createElement('option');
    unavailableOption.value = previousValue;
    unavailableOption.textContent = '已保存设备（当前不可用）';
    select.append(unavailableOption);
  }
  select.value = Array.from(select.options).some(option => option.value === previousValue) ? previousValue : '';
}

async function refreshAudioDevices(options = {}) {
  if (!navigator.mediaDevices?.enumerateDevices) return;
  refreshAudioDevicesButton.disabled = true;
  let permissionStream;
  try {
    if (options.requestPermission) {
      permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    populateAudioDeviceSelect(realtimeInputDeviceInput, devices, 'audioinput', realtimeInputDeviceInput.value || currentSettings.realtimeInputDeviceId);
    populateAudioDeviceSelect(realtimeOutputDeviceInput, devices, 'audiooutput', realtimeOutputDeviceInput.value || currentSettings.realtimeOutputDeviceId);
    if (options.requestPermission) showToast('音频设备列表已刷新。');
  } catch (error) {
    if (options.requestPermission) showToast(`无法读取音频设备：${error.message}`, 5200);
  } finally {
    permissionStream?.getTracks().forEach(track => track.stop());
    refreshAudioDevicesButton.disabled = false;
  }
}

function addDiagnosticItem(label, value, status = '') {
  const item = document.createElement('span');
  item.className = 'diagnostics-item';
  const caption = document.createElement('small');
  caption.textContent = label;
  const detail = document.createElement('b');
  detail.className = status;
  detail.textContent = value;
  item.append(caption, detail);
  diagnosticsGrid.append(item);
}

async function refreshDiagnostics() {
  refreshDiagnosticsButton.disabled = true;
  diagnosticsGrid.replaceChildren();
  addDiagnosticItem('状态', '正在读取…');
  try {
    const diagnostics = await api.getDiagnostics();
    diagnosticsGrid.replaceChildren();
    const processHealthy = diagnostics.process.matchingCount === 1;
    const windowHealthy = diagnostics.process.browserWindowCount === 1;
    const shortcutHealthy = Boolean(diagnostics.recovery.activeShortcut);
    addDiagnosticItem('应用版本', `v${diagnostics.app.version}${diagnostics.app.safeMode ? ' · 安全模式' : ''}`, diagnostics.app.safeMode ? 'warn' : 'ok');
    addDiagnosticItem('Astra 进程', `${diagnostics.process.matchingCount} 个`, processHealthy ? 'ok' : 'warn');
    addDiagnosticItem('窗口数量', `${diagnostics.process.browserWindowCount} 个`, windowHealthy ? 'ok' : 'warn');
    addDiagnosticItem('鼠标穿透', diagnostics.window.clickThrough ? '已开启' : '已关闭', diagnostics.window.clickThrough ? 'warn' : 'ok');
    addDiagnosticItem('恢复快捷键', shortcutHealthy ? shortcutLabel(diagnostics.recovery.activeShortcut) : '注册失败', shortcutHealthy ? 'ok' : 'warn');
    addDiagnosticItem('控制通道', diagnostics.recovery.controlPipeListening ? '正常' : '不可用', diagnostics.recovery.controlPipeListening ? 'ok' : 'warn');
    addDiagnosticItem('图形模式', diagnostics.graphics.softwareRendering ? '软件渲染' : '硬件加速', diagnostics.graphics.softwareRendering ? 'warn' : 'ok');
    addDiagnosticItem('语音转写', diagnostics.voice.transcriptionConfigured ? '已配置' : '系统识别兜底', diagnostics.voice.transcriptionConfigured ? 'ok' : 'warn');
    addDiagnosticItem('实时语音', diagnostics.voice.realtimeConfigured ? `${diagnostics.voice.realtimeModel} · ${diagnostics.voice.realtimeVoice}` : '未开启', diagnostics.voice.realtimeConfigured ? 'ok' : 'warn');
    addDiagnosticItem('语音技能桥接', diagnostics.voice.skillBridgeEnabled ? '已开启 · 执行前确认' : '未开启', diagnostics.voice.skillBridgeEnabled ? 'ok' : 'warn');
    const realtimeRuntime = diagnostics.voice.runtime || {};
    const realtimeStateLabels = { idle: '空闲', connecting: '连接中', listening: '聆听中', thinking: '理解中', speaking: '回答中', reconnecting: '重连中', failed: '已回退' };
    addDiagnosticItem('实时状态', realtimeStateLabels[realtimeRuntime.state] || '未知', ['failed', 'reconnecting'].includes(realtimeRuntime.state) ? 'warn' : 'ok');
    addDiagnosticItem('实时握手', realtimeRuntime.handshakeMs ? `${realtimeRuntime.handshakeMs} ms` : '暂无数据', realtimeRuntime.handshakeMs && realtimeRuntime.handshakeMs > 5000 ? 'warn' : 'ok');
    addDiagnosticItem('实时重连', `${realtimeRuntime.reconnectAttempts || 0} / 3`, realtimeRuntime.reconnectAttempts ? 'warn' : 'ok');
    if (realtimeRuntime.lastError) addDiagnosticItem('最近实时错误', realtimeRuntime.lastError, 'warn');
    addDiagnosticItem('技能中心', `${diagnostics.skills.registered} 项 · ${diagnostics.skills.pendingReminders} 个提醒`, diagnostics.skills.volumeHelperAvailable ? 'ok' : 'warn');
    addDiagnosticItem('本地记忆', `${diagnostics.memory.count} 条${diagnostics.memory.hasDisplayName ? ' · 已设置称呼' : ''}`, 'ok');
    addDiagnosticItem('本地计划', `${diagnostics.planner.pendingTasks} 项待办 · 主动助手${diagnostics.planner.proactive.proactiveEnabled ? '已开启' : '已关闭'}`, 'ok');
    addDiagnosticItem('本地对话', diagnostics.localAi.ready ? `${diagnostics.localAi.runtime.state} · ${diagnostics.localAi.settings.profile}` : '未选择 GGUF 模型', diagnostics.localAi.runtime.state === 'failed' ? 'warn' : diagnostics.localAi.ready ? 'ok' : 'warn');
    addDiagnosticItem('离线语音', diagnostics.offlineVoice.ready ? 'Whisper 已配置' : '未选择语音模型', diagnostics.offlineVoice.ready ? 'ok' : 'warn');
    addDiagnosticItem('本地知识库', `${diagnostics.knowledge.documents} 个文件`, 'ok');
    addDiagnosticItem('情景模式', diagnostics.scenario.definition.label, 'ok');
    addDiagnosticItem('白名单工作流', `${diagnostics.workflows.count} 个`, 'ok');
    addDiagnosticItem('陪伴系统', `Lv.${diagnostics.companion.level.number} ${diagnostics.companion.level.name} · ${diagnostics.companion.score}`, diagnostics.companion.runtime.recovering ? 'warn' : 'ok');
    addDiagnosticItem('桌宠状态', `${diagnostics.companion.runtime.state || 'idle'}${diagnostics.companion.runtime.animation ? ` · ${diagnostics.companion.runtime.animation}` : ''}`, diagnostics.companion.runtime.recovering ? 'warn' : 'ok');
    const storageHealthy = Object.values(diagnostics.storage).every(item => item.recoverable);
    addDiagnosticItem('本地数据', storageHealthy ? '可恢复' : '需要修复', storageHealthy ? 'ok' : 'warn');
  } catch (error) {
    diagnosticsGrid.replaceChildren();
    addDiagnosticItem('诊断失败', error.message, 'warn');
  } finally {
    refreshDiagnosticsButton.disabled = false;
  }
}

function addMessage(role, content, options = {}) {
  const article = document.createElement('article');
  article.className = `message ${role}${options.pending ? ' pending' : ''}${options.error ? ' error' : ''}`;

  const name = document.createElement('div');
  name.className = 'message-name';
  name.textContent = role === 'user' ? 'YOU' : 'ASTRA';

  const paragraph = document.createElement('p');
  paragraph.textContent = content;

  article.append(name, paragraph);
  messagesElement.append(article);
  messagesElement.scrollTop = messagesElement.scrollHeight;
  return article;
}

function muteRealtimeMicrophoneForSpeech() {
  const session = realtimeSession;
  if (!session || session.closed) return;
  session.localStream?.getAudioTracks().forEach(track => {
    track.enabled = false;
  });
  speechMutedRealtimeSession = session;
}

function restoreRealtimeMicrophoneAfterSpeech() {
  const session = speechMutedRealtimeSession;
  speechMutedRealtimeSession = undefined;
  if (!session || session.closed || realtimeSession !== session) return;
  session.localStream?.getAudioTracks().forEach(track => {
    track.enabled = true;
  });
}

function createChineseUtterance(text) {
  const utterance = new SpeechSynthesisUtterance(String(text || '').slice(0, 1200));
  utterance.lang = 'zh-CN';
  utterance.rate = 1.04;
  utterance.pitch = 0.9;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => /zh-CN/i.test(voice.lang)) || voices.find(voice => /^zh/i.test(voice.lang)) || null;
  return utterance;
}

function speak(text) {
  if (!currentSettings.speakReplies || scenarioStoreState.definition?.speakReplies === false || !('speechSynthesis' in window)) {
    setAssistantState(realtimeSession ? 'listening' : 'idle', realtimeSession ? '实时聆听中' : '随时待命');
    return;
  }

  stopSpeechPlayback();
  muteRealtimeMicrophoneForSpeech();
  const utterance = createChineseUtterance(text);
  utterance.onstart = () => setAssistantState('speaking', '正在回答');
  utterance.onend = () => {
    restoreRealtimeMicrophoneAfterSpeech();
    setAssistantState(realtimeSession ? 'listening' : 'idle', realtimeSession ? '实时聆听中' : '随时待命');
  };
  utterance.onerror = () => {
    restoreRealtimeMicrophoneAfterSpeech();
    setAssistantState(realtimeSession ? 'listening' : 'idle', realtimeSession ? '实时聆听中' : '随时待命');
  };
  window.speechSynthesis.speak(utterance);
}

function speakVoiceConfirmation(text) {
  if (!('speechSynthesis' in window)) return;
  stopSpeechPlayback();
  muteRealtimeMicrophoneForSpeech();
  const utterance = createChineseUtterance(text);
  utterance.onstart = () => setAssistantState('speaking', '等待语音确认');
  utterance.onend = () => {
    restoreRealtimeMicrophoneAfterSpeech();
    if (realtimeSession) setAssistantState('listening', '请说确认或取消');
  };
  utterance.onerror = () => {
    restoreRealtimeMicrophoneAfterSpeech();
    if (realtimeSession) setAssistantState('listening', '请说确认或取消');
  };
  window.speechSynthesis.speak(utterance);
}

function stopSpeechPlayback() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  restoreRealtimeMicrophoneAfterSpeech();
  avatar.style.removeProperty('--voice-level');
}

async function runTool(toolId, displayName) {
  setAssistantState('thinking', '正在执行');
  try {
    await api.runTool(toolId);
    const reply = `已为你打开${displayName}。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
  } catch (error) {
    addMessage('assistant', `操作失败：${error.message}`, { error: true });
    setAssistantState('idle', '操作失败');
  }
}

async function launchApp(appEntry) {
  setAssistantState('thinking', '正在启动');
  try {
    await api.launchApp(appEntry.id);
    const reply = `已为你打开${appEntry.name}。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
  } catch (error) {
    addMessage('assistant', `无法打开${appEntry.name}：${error.message}`, { error: true });
    setAssistantState('idle', '操作失败');
  }
}

function appMatchesTarget(appEntry, target) {
  const normalizedTarget = target.toLowerCase().replace(/[。！!，,？?\s]/g, '');
  return appEntry.keywords.some(keyword => {
    const normalizedKeyword = keyword.toLowerCase().replace(/\s/g, '');
    return normalizedTarget.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedTarget);
  });
}

function renderApps() {
  appList.replaceChildren();
  if (!whitelistedApps.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-apps';
    empty.textContent = '尚未发现应用，请点击下方按钮手动添加。';
    appList.append(empty);
    return;
  }

  whitelistedApps.forEach(appEntry => {
    const row = document.createElement('div');
    row.className = `app-row${appEntry.available ? '' : ' unavailable'}`;
    const icon = document.createElement('div');
    icon.className = 'app-icon';
    icon.textContent = appEntry.name.slice(0, 2).toUpperCase();
    const info = document.createElement('div');
    info.className = 'app-info';
    const name = document.createElement('b');
    name.textContent = appEntry.name;
    const appPath = document.createElement('small');
    appPath.textContent = appEntry.available ? appEntry.path : `${appEntry.path}（文件已移动）`;
    info.append(name, appPath);
    const actions = document.createElement('div');
    actions.className = 'app-actions';
    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.textContent = '打开';
    openButton.disabled = !appEntry.available;
    openButton.addEventListener('click', () => launchApp(appEntry));
    actions.append(openButton);
    if (appEntry.source === 'custom') {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-app';
      removeButton.textContent = '×';
      removeButton.title = '移出白名单';
      removeButton.addEventListener('click', async () => {
        if (!window.confirm(`将“${appEntry.name}”移出白名单？`)) return;
        whitelistedApps = await api.removeApp(appEntry.id);
        renderApps();
      });
      actions.append(removeButton);
    }
    row.append(icon, info, actions);
    appList.append(row);
  });
}

async function refreshApps() {
  whitelistedApps = await api.listApps();
  renderApps();
}

async function openApps() {
  try {
    await refreshApps();
    settingsOverlay.classList.add('hidden');
    skillsOverlay.classList.add('hidden');
    memoryOverlay.classList.add('hidden');
    plannerOverlay.classList.add('hidden');
    companionOverlay.classList.add('hidden');
    appsOverlay.classList.remove('hidden');
  } catch (error) {
    showToast(`读取应用白名单失败：${error.message}`);
  }
}

function closeApps() {
  appsOverlay.classList.add('hidden');
}

function renderSkillCenter() {
  skillList.replaceChildren();
  for (const skill of skillCenterState.skills) {
    const item = document.createElement('span');
    item.className = 'skill-chip';
    const name = document.createElement('b');
    name.textContent = skill.name;
    const description = document.createElement('small');
    description.textContent = skill.description;
    item.append(name, description);
    skillList.append(item);
  }

  skillHistory.replaceChildren();
  for (const reminder of skillCenterState.reminders.slice(0, 5)) {
    const row = document.createElement('div');
    row.className = 'skill-history-row';
    const title = document.createElement('b');
    title.textContent = `提醒：${reminder.title}`;
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '取消';
    cancel.addEventListener('click', async () => {
      try {
        await api.runSkill('reminders.cancel', { id: reminder.id });
        await refreshSkills();
      } catch (error) {
        showToast(`取消失败：${error.message}`);
      }
    });
    row.append(title, cancel);
    skillHistory.append(row);
  }
  for (const entry of skillCenterState.history.slice(0, 8)) {
    const row = document.createElement('div');
    row.className = 'skill-history-row';
    const name = document.createElement('b');
    name.textContent = `${entry.ok ? '✓' : '⚠'} ${entry.skillId}`;
    const time = document.createElement('span');
    time.textContent = new Date(entry.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    row.append(name, time);
    skillHistory.append(row);
  }
  if (!skillHistory.children.length) {
    const empty = document.createElement('div');
    empty.className = 'skill-history-row';
    empty.textContent = '还没有技能执行记录。';
    skillHistory.append(empty);
  }
}

async function refreshSkills() {
  skillCenterState = await api.getSkills();
  renderSkillCenter();
}

async function refreshVolume() {
  try {
    currentVolumeState = await api.runSkill('volume.get');
    volumeStatus.textContent = currentVolumeState.muted ? `已静音 · ${currentVolumeState.volume}%` : `${currentVolumeState.volume}%`;
    return currentVolumeState;
  } catch (error) {
    currentVolumeState = undefined;
    volumeStatus.textContent = '不可用';
    throw error;
  }
}

async function openSkills() {
  settingsOverlay.classList.add('hidden');
  appsOverlay.classList.add('hidden');
  memoryOverlay.classList.add('hidden');
  plannerOverlay.classList.add('hidden');
  companionOverlay.classList.add('hidden');
  skillsOverlay.classList.remove('hidden');
  try {
    await refreshSkills();
    await refreshVolume();
  } catch (error) {
    skillResults.textContent = `部分技能不可用：${error.message}`;
  }
}

function closeSkills() {
  skillsOverlay.classList.add('hidden');
}

function memoryCategoryLabel(category) {
  return { general: '一般', preference: '偏好', habit: '习惯', context: '背景' }[category] || '一般';
}

function renderMemoryCenter() {
  memoryDisplayNameInput.value = memoryState.profile.displayName || '';
  memoryPersonalityInput.value = memoryState.profile.personalityMode || 'jarvis';
  memoryResponseStyleInput.value = memoryState.profile.responseStyle || 'concise';
  memoryCount.textContent = `${memoryState.memories.length} / 100`;
  memoryList.replaceChildren();

  const memories = [...memoryState.memories].sort((left, right) => Number(right.pinned) - Number(left.pinned) || Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  if (!memories.length) {
    const empty = document.createElement('div');
    empty.className = 'memory-empty';
    empty.textContent = '还没有本地记忆。你可以说“记住我喜欢蓝色”。';
    memoryList.append(empty);
    return;
  }

  for (const memory of memories) {
    const row = document.createElement('section');
    row.className = 'memory-row';
    const textInput = document.createElement('textarea');
    textInput.maxLength = 500;
    textInput.value = memory.text;
    const controls = document.createElement('div');
    controls.className = 'memory-row-controls';
    const categoryInput = document.createElement('select');
    for (const category of ['general', 'preference', 'habit', 'context']) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = memoryCategoryLabel(category);
      categoryInput.append(option);
    }
    categoryInput.value = memory.category;
    const pinLabel = document.createElement('label');
    pinLabel.className = 'memory-pin';
    const pinInput = document.createElement('input');
    pinInput.type = 'checkbox';
    pinInput.checked = memory.pinned;
    pinLabel.append(pinInput, document.createTextNode('置顶'));
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = '保存';
    saveButton.addEventListener('click', async () => {
      try {
        const result = await api.updateMemory(memory.id, { text: textInput.value, category: categoryInput.value, pinned: pinInput.checked });
        memoryState = result.state;
        renderMemoryCenter();
        showToast('记忆已更新。');
      } catch (error) {
        showToast(`更新失败：${error.message}`, 4200);
      }
    });
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '删除';
    removeButton.addEventListener('click', async () => {
      if (!window.confirm('删除这条本地记忆？')) return;
      try {
        const result = await api.removeMemory(memory.id);
        memoryState = result.state;
        renderMemoryCenter();
        showToast('记忆已删除。');
      } catch (error) {
        showToast(`删除失败：${error.message}`, 4200);
      }
    });
    controls.append(categoryInput, pinLabel, saveButton, removeButton);
    row.append(textInput, controls);
    memoryList.append(row);
  }
}

async function refreshMemory() {
  memoryState = await api.getMemory();
  renderMemoryCenter();
}

async function openMemory() {
  settingsOverlay.classList.add('hidden');
  appsOverlay.classList.add('hidden');
  skillsOverlay.classList.add('hidden');
  plannerOverlay.classList.add('hidden');
  companionOverlay.classList.add('hidden');
  memoryOverlay.classList.remove('hidden');
  try {
    await refreshMemory();
    memoryAddInput.focus();
  } catch (error) {
    showToast(`读取本地记忆失败：${error.message}`, 4200);
  }
}

function closeMemory() {
  memoryOverlay.classList.add('hidden');
}

function toLocalDateTimeInput(timestamp) {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}

function fromLocalDateTimeInput(value) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function plannerTimeLabel(timestamp) {
  if (!timestamp) return '未设置时间';
  return new Date(timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

function renderPlannerCenter() {
  const settings = plannerState.settings || {};
  proactiveEnabledInput.checked = Boolean(settings.proactiveEnabled);
  startupGreetingInput.checked = settings.startupGreetingEnabled !== false;
  dailySummaryInput.checked = settings.dailySummaryEnabled !== false;
  dailySummaryTimeInput.value = settings.dailySummaryTime || '08:30';
  quietHoursInput.checked = settings.quietHoursEnabled !== false;
  quietStartInput.value = settings.quietStart || '22:00';
  quietEndInput.value = settings.quietEnd || '08:00';
  plannerSummary.textContent = plannerState.summary || '今天暂时没有需要处理的本地计划。';

  const sortedTasks = [...plannerState.tasks].sort((left, right) => Number(left.completed) - Number(right.completed) || (left.dueAt || Number.MAX_SAFE_INTEGER) - (right.dueAt || Number.MAX_SAFE_INTEGER));
  const pendingTasks = sortedTasks.filter(task => !task.completed).length;
  taskCount.textContent = `${pendingTasks} 项未完成`;
  taskList.replaceChildren();
  for (const task of sortedTasks) {
    const row = document.createElement('div');
    row.className = `planner-row${task.completed ? ' completed' : ''}`;
    const primary = document.createElement('div');
    primary.className = 'planner-row-primary';
    const completed = document.createElement('input');
    completed.type = 'checkbox';
    completed.checked = task.completed;
    completed.title = task.completed ? '标记为未完成' : '标记为已完成';
    const title = document.createElement('input');
    title.value = task.title;
    title.maxLength = 120;
    const dueAt = document.createElement('input');
    dueAt.type = 'datetime-local';
    dueAt.value = toLocalDateTimeInput(task.dueAt);
    dueAt.title = plannerTimeLabel(task.dueAt);
    const actions = document.createElement('div');
    actions.className = 'planner-row-actions';
    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = '保存';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '删除';
    completed.addEventListener('change', async () => {
      try {
        const result = await api.updateTask(task.id, { completed: completed.checked });
        plannerState = result.state;
        renderPlannerCenter();
        if (completed.checked) {
          setAssistantState('success', '待办已完成', { duration: 1900, priority: 90 });
          playCompanionMotion('celebrate', 1200);
          showCompanionBubble('这一项完成了。', { force: true });
        }
      } catch (error) {
        showToast(`更新失败：${error.message}`, 4200);
      }
    });
    save.addEventListener('click', async () => {
      try {
        const result = await api.updateTask(task.id, { title: title.value, dueAt: fromLocalDateTimeInput(dueAt.value) });
        plannerState = result.state;
        renderPlannerCenter();
        showToast('待办已保存。');
      } catch (error) {
        showToast(`保存失败：${error.message}`, 4200);
      }
    });
    remove.addEventListener('click', async () => {
      try {
        const result = await api.removeTask(task.id);
        plannerState = result.state;
        renderPlannerCenter();
        showToast('待办已删除。');
      } catch (error) {
        showToast(`删除失败：${error.message}`, 4200);
      }
    });
    primary.append(completed, title);
    actions.append(save, remove);
    row.append(primary, dueAt, actions);
    taskList.append(row);
  }
  if (!sortedTasks.length) {
    const empty = document.createElement('div');
    empty.className = 'planner-empty';
    empty.textContent = '还没有待办事项。';
    taskList.append(empty);
  }

  reminderCount.textContent = `${plannerState.reminders.length} 个等待中`;
  plannerReminderList.replaceChildren();
  for (const reminder of plannerState.reminders) {
    const row = document.createElement('div');
    row.className = 'planner-reminder-row';
    const detail = document.createElement('span');
    const title = document.createElement('b');
    title.textContent = reminder.title;
    const time = document.createElement('small');
    time.textContent = plannerTimeLabel(reminder.dueAt);
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '取消';
    cancel.addEventListener('click', async () => {
      try {
        const result = await api.cancelPlannerReminder(reminder.id);
        plannerState = result.state;
        renderPlannerCenter();
        showToast('提醒已取消。');
      } catch (error) {
        showToast(`取消失败：${error.message}`, 4200);
      }
    });
    detail.append(title, time);
    row.append(detail, cancel);
    plannerReminderList.append(row);
  }
  if (!plannerState.reminders.length) {
    const empty = document.createElement('div');
    empty.className = 'planner-empty';
    empty.textContent = '没有等待中的提醒。';
    plannerReminderList.append(empty);
  }
}

async function refreshPlanner() {
  plannerState = await api.getPlanner();
  renderPlannerCenter();
}

async function openPlanner() {
  settingsOverlay.classList.add('hidden');
  appsOverlay.classList.add('hidden');
  skillsOverlay.classList.add('hidden');
  memoryOverlay.classList.add('hidden');
  companionOverlay.classList.add('hidden');
  plannerOverlay.classList.remove('hidden');
  try {
    await refreshPlanner();
    if (!reminderDueInput.value) reminderDueInput.value = toLocalDateTimeInput(Date.now() + 60 * 60 * 1000);
    taskTitleInput.focus();
  } catch (error) {
    showToast(`读取计划失败：${error.message}`, 4200);
  }
}

function closePlanner() {
  plannerOverlay.classList.add('hidden');
}

function companionDateLabel(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

function appendCompanionStat(label, value) {
  const item = document.createElement('span');
  const detail = document.createElement('b');
  detail.textContent = String(value);
  item.append(detail, document.createTextNode(label));
  companionStats.append(item);
}

function renderCompanionCenter() {
  const settings = companionState.settings || {};
  const level = companionState.level || { number: 1, name: '初识', progress: 0, nextMinimum: 40 };
  companionLevelName.textContent = `Lv.${level.number} ${level.name}`;
  companionScoreText.textContent = level.number >= 5 ? `陪伴值 ${companionState.score} · 已达最高等级` : `陪伴值 ${companionState.score} · 下一级 ${level.nextMinimum}`;
  companionAddressPreview.textContent = `称呼：${companionState.preferredAddress || '未设置'}`;
  companionProgressFill.style.width = `${Math.round((level.progress || 0) * 100)}%`;
  companionInteractionsInput.checked = settings.interactionsEnabled !== false;
  companionIdleFrequencyInput.value = settings.idleFrequency || 'normal';
  companionBubbleFrequencyInput.value = settings.bubbleFrequency || 'low';
  companionLowPerformanceInput.checked = settings.lowPerformanceMode === true;
  companionAchievementsInput.checked = settings.achievementsEnabled !== false;
  companionBackgroundModeInput.value = settings.backgroundMode || 'mini';
  companionSleepInput.value = String(settings.sleepAfterMinutes ?? 10);
  companionMiniClickThroughInput.checked = settings.miniClickThrough === true;
  companionFullscreenInput.checked = settings.autoHideFullscreen !== false;
  companionBatteryInput.checked = settings.autoLowPower !== false;
  companionReactionsInput.checked = settings.cursorReactions !== false || settings.edgeReactions !== false;

  companionStats.replaceChildren();
  appendCompanionStat('有效互动', companionState.totalInteractions || 0);
  appendCompanionStat('相伴天数', companionState.activeDays || 0);
  appendCompanionStat('技能完成', companionState.counters?.skill || 0);
  appendCompanionStat('待办完成', companionState.counters?.task || 0);

  companionAddressInput.replaceChildren();
  for (const address of companionState.availableAddressModes || []) {
    const option = document.createElement('option');
    option.value = address.value;
    option.disabled = !address.unlocked;
    option.textContent = address.unlocked ? address.label : `${address.label} · Lv.${address.minimumLevel} 解锁`;
    companionAddressInput.append(option);
  }
  companionAddressInput.value = settings.addressMode || 'profile';

  const cosmeticInputs = [
    [companionThemeInput, companionState.cosmetics?.themes, settings.theme],
    [companionEyeInput, companionState.cosmetics?.eyes, settings.eyeStyle],
    [companionCoreInput, companionState.cosmetics?.cores, settings.coreStyle],
    [companionShoulderInput, companionState.cosmetics?.shoulders, settings.shoulderStyle],
    [companionHaloInput, companionState.cosmetics?.halos, settings.haloStyle]
  ];
  for (const [select, options = [], selected] of cosmeticInputs) {
    select.replaceChildren();
    for (const item of options) {
      const option = document.createElement('option');
      option.value = item.value;
      option.disabled = item.unlocked === false;
      option.textContent = item.unlocked === false ? `${item.label} · 完成本地成就解锁` : item.label;
      select.append(option);
    }
    select.value = selected || options[0]?.value || '';
  }

  companionCollectionList.replaceChildren();
  if (!(companionState.collection || []).length) {
    const empty = document.createElement('div');
    empty.className = 'companion-empty';
    empty.textContent = '收藏册还是空的。完成明确互动后会在本地解锁节点。';
    companionCollectionList.append(empty);
  } else {
    for (const entry of companionState.collection) {
      const row = document.createElement('article');
      row.className = 'companion-entry unlocked';
      const title = document.createElement('b');
      title.textContent = entry.title;
      const copy = document.createElement('span');
      copy.textContent = entry.copy;
      const time = document.createElement('small');
      time.textContent = `解锁于 ${companionDateLabel(entry.unlockedAt)}`;
      row.append(title, copy, time);
      companionCollectionList.append(row);
    }
  }

  companionAchievementList.replaceChildren();
  for (const achievement of companionState.achievements || []) {
    const row = document.createElement('article');
    row.className = `companion-entry ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    const title = document.createElement('b');
    title.textContent = `${achievement.unlocked ? '✓' : '◇'} ${achievement.title}`;
    const description = document.createElement('span');
    description.textContent = achievement.description;
    row.append(title, description);
    companionAchievementList.append(row);
  }
}

function applyCompanionPreferences() {
  document.body.classList.toggle('performance-low', companionState.settings.lowPerformanceMode === true);
  avatar.setAttribute('aria-disabled', companionState.settings.interactionsEnabled === false ? 'true' : 'false');
  avatar.style.cursor = companionState.settings.interactionsEnabled === false ? 'default' : '';
  document.body.dataset.theme = companionState.settings.theme || 'red-gold';
  avatar.dataset.eyes = companionState.settings.eyeStyle || 'standard';
  avatar.dataset.core = companionState.settings.coreStyle || 'round';
  avatar.dataset.shoulders = companionState.settings.shoulderStyle || 'classic';
  avatar.dataset.halo = companionState.settings.haloStyle || 'orbit';
  if (companionState.settings.interactionsEnabled === false) closeQuickWheel();
  scheduleCompanionIdleMotion();
}

function applyWindowMode(payload = {}) {
  currentWindowMode = payload.mode || currentWindowMode || 'full';
  document.body.classList.toggle('mini-mode', currentWindowMode === 'mini');
  document.body.classList.toggle('window-hidden-mode', currentWindowMode === 'hidden');
  setInteractionLayer(currentWindowMode === 'full' ? 'full' : 'glance');
  closeQuickWheel();
  commandPalette.classList.add('hidden');
  if (currentWindowMode === 'mini') {
    closeSettings();
    closeApps();
    closeSkills();
    closeMemory();
    closePlanner();
    closeCompanion();
    messageInput.blur();
  }
}

async function refreshCompanion() {
  companionState = await api.getCompanion();
  applyCompanionPreferences();
  renderCompanionCenter();
  return companionState;
}

async function openCompanion() {
  settingsOverlay.classList.add('hidden');
  appsOverlay.classList.add('hidden');
  skillsOverlay.classList.add('hidden');
  memoryOverlay.classList.add('hidden');
  plannerOverlay.classList.add('hidden');
  companionOverlay.classList.remove('hidden');
  try {
    await refreshCompanion();
    companionIdleFrequencyInput.focus();
  } catch (error) {
    showToast(`读取陪伴数据失败：${error.message}`, 4200);
  }
}

function closeCompanion() {
  companionOverlay.classList.add('hidden');
  scheduleCompanionIdleMotion();
}

const COMPANION_ACTION_LABELS = {
  browser: '浏览器',
  notepad: '记事本',
  calculator: '计算器',
  downloads: '下载目录',
  settings: '系统设置',
  screenshot: '屏幕截图',
  'clipboard.read': '读取剪贴板',
  'clipboard.write': '写入剪贴板',
  'volume.get': '读取音量',
  'volume.set': '设置音量',
  'volume.mute': '系统静音',
  'volume.unmute': '取消静音',
  'volume.toggle': '切换静音',
  'files.search': '文件搜索',
  'reminders.schedule': '创建提醒',
  'reminders.cancel': '取消提醒'
};

function companionActionLabel(id) {
  return COMPANION_ACTION_LABELS[id] || whitelistedApps.find(item => item.id === id)?.name || '本地操作';
}

function handleCompanionAction(payload = {}) {
  const label = companionActionLabel(String(payload.id || ''));
  if (payload.phase === 'start') {
    setAssistantState('executing', `正在执行：${label}`, { duration: 12000, priority: 60 });
    playCompanionMotion('work', 1200);
    return;
  }
  if (payload.phase === 'success') {
    setAssistantState('success', `${label}已完成`, { duration: 1900, priority: 90 });
    const specialMotion = payload.id === 'calculator' ? 'abacus' : payload.id === 'screenshot' ? 'camera' : String(payload.id || '').startsWith('volume.') ? 'energy' : payload.id === 'task-streak' ? 'armor' : 'celebrate';
    playCompanionMotion(specialMotion, payload.id === 'task-streak' ? 1800 : 1200);
    if (companionState.settings.bubbleFrequency !== 'off') showCompanionBubble(`${label}完成。`);
    return;
  }
  if (payload.phase === 'error') {
    setAssistantState('error', `${label}执行失败`, { duration: 2200, priority: 90 });
    playCompanionMotion('shake', 700);
  }
}

let avatarDragContext;
let pendingWindowPosition;
let windowMoveInFlight = false;
let avatarInteractionIndex = 0;

async function flushWindowMove() {
  if (windowMoveInFlight || !pendingWindowPosition) return;
  const position = pendingWindowPosition;
  pendingWindowPosition = undefined;
  windowMoveInFlight = true;
  try {
    await api.moveWindowTo(position);
  } catch (error) {
    showToast(`拖动失败：${error.message}`, 3200);
  } finally {
    windowMoveInFlight = false;
    if (pendingWindowPosition) requestAnimationFrame(flushWindowMove);
  }
}

async function settleWindowMove() {
  if (pendingWindowPosition && !windowMoveInFlight) await flushWindowMove();
  for (let attempt = 0; attempt < 18 && (pendingWindowPosition || windowMoveInFlight); attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 16));
    if (pendingWindowPosition && !windowMoveInFlight) await flushWindowMove();
  }
}

async function recordAvatarInteraction(message, motion) {
  setAssistantState('interacting', '互动回应', { duration: 1200, priority: 20 });
  playCompanionMotion(motion, 1000);
  showCompanionBubble(message, { force: true, duration: 2600 });
  try {
    await api.recordCompanionEvent({ type: 'touch' });
  } catch {}
}

function setupAvatarInteractions() {
  const clearHeadHover = () => {
    clearTimeout(headHoverTimer);
    headHoverTimer = undefined;
  };
  const scheduleHeadHover = event => {
    if (avatarDragContext || Date.now() - lastHeadPatAt < 30000) return clearHeadHover();
    const bounds = avatar.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    const overHead = localX >= bounds.width * .22 && localX <= bounds.width * .78 && localY >= 8 && localY <= bounds.height * .58;
    if (!overHead || headHoverTimer) return overHead ? undefined : clearHeadHover();
    headHoverTimer = setTimeout(() => {
      headHoverTimer = undefined;
      lastHeadPatAt = Date.now();
      recordAvatarInteraction('检测到摸头动作。核心温度正常。', 'nod');
    }, 1200);
  };

  avatar.addEventListener('contextmenu', event => {
    event.preventDefault();
    openQuickWheel(event.clientX, event.clientY);
  });
  avatar.addEventListener('keydown', event => {
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
      event.preventDefault();
      const bounds = avatar.getBoundingClientRect();
      openQuickWheel(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    }
  });
  avatar.addEventListener('dblclick', event => {
    if (event.button !== 0 || currentWindowMode !== 'mini') return;
    event.preventDefault();
    api.restoreFullWindow();
  });
  avatar.addEventListener('pointerdown', async event => {
    if (event.button !== 0 || companionState.settings.interactionsEnabled === false) return;
    event.preventDefault();
    clearHeadHover();
    closeQuickWheel();
    avatar.classList.add('drag-armed');
    avatar.setPointerCapture(event.pointerId);
    avatarDragContext = {
      pointerId: event.pointerId,
      startScreenX: event.screenX,
      startScreenY: event.screenY,
      lastScreenX: event.screenX,
      lastScreenY: event.screenY,
      lastAt: performance.now(),
      maxSpeed: 0,
      moved: false,
      bounds: undefined
    };
    try {
      avatarDragContext.bounds = await api.getWindowDragState();
    } catch {
      avatarDragContext = undefined;
    }
  });

  avatar.addEventListener('pointermove', event => {
    const context = avatarDragContext;
    if (!context) return scheduleHeadHover(event);
    if (context.pointerId !== event.pointerId || !context.bounds) return;
    const deltaX = event.screenX - context.startScreenX;
    const deltaY = event.screenY - context.startScreenY;
    if (!context.moved && Math.hypot(deltaX, deltaY) < 6) return;
    context.moved = true;
    const now = performance.now();
    const elapsed = Math.max(1, now - context.lastAt);
    const speed = Math.hypot(event.screenX - context.lastScreenX, event.screenY - context.lastScreenY) / elapsed * 1000;
    context.maxSpeed = Math.max(context.maxSpeed, speed);
    context.lastScreenX = event.screenX;
    context.lastScreenY = event.screenY;
    context.lastAt = now;
    avatar.classList.remove('drag-armed');
    avatar.classList.add('drag-active');
    avatar.classList.toggle('drag-fast', speed >= 1400);
    avatar.style.setProperty('--drag-tilt', `${Math.max(-10, Math.min(10, deltaX / 12))}deg`);
    setAssistantState('dragging', '正在移动', { force: true });
    pendingWindowPosition = { x: context.bounds.x + deltaX, y: context.bounds.y + deltaY };
    requestAnimationFrame(flushWindowMove);
  });

  const finishInteraction = async event => {
    const context = avatarDragContext;
    if (!context || context.pointerId !== event.pointerId) return;
    avatarDragContext = undefined;
    clearHeadHover();
    avatar.classList.remove('drag-armed', 'drag-active', 'drag-fast');
    avatar.style.removeProperty('--drag-tilt');
    if (avatar.hasPointerCapture(event.pointerId)) avatar.releasePointerCapture(event.pointerId);
    if (context.moved) {
      await settleWindowMove();
      let finalState = context.bounds;
      try { finalState = await api.getWindowDragState(); } catch {}
      const feedback = interaction.classifyDragFeedback({
        bounds: finalState,
        workArea: finalState?.workArea,
        maxSpeed: context.maxSpeed,
        distance: Math.hypot(event.screenX - context.startScreenX, event.screenY - context.startScreenY)
      });
      await recordAvatarInteraction(feedback.message, feedback.motion);
      return;
    }
    if (currentWindowMode === 'mini' && event.detail >= 2) return;
    const now = Date.now();
    rapidAvatarTapCount = now - lastAvatarTapAt <= 420 ? rapidAvatarTapCount + 1 : 1;
    lastAvatarTapAt = now;
    if (rapidAvatarTapCount >= 4) {
      rapidAvatarTapCount = 0;
      await recordAvatarInteraction('轻一点，我还在这里。', 'shake');
      return;
    }
    avatarInteractionIndex = (avatarInteractionIndex + 1) % 4;
    const interactions = [
      ['我在。', 'nod'],
      ['收到你的招呼。', 'wave'],
      ['核心状态正常。', 'poke'],
      ['随时待命。', 'look']
    ];
    await recordAvatarInteraction(...interactions[avatarInteractionIndex]);
  };
  avatar.addEventListener('pointerup', finishInteraction);
  avatar.addEventListener('pointercancel', event => {
    if (avatarDragContext?.pointerId === event.pointerId) {
      avatarDragContext = undefined;
      clearHeadHover();
      avatar.classList.remove('drag-armed', 'drag-active', 'drag-fast');
      avatar.style.removeProperty('--drag-tilt');
      const resting = restingAssistantState();
      setAssistantState(resting.state, resting.label, { force: true });
    }
  });
  avatar.addEventListener('pointerleave', clearHeadHover);
}

async function adjustVolume(delta) {
  try {
    const state = currentVolumeState || await refreshVolume();
    currentVolumeState = await api.runSkill('volume.set', { value: state.volume + delta });
    volumeStatus.textContent = `${currentVolumeState.volume}%`;
    await refreshSkills();
  } catch (error) {
    showToast(error.message, 4200);
  }
}

function formatFileResults(result) {
  if (!result.results.length) return `没有在桌面、文档和下载目录中找到“${result.query}”。`;
  return result.results.slice(0, 12).map((item, index) => `${index + 1}. ${item.name}\n${item.path}`).join('\n');
}

async function handleLocalCommand(message) {
  if (/^(?:请|帮我|麻烦)?\s*(?:打开|查看|管理)?(?:计划中心|日程管理|待办管理|主动助手)[。！!]?$/i.test(message)) {
    await openPlanner();
    return true;
  }

  if (/^(?:查看|生成|告诉我)?\s*(?:今日摘要|今天.*(?:安排|待办)|我的计划|有什么提醒)[。！!]?$/i.test(message)) {
    const reply = await api.getDailySummary();
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  const taskMatch = message.match(/^(?:添加|新建)(?:一个)?待办(?:事项)?\s*[“"]?(.+?)[”"]?[。！!]?$/i);
  if (taskMatch) {
    const result = await api.addTask({ title: taskMatch[1].trim() });
    plannerState = result.state;
    const reply = `已添加待办“${result.task.title}”。你可以在计划中心设置时间。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/^(?:请|帮我|麻烦)?\s*(?:打开|查看|管理)?(?:本地)?(?:记忆中心|记忆管理|记忆与人格)[。！!]?$/i.test(message)) {
    await openMemory();
    return true;
  }

  const displayNameMatch = message.match(/以后(?:请)?叫我\s*[“"]?(.+?)[”"]?[。！!]?$/i);
  if (displayNameMatch) {
    const state = await api.getMemory();
    memoryState = await api.saveMemoryProfile({ ...state.profile, displayName: displayNameMatch[1].trim() });
    const reply = `好的，以后我会称呼你为“${memoryState.profile.displayName}”。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/(?:你(?:还)?记得(?:我)?什么|你保存了什么|查看(?:本地)?记忆)/i.test(message)) {
    const state = await api.getMemory();
    const lines = [];
    if (state.profile.displayName) lines.push(`称呼：${state.profile.displayName}`);
    for (const memory of state.memories.slice(0, 12)) lines.push(`• ${memory.text}`);
    const reply = lines.length ? `我在本机保存了这些信息：\n${lines.join('\n')}` : '我还没有保存任何关于你的记忆。只有你明确让我记住时，我才会写入本机。';
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(lines.length ? `我保存了 ${state.memories.length} 条本地记忆。` : reply);
    return true;
  }

  const forgetMatch = message.match(/^(?:请)?忘记(?:掉)?\s*[“"]?(.+?)[”"]?[。！!]?$/i);
  if (forgetMatch) {
    const target = forgetMatch[1].trim();
    if (/^(?:全部|所有|所有记忆|全部记忆)$/.test(target)) {
      if (!window.confirm('确定清空全部本地记忆？称呼与人格设置会保留。')) {
        const reply = '好的，我没有清空记忆。';
        addMessage('assistant', reply);
        history.push({ role: 'assistant', content: reply });
        return true;
      }
      const result = await api.clearMemory();
      memoryState = result.state;
      const reply = `已清空 ${result.removed} 条本地记忆，称呼与人格设置仍然保留。`;
      addMessage('assistant', reply);
      history.push({ role: 'assistant', content: reply });
      speak(reply);
      return true;
    }
    const state = await api.getMemory();
    const normalizedTarget = target.toLocaleLowerCase('zh-CN');
    const matches = state.memories.filter(memory => memory.text.toLocaleLowerCase('zh-CN').includes(normalizedTarget));
    if (!matches.length) {
      const reply = `我没有找到包含“${target}”的本地记忆。`;
      addMessage('assistant', reply);
      history.push({ role: 'assistant', content: reply });
      speak(reply);
      return true;
    }
    for (const memory of matches) await api.removeMemory(memory.id);
    const reply = `已忘记 ${matches.length} 条包含“${target}”的记忆。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  const rememberMatch = message.match(/^(?:请)?记住(?:一下)?[：:\s]*(.+?)[。！!]?$/i);
  if (rememberMatch) {
    const text = rememberMatch[1].trim();
    const category = /喜欢|偏好|最爱/.test(text) ? 'preference' : /习惯|每天|通常|经常/.test(text) ? 'habit' : /工作|项目|背景|使用/.test(text) ? 'context' : 'general';
    const result = await api.addMemory({ text, category });
    memoryState = result.state;
    const reply = result.created ? `好的，我已在本机记住：“${result.memory.text}”。` : `这条记忆已经存在，我更新了它的时间。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/^(?:请|帮我|麻烦)?\s*(?:打开)?技能中心[。！!]?$/i.test(message)) {
    await openSkills();
    return true;
  }

  if (/(?:截个图|截图|屏幕截图)/i.test(message)) {
    const result = await api.runSkill('screenshot');
    const reply = `截图已保存到：${result.filePath}`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak('截图已经保存。');
    return true;
  }

  const volumeSetMatch = message.match(/(?:把)?(?:系统)?音量(?:调到|设置为|设为)\s*(\d{1,3})\s*%?/i);
  if (volumeSetMatch) {
    const result = await api.runSkill('volume.set', { value: Number(volumeSetMatch[1]) });
    const reply = `系统音量已设置为 ${result.volume}%${result.muted ? '，当前静音' : ''}。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/(?:取消|解除|关闭)静音/i.test(message)) {
    const result = await api.runSkill('volume.unmute');
    const reply = `已取消静音，当前音量 ${result.volume}%。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/(?:打开|开启|系统)?静音/i.test(message)) {
    const result = await api.runSkill('volume.mute');
    const reply = `系统已静音，原音量为 ${result.volume}%。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/音量(?:大|高)(?:一点|一些)?/i.test(message) || /调高音量/i.test(message)) {
    const current = await api.runSkill('volume.get');
    const result = await api.runSkill('volume.set', { value: current.volume + 10 });
    const reply = `音量已调高到 ${result.volume}%。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/音量(?:小|低)(?:一点|一些)?/i.test(message) || /调低音量/i.test(message)) {
    const current = await api.runSkill('volume.get');
    const result = await api.runSkill('volume.set', { value: current.volume - 10 });
    const reply = `音量已调低到 ${result.volume}%。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  const clipboardWriteMatch = message.match(/把\s*(.+?)\s*复制到剪贴板[。！!]?$/i);
  if (clipboardWriteMatch) {
    const result = await api.runSkill('clipboard.write', { text: clipboardWriteMatch[1] });
    const reply = `已将 ${result.characters} 个字符写入剪贴板。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  if (/(?:读取|查看|看看).{0,4}剪贴板/i.test(message)) {
    const result = await api.runSkill('clipboard.read');
    const reply = result.text ? `剪贴板内容：\n${result.text}${result.truncated ? '\n（内容过长，已截断显示）' : ''}` : '剪贴板中没有文本内容。';
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(result.text ? '已读取剪贴板内容。' : reply);
    return true;
  }

  const fileSearchMatch = message.match(/(?:搜索|查找|找一下|找找)(?:电脑里的|本机的)?文件\s*[“"]?(.+?)[”"]?[。！!]?$/i);
  if (fileSearchMatch) {
    const result = await api.runSkill('files.search', { query: fileSearchMatch[1] });
    const reply = formatFileResults(result);
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(result.results.length ? `找到了 ${result.results.length} 个文件。` : reply);
    return true;
  }

  const tools = [
    { pattern: /打开.*(浏览器|browser)/i, id: 'browser', name: '默认浏览器' },
    { pattern: /打开.*(记事本|notepad)/i, id: 'notepad', name: '记事本' },
    { pattern: /打开.*(计算器|calculator)/i, id: 'calculator', name: '计算器' },
    { pattern: /打开.*(下载|download)/i, id: 'downloads', name: '下载目录' },
    { pattern: /打开.*(系统设置|windows设置)/i, id: 'settings', name: '系统设置' }
  ];
  const matchedTool = tools.find(tool => tool.pattern.test(message));
  if (matchedTool) {
    await runTool(matchedTool.id, matchedTool.name);
    return true;
  }

  const searchMatch = message.match(/(?:用浏览器)?(?:搜索一下|搜一下|查一下|搜索)\s*(.+)/i);
  if (searchMatch) {
    const query = searchMatch[1].trim();
    await api.searchWeb(query);
    const reply = `已在默认浏览器中搜索“${query}”。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  const openAppMatch = message.match(/(?:请|帮我|麻烦)?\s*打开\s*(.+?)(?:吧|一下)?[。！!]?$/i);
  if (openAppMatch) {
    const target = openAppMatch[1].trim();
    const matchedApp = whitelistedApps.find(appEntry => appEntry.available && appMatchesTarget(appEntry, target));
    if (matchedApp) {
      await launchApp(matchedApp);
      return true;
    }
    if (/(微信|wechat|qq|vscode|vs code|visual studio code)/i.test(target)) {
      const reply = `没有检测到“${target}”。请在“应用”面板中选择它的 EXE 加入白名单。`;
      addMessage('assistant', reply);
      history.push({ role: 'assistant', content: reply });
      speak(reply);
      openApps();
      return true;
    }
  }

  const reminderMatch = message.match(/提醒我?\s*(\d+(?:\.\d+)?)\s*分钟后\s*(.+)/);
  if (reminderMatch) {
    const minutes = Number(reminderMatch[1]);
    const title = reminderMatch[2].trim();
    const reminder = await api.scheduleReminder({ minutes, title });
    const reply = `好的，我会在 ${reminder.minutes} 分钟后提醒你“${reminder.title}”。`;
    addMessage('assistant', reply);
    history.push({ role: 'assistant', content: reply });
    speak(reply);
    return true;
  }

  return false;
}

function resizeMessageInput() {
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(72, Math.max(30, messageInput.scrollHeight))}px`;
}

function hideCommandPalette() {
  visibleCommandItems = [];
  commandPaletteIndex = 0;
  commandPalette.classList.add('hidden');
  commandPalette.replaceChildren();
}

async function executeCommandItem(item) {
  if (!item) return;
  hideCommandPalette();
  if (item.mode === 'insert') {
    messageInput.value = item.value;
    resizeMessageInput();
    messageInput.focus();
    messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
    return;
  }
  messageInput.value = '';
  resizeMessageInput();
  if (item.mode === 'send') return sendMessage(item.value);
  if (item.value === 'screenshot') return runTool('screenshot', '屏幕截图');
  if (item.value === 'focus') {
    focusOverlay.classList.remove('hidden');
    focusState = await api.getFocus();
    renderFocus();
    return;
  }
  if (item.value === 'voice') {
    micButton.focus();
    showCompanionBubble('按住麦克风按钮开始说话，松开后识别。', { force: true, duration: 4200 });
    return;
  }
  if (item.value === 'mini') return api.setWindowMode('mini');
  if (item.value === 'settings') return openSettings();
}

function renderCommandPalette() {
  visibleCommandItems = interaction.commandSuggestions(messageInput.value);
  commandPalette.replaceChildren();
  if (!visibleCommandItems.length) return commandPalette.classList.add('hidden');
  commandPaletteIndex = Math.max(0, Math.min(commandPaletteIndex, visibleCommandItems.length - 1));
  visibleCommandItems.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'option');
    button.classList.toggle('selected', index === commandPaletteIndex);
    button.setAttribute('aria-selected', index === commandPaletteIndex ? 'true' : 'false');
    const command = document.createElement('b');
    command.textContent = item.command;
    const copy = document.createElement('span');
    const label = document.createElement('span');
    label.textContent = item.label;
    const hint = document.createElement('small');
    hint.textContent = item.hint;
    copy.append(label, hint);
    button.append(command, copy);
    button.addEventListener('mouseenter', () => {
      if (commandPaletteIndex === index) return;
      commandPaletteIndex = index;
      renderCommandPalette();
    });
    button.addEventListener('click', () => executeCommandItem(item).catch(error => showToast(error.message, 4200)));
    commandPalette.append(button);
  });
  commandPalette.classList.remove('hidden');
}

async function sendMessage(message) {
  const cleaned = message.trim();
  if (!cleaned && !pendingImages.length) return;
  if (busy) {
    if (!activeChatRequestId) return;
    await cancelActiveChatGeneration();
    while (busy) await new Promise(resolve => setTimeout(resolve, 0));
  }

  busy = true;
  sendButton.disabled = true;
  if (cleaned && sentMessageHistory.at(-1) !== cleaned) sentMessageHistory.push(cleaned);
  if (sentMessageHistory.length > 50) sentMessageHistory = sentMessageHistory.slice(-50);
  messageHistoryIndex = sentMessageHistory.length;
  messageInput.value = '';
  resizeMessageInput();
  hideCommandPalette();
  const images = pendingImages.splice(0);
  renderImagePreviews();
  addMessage('user', `${cleaned || '请查看图片'}${images.length ? `（${images.length} 张图片）` : ''}`);
  history.push({ role: 'user', content: cleaned });

  try {
    if (await handleLocalCommand(cleaned)) return;

    setAssistantState('thinking', '正在思考');
    const pending = addMessage('assistant', '', { pending: true });
    pending.classList.add('streaming');
    try {
      activeChatMessage = pending;
      activeChatText = '';
      activeChatMetrics = {};
      activeChatCompletion = new Promise(resolve => { activeChatCompletionResolve = resolve; });
      const result = await api.startChatStream({ message: cleaned, history: history.slice(0, -1), images });
      activeChatRequestId = result.requestId;
      stopGenerationButton.classList.remove('hidden');
      sendButton.disabled = false;
      await activeChatCompletion;
    } catch (error) {
      pending.classList.remove('pending', 'streaming');
      pending.classList.add('error');
      pending.querySelector('p').textContent = `连接失败：${error.message}`;
      setAssistantState('idle', '连接失败');
    }
  } catch (error) {
    addMessage('assistant', `操作失败：${error.message}`, { error: true });
    setAssistantState('idle', '操作失败');
  } finally {
    busy = false;
    activeChatRequestId = '';
    activeChatMessage = undefined;
    activeChatText = '';
    activeChatMetrics = {};
    activeChatCompletion = undefined;
    activeChatCompletionResolve = undefined;
    stopGenerationButton.classList.add('hidden');
    sendButton.disabled = false;
    messageInput.focus();
  }
}

function formatChatMetrics(metrics = {}, suffix = '') {
  const items = [];
  if (metrics.firstTokenMs) items.push(`首字 ${metrics.firstTokenMs} ms`);
  if (metrics.tokensPerSecond) items.push(`${metrics.tokensPerSecond} token/s`);
  if (metrics.contextTokens) items.push(`上下文 ${metrics.contextTokens}${metrics.contextSize ? ` / ${metrics.contextSize}` : ''}`);
  if (suffix) items.push(suffix);
  return items.join(' · ');
}

function updateChatMessageMetrics(element, metrics, suffix = '') {
  const text = formatChatMetrics(metrics, suffix);
  let detail = element.querySelector('.message-metrics');
  if (!text) { detail?.remove(); return; }
  if (!detail) {
    detail = document.createElement('div');
    detail.className = 'message-metrics';
    element.append(detail);
  }
  detail.textContent = text;
}

async function cancelActiveChatGeneration() {
  if (!activeChatRequestId) return;
  await api.stopChatStream(activeChatRequestId);
  await Promise.race([activeChatCompletion || Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1200))]);
}

function openSettings() {
  endpointInput.value = currentSettings.endpoint || '';
  modelInput.value = currentSettings.model || '';
  transcriptionModelInput.value = currentSettings.transcriptionModel || 'gpt-4o-mini-transcribe';
  apiKeyInput.value = currentSettings.apiKey || '';
  speakRepliesInput.checked = currentSettings.speakReplies !== false;
  realtimeEnabledInput.checked = currentSettings.realtimeEnabled === true;
  realtimeAutoConnectInput.checked = currentSettings.realtimeAutoConnect === true;
  realtimeReconnectInput.checked = currentSettings.realtimeReconnectEnabled !== false;
  voiceSkillBridgeInput.checked = currentSettings.voiceSkillBridgeEnabled === true;
  replaceSelectOptions(realtimeModelInput, currentSettings.realtimeModelOptions, currentSettings.realtimeModel);
  replaceSelectOptions(realtimeVoiceInput, currentSettings.realtimeVoiceOptions, currentSettings.realtimeVoice);
  realtimeVadModeInput.value = currentSettings.realtimeVadMode || 'natural';
  realtimeIdleMinutesInput.value = String(currentSettings.realtimeIdleMinutes ?? 10);
  realtimeMaxMinutesInput.value = String(currentSettings.realtimeMaxMinutes ?? 30);
  launchAtLoginInput.checked = Boolean(currentSettings.launchAtLogin);
  updateManifestInput.value = currentSettings.updateManifestUrl || '';
  updateRecoveryUi();
  appsOverlay.classList.add('hidden');
  skillsOverlay.classList.add('hidden');
  memoryOverlay.classList.add('hidden');
  plannerOverlay.classList.add('hidden');
  companionOverlay.classList.add('hidden');
  intelligenceOverlay.classList.add('hidden');
  settingsOverlay.classList.remove('hidden');
  refreshAudioDevices();
  refreshDiagnostics();
  endpointInput.focus();
}

function closeSettings() {
  settingsOverlay.classList.add('hidden');
}

function selectRecorderMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  return candidates.find(candidate => MediaRecorder.isTypeSupported(candidate)) || '';
}

function setVoiceLevel(level) {
  avatar.style.setProperty('--voice-level', String(Math.max(0, Math.min(1, level))));
}

function updateRealtimeButton() {
  const state = realtimeSession?.state || (realtimeReconnectTimer ? 'reconnecting' : 'idle');
  realtimeButton.classList.toggle('active', state !== 'idle');
  realtimeButton.disabled = state === 'connecting' || (state === 'idle' && (!currentSettings.realtimeEnabled || !currentSettings.endpoint || !currentSettings.apiKeyConfigured));
  realtimeButton.textContent = state === 'connecting' ? '正在连接…' : state === 'reconnecting' ? '取消重连' : state === 'idle' ? '开始实时通话' : '结束实时通话';
  const canUseVoiceInput = Boolean(currentSettings.endpoint && currentSettings.apiKeyConfigured) || offlineVoiceState.ready === true || Boolean(speechRecognition);
  micButton.disabled = state !== 'idle' || !canUseVoiceInput;
  micButton.title = state !== 'idle' ? '实时通话进行中，按住麦克风不可用' : canUseVoiceInput ? '按住说话，松开发送' : '未配置转写服务，麦克风不可用；请在设置中填写接口地址和 API Key，或配置离线语音';
}

function getRealtimeMessage(key, role) {
  if (realtimeMessageElements.has(key)) return realtimeMessageElements.get(key);
  const element = addMessage(role, '');
  element.classList.add('streaming');
  realtimeMessageElements.set(key, element);
  return element;
}

function updateRealtimeMessage(key, role, text, append = false) {
  const element = getRealtimeMessage(key, role);
  const paragraph = element.querySelector('p');
  paragraph.textContent = append ? `${paragraph.textContent}${text}` : text;
  messagesElement.scrollTop = messagesElement.scrollHeight;
  return paragraph.textContent.trim();
}

function commitRealtimeMessage(key, role, text, options = {}) {
  const cleaned = String(text || '').trim();
  if (!cleaned || committedRealtimeMessages.has(key)) return;
  committedRealtimeMessages.add(key);
  const element = getRealtimeMessage(key, role);
  element.classList.remove('streaming');
  element.querySelector('p').textContent = cleaned;
  if (options.recordHistory !== false) history.push({ role, content: cleaned });
}

function sendRealtimeEvent(payload) {
  const channel = realtimeSession?.dataChannel;
  if (!channel || channel.readyState !== 'open') return false;
  channel.send(JSON.stringify(payload));
  return true;
}

function setRealtimeOutputEnabled(session, enabled) {
  session.remoteStream?.getAudioTracks().forEach(track => {
    track.enabled = enabled;
  });
}

function interruptRealtimeResponse(session) {
  if (!session || session.closed) return;
  setRealtimeOutputEnabled(session, false);
  if (session.currentResponseId) {
    sendRealtimeEvent({ type: 'response.cancel', response_id: session.currentResponseId });
  }
  if (session.currentOutputItemId && session.outputStartedAt) {
    sendRealtimeEvent({
      type: 'conversation.item.truncate',
      item_id: session.currentOutputItemId,
      content_index: 0,
      audio_end_ms: Math.max(0, Date.now() - session.outputStartedAt)
    });
  }
  session.currentResponseId = '';
  session.currentOutputItemId = '';
  session.outputStartedAt = 0;
  setAssistantState('interrupting', '已打断，正在听你说');
}

function suppressRealtimeModelTurn(session, itemId) {
  if (!session || session.closed) return;
  const hadActiveResponse = Boolean(session.currentResponseId);
  session.suppressNextResponse = !hadActiveResponse;
  clearTimeout(session.suppressResponseTimer);
  if (session.suppressNextResponse) {
    session.suppressResponseTimer = setTimeout(() => {
      session.suppressNextResponse = false;
    }, 2500);
  }
  interruptRealtimeResponse(session);
  setRealtimeOutputEnabled(session, false);
  if (itemId && itemId !== 'current') sendRealtimeEvent({ type: 'conversation.item.delete', item_id: itemId });
}

function clearVoiceSkillConfirmation(options = {}) {
  clearTimeout(pendingVoiceSkillTimer);
  pendingVoiceSkillTimer = undefined;
  const pending = pendingVoiceSkillConfirmation;
  pendingVoiceSkillConfirmation = undefined;
  if (pending && !options.silent) {
    const message = options.message || `已取消“${pending.label}”。`;
    addMessage('assistant', message);
    speakVoiceConfirmation(message);
  }
  return pending;
}

function requestVoiceSkillConfirmation(session, classification) {
  clearVoiceSkillConfirmation({ silent: true });
  pendingVoiceSkillConfirmation = {
    command: classification.command,
    commandType: classification.commandType,
    label: classification.label,
    expiresAt: Date.now() + 15000
  };
  const prompt = `识别到语音命令：${classification.label}。请说“确认”或“取消”。`;
  addMessage('assistant', prompt);
  setAssistantState('listening', '请说确认或取消');
  voiceInputHint.textContent = `待确认：${classification.label} · 15 秒内说“确认”或“取消”`;
  speakVoiceConfirmation(prompt);
  pendingVoiceSkillTimer = setTimeout(() => {
    if (!pendingVoiceSkillConfirmation) return;
    clearVoiceSkillConfirmation({ message: '语音确认已超时，操作未执行。' });
  }, 15000);
}

async function executeConfirmedVoiceSkill(pending) {
  setAssistantState('thinking', '正在执行已确认技能');
  history.push({ role: 'user', content: pending.command });
  try {
    const handled = await handleLocalCommand(pending.command);
    if (!handled) {
      const message = '该语音命令不在本地白名单中，未执行任何操作。';
      addMessage('assistant', message, { error: true });
      history.push({ role: 'assistant', content: message });
      speakVoiceConfirmation(message);
    }
  } catch (error) {
    const message = `语音技能执行失败：${error.message}`;
    addMessage('assistant', message, { error: true });
    history.push({ role: 'assistant', content: message });
    speakVoiceConfirmation(message);
  }
}

function handleVoiceSkillTranscript(session, text, itemId) {
  if (!currentSettings.voiceSkillBridgeEnabled || !window.astraVoiceBridge) return false;
  const classification = window.astraVoiceBridge.classifyVoiceInput(text);

  if (pendingVoiceSkillConfirmation) {
    suppressRealtimeModelTurn(session, itemId);
    if (classification?.type === 'confirmation' && classification.decision === 'confirm') {
      const pending = clearVoiceSkillConfirmation({ silent: true });
      addMessage('assistant', `已确认：${pending.label}。`);
      void executeConfirmedVoiceSkill(pending);
      return true;
    }
    if (classification?.type === 'confirmation' && classification.decision === 'cancel') {
      clearVoiceSkillConfirmation();
      return true;
    }
    showToast('当前有待确认的语音操作，请明确说“确认”或“取消”。', 4200);
    speakVoiceConfirmation('请明确说确认或取消。');
    return true;
  }

  if (classification?.type === 'confirmation') {
    suppressRealtimeModelTurn(session, itemId);
    const message = '当前没有等待确认的语音操作。';
    addMessage('assistant', message);
    speakVoiceConfirmation(message);
    return true;
  }

  if (classification?.type === 'command') {
    suppressRealtimeModelTurn(session, itemId);
    requestVoiceSkillConfirmation(session, classification);
    return true;
  }
  return false;
}

function monitorRealtimeOutput(session) {
  if (!session.remoteAnalyser) return;
  const samples = new Uint8Array(session.remoteAnalyser.fftSize);
  const tick = () => {
    if (realtimeSession !== session || session.closed) return;
    session.remoteAnalyser.getByteTimeDomainData(samples);
    const { level } = window.astraVoice.calculateVoiceLevel(samples);
    setVoiceLevel(level);
    session.remoteAnimationFrame = requestAnimationFrame(tick);
  };
  tick();
}

function handleRealtimeEvent(session, event) {
  if (!event || realtimeSession !== session) return;
  if (/speech|transcription|^response\./.test(event.type)) {
    session.lastActivityAt = Date.now();
    session.lastEventAt = new Date().toISOString();
    if (!session.lastStatusAt || Date.now() - session.lastStatusAt > 2000) {
      session.lastStatusAt = Date.now();
      api.reportRealtimeStatus({
        state: session.state,
        connectionState: session.peerConnection?.connectionState,
        iceConnectionState: session.peerConnection?.iceConnectionState,
        dataChannelState: session.dataChannel?.readyState,
        reconnectAttempts: session.reconnectAttempts ?? realtimeReconnectAttempts,
        handshakeMs: session.handshakeMs,
        connectedAt: session.connectedAt,
        lastEventAt: new Date().toISOString()
      });
    }
  }
  const itemId = event.item_id || event.item?.id || event.response_id || event.response?.id || 'current';
  switch (event.type) {
    case 'session.created':
    case 'session.updated':
      connectionStatus.textContent = '实时语音已连接';
      break;
    case 'input_audio_buffer.speech_started':
      session.state = 'listening';
      interruptRealtimeResponse(session);
      setAssistantState('listening', '正在聆听');
      voiceInputHint.textContent = '实时聆听中，可以随时打断 Astra';
      break;
    case 'input_audio_buffer.speech_stopped':
      session.state = 'thinking';
      setAssistantState('thinking', '正在理解');
      break;
    case 'conversation.item.input_audio_transcription.delta':
      updateRealtimeMessage(`input:${itemId}`, 'user', String(event.delta || ''), true);
      break;
    case 'conversation.item.input_audio_transcription.completed': {
      const key = `input:${itemId}`;
      const text = updateRealtimeMessage(key, 'user', String(event.transcript || ''), false);
      const bridged = handleVoiceSkillTranscript(session, text, itemId);
      commitRealtimeMessage(key, 'user', text, { recordHistory: !bridged });
      break;
    }
    case 'response.created':
      session.state = 'thinking';
      session.currentResponseId = event.response?.id || event.response_id || '';
      if (session.suppressNextResponse) {
        session.suppressNextResponse = false;
        clearTimeout(session.suppressResponseTimer);
        session.suppressedResponseIds ||= new Set();
        if (session.currentResponseId) session.suppressedResponseIds.add(session.currentResponseId);
        sendRealtimeEvent(session.currentResponseId ? { type: 'response.cancel', response_id: session.currentResponseId } : { type: 'response.cancel' });
        setRealtimeOutputEnabled(session, false);
        session.currentResponseId = '';
        return;
      }
      session.outputStartedAt = 0;
      setRealtimeOutputEnabled(session, true);
      setAssistantState('thinking', '正在回应');
      break;
    case 'response.output_item.added':
      if (session.suppressedResponseIds?.has(event.response_id)) break;
      session.currentOutputItemId = event.item?.id || event.item_id || '';
      break;
    case 'response.output_audio_transcript.delta':
      if (session.suppressedResponseIds?.has(event.response_id)) break;
      session.state = 'speaking';
      session.outputStartedAt ||= Date.now();
      setAssistantState('speaking', '正在实时回答');
      updateRealtimeMessage(`output:${itemId}`, 'assistant', String(event.delta || ''), true);
      break;
    case 'response.output_audio_transcript.done': {
      if (session.suppressedResponseIds?.has(event.response_id)) break;
      const key = `output:${itemId}`;
      const text = updateRealtimeMessage(key, 'assistant', String(event.transcript || ''), false);
      commitRealtimeMessage(key, 'assistant', text);
      break;
    }
    case 'response.done':
      session.suppressedResponseIds?.delete(event.response?.id || event.response_id);
      session.currentResponseId = '';
      session.currentOutputItemId = '';
      if (event.response?.status === 'failed') {
        const message = event.response?.status_details?.error?.message || '实时回答失败。';
        reportRealtimeStatus(session, session.state, { lastError: message });
        showToast(message, 5200);
        setAssistantState('idle', '回答失败');
      }
      break;
    case 'response.output_audio.done':
      session.state = 'listening';
      setTimeout(() => {
        if (realtimeSession === session && !session.closed) setAssistantState('listening', '实时聆听中');
      }, 240);
      break;
    case 'conversation.item.input_audio_transcription.failed':
      reportRealtimeStatus(session, session.state, { lastError: event.error?.message || '实时语音转写失败。' });
      showToast(event.error?.message || '实时语音转写失败。', 4200);
      break;
    case 'error':
      reportRealtimeStatus(session, session.state, { lastError: event.error?.message || '实时语音服务返回错误。' });
      showToast(event.error?.message || '实时语音服务返回错误。', 5200);
      break;
    default:
      break;
  }
}

function reportRealtimeStatus(session, state, patch = {}) {
  api.reportRealtimeStatus({
    state,
    connectionState: session?.peerConnection?.connectionState,
    iceConnectionState: session?.peerConnection?.iceConnectionState,
    dataChannelState: session?.dataChannel?.readyState,
    reconnectAttempts: session?.reconnectAttempts ?? realtimeReconnectAttempts,
    handshakeMs: session?.handshakeMs,
    connectedAt: session?.connectedAt,
    lastEventAt: session?.lastEventAt,
    lastError: patch.lastError || ''
  });
}

function armRealtimeSessionLimits(session) {
  const maxMinutes = Number(currentSettings.realtimeMaxMinutes) || 30;
  session.maxTimer = setTimeout(() => {
    if (realtimeSession === session) stopRealtimeVoice('limit');
  }, maxMinutes * 60 * 1000);
  const idleMinutes = Number(currentSettings.realtimeIdleMinutes) || 0;
  if (idleMinutes > 0) {
    session.idleTimer = setInterval(() => {
      if (realtimeSession === session && Date.now() - session.lastActivityAt >= idleMinutes * 60 * 1000) {
        stopRealtimeVoice('idle');
      }
    }, 15000);
  }
  session.durationTimer = setInterval(() => {
    if (realtimeSession !== session || session.state !== 'listening') return;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.handshakeStartedAt) / 1000));
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    voiceInputHint.textContent = `实时聆听中 · ${minutes}:${seconds} · 可以随时打断`;
  }, 1000);
}

function cleanupRealtimeSession(session) {
  if (!session || session.closed) return;
  session.closed = true;
  clearTimeout(session.disconnectTimer);
  clearTimeout(session.connectTimer);
  clearTimeout(session.suppressResponseTimer);
  clearTimeout(session.maxTimer);
  clearInterval(session.idleTimer);
  clearInterval(session.durationTimer);
  if (session.remoteAnimationFrame) cancelAnimationFrame(session.remoteAnimationFrame);
  session.remoteSource?.disconnect();
  session.remoteAudioContext?.close().catch(() => {});
  session.localStream?.getTracks().forEach(track => track.stop());
  session.dataChannel?.close();
  session.peerConnection?.close();
  if (realtimeAudio.srcObject === session.remoteStream) realtimeAudio.srcObject = null;
  stopSpeechPlayback();
  clearVoiceSkillConfirmation({ silent: true });
  if (realtimeSession === session) realtimeSession = undefined;
  setVoiceLevel(0);
  updateRealtimeButton();
  updateRecoveryUi();
}

function reconnectDelay(attempt) {
  return [1000, 3000, 7000][Math.max(0, Math.min(2, attempt - 1))];
}

function scheduleRealtimeReconnect(reason, error) {
  if (realtimeManualStop || !currentSettings.realtimeEnabled || currentSettings.realtimeReconnectEnabled === false || realtimeReconnectAttempts >= 3) {
    reportRealtimeStatus(undefined, 'failed', { lastError: error?.message || reason });
    setAssistantState('idle', '实时语音已回退');
    voiceInputHint.textContent = '实时连接不可用，仍可按住麦克风说话';
    showToast(`实时语音已断开：${error?.message || reason}。已回退到按住说话模式。`, 6200);
    updateRealtimeButton();
    return;
  }
  realtimeReconnectAttempts += 1;
  const delay = reconnectDelay(realtimeReconnectAttempts);
  reportRealtimeStatus(undefined, 'reconnecting', { lastError: error?.message || reason });
  setAssistantState('thinking', `正在重连 ${realtimeReconnectAttempts}/3`);
  voiceInputHint.textContent = `${Math.ceil(delay / 1000)} 秒后尝试恢复实时语音`;
  showToast(`实时连接中断，正在进行第 ${realtimeReconnectAttempts} 次重连。`, 3200);
  realtimeReconnectTimer = setTimeout(() => {
    realtimeReconnectTimer = undefined;
    startRealtimeVoice({ automatic: true, reconnecting: true });
  }, delay);
  updateRealtimeButton();
}

function handleRealtimeDisconnect(session, reason, error) {
  if (!session || session.disconnectHandled || realtimeSession !== session) return;
  session.disconnectHandled = true;
  cleanupRealtimeSession(session);
  scheduleRealtimeReconnect(reason, error);
}

function stopRealtimeVoice(reason = 'manual') {
  realtimeManualStop = true;
  realtimeConnectAttempt += 1;
  clearTimeout(realtimeReconnectTimer);
  realtimeReconnectTimer = undefined;
  const session = realtimeSession;
  if (session) cleanupRealtimeSession(session);
  realtimeReconnectAttempts = 0;
  setAssistantState('idle', '随时待命');
  connectionStatus.textContent = currentSettings.endpoint && currentSettings.apiKeyConfigured ? '配置已就绪' : '离线模式';
  reportRealtimeStatus(undefined, 'idle');
  if (reason === 'manual') showToast('实时通话已结束。');
  if (reason === 'idle') showToast('实时通话长时间无活动，已自动结束。', 5200);
  if (reason === 'limit') showToast('已达到单次实时通话时长上限，连接已安全关闭。', 5200);
  updateRealtimeButton();
  updateRecoveryUi();
}

async function selectedInputDeviceId() {
  const configured = currentSettings.realtimeInputDeviceId || '';
  if (!configured || !navigator.mediaDevices?.enumerateDevices) return '';
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'audioinput' && device.deviceId === configured) ? configured : '';
  } catch {
    return '';
  }
}

async function applyRealtimeOutputDevice() {
  if (typeof realtimeAudio.setSinkId !== 'function') return;
  try {
    await realtimeAudio.setSinkId(currentSettings.realtimeOutputDeviceId || '');
  } catch {
    await realtimeAudio.setSinkId('').catch(() => {});
    showToast('所选扬声器不可用，已切换到系统默认设备。', 4200);
  }
}

async function startRealtimeVoice(options = {}) {
  if (realtimeSession) {
    if (!options.automatic) stopRealtimeVoice('manual');
    return;
  }
  clearTimeout(realtimeReconnectTimer);
  realtimeReconnectTimer = undefined;
  if (!options.reconnecting) realtimeReconnectAttempts = 0;
  realtimeManualStop = false;
  if (!currentSettings.realtimeEnabled || !currentSettings.endpoint || !currentSettings.apiKeyConfigured) {
    showToast('请先在设置中开启实时语音并配置支持 Realtime API 的服务。', 5200);
    return;
  }
  if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
    showToast('当前环境不支持 WebRTC，已保留按住说话模式。', 5200);
    return;
  }

  const attempt = ++realtimeConnectAttempt;
  const now = Date.now();
  const session = { state: options.reconnecting ? 'reconnecting' : 'connecting', closed: false, handshakeStartedAt: now, lastActivityAt: now };
  realtimeSession = session;
  session.connectTimer = setTimeout(() => {
    if (realtimeSession === session && session.dataChannel?.readyState !== 'open') handleRealtimeDisconnect(session, '实时连接超时');
  }, 25000);
  reportRealtimeStatus(session, session.state);
  stopSpeechPlayback();
  stopFallbackRecognition();
  if (voiceSession) stopOnlineVoice('realtime');
  setAssistantState('thinking', options.reconnecting ? `正在重连 ${realtimeReconnectAttempts}/3` : '正在连接实时语音');
  voiceInputHint.textContent = '正在建立低延迟音频通道…';
  updateRealtimeButton();

  try {
    const inputDeviceId = await selectedInputDeviceId();
    session.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(inputDeviceId ? { deviceId: { exact: inputDeviceId } } : {})
      },
      video: false
    });
    if (attempt !== realtimeConnectAttempt || realtimeSession !== session) {
      session.localStream.getTracks().forEach(track => track.stop());
      return;
    }

    const peerConnection = new RTCPeerConnection();
    session.peerConnection = peerConnection;
    session.localStream.getTracks().forEach(track => {
      track.addEventListener('ended', () => handleRealtimeDisconnect(session, '麦克风已断开'));
      peerConnection.addTrack(track, session.localStream);
    });
    const dataChannel = peerConnection.createDataChannel('oai-events');
    session.dataChannel = dataChannel;
    dataChannel.addEventListener('open', () => {
      if (realtimeSession !== session) return;
      session.state = 'listening';
      clearTimeout(session.connectTimer);
      session.connectedAt = new Date().toISOString();
      session.lastEventAt = session.connectedAt;
      session.handshakeMs = Date.now() - session.handshakeStartedAt;
      session.lastActivityAt = Date.now();
      session.reconnectAttempts = realtimeReconnectAttempts;
      realtimeReconnectAttempts = 0;
      connectionStatus.textContent = '实时语音已连接';
      setAssistantState('listening', '实时聆听中');
      voiceInputHint.textContent = '实时聆听中，可以边说边回应并自然打断';
      reportRealtimeStatus(session, 'listening');
      api.recordCompanionEvent({ type: 'voice' }).catch(() => {});
      armRealtimeSessionLimits(session);
      updateRealtimeButton();
    });
    dataChannel.addEventListener('message', messageEvent => {
      try {
        handleRealtimeEvent(session, JSON.parse(messageEvent.data));
      } catch {
        // Ignore malformed provider events without ending the audio call.
      }
    });
    dataChannel.addEventListener('close', () => {
      if (realtimeSession === session && !session.closed) handleRealtimeDisconnect(session, '数据通道已关闭');
    });
    peerConnection.addEventListener('track', event => {
      if (realtimeSession !== session) return;
      session.remoteStream = event.streams[0] || new MediaStream([event.track]);
      realtimeAudio.srcObject = session.remoteStream;
      applyRealtimeOutputDevice().finally(() => realtimeAudio.play().catch(() => {}));
      if (!session.remoteAudioContext) {
        session.remoteAudioContext = new AudioContext();
        session.remoteAnalyser = session.remoteAudioContext.createAnalyser();
        session.remoteAnalyser.fftSize = 512;
        session.remoteSource = session.remoteAudioContext.createMediaStreamSource(session.remoteStream);
        session.remoteSource.connect(session.remoteAnalyser);
        session.remoteAudioContext.resume().catch(() => {});
        monitorRealtimeOutput(session);
      }
    });
    peerConnection.addEventListener('connectionstatechange', () => {
      if (realtimeSession !== session || session.closed) return;
      reportRealtimeStatus(session, session.state);
      if (peerConnection.connectionState === 'connected') {
        clearTimeout(session.disconnectTimer);
        connectionStatus.textContent = '实时语音已连接';
      }
      if (peerConnection.connectionState === 'disconnected') {
        clearTimeout(session.disconnectTimer);
        session.disconnectTimer = setTimeout(() => {
          if (peerConnection.connectionState === 'disconnected') handleRealtimeDisconnect(session, '网络连接暂时中断');
        }, 1800);
      }
      if (peerConnection.connectionState === 'failed') handleRealtimeDisconnect(session, 'WebRTC 连接失败');
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const answer = await api.createRealtimeCall({ sdp: peerConnection.localDescription?.sdp || offer.sdp });
    if (realtimeSession !== session) return;
    await peerConnection.setRemoteDescription({ type: 'answer', sdp: answer.sdp });
  } catch (error) {
    if (realtimeSession === session) handleRealtimeDisconnect(session, '连接建立失败', error);
  }
}

function cleanupVoiceSession(session) {
  if (session.cleaned) return;
  session.cleaned = true;
  if (session.animationFrame) cancelAnimationFrame(session.animationFrame);
  session.source?.disconnect();
  session.audioContext?.close().catch(() => {});
  session.stream.getTracks().forEach(track => track.stop());
  if (voiceSession === session) voiceSession = undefined;
  micButton.classList.remove('active');
  setVoiceLevel(0);
}

function encodeMonoWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset, text) => [...text].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, value < 0 ? value * 32768 : value * 32767, true);
  }
  return buffer;
}

async function blobToOfflineWav(blob) {
  const sourceContext = new AudioContext();
  try {
    const decoded = await sourceContext.decodeAudioData(await blob.arrayBuffer());
    const length = Math.ceil(decoded.duration * 16000);
    const offline = new OfflineAudioContext(1, Math.max(1, length), 16000);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return encodeMonoWav(rendered.getChannelData(0), 16000);
  } finally {
    await sourceContext.close().catch(() => {});
  }
}

async function handleRecordedVoice(session) {
  if (session.failed) return;
  const blob = new Blob(session.chunks, { type: session.mimeType });
  cleanupVoiceSession(session);
  if (blob.size < 800 || Date.now() - session.startedAt < 250) {
    setAssistantState('idle', '随时待命');
    showToast('录音太短，请按住麦克风说完后再松开。');
    updateRecoveryUi();
    return;
  }

  setAssistantState('thinking', '正在识别语音');
  voiceTranscribing = true;
  voiceInputHint.textContent = '正在进行语音转写…';
  try {
    const onlineReady = Boolean(currentSettings.endpoint && currentSettings.apiKeyConfigured);
    const result = onlineReady
      ? await api.transcribeAudio({ audio: await blob.arrayBuffer(), mimeType: blob.type || session.mimeType })
      : offlineVoiceState.ready
        ? await api.transcribeOfflineAudio({ audio: await blobToOfflineWav(blob), mimeType: 'audio/wav' })
        : (() => { throw new Error('未配置在线转写或本地 Whisper。'); })();
    messageInput.value = result.text;
    api.recordCompanionEvent({ type: 'voice' }).catch(() => {});
    await sendMessage(result.text);
  } catch (error) {
    setAssistantState('idle', '识别失败');
    showToast(`语音识别失败：${error.message}`, 5200);
  } finally {
    voiceTranscribing = false;
    updateRecoveryUi();
  }
}

function monitorVoiceLevel(session) {
  const samples = new Uint8Array(session.analyser.fftSize);
  const tick = () => {
    if (voiceSession !== session) return;
    session.analyser.getByteTimeDomainData(samples);
    const { rms, level } = window.astraVoice.calculateVoiceLevel(samples);
    setVoiceLevel(level);
    const now = Date.now();
    if (rms > 0.025) {
      session.heardVoice = true;
      session.lastVoiceAt = now;
    }
    const stopReason = window.astraVoice.voiceStopReason({ now, startedAt: session.startedAt, heardVoice: session.heardVoice, lastVoiceAt: session.lastVoiceAt });
    if (stopReason === 'limit') {
      voicePressActive = false;
      showToast('单次录音最长 30 秒，已自动开始识别。');
      stopOnlineVoice('limit');
      return;
    }
    if (stopReason === 'silence') {
      voicePressActive = false;
      stopOnlineVoice('silence');
      return;
    }
    session.animationFrame = requestAnimationFrame(tick);
  };
  tick();
}

function stopOnlineVoice(reason = 'release') {
  const session = voiceSession;
  if (!session || session.recorder.state === 'inactive') return;
  session.stopReason = reason;
  try {
    session.recorder.requestData();
  } catch {
    // Some MediaRecorder implementations flush automatically on stop.
  }
  session.recorder.stop();
}

async function startOnlineVoice() {
  if (voiceSession || voiceTranscribing || busy) return;
  stopSpeechPlayback();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false
    });
    if (!voicePressActive) {
      stream.getTracks().forEach(track => track.stop());
      setAssistantState('idle', '随时待命');
      return;
    }
    const mimeType = selectRecorderMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    const audioContext = new AudioContext();
    await audioContext.resume();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const session = {
      stream,
      recorder,
      audioContext,
      analyser,
      source,
      mimeType: recorder.mimeType || mimeType || 'audio/webm',
      chunks: [],
      startedAt: Date.now(),
      lastVoiceAt: Date.now(),
      heardVoice: false,
      animationFrame: 0
    };
    voiceSession = session;
    recorder.ondataavailable = event => {
      if (event.data.size) session.chunks.push(event.data);
    };
    recorder.onerror = event => {
      session.failed = true;
      cleanupVoiceSession(session);
      setAssistantState('idle', '录音失败');
      showToast(`录音失败：${event.error?.message || '未知错误'}`);
    };
    recorder.onstop = () => handleRecordedVoice(session);
    recorder.start(200);
    micButton.classList.add('active');
    setAssistantState('listening', '正在聆听');
    voiceInputHint.textContent = '正在录音，松开或保持静音即可发送';
    monitorVoiceLevel(session);
  } catch (error) {
    stream?.getTracks().forEach(track => track.stop());
    micButton.classList.remove('active');
    setAssistantState('idle', '麦克风不可用');
    showToast(`无法使用麦克风：${error.message}`, 5200);
  }
}

function startFallbackRecognition() {
  if (!speechRecognition || fallbackRecognitionRequested || fallbackRecognitionActive || voiceTranscribing || busy) {
    if (!speechRecognition) showToast('当前系统不支持语音识别，请配置在线转写或使用文字输入。');
    return;
  }
  stopSpeechPlayback();
  messageInput.value = '';
  try {
    fallbackRecognitionRequested = true;
    speechRecognition.start();
  } catch (error) {
    fallbackRecognitionRequested = false;
    showToast(`系统语音识别启动失败：${error.message}`);
  }
}

function stopFallbackRecognition() {
  if (!speechRecognition || (!fallbackRecognitionRequested && !fallbackRecognitionActive)) return;
  try {
    speechRecognition.stop();
  } catch {
    // Recognition may already be stopping.
  }
}

function startVoiceInput() {
  if (realtimeSession) {
    showToast('实时通话进行中，无需按住麦克风。');
    return;
  }
  if ((currentSettings.endpoint && currentSettings.apiKeyConfigured || offlineVoiceState.ready) && navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window) {
    startOnlineVoice();
    return;
  }
  startFallbackRecognition();
}

function stopVoiceInput() {
  if (voiceSession) stopOnlineVoice('release');
  else stopFallbackRecognition();
}

function setupVoiceInput() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (Recognition) {
    speechRecognition = new Recognition();
    speechRecognition.lang = 'zh-CN';
    speechRecognition.interimResults = true;
    speechRecognition.continuous = false;
    speechRecognition.onstart = () => {
      fallbackRecognitionRequested = false;
      fallbackRecognitionActive = true;
      micButton.classList.add('active');
      setAssistantState('listening', '正在聆听');
      if (!voicePressActive) stopFallbackRecognition();
    };
    speechRecognition.onresult = event => {
      messageInput.value = Array.from(event.results).map(result => result[0].transcript).join('');
    };
    speechRecognition.onend = () => {
      fallbackRecognitionRequested = false;
      fallbackRecognitionActive = false;
      micButton.classList.remove('active');
      setAssistantState('idle', '随时待命');
      if (messageInput.value.trim()) sendMessage(messageInput.value);
    };
    speechRecognition.onerror = event => {
      fallbackRecognitionRequested = false;
      fallbackRecognitionActive = false;
      micButton.classList.remove('active');
      setAssistantState('idle', '识别失败');
      if (event.error !== 'aborted') showToast('系统语音识别不可用，请检查麦克风权限或配置在线转写。');
    };
  }

  micButton.addEventListener('pointerdown', event => {
    if (event.button !== 0 || voicePressActive) return;
    event.preventDefault();
    voicePressActive = true;
    micButton.setPointerCapture?.(event.pointerId);
    startVoiceInput();
  });
  const releasePointer = event => {
    if (!voicePressActive) return;
    event.preventDefault();
    voicePressActive = false;
    stopVoiceInput();
  };
  micButton.addEventListener('pointerup', releasePointer);
  micButton.addEventListener('pointercancel', releasePointer);
  micButton.addEventListener('keydown', event => {
    if (![' ', 'Enter'].includes(event.key) || event.repeat || voicePressActive) return;
    event.preventDefault();
    voicePressActive = true;
    startVoiceInput();
  });
  micButton.addEventListener('keyup', event => {
    if (![' ', 'Enter'].includes(event.key) || !voicePressActive) return;
    event.preventDefault();
    voicePressActive = false;
    stopVoiceInput();
  });
  realtimeButton.addEventListener('click', () => {
    if (realtimeSession || realtimeReconnectTimer) stopRealtimeVoice('manual');
    else startRealtimeVoice();
  });
  refreshAudioDevicesButton.addEventListener('click', () => refreshAudioDevices({ requestPermission: true }));
  navigator.mediaDevices?.addEventListener?.('devicechange', async () => {
    await refreshAudioDevices();
    if (realtimeSession) handleRealtimeDisconnect(realtimeSession, '音频设备发生变化');
  });
}

const WORKFLOW_ACTION_OPTIONS = [
  { value: '', label: '不添加', action: null },
  { value: 'calculator', label: '打开计算器', action: { type: 'open-tool', id: 'calculator' } },
  { value: 'notepad', label: '打开记事本', action: { type: 'open-tool', id: 'notepad' } },
  { value: 'downloads', label: '打开下载目录', action: { type: 'open-tool', id: 'downloads' } },
  { value: 'vscode', label: '打开 VS Code', action: { type: 'open-app', id: 'vscode' } },
  { value: 'volume30', label: '音量设置为 30%', action: { type: 'set-volume', value: 30 } },
  { value: 'focus25', label: '开始 25 分钟专注', action: { type: 'start-focus', minutes: 25 } },
  { value: 'work', label: '切换工作模式', action: { type: 'set-scenario', id: 'work' } },
  { value: 'leisure', label: '切换休闲模式', action: { type: 'set-scenario', id: 'leisure' } },
  { value: 'mini', label: '切换迷你桌宠', action: { type: 'set-window-mode', id: 'mini' } },
  { value: 'summary', label: '显示今日摘要', action: { type: 'show-summary' } }
];

function populateWorkflowActionSelect(select, includeEmpty = true) {
  select.replaceChildren();
  for (const item of WORKFLOW_ACTION_OPTIONS.filter(option => includeEmpty || option.value)) {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    select.append(option);
  }
}

function formatByteCount(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes >= 1024 ** 3) return `${Math.round(bytes / 1024 ** 3 * 10) / 10} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

async function selectManagedModel(item) {
  localAiState = await api.selectManagedModel(item.id);
  offlineVoiceState = await api.getOfflineVoice();
  renderOfflineVoiceCenter();
  renderLocalAiCenter();
  showToast(`已选择 ${item.label}。`);
}

function renderModelManager() {
  const recommended = localAiState.profiles?.find(item => item.value === localAiState.recommendedProfile)?.label || '均衡模式';
  modelDeploymentSummary.textContent = `${localAiState.systemMemoryGb || '?'} GB 内存，建议${recommended} · 模型目录剩余 ${formatByteCount(localAiState.availableDiskBytes)}`;
  modelCatalog.replaceChildren();
  const download = localAiState.download || {};
  const activeStates = ['starting', 'downloading', 'resuming', 'pausing', 'verifying', 'cancelling'];
  for (const item of localAiState.catalog || []) {
    const card = document.createElement('article');
    card.className = `model-card${item.kind === 'chat' && item.profile === localAiState.recommendedProfile ? ' recommended' : ''}`;
    const info = document.createElement('span');
    const name = document.createElement('b');
    name.textContent = `${item.label}${item.kind === 'chat' && item.profile === localAiState.recommendedProfile ? ' · 推荐' : ''}`;
    const detail = document.createElement('small');
    detail.textContent = `${item.description} 下载 ${item.sizeLabel} · 预计内存 ${item.estimatedMemoryLabel} · ${item.license}`;
    info.append(name, detail);
    const actions = document.createElement('span');
    actions.className = 'model-card-actions';
    const action = document.createElement('button');
    action.type = 'button';
    const downloadingThis = download.modelId === item.id && activeStates.includes(download.state);
    action.disabled = item.selected || downloadingThis || (activeStates.includes(download.state) && download.modelId !== item.id);
    action.textContent = downloadingThis ? '处理中…' : item.selected ? '已选择' : item.installed ? '使用模型' : download.modelId === item.id && ['paused', 'failed'].includes(download.state) ? '继续下载' : '下载';
    action.addEventListener('click', async () => {
      try {
        if (item.installed) return selectManagedModel(item);
        if (download.modelId === item.id && ['paused', 'failed'].includes(download.state)) {
          await api.resumeManagedModelDownload(item.id);
          return;
        }
        if (!confirm(`下载“${item.label}”？\n\n文件：${item.fileName}\n大小：${item.sizeLabel}\n预计内存：${item.estimatedMemoryLabel}\n协议：${item.license}\n\n下载后将自动校验 SHA256 并设置为本地模型。`)) return;
        await api.downloadManagedModel(item.id);
      } catch (error) { showToast(error.message, 6200); }
    });
    actions.append(action);
    if (item.installed) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '删除';
      remove.addEventListener('click', async () => {
        if (!confirm(`删除 Astra 模型目录中的“${item.fileName}”？`)) return;
        try {
          localAiState = await api.deleteManagedModel(item.id);
          offlineVoiceState = await api.getOfflineVoice();
          renderLocalAiCenter();
          renderOfflineVoiceCenter();
          showToast('模型已删除。');
        } catch (error) { showToast(error.message, 5200); }
      });
      actions.append(remove);
    }
    card.append(info, actions);
    modelCatalog.append(card);
  }
  const showDownload = Boolean(download.modelId && download.state && download.state !== 'idle');
  modelDownloadPanel.classList.toggle('hidden', !showDownload);
  if (showDownload) {
    const percent = download.totalBytes ? Math.min(100, Math.round(download.receivedBytes / download.totalBytes * 1000) / 10) : 0;
    const stateLabels = { starting: '准备下载', downloading: '正在下载', resuming: '正在续传', pausing: '正在暂停', paused: '已暂停', verifying: '正在校验 SHA256', completed: '下载完成并已配置', cancelling: '正在取消', cancelled: '已取消', failed: '下载失败' };
    modelDownloadStatus.textContent = `${stateLabels[download.state] || download.state}${download.speedBytesPerSecond ? ` · ${formatByteCount(download.speedBytesPerSecond)}/秒` : ''}${download.error ? ` · ${download.error}` : ''}`;
    modelDownloadPercent.textContent = `${percent}% · ${formatByteCount(download.receivedBytes)} / ${formatByteCount(download.totalBytes)}`;
    modelDownloadProgress.value = percent;
    pauseModelDownloadButton.disabled = !['starting', 'downloading', 'resuming'].includes(download.state);
    resumeModelDownloadButton.disabled = !['paused', 'failed'].includes(download.state);
    cancelModelDownloadButton.disabled = !['starting', 'downloading', 'resuming', 'pausing', 'paused', 'failed'].includes(download.state);
  }
  const selectedManaged = (localAiState.catalog || []).find(item => item.selected);
  deleteManagedModelButton.disabled = !selectedManaged;
  deleteManagedModelButton.dataset.modelId = selectedManaged?.id || '';
}

function renderLocalAiCenter() {
  const settings = localAiState.settings || {};
  localAiEnabledInput.checked = settings.enabled === true;
  localAiModeInput.value = settings.mode || 'auto';
  localAiThreadsInput.value = String(settings.threads || 4);
  localAiGpuInput.value = String(settings.gpuLayers || 0);
  localAiRuntimeInput.value = settings.runtimePath || '';
  localAiModelInput.value = settings.modelPath || '';
  localAiMmprojInput.value = settings.mmprojPath || '';
  localAiProfileInput.replaceChildren();
  for (const profile of localAiState.profiles || []) {
    const option = document.createElement('option');
    option.value = profile.value;
    option.textContent = `${profile.label} · ${profile.description}`;
    localAiProfileInput.append(option);
  }
  localAiProfileInput.value = settings.profile || 'balanced';
  const labels = { stopped: '已停止', starting: '正在启动', restarting: '正在恢复', ready: '运行中', failed: '启动失败' };
  const recommendation = localAiState.profiles?.find(item => item.value === localAiState.recommendedProfile)?.label || '均衡模式';
  localAiStatus.textContent = localAiState.ready ? `${labels[localAiState.runtime?.state] || '已配置'} · ${localAiState.visionReady ? '支持本地图片' : '仅文字'} · ${localAiState.systemMemoryGb} GB 内存建议${recommendation}` : `内置运行时已就绪，请选择 GGUF 模型 · ${localAiState.systemMemoryGb || '?'} GB 内存建议${recommendation}`;
  if (localAiState.runtime?.error) localAiStatus.title = localAiState.runtime.error;
  const phaseLabels = { stopped: '模型尚未启动', 'checking-resources': '正在检查模型和内存', 'loading-model': '正在加载模型', 'allocating-memory': '正在分配模型内存', 'waiting-health': '正在等待本地服务', 'diagnosing-template': '正在诊断聊天模板', 'warming-up': '正在预热模型', restarting: '模型异常，正在自动恢复', ready: '模型已预热并可用', failed: '模型启动失败' };
  const compatibility = localAiState.compatibility || {};
  const runtime = localAiState.runtime || {};
  const details = [phaseLabels[runtime.phase] || phaseLabels[runtime.state] || '模型状态未知'];
  if (runtime.activePort) details.push(`端口 ${runtime.activePort}`);
  if (runtime.startupTimeoutMs) details.push(`启动等待上限 ${Math.round(runtime.startupTimeoutMs / 1000)} 秒`);
  if (compatibility.estimatedMemoryBytes) details.push(`预计内存 ${formatByteCount(compatibility.estimatedMemoryBytes)}`);
  if (compatibility.warning) details.push(compatibility.warning);
  if (runtime.error || localAiState.runtimeRecord?.lastError) details.push(`最近错误：${runtime.error || localAiState.runtimeRecord.lastError}`);
  localAiRuntimeDetails.textContent = details.join(' · ');
  if (localAiState.setupWizardRecommended) modelDeploymentPanel.classList.remove('hidden');
  renderModelManager();
}

function renderOfflineVoiceCenter() {
  const settings = offlineVoiceState.settings || {};
  offlineVoiceEnabledInput.checked = settings.enabled === true;
  offlineVoiceRuntimeInput.value = settings.runtimePath || '';
  offlineVoiceModelInput.value = settings.modelPath || '';
  offlineVoiceStatus.textContent = offlineVoiceState.ready ? '已就绪 · 录音只在本机转写' : '尚未完成运行时和模型配置';
  updateRecoveryUi();
}

function renderKnowledgeCenter() {
  knowledgeList.replaceChildren();
  for (const documentEntry of knowledgeState.documents || []) {
    const row = document.createElement('div');
    row.className = 'knowledge-row';
    const info = document.createElement('span');
    const name = document.createElement('b');
    name.textContent = documentEntry.name;
    const detail = document.createElement('small');
    detail.textContent = `${Math.ceil(documentEntry.text.length / 1000)} 千字符 · ${new Date(documentEntry.importedAt).toLocaleDateString('zh-CN')}`;
    info.append(name, detail);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '删除';
    remove.addEventListener('click', async () => {
      knowledgeState = await api.removeKnowledge(documentEntry.id);
      renderKnowledgeCenter();
    });
    row.append(info, remove);
    knowledgeList.append(row);
  }
  if (!knowledgeList.children.length) knowledgeList.textContent = '尚未导入本地知识文件。';
}

function applyScenarioState(state, applyWindow = false) {
  scenarioStoreState = state || scenarioStoreState;
  document.body.dataset.scenario = scenarioStoreState.active || 'normal';
  scenarioSelect.replaceChildren();
  for (const optionItem of scenarioStoreState.options || []) {
    const option = document.createElement('option');
    option.value = optionItem.value;
    option.textContent = optionItem.label;
    scenarioSelect.append(option);
  }
  scenarioSelect.value = scenarioStoreState.active || 'normal';
  scenarioAutomaticInput.checked = scenarioStoreState.automatic === true;
  if (applyWindow && scenarioStoreState.definition?.preferredWindowMode) api.setWindowMode(scenarioStoreState.definition.preferredWindowMode).catch(() => {});
  const resting = restingAssistantState();
  setAssistantState(resting.state, scenarioStoreState.definition?.label || resting.label, { force: true });
}

function workflowActionLabel(action) {
  return WORKFLOW_ACTION_OPTIONS.find(item => item.action && JSON.stringify(item.action) === JSON.stringify(action))?.label || action.type;
}

function renderWorkflowCenter() {
  workflowList.replaceChildren();
  for (const workflow of workflowState.workflows || []) {
    const row = document.createElement('article');
    row.className = 'workflow-row';
    const info = document.createElement('span');
    const name = document.createElement('b');
    name.textContent = workflow.name;
    const detail = document.createElement('small');
    detail.textContent = workflow.actions.map(workflowActionLabel).join(' → ');
    info.append(name, detail);
    const actions = document.createElement('span');
    const run = document.createElement('button');
    run.type = 'button'; run.textContent = '运行';
    run.addEventListener('click', async () => {
      let result = await api.runWorkflow(workflow.id, false);
      if (result.confirmationRequired) {
        const confirmed = confirm(`运行“${workflow.name}”？\n\n${workflow.actions.map((action, index) => `${index + 1}. ${workflowActionLabel(action)}`).join('\n')}`);
        if (!confirmed) return;
        result = await api.runWorkflow(workflow.id, true);
      }
      showToast(result.ok ? `工作流“${workflow.name}”已完成。` : '工作流未执行。');
    });
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = '删除';
    remove.addEventListener('click', async () => { const result = await api.removeWorkflow(workflow.id); workflowState = result.state; renderWorkflowCenter(); });
    actions.append(run, remove);
    row.append(info, actions);
    workflowList.append(row);
  }
  if (!workflowList.children.length) workflowList.textContent = '尚未创建白名单工作流。';
}

async function refreshIntelligenceCenter() {
  [localAiState, offlineVoiceState, knowledgeState, scenarioStoreState, workflowState] = await Promise.all([
    api.getLocalAi(), api.getOfflineVoice(), api.getKnowledge(), api.getScenario(), api.getWorkflows()
  ]);
  renderLocalAiCenter();
  renderOfflineVoiceCenter();
  renderKnowledgeCenter();
  applyScenarioState(scenarioStoreState);
  renderWorkflowCenter();
}

async function openIntelligenceCenter() {
  [settingsOverlay, appsOverlay, skillsOverlay, memoryOverlay, plannerOverlay, companionOverlay, focusOverlay].forEach(element => element.classList.add('hidden'));
  intelligenceOverlay.classList.remove('hidden');
  try {
    await refreshIntelligenceCenter();
  } catch (error) {
    showToast(`读取本地智能设置失败：${error.message}`, 5200);
  }
}

function closeIntelligenceCenter() {
  intelligenceOverlay.classList.add('hidden');
}

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  sendMessage(messageInput.value);
});
messageInput.addEventListener('input', () => {
  resizeMessageInput();
  messageHistoryIndex = sentMessageHistory.length;
  commandPaletteIndex = 0;
  renderCommandPalette();
});
messageInput.addEventListener('keydown', event => {
  if (event.isComposing || event.keyCode === 229) return;
  if (!commandPalette.classList.contains('hidden') && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    const offset = event.key === 'ArrowUp' ? -1 : 1;
    commandPaletteIndex = (commandPaletteIndex + offset + visibleCommandItems.length) % visibleCommandItems.length;
    renderCommandPalette();
    return;
  }
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (!commandPalette.classList.contains('hidden') && visibleCommandItems[commandPaletteIndex]) {
      executeCommandItem(visibleCommandItems[commandPaletteIndex]).catch(error => showToast(error.message, 4200));
    } else {
      sendMessage(messageInput.value);
    }
    return;
  }
  if (event.key === 'ArrowUp' && commandPalette.classList.contains('hidden') && messageInput.selectionStart === 0) {
    const selection = interaction.historySelection(sentMessageHistory, messageHistoryIndex, -1);
    if (selection.index >= 0) {
      event.preventDefault();
      messageHistoryIndex = selection.index;
      messageInput.value = selection.value;
      resizeMessageInput();
      messageInput.setSelectionRange(0, 0);
    }
    return;
  }
  if (event.key === 'ArrowDown' && commandPalette.classList.contains('hidden') && messageInput.selectionEnd === messageInput.value.length) {
    const selection = interaction.historySelection(sentMessageHistory, messageHistoryIndex, 1);
    if (selection.index >= 0) {
      event.preventDefault();
      messageHistoryIndex = selection.index;
      messageInput.value = selection.value;
      resizeMessageInput();
      messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
    }
  }
});
stopGenerationButton.addEventListener('click', () => cancelActiveChatGeneration());

quickWheel.addEventListener('click', event => {
  const button = event.target.closest('button[data-wheel-action]');
  if (!button) return;
  executeQuickWheelAction(button.dataset.wheelAction).catch(error => showToast(error.message, 4200));
});
document.addEventListener('pointerdown', event => {
  if (quickWheelOpen && !quickWheel.contains(event.target) && !avatar.contains(event.target)) closeQuickWheel();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (quickWheelOpen) return closeQuickWheel();
  if (!commandPalette.classList.contains('hidden')) return hideCommandPalette();
  if (activeChatRequestId) return cancelActiveChatGeneration();
  if (!intelligenceOverlay.classList.contains('hidden')) return closeIntelligenceCenter();
  if (!settingsOverlay.classList.contains('hidden')) return closeSettings();
  if (!appsOverlay.classList.contains('hidden')) return closeApps();
  if (!skillsOverlay.classList.contains('hidden')) return closeSkills();
  if (!memoryOverlay.classList.contains('hidden')) return closeMemory();
  if (!plannerOverlay.classList.contains('hidden')) return closePlanner();
  if (!companionOverlay.classList.contains('hidden')) return closeCompanion();
  if (!focusOverlay.classList.contains('hidden')) focusOverlay.classList.add('hidden');
});

api.onChatStreamEvent(payload => {
  if (!payload || payload.requestId !== activeChatRequestId || !activeChatMessage) return;
  const paragraph = activeChatMessage.querySelector('p');
  if (payload.type === 'started') {
    connectionStatus.textContent = payload.mode === 'online' ? '在线 AI' : payload.mode === 'local' ? '本地 AI · 流式生成' : '离线基础模式';
    return;
  }
  if (payload.type === 'delta') {
    activeChatMessage.classList.remove('pending');
    activeChatText += String(payload.text || '');
    activeChatMetrics = payload.metrics || activeChatMetrics;
    paragraph.textContent = activeChatText;
    updateChatMessageMetrics(activeChatMessage, activeChatMetrics);
    messagesElement.scrollTop = messagesElement.scrollHeight;
    setAssistantState('speaking', '正在生成');
    return;
  }
  if (payload.type === 'done') {
    activeChatMessage.classList.remove('pending', 'streaming');
    activeChatText = String(payload.text || activeChatText).trim();
    paragraph.textContent = activeChatText;
    activeChatMetrics = payload.metrics || activeChatMetrics;
    updateChatMessageMetrics(activeChatMessage, activeChatMetrics);
    if (activeChatText) {
      history.push({ role: 'assistant', content: activeChatText });
      speak(activeChatText);
    }
    connectionStatus.textContent = payload.mode === 'online' ? '在线 AI' : payload.mode?.startsWith('local') ? '本地 AI' : '离线基础模式';
    activeChatCompletionResolve?.();
    return;
  }
  if (payload.type === 'cancelled') {
    activeChatMessage.classList.remove('pending', 'streaming');
    if (!activeChatText) paragraph.textContent = '已停止生成。';
    updateChatMessageMetrics(activeChatMessage, activeChatMetrics, '已停止');
    setAssistantState('idle', '已停止生成');
    activeChatCompletionResolve?.();
    return;
  }
  if (payload.type === 'error') {
    activeChatMessage.classList.remove('pending', 'streaming');
    activeChatMessage.classList.add('error');
    const errorText = String(payload.error || '对话失败。');
    if (!activeChatText) paragraph.textContent = `连接失败：${errorText}`;
    updateChatMessageMetrics(activeChatMessage, activeChatMetrics, errorText);
    setAssistantState('idle', '连接失败');
    activeChatCompletionResolve?.();
  }
});

document.querySelectorAll('[data-tool]').forEach(button => {
  button.addEventListener('click', () => runTool(button.dataset.tool, button.textContent.trim()));
});

document.querySelector('#appsButton').addEventListener('click', openApps);
document.querySelector('#appsCloseButton').addEventListener('click', closeApps);
document.querySelector('#manageAppsButton').addEventListener('click', openApps);
document.querySelector('#skillsButton').addEventListener('click', openSkills);
document.querySelector('#skillsCloseButton').addEventListener('click', closeSkills);
document.querySelector('#memoryButton').addEventListener('click', openMemory);
document.querySelector('#memoryCloseButton').addEventListener('click', closeMemory);
document.querySelector('#manageMemoryButton').addEventListener('click', openMemory);
document.querySelector('#plannerButton').addEventListener('click', openPlanner);
document.querySelector('#focusButton').addEventListener('click', async () => { focusOverlay.classList.remove('hidden'); focusState = await api.getFocus(); renderFocus(); });
document.querySelector('#focusCloseButton').addEventListener('click', () => focusOverlay.classList.add('hidden'));
document.querySelector('#imageButton').addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', async () => { try { await addImageFiles(imageInput.files); } catch (error) { showToast(error.message); } imageInput.value = ''; });
document.addEventListener('paste', event => { const files = [...(event.clipboardData?.files || [])]; if (files.length) { event.preventDefault(); addImageFiles(files).catch(error => showToast(error.message)); } });
document.addEventListener('dragover', event => { if ([...(event.dataTransfer?.types || [])].includes('Files')) event.preventDefault(); });
document.addEventListener('drop', event => { const files = [...(event.dataTransfer?.files || [])]; if (files.length) { event.preventDefault(); addImageFiles(files).catch(error => showToast(error.message)); } });
document.querySelector('#plannerCloseButton').addEventListener('click', closePlanner);
document.querySelector('#managePlannerButton').addEventListener('click', openPlanner);
document.querySelector('#companionButton').addEventListener('click', openCompanion);
document.querySelector('#companionCloseButton').addEventListener('click', closeCompanion);
document.querySelector('#manageCompanionButton').addEventListener('click', openCompanion);
document.querySelector('#refreshPlannerSummaryButton').addEventListener('click', async () => {
  try {
    plannerSummary.textContent = await api.getDailySummary();
  } catch (error) {
    showToast(`摘要生成失败：${error.message}`, 4200);
  }
});
proactiveSettingsForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    plannerState = await api.saveProactiveSettings({
      proactiveEnabled: proactiveEnabledInput.checked,
      startupGreetingEnabled: startupGreetingInput.checked,
      dailySummaryEnabled: dailySummaryInput.checked,
      dailySummaryTime: dailySummaryTimeInput.value,
      quietHoursEnabled: quietHoursInput.checked,
      quietStart: quietStartInput.value,
      quietEnd: quietEndInput.value
    });
    currentSettings = { ...currentSettings, ...plannerState.settings };
    renderPlannerCenter();
    showToast(plannerState.settings.proactiveEnabled ? '主动助手设置已保存。' : '主动助手已关闭。');
  } catch (error) {
    showToast(`保存失败：${error.message}`, 4200);
  }
});
companionSettingsForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    companionState = await api.saveCompanionSettings({
      interactionsEnabled: companionInteractionsInput.checked,
      idleFrequency: companionIdleFrequencyInput.value,
      bubbleFrequency: companionBubbleFrequencyInput.value,
      lowPerformanceMode: companionLowPerformanceInput.checked,
      achievementsEnabled: companionAchievementsInput.checked,
      addressMode: companionAddressInput.value,
      backgroundMode: companionBackgroundModeInput.value,
      sleepAfterMinutes: Number(companionSleepInput.value),
      miniClickThrough: companionMiniClickThroughInput.checked,
      autoHideFullscreen: companionFullscreenInput.checked,
      autoLowPower: companionBatteryInput.checked,
      cursorReactions: companionReactionsInput.checked,
      edgeReactions: companionReactionsInput.checked,
      theme: companionThemeInput.value,
      eyeStyle: companionEyeInput.value,
      coreStyle: companionCoreInput.value,
      shoulderStyle: companionShoulderInput.value,
      haloStyle: companionHaloInput.value
    });
    applyCompanionPreferences();
    renderCompanionCenter();
    showToast('陪伴设置已保存在本机。');
  } catch (error) {
    showToast(`保存失败：${error.message}`, 4200);
  }
});
document.querySelector('#resetCompanionButton').addEventListener('click', async () => {
  if (!window.confirm('重置陪伴值、收藏和成就？本地记忆与计划不会受到影响。')) return;
  try {
    companionState = await api.resetCompanion();
    applyCompanionPreferences();
    renderCompanionCenter();
    showToast('陪伴进度已重置。');
  } catch (error) {
    showToast(`重置失败：${error.message}`, 4200);
  }
});
taskAddForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const result = await api.addTask({ title: taskTitleInput.value, dueAt: fromLocalDateTimeInput(taskDueInput.value) });
    plannerState = result.state;
    taskTitleInput.value = '';
    taskDueInput.value = '';
    renderPlannerCenter();
    showToast('待办已添加。');
  } catch (error) {
    showToast(`添加失败：${error.message}`, 4200);
  }
});
reminderAddForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const result = await api.addPlannerReminder({ title: reminderTitleInput.value, dueAt: fromLocalDateTimeInput(reminderDueInput.value) });
    plannerState = result.state;
    reminderTitleInput.value = '';
    reminderDueInput.value = toLocalDateTimeInput(Date.now() + 60 * 60 * 1000);
    renderPlannerCenter();
    showToast('定时提醒已添加。');
  } catch (error) {
    showToast(`添加失败：${error.message}`, 4200);
  }
});
document.querySelector('#refreshSkillsButton').addEventListener('click', async () => {
  try {
    await refreshSkills();
    await refreshVolume();
  } catch (error) {
    showToast(error.message, 4200);
  }
});
document.querySelector('#screenshotSkillButton').addEventListener('click', async () => {
  try {
    const result = await api.runSkill('screenshot');
    skillResults.textContent = `截图已保存：\n${result.filePath}`;
    await refreshSkills();
  } catch (error) {
    skillResults.textContent = `截图失败：${error.message}`;
  }
});
document.querySelector('#clipboardSkillButton').addEventListener('click', async () => {
  try {
    const result = await api.runSkill('clipboard.read');
    skillResults.textContent = result.text || '剪贴板中没有文本内容。';
    await refreshSkills();
  } catch (error) {
    skillResults.textContent = `读取失败：${error.message}`;
  }
});
document.querySelector('#volumeDownButton').addEventListener('click', () => adjustVolume(-10));
document.querySelector('#volumeUpButton').addEventListener('click', () => adjustVolume(10));
document.querySelector('#volumeMuteButton').addEventListener('click', async () => {
  try {
    currentVolumeState = await api.runSkill('volume.toggle');
    volumeStatus.textContent = currentVolumeState.muted ? `已静音 · ${currentVolumeState.volume}%` : `${currentVolumeState.volume}%`;
    await refreshSkills();
  } catch (error) {
    showToast(error.message, 4200);
  }
});
fileSearchForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    skillResults.textContent = '正在搜索文件…';
    const result = await api.runSkill('files.search', { query: fileSearchInput.value });
    skillResults.textContent = formatFileResults(result);
    await refreshSkills();
  } catch (error) {
    skillResults.textContent = `搜索失败：${error.message}`;
  }
});
document.querySelector('#addAppButton').addEventListener('click', async () => {
  try {
    const result = await api.addApp();
    whitelistedApps = result.apps;
    renderApps();
    if (!result.canceled) showToast('应用已加入白名单。');
  } catch (error) {
    showToast(`添加失败：${error.message}`);
  }
});
memoryProfileForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    memoryState = await api.saveMemoryProfile({
      displayName: memoryDisplayNameInput.value,
      personalityMode: memoryPersonalityInput.value,
      responseStyle: memoryResponseStyleInput.value
    });
    renderMemoryCenter();
    showToast('称呼与人格设置已保存。');
  } catch (error) {
    showToast(`保存失败：${error.message}`, 4200);
  }
});
memoryAddForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const result = await api.addMemory({ text: memoryAddInput.value, category: memoryCategoryInput.value });
    memoryState = result.state;
    memoryAddInput.value = '';
    renderMemoryCenter();
    showToast(result.created ? '本地记忆已添加。' : '相同记忆已更新。');
  } catch (error) {
    showToast(`添加失败：${error.message}`, 4200);
  }
});
document.querySelector('#clearMemoryButton').addEventListener('click', async () => {
  if (!memoryState.memories.length || !window.confirm('确定清空全部本地记忆？称呼与人格设置会保留。')) return;
  try {
    const result = await api.clearMemory();
    memoryState = result.state;
    renderMemoryCenter();
    showToast(`已清空 ${result.removed} 条本地记忆。`);
  } catch (error) {
    showToast(`清空失败：${error.message}`, 4200);
  }
});
document.querySelector('#settingsButton').addEventListener('click', openSettings);
document.querySelector('#intelligenceButton').addEventListener('click', openIntelligenceCenter);
document.querySelector('#intelligenceCloseButton').addEventListener('click', closeIntelligenceCenter);
document.querySelector('#openModelDeploymentButton').addEventListener('click', () => modelDeploymentPanel.classList.remove('hidden'));
document.querySelector('#dismissModelDeploymentButton').addEventListener('click', async () => { localAiState = await api.dismissLocalAiWizard(); modelDeploymentPanel.classList.add('hidden'); renderLocalAiCenter(); });
pauseModelDownloadButton.addEventListener('click', () => api.pauseManagedModelDownload().catch(error => showToast(error.message, 5200)));
resumeModelDownloadButton.addEventListener('click', () => api.resumeManagedModelDownload(localAiState.download?.modelId).catch(error => showToast(error.message, 5200)));
cancelModelDownloadButton.addEventListener('click', () => api.cancelManagedModelDownload(localAiState.download?.modelId).catch(error => showToast(error.message, 5200)));
document.querySelector('#openModelDirectoryButton').addEventListener('click', async () => { const error = await api.openLocalAiModelDirectory(); if (error) showToast(error, 5200); });
document.querySelector('#inspectLocalModelButton').addEventListener('click', async event => {
  event.currentTarget.disabled = true;
  modelInspectionResult.textContent = '正在检查 GGUF 文件头和 SHA256…';
  try {
    const result = await api.inspectLocalAiModel();
    modelInspectionResult.textContent = result.valid ? `${result.trusted ? '可信清单模型' : '用户选择模型'} · ${formatByteCount(result.sizeBytes)} · ${result.hasChatTemplate ? '检测到聊天模板' : '未在文件头检测到聊天模板'} · SHA256 ${result.sha256}` : result.error;
  } catch (error) { modelInspectionResult.textContent = `检查失败：${error.message}`; }
  finally { event.currentTarget.disabled = false; }
});
recommendGpuLayersButton.addEventListener('click', async event => {
  event.currentTarget.disabled = true;
  gpuRecommendationDetails.innerHTML = '正在检测显卡并解析模型层数…';
  try {
    const result = await api.recommendGpuLayers();
    renderGpuRecommendation(result);
  } catch (error) {
    gpuRecommendationDetails.textContent = `检测失败：${error.message}`;
  } finally {
    event.currentTarget.disabled = false;
  }
});
function renderGpuRecommendation(result) {
  gpuRecommendationDetails.innerHTML = '';
  if (!result || !result.gpu || !result.gpu.available) {
    gpuRecommendationDetails.textContent = (result && result.gpu && result.gpu.reason) || '未检测到可用 NVIDIA GPU，建议 CPU 推理（GPU 层数设为 0）。';
    return;
  }
  const gpuName = result.gpu.deviceName || 'NVIDIA GPU';
  const vramLabel = formatByteCount(Number(result.gpu.vramBytes) || 0);
  const blockCount = Number(result.model && result.model.blockCount) || 0;
  const modelSize = formatByteCount(Number(result.model && result.model.sizeBytes) || 0);
  const layers = Number(result.recommendation && result.recommendation.layers) || 0;
  const reason = (result.recommendation && result.recommendation.reason) || '';
  const summary = document.createElement('div');
  summary.textContent = `${gpuName} · ${vramLabel} 显存 · 模型 ${blockCount ? blockCount + ' 层' : '层数未知'}（${modelSize}）· 建议 ${layers} 层${reason ? ' · ' + reason : ''}`;
  gpuRecommendationDetails.appendChild(summary);
  if (blockCount > 0) {
    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.className = 'secondary-button';
    applyButton.textContent = `采用 ${layers} 层`;
    applyButton.addEventListener('click', () => {
      localAiGpuInput.value = String(layers);
      showToast(`已填入 ${layers} 层，请记得「保存配置」使其生效。`);
    });
    gpuRecommendationDetails.appendChild(applyButton);
  }
}
deleteManagedModelButton.addEventListener('click', async () => {
  const modelId = deleteManagedModelButton.dataset.modelId;
  if (!modelId || !confirm('删除 Astra 模型目录中的已选模型？此操作不会删除其他目录中的模型。')) return;
  try { localAiState = await api.deleteManagedModel(modelId); renderLocalAiCenter(); showToast('模型已删除。'); } catch (error) { showToast(error.message, 5200); }
});
document.querySelector('#settingsCloseButton').addEventListener('click', closeSettings);
document.querySelector('#minimizeButton').addEventListener('click', () => api.minimize());
document.querySelector('#closeButton').addEventListener('click', () => api.close());
document.querySelector('#miniModeButton').addEventListener('click', () => api.setWindowMode('mini'));
localAiForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    localAiState = await api.saveLocalAi({
      enabled: localAiEnabledInput.checked,
      mode: localAiModeInput.value,
      profile: localAiProfileInput.value,
      threads: Number(localAiThreadsInput.value),
      gpuLayers: Number(localAiGpuInput.value),
      runtimePath: localAiRuntimeInput.value,
      modelPath: localAiModelInput.value,
      mmprojPath: localAiMmprojInput.value,
      autoStart: true,
      keepAliveMinutes: 10,
      wizardDismissed: localAiState.settings?.wizardDismissed === true || Boolean(localAiModelInput.value)
    });
    renderLocalAiCenter();
    showToast('本地模型设置已保存。');
  } catch (error) { showToast(`保存失败：${error.message}`, 5200); }
});
document.querySelector('#selectLocalAiRuntimeButton').addEventListener('click', async () => { const result = await api.selectLocalAiRuntime(); if (!result.canceled) localAiRuntimeInput.value = result.path; });
document.querySelector('#selectLocalAiModelButton').addEventListener('click', async () => { const result = await api.selectLocalAiModel(); if (!result.canceled) localAiModelInput.value = result.path; });
document.querySelector('#selectLocalAiMmprojButton').addEventListener('click', async () => { const result = await api.selectLocalAiMmproj(); if (!result.canceled) localAiMmprojInput.value = result.path; });
document.querySelector('#startLocalAiButton').addEventListener('click', async () => { try { localAiState = await api.startLocalAi(); renderLocalAiCenter(); showToast('本地模型已启动。'); } catch (error) { showToast(error.message, 6200); } });
document.querySelector('#stopLocalAiButton').addEventListener('click', async () => { localAiState = await api.stopLocalAi(); renderLocalAiCenter(); });
offlineVoiceForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    offlineVoiceState = await api.saveOfflineVoice({ enabled: offlineVoiceEnabledInput.checked, runtimePath: offlineVoiceRuntimeInput.value, modelPath: offlineVoiceModelInput.value, language: 'zh', threads: 4 });
    renderOfflineVoiceCenter();
    showToast('离线语音设置已保存。');
  } catch (error) { showToast(`保存失败：${error.message}`, 5200); }
});
document.querySelector('#selectOfflineVoiceRuntimeButton').addEventListener('click', async () => { const result = await api.selectOfflineVoiceRuntime(); if (!result.canceled) offlineVoiceRuntimeInput.value = result.path; });
document.querySelector('#selectOfflineVoiceModelButton').addEventListener('click', async () => { const result = await api.selectOfflineVoiceModel(); if (!result.canceled) offlineVoiceModelInput.value = result.path; });
document.querySelector('#importKnowledgeButton').addEventListener('click', async () => { try { const result = await api.importKnowledge(); knowledgeState = result.state; renderKnowledgeCenter(); if (!result.canceled) showToast('本地知识文件已导入。'); } catch (error) { showToast(error.message, 5200); } });
document.querySelector('#clearKnowledgeButton').addEventListener('click', async () => { if (confirm('清空所有本地知识文件索引？原文件不会被删除。')) { knowledgeState = await api.clearKnowledge(); knowledgeResults.replaceChildren(); renderKnowledgeCenter(); } });
document.querySelector('#knowledgeSearchButton').addEventListener('click', async () => {
  const results = await api.searchKnowledge(knowledgeSearchInput.value);
  knowledgeResults.replaceChildren();
  for (const result of results) {
    const row = document.createElement('article'); row.className = 'knowledge-result';
    const title = document.createElement('b'); title.textContent = result.name;
    const text = document.createElement('span'); text.textContent = result.text.slice(0, 420);
    row.append(title, text); knowledgeResults.append(row);
  }
  if (!results.length) knowledgeResults.textContent = '没有找到相关内容。';
});
document.querySelector('#applyScenarioButton').addEventListener('click', async () => { scenarioStoreState = await api.setScenario(scenarioSelect.value); applyScenarioState(scenarioStoreState, true); showToast(`已切换到${scenarioStoreState.definition.label}。`); });
document.querySelector('#saveScenarioButton').addEventListener('click', async () => {
  const automatic = scenarioAutomaticInput.checked;
  const schedules = automatic ? [{ scenario: 'normal', start: '07:00', end: '09:00' }, { scenario: 'work', start: '09:00', end: '18:00' }, { scenario: 'leisure', start: '18:00', end: '23:00' }, { scenario: 'sleep', start: '23:00', end: '07:00' }] : [];
  scenarioStoreState = await api.saveScenario({ ...scenarioStoreState, active: scenarioSelect.value, automatic, schedules });
  applyScenarioState(scenarioStoreState);
  showToast('情景模式设置已保存。');
});
workflowForm.addEventListener('submit', async event => {
  event.preventDefault();
  const actions = [workflowActionOne.value, workflowActionTwo.value, workflowActionThree.value, workflowActionFour.value].map(value => WORKFLOW_ACTION_OPTIONS.find(item => item.value === value)?.action).filter(Boolean);
  try {
    const result = await api.addWorkflow({ name: workflowNameInput.value, confirmBeforeRun: workflowConfirmInput.checked, actions });
    workflowState = result.state;
    workflowNameInput.value = '';
    workflowActionOne.selectedIndex = 0;
    workflowActionTwo.value = '';
    workflowActionThree.value = '';
    workflowActionFour.value = '';
    renderWorkflowCenter();
    showToast('白名单工作流已保存。');
  } catch (error) { showToast(error.message, 5200); }
});
clickThroughButton.addEventListener('click', async () => {
  try {
    const result = await api.setClickThrough(true);
    const shortcut = result.shortcut || 'Ctrl + Shift + Space';
    showToast(`穿透已开启；按 ${shortcut} 或等待 ${result.autoRestoreSeconds} 秒自动恢复。`, 5200);
  } catch (error) {
    showToast(`无法开启鼠标穿透：${error.message}`);
  }
});
refreshDiagnosticsButton.addEventListener('click', refreshDiagnostics);
exportDiagnosticsButton.addEventListener('click', async () => {
  try {
    const result = await api.exportDiagnostics();
    if (!result.canceled) showToast('诊断报告已导出，可将它发给开发者排查问题。', 4200);
  } catch (error) {
    showToast(`导出失败：${error.message}`);
  }
});
safeModeButton.addEventListener('click', async () => {
  try {
    const safeMode = !currentSettings.safeMode;
    const confirmed = window.confirm(safeMode ? 'Astra 将立即以安全模式重启，并禁用透明窗口和鼠标穿透。继续吗？' : 'Astra 将立即恢复普通模式并重启。继续吗？');
    if (!confirmed) return;
    if (safeMode) await api.restartSafeMode();
    else await api.restartNormalMode();
  } catch (error) {
    showToast(`重启失败：${error.message}`);
  }
});

settingsOverlay.addEventListener('click', event => {
  if (event.target === settingsOverlay) closeSettings();
});
intelligenceOverlay.addEventListener('click', event => { if (event.target === intelligenceOverlay) closeIntelligenceCenter(); });
appsOverlay.addEventListener('click', event => {
  if (event.target === appsOverlay) closeApps();
});
skillsOverlay.addEventListener('click', event => {
  if (event.target === skillsOverlay) closeSkills();
});
memoryOverlay.addEventListener('click', event => {
  if (event.target === memoryOverlay) closeMemory();
});
plannerOverlay.addEventListener('click', event => {
  if (event.target === plannerOverlay) closePlanner();
});
companionOverlay.addEventListener('click', event => {
  if (event.target === companionOverlay) closeCompanion();
});

settingsForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    currentSettings = await api.saveSettings({
      endpoint: endpointInput.value,
      model: modelInput.value,
      transcriptionModel: transcriptionModelInput.value,
      apiKey: apiKeyInput.value,
      speakReplies: speakRepliesInput.checked,
      realtimeEnabled: realtimeEnabledInput.checked,
      realtimeAutoConnect: realtimeAutoConnectInput.checked,
      realtimeReconnectEnabled: realtimeReconnectInput.checked,
      voiceSkillBridgeEnabled: voiceSkillBridgeInput.checked,
      realtimeModel: realtimeModelInput.value,
      realtimeVoice: realtimeVoiceInput.value,
      realtimeVadMode: realtimeVadModeInput.value,
      realtimeIdleMinutes: Number(realtimeIdleMinutesInput.value),
      realtimeMaxMinutes: Number(realtimeMaxMinutesInput.value),
      realtimeInputDeviceId: realtimeInputDeviceInput.value,
      realtimeOutputDeviceId: realtimeOutputDeviceInput.value,
      launchAtLogin: launchAtLoginInput.checked,
      restoreShortcut: restoreShortcutInput.value
      ,updateManifestUrl: updateManifestInput.value
    });
    updateRecoveryUi();
    if (realtimeSession || realtimeReconnectTimer) stopRealtimeVoice('settings');
    connectionStatus.textContent = currentSettings.safeMode ? '安全模式' : currentSettings.endpoint && currentSettings.model && currentSettings.apiKeyConfigured ? '配置已保存' : '离线模式';
    closeSettings();
    showToast('设置已安全保存。');
  } catch (error) {
    showToast(`保存失败：${error.message}`);
  }
});

api.onInteractionRestored((_event, detail) => {
  const message = detail?.reason === 'automatic' ? '安全计时结束，已自动恢复原界面。' : '已恢复原界面的鼠标操作。';
  showToast(message);
  if (!settingsOverlay.classList.contains('hidden')) refreshDiagnostics();
});

api.onWindowModeChanged(payload => applyWindowMode(payload));

api.onCompanionAction((_event, payload) => handleCompanionAction(payload));

api.onCompanionUpdated((_event, payload) => {
  if (payload?.state) {
    companionState = payload.state;
    applyCompanionPreferences();
    if (!companionOverlay.classList.contains('hidden')) renderCompanionCenter();
  }
  for (const achievement of payload?.newlyUnlocked || []) {
    showToast(`成就解锁：${achievement.title}`, 4200);
    showCompanionBubble(`新记录：${achievement.title}`, { force: true, duration: 3600 });
    playCompanionMotion('celebrate', 1200);
  }
});

api.onProactiveMessage((_event, payload) => {
  const text = String(payload?.text || '').trim();
  if (!text) return;
  addMessage('assistant', text);
  if (payload?.type === 'reminder') showToast(text, 5200);
  setAssistantState('idle', payload?.type === 'summary' ? '摘要已更新' : '随时待命');
});

function renderFocus() {
  const remaining = focusState.active ? Math.max(0, focusState.active.dueAt - Date.now()) : 0;
  const seconds = Math.ceil(remaining / 1000);
  document.querySelector('#focusClock').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  document.querySelector('#focusMinutesInput').value = focusState.settings?.focusMinutes || 25;
  document.querySelector('#breakMinutesInput').value = focusState.settings?.breakMinutes || 5;
  document.querySelector('#waterEnabledInput').checked = focusState.settings?.waterEnabled !== false;
  document.querySelector('#focusHistory').textContent = `已完成 ${focusState.history?.filter(item => item.type === 'focus').length || 0} 次专注`;
  document.body.classList.toggle('focus-active', focusState.active?.type === 'focus');
}
setInterval(() => { if (!focusOverlay.classList.contains('hidden') || focusState.active) renderFocus(); }, 1000);
document.querySelector('#startFocusButton').addEventListener('click', async () => { focusState = await api.startFocus({ type: 'focus', minutes: Number(document.querySelector('#focusMinutesInput').value) }); renderFocus(); });
document.querySelector('#startBreakButton').addEventListener('click', async () => { focusState = await api.startFocus({ type: 'break', minutes: Number(document.querySelector('#breakMinutesInput').value) }); renderFocus(); });
document.querySelector('#stopFocusButton').addEventListener('click', async () => { focusState = await api.stopFocus(); renderFocus(); });
document.querySelector('#clearFocusButton').addEventListener('click', async () => { focusState = await api.clearFocusHistory(); renderFocus(); });
api.onFocusUpdated(payload => { if (payload?.state) { focusState = payload.state; renderFocus(); if (payload.type === 'completed') playCompanionMotion('celebrate', 1400); } });
api.onLocalAiStatus(payload => {
  localAiState = payload || localAiState;
  renderLocalAiCenter();
  if (localAiState.runtime?.state === 'failed') showToast(`本地模型异常：${localAiState.runtime.error || '未知错误'}`, 6200);
});
api.onModelDownloadStatus(payload => {
  localAiState = { ...localAiState, download: payload || localAiState.download };
  renderModelManager();
  if (payload?.state === 'completed') {
    Promise.all([api.getLocalAi(), api.getOfflineVoice()]).then(([localState, voiceState]) => { localAiState = localState; offlineVoiceState = voiceState; renderLocalAiCenter(); renderOfflineVoiceCenter(); });
    showToast('模型下载、SHA256 校验和配置已完成。', 5200);
  }
  if (payload?.state === 'failed' && payload.error) showToast(`模型下载失败：${payload.error}`, 6200);
});
api.onScenarioUpdated(payload => {
  if (payload?.state) applyScenarioState(payload.state, ['manual', 'schedule', 'workflow'].includes(payload.reason));
});

function handleProximityEvent(event) {
  if (!event || companionState.settings.interactionsEnabled === false || avatarDragContext) return;
  if (event === 'enter') {
    showInteractionCue('look', 850);
    playCompanionMotion('look', 900, { idle: true });
    return;
  }
  if (event === 'fast') {
    showInteractionCue('alert', 900);
    playCompanionMotion('shake', 650);
    return;
  }
  if (event === 'circle') {
    showInteractionCue('attention', 1000);
    showCompanionBubble('视线跟得上。需要我做什么吗？', {
      duration: 5200,
      actions: [
        { label: '开始对话', onClick: () => openFullInteraction(() => messageInput.focus()) },
        { label: '暂时不用', onClick: () => showInteractionCue('look', 600) }
      ]
    });
    return;
  }
  if (event === 'dwell') {
    showCompanionBubble('我注意到你停在这里。', {
      duration: 5200,
      actions: [
        { label: '和我聊聊', onClick: () => openFullInteraction(() => messageInput.focus()) },
        { label: '语音输入', onClick: () => openFullInteraction(() => micButton.focus()) }
      ]
    });
  }
}

api.onEnvironmentChanged(payload => {
  const previous = environmentState; environmentState = payload || {};
  document.body.classList.toggle('performance-low', environmentState.lowPerformance || companionState.settings.lowPerformanceMode);
  avatar.style.setProperty('--look-x', String(environmentState.cursor?.lookX || 0));
  avatar.style.setProperty('--look-y', String(environmentState.cursor?.lookY || 0));
  if (environmentState.idle) setAssistantState('sleepy', '充电休眠', { force: true });
  else if (environmentState.engineer) setAssistantState('idle', '工程师陪伴', { force: true });
  if (!previous.online && environmentState.online) showCompanionBubble('网络已恢复。', { force: true });
  if (previous.online && !environmentState.online) showCompanionBubble('网络断开，我会保持本地陪伴。', { force: true });
  if (!previous.lowBattery && environmentState.lowBattery) showCompanionBubble(`电量仅剩 ${environmentState.batteryPercent}% ，已进入节能状态。`, { force: true });
  if (!previous.charging && environmentState.charging && environmentState.idle) showCompanionBubble('正在充电休眠。', { force: true });
  lastProximitySnapshot = environmentState.cursor || {};
  const wasNearby = proximityState.nearby === true;
  const proximity = interaction.proximityReaction(proximityState, lastProximitySnapshot, Date.now());
  proximityState = proximity.state;
  handleProximityEvent(proximity.event);
  if (!wasNearby && proximityState.nearby) {
    clearTimeout(proximityDwellTimer);
    proximityDwellTimer = setTimeout(() => {
      const dwell = interaction.proximityReaction(proximityState, lastProximitySnapshot, Date.now());
      proximityState = dwell.state;
      handleProximityEvent(dwell.event);
    }, 3100);
  } else if (!proximityState.nearby) {
    clearTimeout(proximityDwellTimer);
  }
  if (environmentState.edge) playCompanionMotion(environmentState.edge === 'bottom' ? 'stretch' : 'look', 900, { idle: true });
});
{
  const now = new Date();
  const holiday = `${now.getMonth() + 1}-${now.getDate()}`;
  if (['1-1', '10-1', '12-25'].includes(holiday)) document.body.classList.add('holiday-theme');
}
document.querySelector('#exportDataButton').addEventListener('click', async () => { const result = await api.exportLocalData(); if (!result.canceled) showToast('本地备份已导出。'); });
document.querySelector('#importDataButton').addEventListener('click', async () => { if (confirm('恢复备份会覆盖本地设置、记忆、计划和成长，继续吗？')) { await api.importLocalData(); showToast('备份已恢复。'); } });
document.querySelector('#clearDataButton').addEventListener('click', async () => { if (confirm('完全清除所有 Astra 本地数据？此操作不可撤销。')) { await api.clearLocalData(); location.reload(); } });
document.querySelector('#checkUpdatesButton').addEventListener('click', async () => { try { const result = await api.checkForUpdates(); showToast(result.latestVersion ? `最新版本：${result.latestVersion}。下载和安装仍需你确认。` : '更新清单未提供版本。', 5200); } catch (error) { showToast(error.message, 5200); } });
document.querySelector('#completeOnboardingButton').addEventListener('click', async () => { currentSettings = await api.completeOnboarding(); onboardingOverlay.classList.add('hidden'); });

async function initialize() {
  try {
    currentSettings = await api.getSettings();
    const [, , windowMode, localState, voiceState, scenarioStateValue] = await Promise.all([refreshApps(), refreshCompanion(), api.getWindowMode(), api.getLocalAi(), api.getOfflineVoice(), api.getScenario()]);
    localAiState = localState;
    offlineVoiceState = voiceState;
    applyScenarioState(scenarioStateValue);
    connectionStatus.textContent = currentSettings.safeMode ? '安全模式' : currentSettings.endpoint && currentSettings.model && currentSettings.apiKeyConfigured ? '在线 AI 已配置' : localAiState.ready ? '本地 AI 已配置' : '离线基础模式';
    updateRecoveryUi();
    applyWindowMode(windowMode);
    focusState = await api.getFocus();
    renderFocus();
    if (!currentSettings.onboardingCompleted) onboardingOverlay.classList.remove('hidden');
  } catch {
    connectionStatus.textContent = '设置不可用';
  }
  setupAvatarInteractions();
  populateWorkflowActionSelect(workflowActionOne, false);
  populateWorkflowActionSelect(workflowActionTwo, true);
  populateWorkflowActionSelect(workflowActionThree, true);
  populateWorkflowActionSelect(workflowActionFour, true);
  setupVoiceInput();
  resizeMessageInput();
  refreshAudioDevices();
  updateRealtimeButton();
  if (currentSettings.realtimeEnabled && currentSettings.realtimeAutoConnect) startRealtimeVoice({ automatic: true });
  scheduleCompanionIdleMotion();
  messageInput.focus();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    clearTimeout(companionIdleTimer);
    clearCompanionMotion(false);
  } else {
    const resting = restingAssistantState();
    setAssistantState(resting.state, resting.label, { force: true });
    scheduleCompanionIdleMotion();
  }
});
window.addEventListener('beforeunload', () => {
  clearTimeout(companionIdleTimer);
  clearTimeout(companionMotionWatchdog);
  clearTimeout(interactionCueTimer);
  clearTimeout(proximityDwellTimer);
  clearTimeout(headHoverTimer);
  stopRealtimeVoice('unload');
});
initialize();
