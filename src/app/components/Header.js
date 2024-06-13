'use client';

import React, { useState } from 'react';
import styles from '../styles/Header.module.css';
import Image from 'next/image';
import kl from '../assets/Kl_christmas.png';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/Config';
import LoginPromptModal from './LoginPromptModal'; // Import the LoginPromptModal component

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const listingpage = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/listing');
    }
  };

  const handleNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogin = () => {
    if (!user) {
      router.push('/login');
    } else {
      auth.signOut().then(() => {
        if (pathname !== '/') {
          router.push('/login');
        }
      });
    }
  };

  const handleNavLinkClick = (e, path) => {
    if (!user && path !== '/' && path !== '/help') {
      e.preventDefault();
      setShowModal(true);
    } else {
      router.push(path);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalLogin = () => {
    setShowModal(false);
    router.push('/login');
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
            <a href="/" className={styles.navLink} onClick={(e) => handleNavLinkClick(e, '/')}>
              Home
            </a>
          </li>
          <li>
            <a href="/mylisting" className={styles.navLink} onClick={(e) => handleNavLinkClick(e, '/listing')}>
              Listings
            </a>
          </li>
          <li>
            <a href="/community" className={styles.navLink} onClick={(e) => handleNavLinkClick(e, '/community')}>
              Community
            </a>
          </li>
          <li>
            <a href="/profile" className={styles.navLink} onClick={(e) => handleNavLinkClick(e, '/profile')}>
              Profile
            </a>
          </li>
          <li>
            <a href="/help" className={styles.navLink} onClick={(e) => handleNavLinkClick(e, '/help')}>
              Help
            </a>
          </li>
        </ul>
      </nav>
      <div className={styles.actions}>
        <button className={styles.addlisting} onClick={listingpage}>
          <FontAwesomeIcon icon={faPlus} /> Add Listing
        </button>
        <button className={styles.loginButton} onClick={handleLogin}>
          {user ? 'Logout' : 'Login'}
        </button>
        <button className={styles.hamburger} onClick={handleNavToggle}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <LoginPromptModal show={showModal} handleClose={handleModalClose} handleLogin={handleModalLogin} />
    </header>
  );
};

export default Header;
