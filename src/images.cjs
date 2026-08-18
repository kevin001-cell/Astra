const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function normalizeImageAttachments(value) {
  if (!Array.isArray(value)) return [];
  if (value.length > MAX_IMAGES) throw new Error(`每次最多发送 ${MAX_IMAGES} 张图片。`);
  return value.map((item, index) => {
    const dataUrl = String(item?.dataUrl || '');
    const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i);
    if (!match || !ALLOWED_IMAGE_TYPES.has(match[1].toLowerCase())) throw new Error(`第 ${index + 1} 张图片格式不受支持。`);
    const bytes = Buffer.from(match[2], 'base64').length;
    if (!bytes || bytes > MAX_IMAGE_BYTES) throw new Error(`第 ${index + 1} 张图片超过 4 MB，请压缩后重试。`);
    return { dataUrl, mimeType: match[1].toLowerCase(), bytes, name: String(item?.name || `image-${index + 1}`).slice(0, 120) };
  });
}

function buildUserContent(message, images) {
  const attachments = normalizeImageAttachments(images);
  if (!attachments.length) return String(message || '');
  const content = [];
  if (String(message || '').trim()) content.push({ type: 'text', text: String(message).slice(0, 8000) });
  for (const image of attachments) content.push({ type: 'image_url', image_url: { url: image.dataUrl } });
  return content;
}

module.exports = { ALLOWED_IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_BYTES, buildUserContent, normalizeImageAttachments };
