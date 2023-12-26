// components/RoomDetails.js
import React from 'react';
import styles from '../styles/roomdetails.module.css';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone,faFacebook,faBed } from '@fortawesome/free-solid-svg-icons';
const RoomDetails = ({ room }) => {
  return (
    <>
     <div className={styles.room_details_wrapper}>
    <div className={styles.room_details_container}>
      <Image src={room.imagesrc} alt={room.Roomid} width={450} height={350} />
      <h6>Room id: {room.Roomid}</h6>
      <h1>Room name: {room.name}</h1>
      <h5><p>Price: {room.price}</p></h5>
      <p><span><FontAwesomeIcon icon={faBed} /></span>    {room.capacity} people</p>
      <p>Description: {room.description}</p>
      <p>Bed Type: {room.bedType}</p>
      <p>Washrooms: {room.Washrooms}</p>
      <p><h4>Nearby School / University:  {room.uni}</h4></p>
      <p><span><FontAwesomeIcon icon={faPhone} /></span> {room.phno}</p>
      {/* Add more details as needed */}
      <button className={styles.bookbutton} onClick={() => console.log('Book Now')}>Book Now</button>
      <FontAwesomeIcon icon={faFacebook} />
    </div>
    <button className={styles.viewmorebutton} onClick={() => console.log('Book Now')}>More Rooms..</button>
    </div>
    </>
  );
};

export default RoomDetails;
