const { execFile } = require('node:child_process');
const fs = require('node:fs');
const { sanitizeVolume } = require('./skills.cjs');

function validateVolumeAction(action) {
  const normalized = String(action || '').toLowerCase();
  if (!['get', 'set', 'mute', 'unmute', 'toggle'].includes(normalized)) throw new Error('不支持的音量操作。');
  return normalized;
}

function parseVolumeOutput(stdout) {
  const parsed = JSON.parse(String(stdout || '').trim());
  return { volume: sanitizeVolume(parsed.volume), muted: Boolean(parsed.muted) };
}

function runWindowsVolume(helperPath, action, value) {
  const safeAction = validateVolumeAction(action);
  const safeValue = safeAction === 'set' ? sanitizeVolume(value) : 0;
  if (process.platform !== 'win32') return Promise.reject(new Error('音量控制目前仅支持 Windows。'));
  if (!helperPath || !fs.existsSync(helperPath)) return Promise.reject(new Error('音量助手文件缺失，请重新安装 Astra。'));
  return new Promise((resolve, reject) => {
    execFile(helperPath, [safeAction, String(safeValue)], { windowsHide: true, timeout: 5000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Windows 音量控制失败：${String(stderr || error.message).trim().slice(0, 300)}`));
        return;
      }
      try {
        resolve(parseVolumeOutput(stdout));
      } catch {
        reject(new Error('Windows 没有返回有效的音量状态。'));
      }
    });
  });
}

module.exports = { parseVolumeOutput, runWindowsVolume, validateVolumeAction };
