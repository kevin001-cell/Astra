const MEMORY_CATEGORIES = ['general', 'preference', 'habit', 'context'];
const PERSONALITY_MODES = ['warm', 'professional', 'jarvis'];
const RESPONSE_STYLES = ['concise', 'balanced', 'detailed'];
const MAX_MEMORIES = 100;
const MAX_MEMORY_TEXT = 500;

const DEFAULT_PROFILE = Object.freeze({
  displayName: '',
  personalityMode: 'jarvis',
  responseStyle: 'concise'
});

function cleanText(value, maxLength = MAX_MEMORY_TEXT) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function containsSensitiveMemory(text) {
  return /(密码|口令|验证码|api\s*key|access\s*token|secret|私钥|助记词|银行卡|信用卡|身份证|social\s*security)/i.test(text);
}

function sanitizeMemoryText(value) {
  const text = cleanText(value);
  if (!text) throw new Error('记忆内容不能为空。');
  if (containsSensitiveMemory(text)) throw new Error('为保护隐私，密码、密钥、验证码和证件信息不能保存为记忆。');
  return text;
}

function sanitizeCategory(value) {
  return MEMORY_CATEGORIES.includes(value) ? value : 'general';
}

function sanitizeChoice(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

function normalizeProfile(profile = {}) {
  return {
    displayName: cleanText(profile.displayName, 40),
    personalityMode: sanitizeChoice(profile.personalityMode, PERSONALITY_MODES, DEFAULT_PROFILE.personalityMode),
    responseStyle: sanitizeChoice(profile.responseStyle, RESPONSE_STYLES, DEFAULT_PROFILE.responseStyle)
  };
}

function normalizeMemory(item) {
  try {
    const text = sanitizeMemoryText(item?.text);
    const createdAt = Number.isFinite(Date.parse(item?.createdAt)) ? new Date(item.createdAt).toISOString() : new Date(0).toISOString();
    const updatedAt = Number.isFinite(Date.parse(item?.updatedAt)) ? new Date(item.updatedAt).toISOString() : createdAt;
    if (!item?.id) return null;
    return {
      id: cleanText(item.id, 100),
      text,
      category: sanitizeCategory(item.category),
      createdAt,
      updatedAt,
      pinned: Boolean(item.pinned)
    };
  } catch {
    return null;
  }
}

function normalizeMemoryStore(value = {}) {
  const memories = Array.isArray(value.memories) ? value.memories.map(normalizeMemory).filter(Boolean) : [];
  return {
    version: 1,
    profile: normalizeProfile(value.profile),
    memories: memories.slice(-MAX_MEMORIES)
  };
}

function addMemory(store, input, options = {}) {
  const normalized = normalizeMemoryStore(store);
  const text = sanitizeMemoryText(input?.text);
  const now = (options.now || new Date()).toISOString();
  const duplicate = normalized.memories.find(item => item.text.toLocaleLowerCase('zh-CN') === text.toLocaleLowerCase('zh-CN'));
  if (duplicate) {
    duplicate.category = sanitizeCategory(input?.category || duplicate.category);
    duplicate.pinned = input?.pinned === undefined ? duplicate.pinned : Boolean(input.pinned);
    duplicate.updatedAt = now;
    return { store: normalized, memory: duplicate, created: false };
  }
  const memory = {
    id: cleanText(options.id, 100),
    text,
    category: sanitizeCategory(input?.category),
    createdAt: now,
    updatedAt: now,
    pinned: Boolean(input?.pinned)
  };
  if (!memory.id) throw new Error('无法生成记忆编号。');
  normalized.memories.push(memory);
  normalized.memories = normalized.memories.slice(-MAX_MEMORIES);
  return { store: normalized, memory, created: true };
}

function updateMemory(store, id, patch, options = {}) {
  const normalized = normalizeMemoryStore(store);
  const memory = normalized.memories.find(item => item.id === String(id || ''));
  if (!memory) throw new Error('没有找到这条记忆。');
  if (Object.hasOwn(patch || {}, 'text')) memory.text = sanitizeMemoryText(patch.text);
  if (Object.hasOwn(patch || {}, 'category')) memory.category = sanitizeCategory(patch.category);
  if (Object.hasOwn(patch || {}, 'pinned')) memory.pinned = Boolean(patch.pinned);
  memory.updatedAt = (options.now || new Date()).toISOString();
  return { store: normalized, memory };
}

function removeMemory(store, id) {
  const normalized = normalizeMemoryStore(store);
  const previousLength = normalized.memories.length;
  normalized.memories = normalized.memories.filter(item => item.id !== String(id || ''));
  return { store: normalized, removed: normalized.memories.length !== previousLength };
}

function clearMemories(store) {
  const normalized = normalizeMemoryStore(store);
  const removed = normalized.memories.length;
  normalized.memories = [];
  return { store: normalized, removed };
}

function saveProfile(store, profile) {
  const normalized = normalizeMemoryStore(store);
  const displayName = cleanText(profile?.displayName, 40);
  if (displayName && containsSensitiveMemory(displayName)) {
    throw new Error('为保护隐私，称呼中不能包含密码、密钥、验证码或证件信息。');
  }
  normalized.profile = normalizeProfile({ ...profile, displayName });
  return normalized;
}

function buildMemoryPrompt(store, maxCharacters = 1600) {
  const normalized = normalizeMemoryStore(store);
  const personalityLabels = {
    warm: '温暖、主动鼓励，但不过度热情',
    professional: '专业、克制、重视准确性',
    jarvis: '像科幻管家一样沉着、机敏、可靠'
  };
  const styleLabels = {
    concise: '优先简短回答，除非用户要求展开',
    balanced: '回答兼顾简洁和必要解释',
    detailed: '提供较完整的步骤和说明'
  };
  const lines = [
    '以下是用户明确允许保存在本机的资料。只在相关时自然使用，不要声称记得未列出的信息。',
    `人格模式：${personalityLabels[normalized.profile.personalityMode]}`,
    `回答风格：${styleLabels[normalized.profile.responseStyle]}`
  ];
  if (normalized.profile.displayName) lines.push(`用户称呼：${normalized.profile.displayName}`);
  const selected = [...normalized.memories]
    .sort((left, right) => Number(right.pinned) - Number(left.pinned) || Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, 20);
  for (const memory of selected) lines.push(`- [${memory.category}] ${memory.text}`);
  return lines.join('\n').slice(0, Math.max(200, Math.min(4000, maxCharacters)));
}

module.exports = {
  DEFAULT_PROFILE,
  MAX_MEMORIES,
  MEMORY_CATEGORIES,
  PERSONALITY_MODES,
  RESPONSE_STYLES,
  addMemory,
  buildMemoryPrompt,
  clearMemories,
  containsSensitiveMemory,
  normalizeMemoryStore,
  normalizeProfile,
  removeMemory,
  sanitizeMemoryText,
  saveProfile,
  updateMemory
};
