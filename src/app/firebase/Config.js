// firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Fallback values if environment variables aren't available
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBwTX1giyCj1Xtj7A6VW1Lb19tbiiAmm2A",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "kamerlark1.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://kamerlark1-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kamerlark1",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kamerlark1.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "342771663259",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:342771663259:web:6f71b1e03ea003e089213e",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-F59CGZN0Q4",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// App Check (anti-abuse): activates only when a reCAPTCHA v3 site key is
// configured, so local dev keeps working without one. Register the site in
// Firebase Console -> App Check, then set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
// Do NOT enforce App Check in the console until this is live and the
// console metrics show verified traffic, or every client gets blocked.
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  import("firebase/app-check")
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    })
    .catch((e) => console.warn("App Check init failed:", e));
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { app, auth, db, storage };
