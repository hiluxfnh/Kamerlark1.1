"use client";
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import { db } from "./firebase/Config";
import { collection, getDocs } from "firebase/firestore";
import Footer from "./components/Footer";
import ImageSlider from "./components/Imageslider";
import RoomCardNew from "./components/roomCard"; // Import RoomCardNew
import Image from "next/image";
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
    description:
      "Embark on an exhilarating boat ride and explore the wonders of the open sea. Uncover hidden treasures and create lasting memories.",
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/a1.png?alt=media&token=47cb700a-ec0f-4df0-b80b-3755b10d0854",
    alt: "Majestic Forest Retreat",
    title: "Embrace Nature's Majesty",
    description:
      "Immerse yourself in the enchanting beauty of a majestic forest. Connect with nature and experience the serenity of the great outdoors.",
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/Untitled%20design-11.png?alt=media&token=fe5ba00b-fd8e-4328-a971-26c2d9fc1d2a",
    alt: "Cityscape Marvels",
    title: "Explore Urban Wonders",
    description:
      "Dive into the hustle and bustle of a vibrant city. Marvel at modern architecture, cultural landmarks, and the pulsating energy of urban life.",
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/proctoshield-8eaf3.appspot.com/o/Untitled%20design-12.png?alt=media&token=e5163b88-de44-47fe-956e-01ac18dbbc53",
    alt: "Charming Streets of Italy",
    title: "Romantic Italian Escapade",
    description:
      "Stroll through charming streets, savor exquisite cuisine, and bask in the romantic ambiance of Italy. Experience a dreamy getaway like never before.",
  },
];


export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // Start with 4 items visible (2 rows)
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true); // Show spinner
      const roomCollection = collection(db, "roomdetails");
      const roomSnapshot = await getDocs(roomCollection);
      const roomList = roomSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomList);
      setLoading(false); // Hide spinner
    };

    fetchRooms();
  }, []);

  return (
    <>
      <Header />
      <div className="w-screen bg-black">
      <div className="w-screen h-120 mx-auto mb-5">
        <ImageSlider slides={slides} />
      </div>
      </div>
      <div className="w-256 mx-auto">
        <h1 className="text-xl font-semibold my-3">Popular Accommodations</h1>
        <p>Here are most rated Accommodations you can view.</p>
        <div className="grid grid-cols-4 w-full mx-auto gap-5 mt-3">
          {[...rooms,...rooms].slice(0, visibleCount).map((room) => (
            <RoomCardNew room={room} key={room.id} />
          ))}
        </div>
      </div>
      <div className="w-256 mx-auto rounded-lg my-5 flex flex-row items-center overflow-hidden relative" style={{
        boxShadow: "0 0 10px 0 lightgrey",
        height: "280px",
      }}>
          <Image src={require('./assets/work_2_dribbble-01_4x.png')} alt="Work from Home" className="rounded-lg w-80 ml-32" width={1000} height={1000}/>
          <div style={{
            width:'450px',
            height:'380px',
          }} className="rounded-full bg-teal-950 flex flex-row items-center justify-center flex-wrap ml-16">
              <div className="m-10"><p className="text-base text-white">
                Find your next accommodation from <span className="text-base text-gray-300">KamerLark.</span> 
              </p>
              <button className="text-sm p-2 px-4 bg-cyan-700 rounded-sm text-white my-2">FIND STAYS</button></div>
          </div>
          <div className=" absolute rounded-full bg-yellow-500 bottom-3" style={{
            width: '150px',
            height: '150px',
            left:'-50px',
          }}>

          </div>
          <div className=" absolute rounded-full bg-yellow-500 top-10 left-5" style={{
            width: '50px',
            height: '50px',
          }}>

          </div>
      </div>
      <Footer />
    </>
  );
}
