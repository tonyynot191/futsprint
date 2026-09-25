// src/lib/imageUtils.js

/**
 * True on devices where a camera-capture input is genuinely useful.
 * Laptops and desktops return false.
 */
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    (navigator.maxTouchPoints ?? 0) > 0 ||
    (navigator.msMaxTouchPoints ?? 0) > 0
  );
}

/**
 * Compresses an image file on the client.
 * - Non-images pass through untouched.
 * - Images smaller than `minBytes` pass through untouched.
 * - Larger images are scaled to fit within `maxDim` and re-encoded as JPEG.
 *
 * Returns { file, compressed } where `compressed` is true if it was re-encoded.
 */
export async function compressImage(
  file,
  { maxDim = 2000, quality = 0.82, minBytes = 900 * 1024 } = {}
) {
  if (!file || !file.type?.startsWith('image/')) {
    return { file, compressed: false };
  }
  if (file.size <= minBytes) {
    return { file, compressed: false };
  }
  // Skip formats we can't safely re-encode
  if (file.type === 'image/gif') {
    return { file, compressed: false };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob) return { file, compressed: false };

    // If compression somehow produced a bigger file, keep the original
    if (blob.size >= file.size) {
      return { file, compressed: false };
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    const newFile = new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    return { file: newFile, compressed: true };
  } catch (err) {
    // Non-fatal — just upload the original
    // eslint-disable-next-line no-console
    console.warn('[FUTSPrint] Image compression failed:', err);
    return { file, compressed: false };
  }
}

export function formatMB(bytes) {
  if (!bytes && bytes !== 0) return '';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}