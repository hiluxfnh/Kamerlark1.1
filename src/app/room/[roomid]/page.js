"use client";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { db } from "../../firebase/Config"; // Adjust the import as necessary
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import RoomDetails from "../roomdetails";
import Spinner from "../../components/Spinner"; // Import Spinner
import { useI18n } from "../../lib/i18n";

export default function Roomid({ params }) {
  const { t } = useI18n();
  // Room pages are publicly browsable — no login redirect here. Booking,
  // appointments and chat inside RoomDetails handle auth themselves.
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
            {room ? <RoomDetails room={room} /> : <div>{t("room.notFound")}</div>}
          </div>
          {/* Footer is included globally via RootLayout */}
        </>
      )}
    </>
  );
}
