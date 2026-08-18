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

function inspectGgufFile(filePath) {
  const normalized = path.resolve(String(filePath || ''));
  if (path.extname(normalized).toLowerCase() !== '.gguf') return { valid: false, error: '请选择 GGUF 模型文件。' };
  if (!fs.existsSync(normalized)) return { valid: false, error: '模型文件不存在。' };
  const stat = fs.statSync(normalized);
  if (!stat.isFile() || stat.size < 1024 * 1024) return { valid: false, error: '模型文件过小或不是普通文件。' };
  const length = Math.min(stat.size, 4 * 1024 * 1024);
  const buffer = Buffer.alloc(length);
  const descriptor = fs.openSync(normalized, 'r');
  try {
    fs.readSync(descriptor, buffer, 0, length, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  if (buffer.subarray(0, 4).toString('ascii') !== 'GGUF') return { valid: false, error: '文件头不是有效的 GGUF。', sizeBytes: stat.size };
  const metadata = buffer.toString('utf8');
  return {
    valid: true,
    sizeBytes: stat.size,
    hasChatTemplate: metadata.includes('tokenizer.chat_template'),
    architecture: (metadata.match(/general\.architecture.{0,80}?([A-Za-z0-9_-]{2,32})/) || [])[1] || ''
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
