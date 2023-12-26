// components/LoginSignup.js
'use client'
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/Config';
import styles from '../styles/login.module.css'; 
import Image from 'next/image';
import kl from '../assets/kamerlark.png'
const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added name state
  const [phoneNumber, setPhoneNumber] = useState(''); // Added phone number state
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // successful login 
      } else {
        // For signup, include additional fields like name and phone number
        await createUserWithEmailAndPassword(auth, email, password, {
          displayName: name,
          phoneNumber: phoneNumber,
        });
        //   successful signup 
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div className={styles.container}>
       
      <form className={styles.form} onSubmit={handleSubmit}>
      <Image src={kl} alt="Kamerlark" className={styles.logo} width={70} height={70}/>
        <label className={styles.label}>
          Email:
          <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={styles.label}>
          Password:
          <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {!isLogin && ( // Render additional fields only for signup
          <>
            <label className={styles.label}>
              Name:
              <input className={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className={styles.label}>
              Phone Number:
              <input className={styles.input} type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </label>
          </>
        )}
        <button className={styles.button} type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p className={styles.link} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Don\'t have an account? Sign up here.' : 'Already have an account? Login here.'}
      </p>
    </div>
  );
};

export default LoginSignup;
