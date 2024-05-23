// components/Footer.js
import React from 'react';
import styles from '../styles/Footer.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.companyInfo}>
          <p>&copy; {new Date().getFullYear()} KamerLark. All rights reserved.</p>
          <p>Your trusted accommodation platform.</p>
        </div>
        <div className={styles.contactInfo}>
          <h4>Contact Us</h4>
          <p><FontAwesomeIcon icon={faEnvelope} /> info@kamerlark.com</p>
          <p><FontAwesomeIcon icon={faPhone} /> +123 456 7890</p>
          <p><FontAwesomeIcon icon={faMapMarkerAlt} /> 123 Main Street, City, Country</p>
        </div>
        <div className={styles.quickLinks}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/listings">Listings</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className={styles.socialMedia}>
          <h4>Follow Us</h4>
          <a href="https://www.facebook.com/kamerlark" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </a>
          <a href="https://www.twitter.com/kamerlark" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} size="2x" />
          </a>
          <a href="https://www.instagram.com/kamerlark" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} size="2x" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
