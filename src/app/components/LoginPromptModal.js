'use client';

import React from 'react';
import styles from '../styles/Modal.module.css';

const LoginPromptModal = ({ show, handleClose, handleLogin }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Please Log In</h2>
        <p>You need to log in to access this page.</p>
        <div className={styles.modalActions}>
          <button onClick={handleLogin} className={styles.loginButton}>Log In</button>
          <button onClick={handleClose} className={styles.closeButton}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
