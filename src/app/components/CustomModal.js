import React from 'react';
import styles from '@/app/styles/CustomModal.module.css';

const CustomModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modal_overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modal_header}>
          <h2>{title}</h2>
          <button className={styles.close_button} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modal_body}>
          {children}
        </div>
      </div>
    </>
  );
};

export default CustomModal;
