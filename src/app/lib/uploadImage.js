// Single entry point for all image uploads.
//
// Provider selection (no code changes needed to switch):
//  - If NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
//    are set, uploads go to Cloudinary (free tier, used while the Firebase
//    project has no Storage bucket — new Firebase projects gate Storage
//    behind the Blaze plan).
//  - Otherwise, uploads go to Firebase Storage at the given path (works on
//    the original kamerlark1 project, which has a free-plan bucket).
//
// Returns a public https URL either way; callers store it in Firestore
// exactly as before.
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/Config";
import { compressImage } from "./imageCompress";

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file, path) {
  // Downscale + recompress in the browser before uploading. Keeps stored
  // images (and the pages that display them) small. Falls back to the original
  // file on any failure, so uploads never break.
  file = await compressImage(file);

  if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_PRESET);
    // Mirror the storage path's directory as a Cloudinary folder
    const folder = path.split("/").slice(0, -1).join("/");
    if (folder) form.append("folder", folder);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Image upload failed (${res.status}): ${detail.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.secure_url;
  }

  // Firebase Storage fallback
  const storageReference = ref(storage, path);
  await uploadBytes(storageReference, file);
  return getDownloadURL(storageReference);
}

// Upload many files; pathFor(file) builds the per-file storage path.
export async function uploadImages(files, pathFor) {
  return Promise.all(files.map((file) => uploadImage(file, pathFor(file))));
}
