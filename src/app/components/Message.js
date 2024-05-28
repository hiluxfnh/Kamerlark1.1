import styles from '../styles/message.module.css';

const Message = ({ message, type, onClose }) => {
  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose}></div>
      <div className={`${styles.modal} ${type === 'success' ? styles.success : styles.error}`}>
        <p>{message}</p>
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
};

export default Message;
