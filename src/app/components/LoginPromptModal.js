'use client';

import React from 'react';
import styles from '../styles/Modal.module.css';
import { useI18n } from '../lib/i18n';

const LoginPromptModal = ({ show, handleClose, handleLogin }) => {
  const { t } = useI18n();
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>{t('prompt.title')}</h2>
        <p>{t('prompt.body')}</p>
        <div className={styles.modalActions}>
          <button onClick={handleLogin} className={styles.loginButton}>{t('nav.login')}</button>
          <button onClick={handleClose} className={styles.closeButton}>{t('prompt.close')}</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
