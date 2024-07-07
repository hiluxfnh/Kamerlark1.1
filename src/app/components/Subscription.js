// SubscriptionPlans.js

import React from 'react';
import styles from '../styles/subscription.module.css'; // Create a CSS module for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck,faX } from '@fortawesome/free-solid-svg-icons';
const Subscription = () => {
  return (
    <div className={styles.subscriptionPlans}>
      <div className={styles.subscriptionCard}>
        <h2>Standard Plan</h2>
        <p>Perfect for individuals or small groups</p>
        <ul>
          <li><FontAwesomeIcon icon={faCheck} style={{ color: 'green',fontSize:'5px' }} />Access to basic amenities  </li>
          <li>Single room booking <FontAwesomeIcon icon={faCheck} /></li>
          <li>Free Wi-Fi <FontAwesomeIcon icon={faX} /></li>
        </ul>
        <button className={styles.subscribeButton}>Subscribe</button>
      </div>

      <div className={styles.subscriptionCard}>
        <h2>Premium Plan</h2>
        <p>Great for families or larger groups</p>
        <ul>
          <li>Access to all amenities <FontAwesomeIcon icon={faCheck} /></li>
          <li>Multiple room booking <FontAwesomeIcon icon={faCheck} /></li>
          <li>Access to KamarLark`&apos;`s community<FontAwesomeIcon icon={faCheck} /></li>
          <li>Free parking <FontAwesomeIcon icon={faCheck} /></li>
        </ul>
        <button className={styles.subscribeButton}>Subscribe</button>
      </div>
    </div>
  );
};

export default Subscription;
