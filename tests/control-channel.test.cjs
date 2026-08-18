const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { claimControlChannel } = require('../src/control-channel.cjs');

test('a second launch restores the primary control channel', async () => {
  const suffix = `astra-control-${process.pid}-${Date.now()}`;
  const pipeName = process.platform === 'win32' ? `\\\\.\\pipe\\${suffix}` : path.join(os.tmpdir(), `${suffix}.sock`);
  let restore;
  const restored = new Promise(resolve => {
    restore = resolve;
  });

  const primary = await claimControlChannel(pipeName, restore, { timeoutMs: 1000 });
  assert.equal(primary.isPrimary, true);
  assert.ok(primary.server);

  const secondary = await claimControlChannel(pipeName, () => {}, { timeoutMs: 1000 });
  assert.equal(secondary.isPrimary, false);
  await Promise.race([
    restored,
    new Promise((_resolve, reject) => setTimeout(() => reject(new Error('restore command timed out')), 1500))
  ]);

  await new Promise(resolve => primary.server.close(resolve));
});
