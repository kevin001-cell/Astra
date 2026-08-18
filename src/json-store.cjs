const fs = require('node:fs');
const path = require('node:path');

function backupPath(filePath) {
  return `${filePath}.bak`;
}

function parseJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonFile(filePath, fallback) {
  try {
    return { value: parseJsonFile(filePath), source: 'primary', recovered: false };
  } catch {
    try {
      return { value: parseJsonFile(backupPath(filePath)), source: 'backup', recovered: true };
    } catch {
      return { value: typeof fallback === 'function' ? fallback() : fallback, source: 'default', recovered: false };
    }
  }
}

function writeJsonFileAtomic(filePath, value) {
  const directory = path.dirname(filePath);
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  fs.mkdirSync(directory, { recursive: true });
  const serialized = JSON.stringify(value, null, 2);
  try {
    if (fs.existsSync(filePath)) {
      try {
        parseJsonFile(filePath);
        fs.copyFileSync(filePath, backupPath(filePath));
      } catch {}
    }
    const descriptor = fs.openSync(temporaryPath, 'w');
    try {
      fs.writeFileSync(descriptor, serialized, 'utf8');
      fs.fsyncSync(descriptor);
    } finally {
      fs.closeSync(descriptor);
    }
    fs.renameSync(temporaryPath, filePath);
    return { filePath, backupPath: backupPath(filePath), bytes: Buffer.byteLength(serialized) };
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

function fileJsonStatus(filePath) {
  if (!fs.existsSync(filePath)) return { exists: false, valid: false };
  try {
    parseJsonFile(filePath);
    return { exists: true, valid: true };
  } catch {
    return { exists: true, valid: false };
  }
}

function inspectJsonStorage(filePath) {
  const primary = fileJsonStatus(filePath);
  const backup = fileJsonStatus(backupPath(filePath));
  return {
    primaryExists: primary.exists,
    primaryValid: primary.valid,
    backupExists: backup.exists,
    backupValid: backup.valid,
    recoverable: primary.valid || backup.valid || (!primary.exists && !backup.exists)
  };
}

module.exports = {
  backupPath,
  inspectJsonStorage,
  readJsonFile,
  writeJsonFileAtomic
};
