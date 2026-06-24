"use client";
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/Config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import Image from "next/image";
import Avatar from "../../components/Avatar";
import RoomCard from "../../components/roomCard";
import { useI18n } from "../../lib/i18n";

export default function PublicProfilePage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const uid = Array.isArray(params?.uid) ? params.uid[0] : params?.uid;
  const [self] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        // User profile
        const userSnap = await getDoc(doc(db, "Users", uid));
        setProfile(userSnap.data() ? { id: uid, ...userSnap.data() } : null);
        // Listings by this user
        const roomsSnap = await getDocs(
          query(collection(db, "roomdetails"), where("ownerId", "==", uid))
        );
        setRooms(roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        // Followers/following
        const followersSnap = await getDocs(
          query(collection(db, "Follows"), where("followingId", "==", uid))
        );
        const followingSnap = await getDocs(
          query(collection(db, "Follows"), where("followerId", "==", uid))
        );
        setFollowersCount(followersSnap.size);
        setFollowingCount(followingSnap.size);
        // Is current user following?
        if (self?.uid) {
          const meFollowingSnap = await getDocs(
            query(
              collection(db, "Follows"),
              where("followerId", "==", self.uid),
              where("followingId", "==", uid)
            )
          );
          setIsFollowing(!meFollowingSnap.empty);
        } else {
          setIsFollowing(false);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid, self?.uid]);

  const sameUni = useMemo(() => {
    if (!self?.uid || !profile) return false;
    // This requires current user's record; if not available, skip
    return false;
  }, [self?.uid, profile]);

  const startChat = async () => {
    if (!self) {
      router.push("/login");
      return;
    }
    if (!uid) return;
    // Find or create chat room
    const q1 = query(
      collection(db, "chatRoomMapping"),
      where("userIds", "array-contains", self.uid)
    );
    const snap = await getDocs(q1);
    const existing = snap.docs.find(
      (d) => Array.isArray(d.data()?.userIds) && d.data().userIds.includes(uid)
    );
    let roomId;
    if (existing) {
      roomId = existing.data().roomId;
    } else {
      const room = await addDoc(collection(db, "chatRoom"), {
        createdAt: serverTimestamp(),
        userIds: [self.uid, uid],
      });
      await setDoc(doc(collection(db, "chatRoomMapping")), {
        roomId: room.id,
        userIds: [self.uid, uid],
        timestamp: serverTimestamp(),
      });
      roomId = room.id;
    }
    router.push(`/chat/messagecenter?roomId=${roomId}`);
  };

  const follow = async () => {
    if (!self || !uid || self.uid === uid) return;
    if (isFollowing) return;
    await addDoc(collection(db, "Follows"), {
      followerId: self.uid,
      followingId: uid,
      createdAt: serverTimestamp(),
    });
    setIsFollowing(true);
    setFollowersCount((c) => c + 1);
  };

  const unfollow = async () => {
    if (!self || !uid) return;
    const snap = await getDocs(
      query(
        collection(db, "Follows"),
        where("followerId", "==", self.uid),
        where("followingId", "==", uid)
      )
    );
    await Promise.all(
      snap.docs.map((d) => deleteDoc(doc(db, "Follows", d.id)))
    );
    setIsFollowing(false);
    setFollowersCount((c) => Math.max(0, c - 1));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[60vh] text-gray-500">
          {t("pubprofile.loading")}
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[60vh] text-gray-500">
          {t("pubprofile.notFound")}
        </div>
      </>
    );
  }

  const isMe = self?.uid === uid;

  return (
    <>
      <Header />
      <div className="pt-16">
        {/* Hero */}
        <div className="w-full bg-gradient-to-r from-cyan-600 to-blue-700">
          <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10 text-white">
            <div className="flex items-end gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-white/80 rounded-full overflow-hidden">
                <Avatar
                  src={profile.photoURL}
                  name={profile.userName}
                  size={96}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold">
                  {profile.userName || t("chat.userFallback")}
                </h1>
                <div className="flex flex-wrap gap-2 mt-1 text-xs">
                  {profile.university && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20">
                      {profile.university}
                    </span>
                  )}
                  {profile.location && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20">
                      {profile.location}
                    </span>
                  )}
                  {profile.type && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20">
                      {profile.type}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startChat}
                  className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium shadow"
                >
                  {t("pubprofile.message")}
                </button>
                {!isMe &&
                  (isFollowing ? (
                    <button
                      onClick={unfollow}
                      className="bg-black/40 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow"
                    >
                      {t("community.following")}
                    </button>
                  ) : (
                    <button
                      onClick={follow}
                      className="bg-white/20 text-white px-3 py-1.5 rounded-md text-sm font-medium ring-1 ring-white/50"
                    >
                      {t("community.follow")}
                    </button>
                  ))}
              </div>
            </div>
            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{followersCount}</span>{" "}
                {t("pubprofile.followers")}
              </div>
              <div>
                <span className="font-semibold">{followingCount}</span>{" "}
                {t("pubprofile.followingCount")}
              </div>
              <div>
                <span className="font-semibold">{rooms.length}</span> {t("pubprofile.listings")}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: About */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">{t("pubprofile.about")}</h2>
              <p className="text-sm text-gray-600">
                {profile.bio || t("pubprofile.noBio")}
              </p>
              <div className="mt-4 space-y-1 text-sm">
                {profile.email && (
                  <div>
                    <span className="text-gray-500">{t("pubprofile.emailLabel")}</span>
                    {profile.email}
                  </div>
                )}
                {profile.phone && (
                  <div>
                    <span className="text-gray-500">{t("pubprofile.phoneLabel")}</span>
                    {profile.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">{t("pubprofile.highlights")}</h2>
              <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
                {profile.university && (
                  <li>{t("pubprofile.studiesAt")} {profile.university}</li>
                )}
                {profile.location && <li>{t("pubprofile.basedIn")} {profile.location}</li>}
                {rooms.length > 0 && (
                  <li>
                    {t("pubprofile.has")} {rooms.length}{" "}
                    {rooms.length > 1
                      ? t("pubprofile.activeListings")
                      : t("pubprofile.activeListing")}
                  </li>
                )}
              </ul>
            </div>
          </div>
          {/* Right: Listings */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold mb-3">
              {t("pubprofile.listingsBy")} {profile.userName?.split(" ")?.[0] || t("pubprofile.userShort")}
            </h2>
            {rooms.length === 0 ? (
              <div className="text-gray-500 text-sm">{t("pubprofile.noListings")}</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
