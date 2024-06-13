'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { db } from '@/app/firebase/Config'; // Adjust the import as necessary
import { collection, getDocs } from "firebase/firestore";
import RoomDetails from '../roomdetails';
import styles from '../../styles/roomdetails.module.css';
import kam from '../../styles/roomcard.module.css';
import RoomCard from '../../components/rooms/listing';
import Spinner from '../../components/Spinner'; // Import Spinner

export default function Roomid({ params }) {
  const [showMoreRooms, setShowMoreRooms] = useState(false);
  const [buttonshow, setButtonshow] = useState('');
  const [room, setRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const { roomid } = params;

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true); // Show spinner
      try {
        console.log('Fetching room data for roomid:', roomid); // Log the roomid
        const querySnapshot = await getDocs(collection(db, "roomdetails"));
        const roomsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllRooms(roomsData);

        const foundRoom = roomsData.find(r => r.id === roomid);
        if (foundRoom) {
          setRoom(foundRoom);
          console.log('Room found:', foundRoom);
        } else {
          console.error(`No room found with roomid: ${roomid}`);
        }
      } catch (error) {
        console.error("Error fetching room data: ", error);
      } finally {
        setLoading(false); // Hide spinner
      }
    };

    if (roomid) {
      fetchRoomData();
    }
  }, [roomid]);

  const handleMoreRoomsClick = () => {
    setShowMoreRooms(true);
    setButtonshow('none');
  };

  return (
    <>
      {loading ? (
        <Spinner /> // Show spinner while loading
      ) : (
        <>
          <Header />
          <div>
            {room ? (
              <RoomDetails room={room} />
            ) : (
              <div>Room not found</div>
            )}
          </div>
          <div className={kam.cardcon}>
            {allRooms.slice(0, 4).map((room) => (
              <RoomCard 
                key={room.id} 
                roomid={room.id} 
                name={room.name} 
                price={room.price} 
                description={room.description} 
                imageSrc={room.images[0]} // Ensure this points to the correct image URL
              />
            ))}
          </div>
          <div className={styles.more_rooms_button_container}>
            {!showMoreRooms && (
              <button className={styles.viewmorebutton} onClick={handleMoreRoomsClick} style={{ display: buttonshow }}>More Rooms..</button>
            )}
          </div>
          {showMoreRooms && (
            <div>
              <div className={kam.cardcon}>
                {allRooms.slice(4).map((room) => (
                  <RoomCard key={room.id} {...room} />
                ))}
              </div>
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <button className={styles.viewmorebutton} onClick={() => setShowMoreRooms(false)}>View Less</button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
