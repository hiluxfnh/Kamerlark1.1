'use client';

import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase/Config';
import { 
  useCreateUserWithEmailAndPassword, 
  useSignInWithEmailAndPassword
} from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import styles from '../styles/login.module.css'; 
import Image from 'next/image';
import kl from '../assets/klchristmas.png';
import { useRouter } from 'next/navigation'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlusG, faFacebook } from '@fortawesome/free-brands-svg-icons';
import Message from '../components/Message';

const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [createUserWithFirebase, createUserLoading, createUserError] = useCreateUserWithEmailAndPassword(auth);
  const [signInWithFirebase, signInLoading, signInError] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  useEffect(() => {
    if (signInError) {
      setErrorMessage(`Login Error: ${signInError.message}`);
    }
  }, [signInError]);

  useEffect(() => {
    if (createUserError) {
      setErrorMessage(`Sign Up Error: ${createUserError.message}`);
    }
  }, [createUserError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!isLogin && (!firstName || !lastName || !email || !password || !phoneNumber)) {
        setErrorMessage('Please fill in all fields.');
        return;
      }

      if (isLogin) {
        const userCredential = await signInWithFirebase(email, password);
        if (userCredential) {
          setSuccessMessage('User logged in successfully');
          sessionStorage.setItem('user', true);
          resetForm();
          router.push('/');
        }
      } else {
        const userCredential = await createUserWithFirebase(email, password);
        const user = userCredential.user;
        const profilePictureURL = profilePicture ? await uploadProfilePicture(user.uid) : null;

        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
          photoURL: profilePictureURL,
          phoneNumber: phoneNumber,
        });

        await setDoc(doc(db, "Users", user.uid), {
          userName: `${firstName} ${lastName}`,
          email: email,
          phoneNumber: phoneNumber,
          photoURL: profilePictureURL
        });

        setSuccessMessage('User created successfully');
        sessionStorage.setItem('user', true);
        resetForm();
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
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
        setSuccessMessage('User logged in with Google successfully');
        sessionStorage.setItem('user', true);
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const uploadProfilePicture = async (uid) => {
    if (!profilePicture) return null;
    const storageRef = ref(storage, `profile_pictures/${uid}/${profilePicture.name}`);
    await uploadBytes(storageRef, profilePicture);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setProfilePicture(null);
  };

  return (
    <>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Image src={kl} alt="Kamerlark" className={styles.logo} width={50} height={60} />
          <br />
          <p className={styles.subtitle}>{isLogin ? 'Login to your account' : 'Sign up for an account'}</p>

          <div className={styles.google}>
            <button type="button" className={styles.googlebutton} onClick={handleGoogleSignIn} disabled={signInLoading || createUserLoading}>
              <span className={styles.iconPadding}><FontAwesomeIcon icon={faGooglePlusG} style={{ color: 'red' }} /></span>
              Continue with Google
            </button>
          </div>

          <div className={styles.facebook}>
            <button className={styles.facebookbutton} type="button">
              <span className={styles.iconPadding}><FontAwesomeIcon icon={faFacebook} style={{ color: '#1877f2' }} /></span>
              Continue with Facebook
            </button>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>────────── or ──────────</span>
          </div>

          {!isLogin && (
            <>
              <label className={styles.label}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder='First Name'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              <label className={styles.label}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder='Last Name'
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
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            <input
              className={styles.input}
              type="password"
              placeholder='Password'
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
                  placeholder='Phone Number'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </label>

              <label className={styles.label}>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  required
                />
              </label>
            </>
          )}

          <button className={styles.button} type="submit" disabled={signInLoading || createUserLoading}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {errorMessage && <Message message={errorMessage} type="error" onClose={() => setErrorMessage('')} />}
        {successMessage && <Message message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}

        <p className={styles.link} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up here." : "Already have an account? Login here."}
        </p>
      </div>

      <div className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} KamerLark. All rights reserved.</p>
      </div>
    </>
  );
};

export default LoginSignup;
