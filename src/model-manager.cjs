const fs = require('node:fs');
const path = require('node:path');

const TRUSTED_MODEL_CATALOG = Object.freeze([
  Object.freeze({
    id: 'qwen3-1.7b-q4km',
    kind: 'chat',
    tier: 'light',
    label: '轻量 · Qwen3 1.7B Q4_K_M',
    description: '适合 8 GB 内存或更重视响应速度的电脑。',
    fileName: 'Qwen3-1.7B-Q4_K_M.gguf',
    url: 'https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF/resolve/daeb8e2d528a760970442092f6bf1e55c3b659eb/Qwen3-1.7B-Q4_K_M.gguf?download=true',
    sha256: 'd2387ca2dbfee2ffabce7120d3770dadca0b293052bc2f0e138fdc940d9bc7b5',
    sizeBytes: 1282439264,
    sizeLabel: '约 1.3 GB',
    estimatedMemoryLabel: '约 3–5 GB',
    license: 'Apache-2.0',
    profile: 'light'
  }),
  Object.freeze({
    id: 'qwen3-4b-q4km',
    kind: 'chat',
    tier: 'balanced',
    label: '均衡 · Qwen3 4B Q4_K_M',
    description: '推荐 16 GB 内存，中文对话质量与速度较均衡。',
    fileName: 'Qwen3-4B-Q4_K_M.gguf',
    url: 'https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/bc640142c66e1fdd12af0bd68f40445458f3869b/Qwen3-4B-Q4_K_M.gguf?download=true',
    sha256: '7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5',
    sizeBytes: 2500000000,
    sizeLabel: '约 2.5 GB',
    estimatedMemoryLabel: '约 6–9 GB',
    license: 'Apache-2.0',
    profile: 'balanced'
  }),
  Object.freeze({
    id: 'qwen3-8b-q4km',
    kind: 'chat',
    tier: 'quality',
    label: '质量 · Qwen3 8B Q4_K_M',
    description: '建议 24 GB 以上内存，质量更高但 CPU 推理更慢。',
    fileName: 'Qwen3-8B-Q4_K_M.gguf',
    url: 'https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/1d54a16a18cba0d8fbad4a16db801decc729e099/Qwen3-8B-Q4_K_M.gguf?download=true',
    sha256: 'd98cdcbd03e17ce47681435b5150e34c1417f50b5c0019dd560e4882c5745785',
    sizeBytes: 5027783808,
    sizeLabel: '约 5.0 GB',
    estimatedMemoryLabel: '约 10–14 GB',
    license: 'Apache-2.0',
    profile: 'quality'
  }),
  Object.freeze({
    id: 'whisper-small',
    kind: 'voice',
    tier: 'voice',
    label: '离线语音 · Whisper Small',
    description: '适合中文离线转写，准确率和 CPU 速度较均衡。',
    fileName: 'ggml-small.bin',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/c521a4b02f422512d734391fdf08bb08c0862f68/ggml-small.bin?download=true',
    sha256: '1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b',
    sizeBytes: 487601967,
    sizeLabel: '约 488 MB',
    estimatedMemoryLabel: '约 1–2 GB',
    license: 'MIT',
    profile: ''
  })
]);

function trustedModelById(value) {
  const id = String(value || '').trim().slice(0, 80);
  return TRUSTED_MODEL_CATALOG.find(item => item.id === id);
}

function validManagedModelFileName(value) {
  const fileName = path.basename(String(value || '').trim());
  if (!/^[A-Za-z0-9._-]+\.(?:gguf|bin)$/i.test(fileName)) return '';
  if (/\.bin$/i.test(fileName) && !/^ggml-[A-Za-z0-9._-]+\.bin$/i.test(fileName)) return '';
  return fileName;
}

function modelDirectoryPath(documentsPath) {
  return path.resolve(String(documentsPath || ''), 'Astra', 'Models');
}

function managedModelPath(directory, fileName) {
  const safeName = validManagedModelFileName(fileName);
  if (!safeName) return '';
  const root = path.resolve(String(directory || ''));
  const target = path.resolve(root, safeName);
  return target.startsWith(`${root}${path.sep}`) ? target : '';
}

function recommendedProfileForMemory(memoryGb) {
  const value = Number(memoryGb);
  if (!Number.isFinite(value) || value < 12) return 'light';
  if (value < 24) return 'balanced';
  return 'quality';
}

function estimateModelMemoryBytes(modelBytes, profile = 'balanced') {
  const bytes = Math.max(0, Number(modelBytes) || 0);
  const overhead = profile === 'light' ? 768 * 1024 ** 2 : profile === 'quality' ? 2 * 1024 ** 3 : 1280 * 1024 ** 2;
  return Math.ceil(bytes * 1.18 + overhead);
}

function dynamicStartupTimeoutMs(modelBytes) {
  const gigabytes = Math.max(0, Number(modelBytes) || 0) / 1024 ** 3;
  return Math.max(45000, Math.min(180000, Math.round(45000 + gigabytes * 12000)));
}

