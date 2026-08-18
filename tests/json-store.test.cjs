const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { backupPath, inspectJsonStorage, readJsonFile, writeJsonFileAtomic } = require('../src/json-store.cjs');

function withTemporaryDirectory(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-json-store-'));
  try {
    return callback(directory);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('atomic JSON writes keep the previous valid backup', () => withTemporaryDirectory(directory => {
  const filePath = path.join(directory, 'planner.json');
  writeJsonFileAtomic(filePath, { version: 1 });
  writeJsonFileAtomic(filePath, { version: 2 });
  assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), { version: 2 });
  assert.deepEqual(JSON.parse(fs.readFileSync(backupPath(filePath), 'utf8')), { version: 1 });
}));

test('damaged primary JSON recovers from backup', () => withTemporaryDirectory(directory => {
  const filePath = path.join(directory, 'settings.json');
  writeJsonFileAtomic(filePath, { value: 'first' });
  writeJsonFileAtomic(filePath, { value: 'second' });
  fs.writeFileSync(filePath, '{broken', 'utf8');
  const result = readJsonFile(filePath, {});
  assert.equal(result.source, 'backup');
  assert.equal(result.recovered, true);
  assert.deepEqual(result.value, { value: 'first' });
  assert.equal(inspectJsonStorage(filePath).recoverable, true);
}));

test('invalid primary and backup fall back safely', () => withTemporaryDirectory(directory => {
  const filePath = path.join(directory, 'memory.json');
  fs.writeFileSync(filePath, 'bad', 'utf8');
  fs.writeFileSync(backupPath(filePath), 'bad', 'utf8');
  assert.deepEqual(readJsonFile(filePath, { memories: [] }), { value: { memories: [] }, source: 'default', recovered: false });
  assert.equal(inspectJsonStorage(filePath).recoverable, false);
}));
