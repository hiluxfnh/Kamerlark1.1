
'use client'
// Removed 'use client' as it's not a standard directive
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/Config';
import styles from '../../styles/roomcard.module.css';
import Image from 'next/image';

const RoomCard = ({ roomid, name, price, description, imageSrc }) => {
  const router = useRouter();
  const userState = useAuthState(auth);
  const user = userState?.[0];
  

  const handleButtonClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/room/${roomid.toLowerCase()}`);
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
        <p className={styles.price}>Price: {price}</p>
        <p className={styles.description}>{description}</p>
        <button className={styles.button} onClick={() => handleButtonClick()}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default RoomCard;