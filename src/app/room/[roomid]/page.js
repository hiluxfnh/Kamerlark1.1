'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { db } from '../../firebase/Config'; // Adjust the import as necessary
import { collection, getDocs } from "firebase/firestore";
import RoomDetails from '../roomdetails';
import styles from '../../styles/roomdetails.module.css';
import kam from '../../styles/roomcard.module.css';
import Spinner from '../../components/Spinner'; // Import Spinner
import RoomCardNew from '../../components/roomCard';
import Footer from '../../components/Footer';

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
          <Footer />
        </>
      )}
    </>
  );
}
