'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { db } from '@/app/firebase/Config'; // Adjust the import as necessary
import { collection, getDocs } from "firebase/firestore";
import RoomDetails from '../roomdetails';
import styles from '../../styles/roomdetails.module.css';
import kam from '../../styles/roomcard.module.css';
import RoomCard from '../../components/rooms/listing';

export default function Roomid({ params }) {
  const [showMoreRooms, setShowMoreRooms] = useState(false);
  const [room, setRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4); // Start with 4 rooms visible

  const { roomid } = params;

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

    if (roomid) {
      fetchRoomData();
    }
  }, [roomid]);

  const handleViewMore = () => {
    setVisibleCount(prevCount => prevCount + 4); // Load 4 more rooms
  };

  const handleViewLess = () => {
    setVisibleCount(4); // Reset to show only 4 rooms
  };

  return (
    <>
      <Header />
      <div>
        {loading ? (
          <div className={styles.loadingContainer}>Loading...</div>
        ) : (
          room ? (
            <RoomDetails room={room} />
          ) : (
            <div>Room not found</div>
          )
        )}
      </div>
      {!loading && (
        <>
          <div className={kam.cardcon}>
            {allRooms.slice(0, visibleCount).map((room) => (
              <RoomCard key={room.id} {...room} />
            ))}
          </div>
          <div className={styles.more_rooms_button_container}>
            {visibleCount < allRooms.length && (
              <button className={styles.viewmorebutton} onClick={handleViewMore}>More Rooms..</button>
            )}
            {visibleCount > 4 && (
              <button className={styles.viewmorebutton} onClick={handleViewLess} style={{ backgroundColor: '#dc3545' }}>View Less</button>
            )}
          </div>
          <br/>
          <br/>
        </>
      )}
    </>
  );
}
