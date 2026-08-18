const REALTIME_DEFAULT_MODEL = 'gpt-realtime';
const REALTIME_DEFAULT_VOICE = 'marin';
const REALTIME_MAX_SDP_BYTES = 200 * 1024;
const REALTIME_MODELS = [
  'gpt-realtime',
  'gpt-realtime-1.5',
  'gpt-realtime-mini',
  'gpt-4o-realtime-preview',
  'gpt-4o-mini-realtime-preview'
];
const REALTIME_VOICES = ['alloy', 'ash', 'ballad', 'cedar', 'coral', 'echo', 'marin', 'sage', 'shimmer', 'verse'];
const REALTIME_VAD_MODES = ['fast', 'natural'];
const REALTIME_IDLE_MINUTES = [0, 5, 10, 20];
const REALTIME_MAX_MINUTES = [10, 20, 30, 60];
const REALTIME_MAX_RECONNECT_ATTEMPTS = 3;
const REALTIME_RUNTIME_STATES = ['idle', 'connecting', 'listening', 'thinking', 'speaking', 'reconnecting', 'failed'];

function normalizeRealtimeEndpoint(baseUrl) {
  const trimmed = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  const base = trimmed.replace(/\/(chat\/completions|audio\/transcriptions|realtime\/calls)$/i, '');
  return `${base}/realtime/calls`;
}

function sanitizeRealtimeModel(value) {
  return REALTIME_MODELS.includes(value) ? value : REALTIME_DEFAULT_MODEL;
}

function sanitizeRealtimeVoice(value) {
  return REALTIME_VOICES.includes(value) ? value : REALTIME_DEFAULT_VOICE;
}

function sanitizeRealtimeVadMode(value) {
  return REALTIME_VAD_MODES.includes(value) ? value : 'natural';
}

function sanitizeRealtimeIdleMinutes(value) {
  const minutes = Number(value);
  return REALTIME_IDLE_MINUTES.includes(minutes) ? minutes : 10;
}

function sanitizeRealtimeMaxMinutes(value) {
  const minutes = Number(value);
  return REALTIME_MAX_MINUTES.includes(minutes) ? minutes : 30;
}

function realtimeReconnectDelay(attempt) {
  const normalizedAttempt = Math.max(1, Math.min(REALTIME_MAX_RECONNECT_ATTEMPTS, Math.trunc(Number(attempt) || 1)));
  return [1000, 3000, 7000][normalizedAttempt - 1];
}

function sanitizeRealtimeRuntimeStatus(value = {}) {
  const state = REALTIME_RUNTIME_STATES.includes(value.state) ? value.state : 'idle';
  const boundedText = input => String(input || '').replace(/[\r\n]+/g, ' ').slice(0, 160);
  const boundedTimestamp = input => {
    const timestamp = Date.parse(input);
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : '';
  };
  return {
    state,
    connectionState: boundedText(value.connectionState),
    iceConnectionState: boundedText(value.iceConnectionState),
    dataChannelState: boundedText(value.dataChannelState),
    reconnectAttempts: Math.max(0, Math.min(REALTIME_MAX_RECONNECT_ATTEMPTS, Math.trunc(Number(value.reconnectAttempts) || 0))),
    handshakeMs: Math.max(0, Math.min(60000, Math.trunc(Number(value.handshakeMs) || 0))),
    connectedAt: boundedTimestamp(value.connectedAt),
    lastEventAt: boundedTimestamp(value.lastEventAt),
    lastError: boundedText(value.lastError)
  };
}

function validateOfferSdp(value) {
  const sdp = String(value || '');
  const bytes = Buffer.byteLength(sdp, 'utf8');
  if (bytes < 32 || !sdp.startsWith('v=0') || !/\bm=audio\b/.test(sdp)) {
    throw new Error('没有收到有效的实时音频协商信息。');
  }
  if (bytes > REALTIME_MAX_SDP_BYTES) throw new Error('实时音频协商信息过大。');
  return sdp;
}

function buildTurnDetection(mode) {
  if (sanitizeRealtimeVadMode(mode) === 'fast') {
    return {
      type: 'semantic_vad',
      eagerness: 'high',
      create_response: true,
      interrupt_response: true
    };
  }
  return {
    type: 'semantic_vad',
    eagerness: 'auto',
    create_response: true,
    interrupt_response: true
  };
}

function buildRealtimeSession(settings = {}, instructions = '') {
  return {
    type: 'realtime',
    model: sanitizeRealtimeModel(settings.realtimeModel),
    instructions: String(instructions || '').slice(0, 12000),
    output_modalities: ['audio'],
    audio: {
      input: {
        noise_reduction: { type: 'near_field' },
        transcription: {
          model: String(settings.transcriptionModel || 'gpt-4o-mini-transcribe').slice(0, 100),
          language: 'zh'
        },
        turn_detection: buildTurnDetection(settings.realtimeVadMode)
      },
      output: {
        voice: sanitizeRealtimeVoice(settings.realtimeVoice)
      }
    }
  };
}

module.exports = {
  REALTIME_DEFAULT_MODEL,
  REALTIME_DEFAULT_VOICE,
  REALTIME_MAX_SDP_BYTES,
  REALTIME_IDLE_MINUTES,
  REALTIME_MAX_MINUTES,
  REALTIME_MAX_RECONNECT_ATTEMPTS,
  REALTIME_MODELS,
  REALTIME_VAD_MODES,
  REALTIME_VOICES,
  buildRealtimeSession,
  buildTurnDetection,
  normalizeRealtimeEndpoint,
  realtimeReconnectDelay,
  sanitizeRealtimeIdleMinutes,
  sanitizeRealtimeMaxMinutes,
  sanitizeRealtimeModel,
  sanitizeRealtimeRuntimeStatus,
  sanitizeRealtimeVadMode,
  sanitizeRealtimeVoice,
  validateOfferSdp
};
