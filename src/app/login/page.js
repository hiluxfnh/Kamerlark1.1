"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../firebase/Config";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import {
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { uploadImage } from "../lib/uploadImage";
import styles from "../styles/login.module.css";
import Image from "next/image";
import kl from "../assets/kamerlark.png";
import { useRouter, useSearchParams } from "next/navigation";
import Message from "../components/Message";
import { useI18n } from "../lib/i18n";

// Official multicolor Google "G" — the red G+ icon was retired years ago
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.3c-2.1 1.6-4.7 2.7-7.5 2.7-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.6l6.5 5.3C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

// Map raw Firebase auth errors to a translation key; the caller runs it
// through t() so the message follows the user's language.
const friendlyAuthErrorKey = (err) => {
  const code = String(err?.code || err?.message || "").toLowerCase();
  if (
    code.includes("wrong-password") ||
    code.includes("invalid-credential") ||
    code.includes("invalid-login")
  )
    return "auth.errIncorrect";
  if (code.includes("user-not-found")) return "auth.errNoAccount";
  if (code.includes("email-already-in-use")) return "auth.errEmailInUse";
  if (code.includes("weak-password")) return "auth.errWeakPassword";
  if (code.includes("invalid-email")) return "auth.errInvalidEmail";
  if (code.includes("too-many-requests")) return "auth.errTooMany";
  if (code.includes("network")) return "auth.errNetwork";
  return "auth.errGeneric";
};

const LoginSignup = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingSource, setSubmittingSource] = useState(null); // 'email' | 'google' | null

  const [createUserWithFirebase, createUserLoading, createUserError] =
    useCreateUserWithEmailAndPassword(auth);
  const [signInWithFirebase, signInLoading, signInError] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get("next");

  // Avoid hook-driven error popups; handle errors inline in submit handlers.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    setSubmittingSource("email");

    try {
      if (
        !isLogin &&
        (!firstName || !lastName || !email || !password || !phoneNumber)
      ) {
        setErrorMessage(t("auth.fillAllFields"));
        return;
      }

      if (isLogin) {
        const userCredential = await signInWithFirebase(email, password);
        if (!userCredential) {
          setErrorMessage(t(friendlyAuthErrorKey(signInError)));
          return;
        }
        sessionStorage.setItem("user", true);
        router.replace(nextUrl || "/");
        return;
      } else {
        const userCredential = await createUserWithFirebase(email, password);
        if (!userCredential) {
          setErrorMessage(t(friendlyAuthErrorKey(createUserError)));
          return;
        }
        const user = userCredential.user;
        const profilePictureURL = profilePicture
          ? await uploadProfilePicture(user.uid)
          : null;

        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
          photoURL: profilePictureURL,
          phoneNumber: phoneNumber,
        });

        await setDoc(doc(db, "Users", user.uid), {
          userName: `${firstName} ${lastName}`,
          email: email,
          phoneNumber: phoneNumber,
          photoURL: profilePictureURL,
        });

        sessionStorage.setItem("user", true);
        router.replace(nextUrl || "/");
        return;
      }
    } catch (error) {
      console.error("Auth Error:", error?.code, error?.message);
      setErrorMessage(t(friendlyAuthErrorKey(error)));
    } finally {
      setIsSubmitting(false);
      setSubmittingSource(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setSubmittingSource("google");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const userRef = doc(db, "Users", result.user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            userName: result.user.displayName,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
            photoURL: result.user.photoURL,
          });
        }
        sessionStorage.setItem("user", true);
        router.replace(nextUrl || "/");
        return;
      }
    } catch (error) {
      const msg =
        error && error.message
          ? error.message
          : String(error || "Unknown error");
      console.error("Google Sign-in Error:", msg);
      setErrorMessage(`${t("auth.errorPrefix")}${msg}`);
    } finally {
      setIsSubmitting(false);
      setSubmittingSource(null);
    }
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const uploadProfilePicture = async (uid) => {
    if (!profilePicture) return null;
    return uploadImage(
      profilePicture,
      `profile_pictures/${uid}/${profilePicture.name}`
    );
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setProfilePicture(null);
  };

  return (
    <>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Image
            src={kl}
            alt="Kamerlark"
            className={styles.logo}
            width={50}
            height={60}
          />
          <br />
          <p className={styles.subtitle}>
            {isLogin ? t("auth.loginTitle") : t("auth.signupTitle")}
          </p>

          <div className={styles.google}>
            <button
              type="button"
              className={styles.googlebutton}
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || signInLoading || createUserLoading}
            >
              <span className={styles.buttonContent}>
                {submittingSource === "google" ? (
                  <span className={styles.spinnerDark} aria-hidden="true" />
                ) : (
                  <span className={styles.iconPadding}>
                    <GoogleIcon />
                  </span>
                )}
                <span>
                  {submittingSource === "google"
                    ? t("auth.signingIn")
                    : t("auth.continueGoogle")}
                </span>
              </span>
            </button>
          </div>

          {!isLogin && (
            <>
              <label className={styles.label}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={t("auth.firstName")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              <label className={styles.label}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={t("auth.lastName")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label className={styles.label}>
            <input
              className={styles.input}
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            <input
              className={styles.input}
              type="password"
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {!isLogin && (
            <>
              <label className={styles.label}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={t("auth.phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </label>

              <label className={styles.label}>
                {/* Optional — uploads need Firebase Storage, and forcing a
                    photo at signup hurt conversion anyway */}
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </label>
            </>
          )}

          <button
            className={styles.button}
            type="submit"
            disabled={isSubmitting || signInLoading || createUserLoading}
            aria-busy={isSubmitting}
          >
            <span className={styles.buttonContent}>
              {submittingSource === "email" && (
                <span className={styles.spinner} aria-hidden="true" />
              )}
              <span>
                {isSubmitting && submittingSource === "email"
                  ? isLogin
                    ? t("auth.loggingIn")
                    : t("auth.signingUp")
                  : isLogin
                  ? t("auth.login")
                  : t("auth.signup")}
              </span>
            </span>
          </button>
        </form>

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}
        {/* Success toast removed to avoid flicker; we navigate immediately */}

        <p className={styles.link} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}
        </p>
      </div>

      <div className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} KamerLark. {t("footer.rights")}</p>
      </div>
    </>
  );
};

export default LoginSignup;
