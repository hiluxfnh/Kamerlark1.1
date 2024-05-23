'use client';
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import { db } from '@/app/firebase/Config';
import { collection, getDocs } from 'firebase/firestore';
import SearchBar from './components/searchbar';
import RoomCard from './components/rooms/listing';
import Footer from './components/Footer';
import kam from './styles/roomcard.module.css';
import ImageSlider from './components/Imageslider';
import Viewmorerooms from './components/Viewmorerooms';


const slides = [
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/Untitled%20design-16.png?alt=media&token=269515d4-2e7d-4380-8b6d-6de5029168a9",
    alt: "50% off on all Room Bookings. Book now to avail the offer.",
    title: "Christmas Sale is Here 🎄",
    description: "50% off on all Room Bookings. Book now to avail the offer.",
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/Untitled%20design-13.png?alt=media&token=0ae4283d-b5b2-41f7-bfce-32944f26acb3",
    alt: "Adventurous Boat Ride",
    title: "Sail into Adventure",
    description: "Embark on an exhilarating boat ride and explore the wonders of the open sea. Uncover hidden treasures and create lasting memories.",
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/a1.png?alt=media&token=47cb700a-ec0f-4df0-b80b-3755b10d0854',
    alt: "Majestic Forest Retreat",
    title: "Embrace Nature's Majesty",
    description: "Immerse yourself in the enchanting beauty of a majestic forest. Connect with nature and experience the serenity of the great outdoors.",
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/Untitled%20design-11.png?alt=media&token=fe5ba00b-fd8e-4328-a971-26c2d9fc1d2a",
    alt: "Cityscape Marvels",
    title: "Explore Urban Wonders",
    description: "Dive into the hustle and bustle of a vibrant city. Marvel at modern architecture, cultural landmarks, and the pulsating energy of urban life.",
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/Untitled%20design-12.png?alt=media&token=e5163b88-de44-47fe-956e-01ac18dbbc53",
    alt: "Charming Streets of Italy",
    title: "Romantic Italian Escapade",
    description: "Stroll through charming streets, savor exquisite cuisine, and bask in the romantic ambiance of Italy. Experience a dreamy getaway like never before.",
  },
];

const containerStyles = {
  width: "90%",
  height: "50vh",
  margin: "0 auto",
  marginTop: '2%',
  marginBottom: "2%",
  fontFamily: "'Poppins', sans-serif",
};

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // Start with 4 items visible (2 rows)

  useEffect(() => {
    const fetchRooms = async () => {
      const roomCollection = collection(db, 'roomdetails');
      const roomSnapshot = await getDocs(roomCollection);
      const roomList = roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(roomList);
    };

    fetchRooms();
  }, []);

  const handleViewMore = () => {
    setVisibleCount(prevCount => prevCount + 4); // Increase by 4 items (2 more rows)
  };

  const handleViewLess = () => {
    setVisibleCount(4); // Reset to show only 4 items
  };

  const buttonStyles = {
    margin: '10px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  const buttonContainerStyles = {
    textAlign: 'center',
    margin: '20px 0',
  };

  return (
    <>
      <Header />
      <div style={containerStyles}>
        <ImageSlider slides={slides} />
      </div>

      <SearchBar />

      <div>
        <div className={kam.cardcon}>
          {rooms.slice(0, visibleCount).map((room) => (
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
        <div style={buttonContainerStyles}>
          {visibleCount < rooms.length && (
            <button onClick={handleViewMore} style={buttonStyles}>View More</button>
          )}
          {visibleCount > 4 && (
            <button onClick={handleViewLess} style={{ ...buttonStyles, backgroundColor: '#dc3545' }}>View Less</button>
          )}
        </div>
      </div>
      <br/>
      <Footer />
    </>
  );
}