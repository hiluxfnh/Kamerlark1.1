// components/LoginSignup.js
'use client';
import { useState } from 'react';
import { auth } from '@/app/firebase/Config';
import { useCreateUserWithEmailAndPassword, useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';

import styles from '../styles/login.module.css'; 
import Image from 'next/image';
import kl from '../assets/kl_christmas.png';
import { useRouter } from 'next/navigation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlusG, faFacebook } from '@fortawesome/free-brands-svg-icons';

const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const [createUserWithFirebase] = useCreateUserWithEmailAndPassword(auth);
  const [signInWithFirebase] = useSignInWithEmailAndPassword(auth);
  const router=useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithFirebase(email, password);
        console.log('User logged in successfully');
        sessionStorage.setItem('user', true);
        setEmail('');
        setPassword('');
        router.push('/');
      } 

      else {
        await createUserWithFirebase(email, password, {
          displayName: name,
          phoneNumber: phoneNumber,
        });
        console.log('User created successfully');
        sessionStorage.setItem('user', true);
        setEmail('');
        setPassword('');
        setName('');
        setPhoneNumber('');
      }
    } catch (error) {
      console.error('Error:', error.message);

    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Image src={kl} alt="Kamerlark" className={styles.logo} width={50} height={60}/>
        <h2 className={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <p className={styles.subtitle}>{isLogin ? 'Login to your account' : 'Sign up for an account'}</p>

        <div className={styles.google}>
          <button className={styles.googlebutton} type="submit">
            <span className={styles.iconPadding}><FontAwesomeIcon icon={faGooglePlusG} style={{ color: 'red' }} /></span>
            Continue with Google
          </button>
        </div>

        <div className={styles.facebook}>
          <button className={styles.facebookbutton} type="submit">
            <span className={styles.iconPadding}><FontAwesomeIcon icon={faFacebook} style={{ color: '#1877f2' }} /></span>
            Continue with Facebook
          </button>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerText}>────────── or ──────────</span>
        </div>

        <label className={styles.label}>
          <input className={styles.input} type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className={styles.label}>
          <input className={styles.input} type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {!isLogin && (
          <>
            <label className={styles.label}>
              <input className={styles.input} type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label className={styles.label}>
              <input className={styles.input} type="text" placeholder='Phone Number' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </label>
          </>
        )}

        <button className={styles.button} type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>

      <p className={styles.link} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up here." : "Already have an account? Login here."}
      </p>
    </div>
  );
};

export default LoginSignup;
