const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyVoiceInput, confirmationDecision } = require('../app/voice-bridge.js');

test('voice bridge recognizes explicit confirmation and cancellation', () => {
  assert.equal(confirmationDecision('好的。'), 'confirm');
  assert.equal(confirmationDecision('取消操作'), 'cancel');
  assert.equal(confirmationDecision('算了'), 'cancel');
});

test('voice bridge only classifies bounded local allowlist commands', () => {
  assert.deepEqual(classifyVoiceInput('打开计算器'), {
    type: 'command', commandType: 'tool', command: '打开计算器', label: '打开计算器'
  });
  assert.equal(classifyVoiceInput('把音量调到 35').commandType, 'volume');
  assert.equal(classifyVoiceInput('提醒我 5 分钟后喝水').commandType, 'reminder');
  assert.equal(classifyVoiceInput('读取剪贴板'), null);
  assert.equal(classifyVoiceInput('搜索文件 密码'), null);
});

test('voice bridge rejects shells and generated command arguments', () => {
  assert.equal(classifyVoiceInput('打开 powershell -command 删除文件'), null);
  assert.equal(classifyVoiceInput('打开 cmd /c calc'), null);
  assert.equal(classifyVoiceInput('打开 微信 --unsafe'), null);
  assert.equal(classifyVoiceInput('打开计算器然后删除文件'), null);
  assert.equal(classifyVoiceInput('不要截图'), null);
  assert.equal(classifyVoiceInput('调高音量并且打开浏览器'), null);
});
