"use client";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { db } from "../../firebase/Config"; // Adjust the import as necessary
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/Config";
import { useRouter } from "next/navigation";
import RoomDetails from "../roomdetails";
import Spinner from "../../components/Spinner"; // Import Spinner

export default function Roomid({ params }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : `/room/${params?.roomid || ""}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, loading, router]);
  const [room, setRoom] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const { roomid } = params;

  useEffect(() => {
    const fetchRoomData = async () => {
      setDataLoading(true); // Show spinner
      try {
        const roomDocRef = doc(db, "roomdetails", roomid);
        const roomDoc = await getDoc(roomDocRef);
        if (roomDoc.exists()) {
          setRoom({ id: roomDoc.id, ...roomDoc.data() });
        } else {
          setRoom(null);
        }
      } catch (error) {
        console.error("Error fetching room data: ", error);
      } finally {
        setDataLoading(false); // Hide spinner
      }
    };

    if (roomid) {
      fetchRoomData();
    }
  }, [roomid]);

  return (
    <>
      {dataLoading ? (
        <Spinner /> // Show spinner while loading
      ) : (
        <>
          <Header />
          <div>
            {room ? <RoomDetails room={room} /> : <div>Room not found</div>}
          </div>
          {/* Footer is included globally via RootLayout */}
        </>
      )}
    </>
  );
}
