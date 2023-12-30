// components/LoginSignup.js
'use client'
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/Config';
import styles from '../styles/login.module.css'; 
import Image from 'next/image';
import kl from '../assets/kl_christmas.png';

// Import necessary Font Awesome packages
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlusG, faFacebook } from '@fortawesome/free-brands-svg-icons';


const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // successful login 
      } else {
        await createUserWithEmailAndPassword(auth, email, password, {
          displayName: name,
          phoneNumber: phoneNumber,
        });
        // successful signup 
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
      
     {/* continue with google / facebook box with logo */}
<div className={styles.google}>
  {/* Set color to red */}
  <button className={styles.googlebutton} type="submit">
    <span className={styles.iconPadding}><FontAwesomeIcon icon={faGooglePlusG} style={{ color: 'red' }} /></span>
    Continue with Google
  </button>
</div>
<div className={styles.facebook}>
  {/* Set color to blue */}
  <button className={styles.facebookbutton} type="submit">
    <span className={styles.iconPadding}><FontAwesomeIcon icon={faFacebook} style={{ color: '#1877f2' }} /></span>
    Continue with Facebook
  </button>
</div>
    
        <div className={styles.divider}>
          <span className={styles.dividerText}>────────── or ──────────</span>
        </div>
        <label className={styles.label}>
          {/* Email: */}
          <input className={styles.input} type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={styles.label}>
          {/* Password: */}
          <input className={styles.input} type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {!isLogin && (
          <>
            <label className={styles.label}>
              {/* Name: */}
              <input className={styles.input} type="text" placeholder='Name'value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className={styles.label}>
              {/* Phone Number: */}
              <input className={styles.input} type="text" placeholder='Phone Number' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
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