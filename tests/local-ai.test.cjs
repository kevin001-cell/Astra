const test = require('node:test');
const assert = require('node:assert/strict');
const { buildLocalServerArgs, chooseChatBackend, describeRuntimeExitCode, missingWindowsRuntimeDlls, normalizeLocalAiSettings } = require('../src/local-ai.cjs');

test('local AI only accepts fixed runtime and GGUF paths', () => {
  const settings = normalizeLocalAiSettings({ enabled: true, runtimePath: 'C:\\runtime\\cmd.exe', modelPath: 'model.bin' });
  assert.equal(settings.runtimePath, '');
  assert.equal(settings.modelPath, '');
});

test('Windows runtime exit codes produce actionable diagnostics', () => {
  assert.match(describeRuntimeExitCode(-1073741795), /CPU/);
  assert.match(describeRuntimeExitCode(-1073741790), /安全策略/);
  assert.match(describeRuntimeExitCode(-1073741515), /DLL/);
});

test('bundled Windows runtime reports exact missing DLL files', () => {
  const present = new Set(['C:\\runtime\\msvcp140.dll', 'C:\\runtime\\vcruntime140.dll']);
  const missing = missingWindowsRuntimeDlls('C:\\runtime\\llama-server.exe', filePath => present.has(filePath));
  assert.deepEqual(missing, ['vcruntime140_1.dll']);
});

test('local server arguments are generated from bounded settings', () => {
  const args = buildLocalServerArgs({ enabled: true, runtimePath: 'C:\\runtime\\llama-server.exe', modelPath: 'C:\\models\\astra.gguf', port: 39271 });
  assert.deepEqual(args.slice(0, 4), ['--model', 'C:\\models\\astra.gguf', '--host', '127.0.0.1']);
  assert.equal(chooseChatBackend({ enabled: true, runtimePath: 'C:\\runtime\\llama-server.exe', modelPath: 'C:\\models\\astra.gguf' }, false), 'local');
});
