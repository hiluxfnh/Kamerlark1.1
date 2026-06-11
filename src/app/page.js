"use client";
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import { db } from "./firebase/Config";
import { collection, getDocs } from "firebase/firestore";
import dynamic from "next/dynamic";
const ImageSlider = dynamic(() => import("./components/Imageslider"), {
  ssr: false,
});
import RoomCardNew from "./components/roomCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "./components/Spinner";

const CardSkeleton = () => (
  <div className="w-full animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <div className="aspect-[4/3] w-full bg-gray-200" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-200" />
      <div className="h-3 w-2/3 rounded bg-gray-200" />
      <div className="h-4 w-1/3 rounded bg-gray-200" />
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const roomCollection = collection(db, "roomdetails");
      const roomSnapshot = await getDocs(roomCollection);
      const roomList = roomSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Newest first, consistent with the Search page default
      roomList.sort(
        (a, b) =>
          (b?.createdAt?.toMillis?.() || 0) - (a?.createdAt?.toMillis?.() || 0)
      );
      setRooms(roomList);
      setLoading(false);
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    try {
      router.prefetch?.("/search");
      router.prefetch?.("/listing");
    } catch {}
  }, [router]);

  return (
    <>
      <Header />
      <div className="w-full bg-black pt-16">
        <div className="mx-auto mb-5 w-full">
          <ImageSlider />
        </div>
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Popular accommodations
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fresh listings near universities across Cameroon.
            </p>
          </div>
          <Link
            href="/search?view=all"
            prefetch
            className="hidden text-sm font-semibold text-[#082e4d] hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : rooms
                .slice(0, visibleCount)
                .map((room) => <RoomCardNew room={room} key={room.id} />)}
        </div>

        {!loading && rooms.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="font-medium text-gray-700">No listings yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to{" "}
              <Link href="/listing" className="font-semibold text-[#082e4d] underline">
                post a room
              </Link>
              .
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex w-full items-center justify-center">
          <Link
            href="/search?view=all"
            prefetch
            onClick={() => setNavigating(true)}
            className={`inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              navigating ? "pointer-events-none opacity-80" : ""
            }`}
            aria-label="See more accommodations"
          >
            See more accommodations
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Landlord acquisition CTA */}
      <section className="mx-auto my-12 w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-cyan-950 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Have a room to rent out?
            </h2>
            <p className="mt-1 max-w-md text-sm text-cyan-100">
              Post it on KamerLark for free and reach thousands of students
              looking for housing near their university.
            </p>
          </div>
          <Link
            href="/listing"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-cyan-950 transition-colors hover:bg-cyan-50"
          >
            Post a listing
          </Link>
        </div>
      </section>

      {navigating ? <Spinner /> : null}
    </>
  );
}
