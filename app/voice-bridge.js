(function exposeVoiceBridge(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.astraVoiceBridge = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const CONFIRM_WORDS = new Set(['确认', '确认执行', '确定', '可以', '好的', '好', '执行', '继续', '是', '是的']);
  const CANCEL_WORDS = new Set(['取消', '取消操作', '不要', '不用', '停止', '算了', '否', '不是']);

  function normalizeVoiceText(value) {
    return String(value || '').trim().toLowerCase().replace(/[\s。！!，,？?、；;：:“”"'‘’]/g, '');
  }

  function confirmationDecision(value) {
    const normalized = normalizeVoiceText(value);
    if (CONFIRM_WORDS.has(normalized)) return 'confirm';
    if (CANCEL_WORDS.has(normalized)) return 'cancel';
    return '';
  }

  function commandResult(commandType, command, label) {
    return { type: 'command', commandType, command: String(command).slice(0, 160), label: String(label).slice(0, 80) };
  }

  function classifyVoiceInput(value) {
    const text = String(value || '').trim().slice(0, 200);
    if (!text) return null;
    const decision = confirmationDecision(text);
    if (decision) return { type: 'confirmation', decision };
    if (/(?:不要|别|不用)/.test(text) || /(?:然后|并且|同时|顺便|之后)|[|;&<>]/.test(text)) return null;

    if (/(截图|截个图|屏幕截图)/i.test(text)) return commandResult('screenshot', '截图', '截取当前屏幕');
    if (/(查看|读取|现在|当前).{0,4}音量/i.test(text)) return commandResult('volume', '查看当前音量', '读取系统音量');
    if (/(取消|关闭|解除)静音/i.test(text)) return commandResult('volume', '取消静音', '取消系统静音');
    if (/(打开|开启|系统)?静音/i.test(text)) return commandResult('volume', '打开静音', '将系统静音');
    if (/音量(?:大|高)(?:一点|一些)?/i.test(text) || /调高音量/i.test(text)) return commandResult('volume', '调高音量', '调高系统音量');
    if (/音量(?:小|低)(?:一点|一些)?/i.test(text) || /调低音量/i.test(text)) return commandResult('volume', '调低音量', '调低系统音量');

    const volumeMatch = text.match(/(?:把|将)?(?:系统)?音量(?:调到|设置为|设为)?\s*(\d{1,3})\s*%?/i);
    if (volumeMatch) {
      const valueNumber = Number(volumeMatch[1]);
      if (valueNumber >= 0 && valueNumber <= 100) return commandResult('volume', `把音量调到 ${valueNumber}`, `将系统音量设置为 ${valueNumber}%`);
    }

    const reminderMatch = text.match(/提醒我?\s*(\d+(?:\.\d+)?)\s*分钟后\s*(.+)/);
    if (reminderMatch) {
      const minutes = Number(reminderMatch[1]);
      const title = reminderMatch[2].trim().replace(/[。！!]+$/, '').slice(0, 80);
      if (minutes > 0 && minutes <= 10080 && title) return commandResult('reminder', `提醒我 ${minutes} 分钟后 ${title}`, `创建“${title}”提醒`);
    }

    const knownTools = [
      { pattern: /^(?:请|帮我|麻烦)?\s*打开(?:一下)?\s*(?:默认)?(?:浏览器|browser)(?:吧|一下)?[。！!]?$/i, command: '打开浏览器', label: '打开默认浏览器' },
      { pattern: /^(?:请|帮我|麻烦)?\s*打开(?:一下)?\s*(?:记事本|notepad)(?:吧|一下)?[。！!]?$/i, command: '打开记事本', label: '打开记事本' },
      { pattern: /^(?:请|帮我|麻烦)?\s*打开(?:一下)?\s*(?:计算器|calculator)(?:吧|一下)?[。！!]?$/i, command: '打开计算器', label: '打开计算器' },
      { pattern: /^(?:请|帮我|麻烦)?\s*打开(?:一下)?\s*(?:下载目录|下载文件夹|downloads?)(?:吧|一下)?[。！!]?$/i, command: '打开下载目录', label: '打开下载目录' },
      { pattern: /^(?:请|帮我|麻烦)?\s*打开(?:一下)?\s*(?:系统设置|windows设置)(?:吧|一下)?[。！!]?$/i, command: '打开系统设置', label: '打开系统设置' }
    ];
    const knownTool = knownTools.find(tool => tool.pattern.test(text));
    if (knownTool) return commandResult('tool', knownTool.command, knownTool.label);

    const openMatch = text.match(/^(?:请|帮我|麻烦)?\s*打开\s*(.+?)(?:吧|一下)?[。！!]?$/i);
    if (openMatch) {
      const target = openMatch[1].trim().slice(0, 40);
      const unsafeTarget = /(?:cmd|powershell|pwsh|命令提示符|终端|\/c\b|-command\b|--)/i.test(target);
      if (target && !unsafeTarget) return commandResult('app', `打开 ${target}`, `打开白名单应用“${target}”`);
    }

    return null;
  }

  return { classifyVoiceInput, confirmationDecision, normalizeVoiceText };
});
