const { execFile } = require('node:child_process');

const NVIDIA_SMI_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 1000;

let cache = null;

function parseNvidiaSmiOutput(stdout) {
  const firstLine = String(stdout || '').split(/\r?\n/)[0] || '';
  const parts = firstLine.split(',').map(part => part.trim());
  if (parts.length < 2) return null;
  const deviceName = parts[0];
  const vramMiB = Number(parts[1]);
  if (!deviceName || !Number.isFinite(vramMiB) || vramMiB <= 0) return null;
  return {
    available: true,
    vendor: 'nvidia',
    deviceName,
    vramBytes: Math.round(vramMiB * 1024 * 1024)
  };
}

function queryNvidiaSmi() {
  return new Promise(resolve => {
    execFile(
      'nvidia-smi',
      ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'],
      { timeout: NVIDIA_SMI_TIMEOUT_MS, windowsHide: true },
      (error, stdout) => {
        if (error) {
          resolve({ available: false, reason: '未检测到 NVIDIA GPU 或 nvidia-smi 不可用' });
          return;
        }
        resolve(parseNvidiaSmiOutput(stdout) || { available: false, reason: '无法解析 nvidia-smi 输出' });
      }
    );
  });
}

async function detectNvidiaGpu({ force = false } = {}) {
  const now = Date.now();
  if (!force && cache && now - cache.timestamp < CACHE_TTL_MS) return cache.value;
  const value = await queryNvidiaSmi();
  cache = { timestamp: now, value };
  return value;
}

function clearNvidiaGpuCache() {
  cache = null;
}

module.exports = {
  clearNvidiaGpuCache,
  detectNvidiaGpu,
  parseNvidiaSmiOutput
};
