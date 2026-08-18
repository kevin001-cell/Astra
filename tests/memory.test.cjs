const test = require('node:test');
const assert = require('node:assert/strict');
const {
  addMemory,
  buildMemoryPrompt,
  clearMemories,
  normalizeMemoryStore,
  removeMemory,
  saveProfile,
  updateMemory
} = require('../src/memory.cjs');

test('memory storage only accepts bounded non-sensitive text', () => {
  assert.throws(() => addMemory({}, { text: '记住我的 API Key 是 abc' }, { id: '1' }), /不能保存/);
  const result = addMemory({}, { text: `  我喜欢蓝色 ${'x'.repeat(600)} `, category: 'preference' }, {
    id: 'memory-1',
    now: new Date('2026-08-18T00:00:00Z')
  });
  assert.equal(result.memory.text.length, 500);
  assert.equal(result.memory.category, 'preference');
  assert.equal(result.store.memories.length, 1);
});

test('duplicate memories update instead of multiplying', () => {
  const first = addMemory({}, { text: '我喜欢蓝色' }, { id: 'one', now: new Date('2026-08-18T00:00:00Z') });
  const second = addMemory(first.store, { text: '我喜欢蓝色', pinned: true }, { id: 'two', now: new Date('2026-08-18T01:00:00Z') });
  assert.equal(second.created, false);
  assert.equal(second.store.memories.length, 1);
  assert.equal(second.memory.pinned, true);
  assert.equal(second.memory.updatedAt, '2026-08-18T01:00:00.000Z');
});

test('memory items can be edited removed and cleared', () => {
  const created = addMemory({}, { text: '我喜欢蓝色' }, { id: 'one', now: new Date('2026-08-18T00:00:00Z') });
  const edited = updateMemory(created.store, 'one', { text: '我喜欢深蓝色', pinned: true }, { now: new Date('2026-08-18T02:00:00Z') });
  assert.equal(edited.memory.text, '我喜欢深蓝色');
  assert.equal(edited.memory.pinned, true);
  assert.equal(removeMemory(edited.store, 'one').removed, true);
  assert.equal(clearMemories(edited.store).removed, 1);
});

test('profile and memories produce a bounded system prompt', () => {
  let store = saveProfile({}, { displayName: '托尼', personalityMode: 'jarvis', responseStyle: 'concise' });
  store = addMemory(store, { text: '我喜欢蓝色', category: 'preference' }, { id: 'one' }).store;
  const prompt = buildMemoryPrompt(store, 800);
  assert.match(prompt, /用户称呼：托尼/);
  assert.match(prompt, /我喜欢蓝色/);
  assert.ok(prompt.length <= 800);
  assert.deepEqual(normalizeMemoryStore({ profile: { personalityMode: 'invalid' } }).profile.personalityMode, 'jarvis');
  assert.throws(() => saveProfile({}, { displayName: 'API Key abc' }), /称呼中不能包含/);
});
