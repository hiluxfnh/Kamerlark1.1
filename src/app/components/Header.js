'use client'
// Header.js

// Header.js
// Header.js
// Header.js
// Header.js
import React, { useState } from 'react';
import styles from '../styles/Header.module.css';
import Image from 'next/image';
import kl from '../assets/Kamerlark.png';

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

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
            <a href="#" className={styles.navLink} onClick={handleNavToggle}>
              Services
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
        <button className={styles.loginButton}>Login</button>
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
