'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { db } from '../../firebase/Config'; // Adjust the import as necessary
import {doc, getDocs } from "firebase/firestore";
import RoomDetails from '../roomdetails';
import Spinner from '../../components/Spinner'; // Import Spinner
import Footer from '../../components/Footer';

export default function Roomid({ params }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const { roomid } = params;
  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true); // Show spinner
      try {
        const querySnapshot = await getDocs(doc(db, "rooms", roomid));
        querySnapshot.forEach((doc) => {
          setRoom({
            id: doc.id,
            ...doc.data(),
          });
        });
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
