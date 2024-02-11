import React, { useState } from 'react';
import styles from '../styles/roomdetails.module.css';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faFacebook, faBed } from '@fortawesome/free-solid-svg-icons';

const RoomDetails = ({ room }) => {
  const images = [room.imagesrc];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  
  return (
    <>
      <div className={styles.room_details_wrapper}>
        <div className={styles.room_details_container}>
          <div className={`${styles.gallery} ${styles.lightbox}`}>
            <div className={styles.room_image}>
              <Image src={selectedImage} alt={room.name} width={450} height={350} layout="responsive" />
            </div>
            <div className={styles.image_grid}>
              {images.map((image, index) => (
                <div key={index} className={styles.grid_item} onClick={() => setSelectedImage(image)}>
                  <div className={styles.image1}>
                    <Image src={image} alt={`Image ${index}`} width={100} height={75} layout="responsive" />
                  </div>
                  <div className={styles.image2}>
                    <Image src={image} alt={`Image ${index}`} width={100} height={75} layout="responsive" />
                  </div>
                  <div className={styles.image3}>
                    <Image src={image} alt={`Image ${index}`} width={100} height={75} layout="responsive" />
                  </div>
                  <div className={styles.image4}>
                    <Image src={image} alt={`Image ${index}`} width={100} height={75} layout="responsive" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.room_id}>
              <h6>Room id: {room.Roomid}</h6>
            </div>

            <div className={styles.room_name}>
              <h1>Room name: {room.name}</h1>
            </div>

            <div className={styles.room_price}>
              <h5>Price: {room.price}</h5>
            </div>

            <div className={styles.room_capacity}>
              <p><span><FontAwesomeIcon icon={faBed} /></span> {room.capacity} people</p>
            </div>

            <div className={styles.room_description}>
              <p>Description: {room.description}</p>
            </div>

            <div className={styles.room_bed_type}>
              <p>Bed Type: {room.bedType}</p>
            </div>

            <div className={styles.room_washrooms}>
              <p>Washrooms: {room.Washrooms}</p>
            </div>

            <div className={styles.room_university}>
              <h4>Nearby School / University: {room.uni}</h4>
            </div>

            <div className={styles.room_contact}>
              <p><span><FontAwesomeIcon icon={faPhone} /></span> {room.phno}</p>
            </div>

            {/* You can add more divs for additional details as needed */}

            <div className={styles.booking_button_container}>
              <button className={styles.bookbutton} onClick={() => console.log('Book Now')}>Book Now</button>
            </div>

            <div className={styles.social_media_icon}>
              <FontAwesomeIcon icon={faFacebook} />
            </div>
          </div>
        </div>
      </div>
  

    </>
  );
};

export default RoomDetails;
