const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  TRUSTED_MODEL_CATALOG,
  describeModelDownloadError,
  dynamicStartupTimeoutMs,
  estimateModelMemoryBytes,
  inspectGgufFile,
  managedModelPath,
  recommendedProfileForMemory,
  trustedModelById,
  validManagedModelFileName
} = require('../src/model-manager.cjs');

test('trusted model catalog pins official revisions and SHA256 values', () => {
  const expected = new Map([
    ['qwen3-1.7b-q4km', ['daeb8e2d528a760970442092f6bf1e55c3b659eb', 'd2387ca2dbfee2ffabce7120d3770dadca0b293052bc2f0e138fdc940d9bc7b5']],
    ['qwen3-4b-q4km', ['bc640142c66e1fdd12af0bd68f40445458f3869b', '7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5']],
    ['qwen3-8b-q4km', ['1d54a16a18cba0d8fbad4a16db801decc729e099', 'd98cdcbd03e17ce47681435b5150e34c1417f50b5c0019dd560e4882c5745785']],
    ['whisper-small', ['c521a4b02f422512d734391fdf08bb08c0862f68', '1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b']]
  ]);
  assert.equal(TRUSTED_MODEL_CATALOG.length, expected.size);
  for (const model of TRUSTED_MODEL_CATALOG) {
    const [revision, sha256] = expected.get(model.id);
    assert.equal(new URL(model.url).protocol, 'https:');
    assert.match(model.url, new RegExp(`/resolve/${revision}/`));
    assert.ok(['.gguf', '.bin'].includes(path.extname(model.fileName)));
    assert.equal(model.sha256, sha256);
    assert.equal(trustedModelById(model.id), model);
  }
});

test('GGUF inspection rejects invalid headers and detects chat templates', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-gguf-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const invalidPath = path.join(directory, 'invalid.gguf');
  fs.writeFileSync(invalidPath, Buffer.alloc(1024 * 1024, 0));
  assert.equal(inspectGgufFile(invalidPath).valid, false);
  const validPath = path.join(directory, 'valid.gguf');
  const payload = Buffer.alloc(1024 * 1024, 0);
  payload.write('GGUF', 0, 'ascii');
  payload.write('tokenizer.chat_template', 128, 'utf8');
  fs.writeFileSync(validPath, payload);
  const inspection = inspectGgufFile(validPath);
  assert.equal(inspection.valid, true);
  assert.equal(inspection.hasChatTemplate, true);
});

test('managed model paths cannot escape the Astra model directory', () => {
  assert.equal(validManagedModelFileName('model.exe'), '');
  assert.equal(validManagedModelFileName('voice.bin'), '');
  assert.equal(validManagedModelFileName('ggml-small.bin'), 'ggml-small.bin');
  assert.equal(managedModelPath('C:\\Models', '..\\escape.gguf'), path.resolve('C:\\Models', 'escape.gguf'));
  assert.equal(managedModelPath('C:\\Models', 'safe.gguf'), path.resolve('C:\\Models', 'safe.gguf'));
});

test('memory recommendations and startup timeouts stay bounded', () => {
  assert.equal(recommendedProfileForMemory(8), 'light');
  assert.equal(recommendedProfileForMemory(16), 'balanced');
  assert.equal(recommendedProfileForMemory(32), 'quality');
  assert.ok(estimateModelMemoryBytes(2500000000, 'balanced') > 2500000000);
  assert.equal(dynamicStartupTimeoutMs(0), 45000);
  assert.ok(dynamicStartupTimeoutMs(5000000000) > 45000);
  assert.equal(dynamicStartupTimeoutMs(100000000000), 180000);
});

test('model download errors explain browser and proxy mismatches', () => {
  const networkError = new TypeError('fetch failed', { cause: Object.assign(new Error('connection reset'), { code: 'ECONNRESET' }) });
  assert.match(describeModelDownloadError(networkError), /浏览器能打开/);
  const dnsError = Object.assign(new Error('lookup failed'), { code: 'ENOTFOUND' });
  assert.match(describeModelDownloadError(dnsError), /DNS/);
  const certificateError = Object.assign(new Error('certificate expired'), { code: 'CERT_HAS_EXPIRED' });
  assert.match(describeModelDownloadError(certificateError), /证书/);
});
