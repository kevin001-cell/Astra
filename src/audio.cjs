const AUDIO_MAX_BYTES = 25 * 1024 * 1024;
const DEFAULT_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const AUDIO_MIME_TYPES = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a'
};

function normalizeApiEndpoint(baseUrl, resourcePath) {
  const trimmed = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  const base = trimmed.replace(/\/(chat\/completions|audio\/transcriptions)$/i, '');
  return `${base}/${String(resourcePath || '').replace(/^\/+/, '')}`;
}

function normalizeAudioMimeType(value) {
  const mimeType = String(value || '').toLowerCase().split(';')[0].trim();
  return AUDIO_MIME_TYPES[mimeType] ? mimeType : '';
}

function audioFilename(mimeType) {
  return `astra-voice.${AUDIO_MIME_TYPES[normalizeAudioMimeType(mimeType)] || 'webm'}`;
}

function validateAudioBytes(value) {
  const bytes = Buffer.from(value || []);
  if (!bytes.length) throw new Error('没有收到录音数据。');
  if (bytes.length > AUDIO_MAX_BYTES) throw new Error('录音文件过大，请缩短后重试。');
  return bytes;
}

function parseTranscriptionResponse(value) {
  const text = typeof value?.text === 'string' ? value.text : typeof value?.transcript === 'string' ? value.transcript : '';
  if (!text.trim()) throw new Error('语音服务没有返回可识别的文字。');
  return text.trim();
}

module.exports = {
  AUDIO_MAX_BYTES,
  DEFAULT_TRANSCRIPTION_MODEL,
  audioFilename,
  normalizeApiEndpoint,
  normalizeAudioMimeType,
  parseTranscriptionResponse,
  validateAudioBytes
};
