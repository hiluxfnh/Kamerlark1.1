// firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// All values come from env (.env.local locally, dashboard vars in prod).
// No hardcoded fallbacks: a missing variable must fail loudly instead of
// silently pointing at the wrong Firebase project.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Firebase env vars missing — copy .env.local.example to .env.local and fill it in."
  );
}

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