const GGUF_VALUE_TYPE = Object.freeze({
  UINT8: 0, INT8: 1, UINT16: 2, INT16: 3, UINT32: 4, INT32: 5,
  FLOAT32: 6, BOOL: 7, STRING: 8, ARRAY: 9, UINT64: 10, INT64: 11, FLOAT64: 12
});

function ggufFixedElementSize(type) {
  switch (type) {
    case GGUF_VALUE_TYPE.UINT8:
    case GGUF_VALUE_TYPE.INT8:
    case GGUF_VALUE_TYPE.BOOL:
      return 1;
    case GGUF_VALUE_TYPE.UINT16:
    case GGUF_VALUE_TYPE.INT16:
      return 2;
    case GGUF_VALUE_TYPE.UINT32:
    case GGUF_VALUE_TYPE.INT32:
    case GGUF_VALUE_TYPE.FLOAT32:
      return 4;
    case GGUF_VALUE_TYPE.UINT64:
    case GGUF_VALUE_TYPE.INT64:
    case GGUF_VALUE_TYPE.FLOAT64:
      return 8;
    default:
      return 0;
  }
}

function readGgufValue(buffer, offset, type) {
  if (offset < 0 || offset > buffer.length) return null;
  switch (type) {
    case GGUF_VALUE_TYPE.UINT8:
    case GGUF_VALUE_TYPE.INT8:
    case GGUF_VALUE_TYPE.BOOL: {
      if (offset + 1 > buffer.length) return null;
      const v = buffer[offset];
      return { value: type === GGUF_VALUE_TYPE.INT8 && v > 127 ? v - 256 : v, offset: offset + 1 };
    }
    case GGUF_VALUE_TYPE.UINT16:
    case GGUF_VALUE_TYPE.INT16: {
      if (offset + 2 > buffer.length) return null;
      const v = buffer.readUInt16LE(offset);
      return { value: type === GGUF_VALUE_TYPE.INT16 && v > 32767 ? v - 65536 : v, offset: offset + 2 };
    }
    case GGUF_VALUE_TYPE.UINT32:
    case GGUF_VALUE_TYPE.INT32: {
      if (offset + 4 > buffer.length) return null;
      const v = buffer.readUInt32LE(offset);
      return { value: type === GGUF_VALUE_TYPE.INT32 && v > 2147483647 ? v - 4294967296 : v, offset: offset + 4 };
    }
    case GGUF_VALUE_TYPE.FLOAT32: {
      if (offset + 4 > buffer.length) return null;
      return { value: buffer.readFloatLE(offset), offset: offset + 4 };
    }
    case GGUF_VALUE_TYPE.UINT64:
    case GGUF_VALUE_TYPE.INT64: {
      if (offset + 8 > buffer.length) return null;
      const v = buffer.readBigUInt64LE(offset);
      return { value: type === GGUF_VALUE_TYPE.INT64 && v > 9223372036854775807n ? v - 18446744073709551616n : v, offset: offset + 8 };
    }
    case GGUF_VALUE_TYPE.FLOAT64: {
      if (offset + 8 > buffer.length) return null;
      return { value: buffer.readDoubleLE(offset), offset: offset + 8 };
    }
    case GGUF_VALUE_TYPE.STRING: {
      if (offset + 8 > buffer.length) return null;
      const len = Number(buffer.readBigUInt64LE(offset));
      offset += 8;
      if (!Number.isFinite(len) || len < 0 || offset + len > buffer.length) return null;
      return { value: buffer.subarray(offset, offset + len).toString('utf8'), offset: offset + len };
    }
    case GGUF_VALUE_TYPE.ARRAY: {
      if (offset + 4 > buffer.length) return null;
      const subType = buffer.readUInt32LE(offset);
      offset += 4;
      if (offset + 8 > buffer.length) return null;
      const count = Number(buffer.readBigUInt64LE(offset));
      offset += 8;
      if (!Number.isFinite(count) || count < 0) return null;
      const fixed = ggufFixedElementSize(subType);
      if (fixed > 0) {
        const total = count * fixed;
        if (offset + total > buffer.length) return null;
        return { value: null, offset: offset + total };
      }
      for (let i = 0; i < count; i++) {
        const r = readGgufValue(buffer, offset, subType);
        if (!r) return null;
        offset = r.offset;
      }
      return { value: null, offset };
    }
    default:
      return null;
  }
}

function parseGgufMetadata(buffer) {
  if (!buffer || buffer.length < 16 || buffer.subarray(0, 4).toString('ascii') !== 'GGUF') return null;
  let offset = 4 + 4 + 8;
  if (offset + 8 > buffer.length) return null;
  const kvCount = Number(buffer.readBigUInt64LE(offset));
  offset += 8;
  if (!Number.isFinite(kvCount) || kvCount < 0 || kvCount > 100000) return null;
  const metadata = {};
  for (let i = 0; i < kvCount; i++) {
    if (offset + 8 > buffer.length) break;
    const keyLen = Number(buffer.readBigUInt64LE(offset));
    offset += 8;
    if (!Number.isFinite(keyLen) || keyLen < 0 || keyLen > 4096 || offset + keyLen > buffer.length) break;
    const key = buffer.subarray(offset, offset + keyLen).toString('utf8');
    offset += keyLen;
    if (offset + 4 > buffer.length) break;
    const valueType = buffer.readUInt32LE(offset);
    offset += 4;
    const result = readGgufValue(buffer, offset, valueType);
    if (!result) break;
    offset = result.offset;
    metadata[key] = result.value;
  }
  return metadata;
}

function summarizeGgufMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return {};
  const architecture = typeof metadata['general.architecture'] === 'string' ? metadata['general.architecture'] : '';
  const prefix = architecture ? `${architecture}.` : '';
  const blockCount = metadata[`${prefix}block_count`];
  const embeddingLength = metadata[`${prefix}embedding_length`];
  const contextLength = metadata[`${prefix}context_length`];
  return {
    architecture,
    blockCount: Number.isFinite(Number(blockCount)) ? Number(blockCount) : undefined,
    embeddingLength: Number.isFinite(Number(embeddingLength)) ? Number(embeddingLength) : undefined,
    contextLength: Number.isFinite(Number(contextLength)) ? Number(contextLength) : undefined,
    hasChatTemplate: Object.prototype.hasOwnProperty.call(metadata, 'tokenizer.chat_template')
  };
}

function inspectGgufFile(filePath) {
  const normalized = path.resolve(String(filePath || ''));
  if (path.extname(normalized).toLowerCase() !== '.gguf') return { valid: false, error: '请选择 GGUF 模型文件。' };
  if (!fs.existsSync(normalized)) return { valid: false, error: '模型文件不存在。' };
  const stat = fs.statSync(normalized);
  if (!stat.isFile() || stat.size < 1024 * 1024) return { valid: false, error: '模型文件过小或不是普通文件。' };
  const length = Math.min(stat.size, 8 * 1024 * 1024);
  const buffer = Buffer.alloc(length);
  const descriptor = fs.openSync(normalized, 'r');
  try {
    fs.readSync(descriptor, buffer, 0, length, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  if (buffer.subarray(0, 4).toString('ascii') !== 'GGUF') return { valid: false, error: '文件头不是有效的 GGUF。', sizeBytes: stat.size };
  const parsed = parseGgufMetadata(buffer);
  const summary = summarizeGgufMetadata(parsed || {});
  if (parsed) {
    return {
      valid: true,
      sizeBytes: stat.size,
      hasChatTemplate: summary.hasChatTemplate || buffer.toString('utf8').includes('tokenizer.chat_template'),
      architecture: summary.architecture || (buffer.toString('utf8').match(/general\.architecture.{0,80}?([A-Za-z0-9_-]{2,32})/) || [])[1] || '',
      blockCount: summary.blockCount,
      embeddingLength: summary.embeddingLength,
      contextLength: summary.contextLength
    };
  }
  const raw = buffer.toString('utf8');
  return {
    valid: true,
    sizeBytes: stat.size,
    hasChatTemplate: raw.includes('tokenizer.chat_template'),
    architecture: (raw.match(/general\.architecture.{0,80}?([A-Za-z0-9_-]{2,32})/) || [])[1] || ''
  };
}

function sanitizeStartupError(value) {
  return String(value || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(-1200);
}

function modelDownloadErrorDetail(value) {
  const details = [];
  const seen = new Set();
  let current = value;
  while (current && typeof current === 'object' && !seen.has(current) && details.length < 4) {
    seen.add(current);
    const code = sanitizeStartupError(current.code);
    const message = sanitizeStartupError(current.message);
    const detail = [code, message].filter(Boolean).join(': ');
    if (detail && !details.includes(detail)) details.push(detail);
    current = current.cause;
  }
  return (details.join(' <- ') || sanitizeStartupError(value)).slice(-1200);
}

function describeModelDownloadError(value) {
  if (value?.name === 'AbortError') return '模型下载已中断。';
  const detail = modelDownloadErrorDetail(value);
  const normalized = detail.toUpperCase();
  if (/ERR_NAME_NOT_RESOLVED|ENOTFOUND|EAI_AGAIN/.test(normalized)) return '无法解析模型下载服务器地址，请检查 DNS 或网络连接。';
  if (/CERT|TLS|SSL|UNABLE_TO_VERIFY/.test(normalized)) return '模型下载服务器证书校验失败，请检查系统时间、代理或安全软件。';
  if (/ERR_PROXY_CONNECTION_FAILED|PROXY|ECONNREFUSED/.test(normalized)) return '无法通过系统代理连接模型下载服务器，请检查代理设置或允许 Astra Desktop 访问网络。';
  if (/FETCH FAILED|FAILED TO FETCH|ETIMEDOUT|ECONNRESET|ECONNABORTED|ERR_CONNECTION|ERR_INTERNET_DISCONNECTED|ERR_NETWORK_CHANGED|ERR_TIMED_OUT|ERR_FAILED/.test(normalized)) {
    return '无法连接模型下载服务器。浏览器能打开时，请检查代理或安全软件是否允许 Astra Desktop 访问网络。';
  }
  return `模型下载失败：${detail || '未知网络错误。'}`;
}

module.exports = {
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
  trustedModelById,
  validManagedModelFileName
};
