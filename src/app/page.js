"use client";
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import { db } from "./firebase/Config";
import { collection, getDocs } from "firebase/firestore";
import Footer from "./components/Footer";
import ImageSlider from "./components/Imageslider";
import RoomCardNew from "./components/roomCard"; // Import RoomCardNew
import Image from "next/image";
import Link from "next/link";

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
      <div className="w-screen bg-black pt-16">
        <div className="w-screen h-120 mx-auto mb-5">
          <ImageSlider />
        </div>
      </div>
      <div className="w-256 mx-auto">
        <h1 className="text-xl font-semibold my-3">Popular Accommodations</h1>
        <p>Here are most rated Accommodations you can view.</p>
        <div className="grid grid-cols-4 w-full mx-auto gap-5 mt-3">
          {[...rooms, ...rooms].slice(0, visibleCount).map((room) => (
            <RoomCardNew room={room} key={room.id} />
          ))}
        </div>
      </div>
      <div
        className="w-256 mx-auto rounded-lg my-5 flex flex-row items-center overflow-hidden relative"
        style={{
          boxShadow: "0 0 10px 0 lightgrey",
          height: "280px",
        }}
      >
        <Image
          src={require("./assets/work_2_dribbble-01_4x.png")}
          alt="Work from Home"
          className="rounded-lg w-80 ml-32"
          width={1000}
          height={1000}
        />
        <div
          style={{
            width: "450px",
            height: "380px",
          }}
          className="rounded-full bg-cyan-950 flex flex-row items-center justify-center flex-wrap ml-16"
        >
          <div className="m-10">
            <p className="text-sm text-white">
              Find your next accommodation from{" "}
              <span className="text-base text-gray-300">KamerLark.</span>
            </p>
            <div className="my-2"><Link
              href={"/search"}
              className="text-sm p-2 px-4 bg-cyan-700 text-white rounded-md"
            >
              FIND STAYS     
            </Link>
            </div>
          </div>
        </div>
        <div
          className=" absolute rounded-full bg-cyan-700 bottom-3"
          style={{
            width: "150px",
            height: "150px",
            left: "-50px",
          }}
        ></div>
        <div
          className=" absolute rounded-full bg-cyan-700 top-10 left-5"
          style={{
            width: "50px",
            height: "50px",
          }}
        ></div>
      </div>
      <Footer />
    </>
  );
}
