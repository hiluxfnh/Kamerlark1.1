// Browser-side image downscale + recompression, run right before upload.
//
// Phone photos are often 3-6 MB at 4000px+; serving those un-resized is the
// single biggest page-weight cost on a photo-heavy listings site. This shrinks
// each image to a sensible max edge and re-encodes it (JPEG for photos, WebP
// when transparency must be kept) so stored files — and therefore page loads —
// are a fraction of the size. It ALWAYS falls back to the original file if
// anything goes wrong, so it can never break an upload.

const MAX_EDGE = 1600; // longest side in px — plenty for full-width display
const JPEG_QUALITY = 0.8;
const WEBP_QUALITY = 0.85;
const SKIP_BELOW_BYTES = 200 * 1024; // already small + no resize needed → leave it

function canEncode(type) {
  try {
    return document.createElement("canvas").toDataURL(type).startsWith(`data:${type}`);
  } catch {
    return false;
  }
}

export async function compressImage(file) {
  try {
    if (typeof window === "undefined" || !file || !file.type) return file;
    if (!file.type.startsWith("image/")) return file;
    // Never rasterize animated or vector formats.
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

    // Preserve transparency for PNG/WebP sources by re-encoding to WebP; if the
    // browser can't encode WebP, leave the file untouched rather than flatten
    // alpha to a black JPEG background.
    const keepsAlpha = file.type === "image/png" || file.type === "image/webp";
    let outType = "image/jpeg";
    let quality = JPEG_QUALITY;
    if (keepsAlpha) {
      if (canEncode("image/webp")) {
        outType = "image/webp";
        quality = WEBP_QUALITY;
      } else {
        return file;
      }
    }

    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    }).catch(() => null);
    if (!bitmap) return file;

    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    if (scale === 1 && file.size < SKIP_BELOW_BYTES) {
      bitmap.close?.();
      return file;
    }

    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise((res) => canvas.toBlob(res, outType, quality));
    // No real gain (e.g. already-optimized image) → keep the original.
    if (!blob || blob.size >= file.size) return file;

    const base = (file.name || "image").replace(/\.\w+$/, "");
    const ext = outType === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], base + ext, { type: outType, lastModified: Date.now() });
  } catch {
    return file;
  }
}
