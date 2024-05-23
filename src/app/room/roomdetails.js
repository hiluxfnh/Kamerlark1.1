import React, { useState } from 'react';
import styles from '../styles/roomdetails.module.css';
import Image from 'next/image';
// import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faFacebook, faBed } from '@fortawesome/free-solid-svg-icons';
import MapComponent from '../components/MapComponent'; // Ensure the path is correct

const RoomDetails = ({ room }) => {
  if (!room) {
    return <div>Loading...</div>; // Loading state if room data is not yet available
  }

  // Ensure only a maximum of four images are used
  const images = room.images.slice(0, 4);
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
                  <div className={styles.thumbnail}>
                    <Image src={image} alt={`Image ${index}`} width={100} height={75} layout="responsive" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <br/>
            <br/>
            <div className={styles.room_name}>
              <h1><b>Room name:</b> {room.name}</h1>
            </div>

            <div className={styles.room_price}>
              <h5><b>Price:</b> {room.price}</h5>
            </div>

            <div className={styles.room_capacity}>
              <p><b><span><FontAwesomeIcon icon={faBed} /></span> Capacity:</b> {room.capacity} people</p>
            </div>

            <div className={styles.room_description}>
              <p><b>Description:</b> {room.description}</p>
            </div>

            <div className={styles.room_bed_type}>
              <p><b>Bed Type:</b> {room.bedType}</p>
            </div>

            <div className={styles.room_washrooms}>
              <p><b>Washrooms:</b> {room.washrooms}</p>
            </div>

            <div className={styles.room_university}>
              <h4><b>Nearby School / University:</b> {room.uni}</h4> 
            </div>

            <div className={styles.room_contact}>
              <p><b><span><FontAwesomeIcon icon={faPhone} /></span> Contact:</b> {room.phno}</p>
            </div>

            <div className={styles.booking_button_container}>
              <button className={styles.bookbutton} onClick={() => console.log('Book Now')}>Book Now</button>
            </div>

            <div className={styles.social_media_icon}>
              <FontAwesomeIcon icon={faFacebook} />
            </div>
          </div>
        </div>
        <div>
          <MapComponent latitude={room.latitude} longitude={room.longitude} />
        </div>
      </div>
    </>
  );
};

export default RoomDetails;
