'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/Config';
import styles from '../../styles/roomcard.module.css';
import Image from 'next/image';

const RoomCard = ({ roomid, name, price, currency, description, imageSrc }) => {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const handleButtonClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/room/${roomid}`);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={imageSrc}
          alt={name}
          width={300}
          height={200}
          objectFit="cover"
          className={styles.image}
        />
      </div>
      <div className={styles.cardContent}>
        <h3>{name}</h3>
        <p className={styles.price}><b>Price:</b> {price} {currency}</p>
        <p className={styles.description}><b>About:</b> {description}</p>
        <button className={styles.button} onClick={handleButtonClick}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
