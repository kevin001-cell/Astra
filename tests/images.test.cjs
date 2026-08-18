const test = require('node:test');
const assert = require('node:assert/strict');
const { buildUserContent, normalizeImageAttachments } = require('../src/images.cjs');

test('image attachments become multimodal content', () => {
  const image = { dataUrl: 'data:image/png;base64,aGVsbG8=', name: 'x.png' };
  assert.equal(normalizeImageAttachments([image])[0].bytes, 5);
  assert.equal(buildUserContent('看图', [image])[1].type, 'image_url');
});
