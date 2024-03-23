'use client'
import React, { useState } from 'react';
import styles from '../styles/Header.module.css';
import Image from 'next/image';
import kl from '../assets/Kl_christmas.png';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/Config';


const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user] = useAuthState(auth);
  
 const listingpage=()=>{
  if (!user) {
    router.push('/login');
  }
  else{
    router.push('/listing');
  }
 
 };
  const handleNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };
  const router=useRouter();
  const handleLogin = () => {
    if(!user){
      router.push('/login');
    }
    else{
      auth.signOut();
    }
  }
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image src={kl} alt="Logo" className={styles.logoImage} />
        <span className={styles.logoText}>KamerLark</span>
      </div>
      <nav className={`${styles.nav} ${isNavOpen ? styles.navOpen : ''}`}>
        <ul className={styles.navList}>
          <li>
            <a href="#" className={styles.navLink} onClick={handleNavToggle}>
              Home
            </a>
          </li>
          <li>
            <a href="#" className={styles.navLink} onClick={handleNavToggle}>
              Listings
            </a>
          </li>
          <li>
            <a href="/community" className={styles.navLink} onClick={handleNavToggle}>
              Community
            </a>
          </li>
          <li>
            <a href="#" className={styles.navLink} onClick={handleNavToggle}>
              Contact
            </a>
          </li>
        </ul>
      </nav>
      <div className={styles.actions}>
      <button className={styles.addlisting} onClick={listingpage}><FontAwesomeIcon icon={faPlus} />  Add Listing</button>
        <button className={styles.loginButton} onClick={handleLogin}>
          {user ? 'Logout' : 'Login'}
          </button>
        <button className={styles.hamburger} onClick={handleNavToggle}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
