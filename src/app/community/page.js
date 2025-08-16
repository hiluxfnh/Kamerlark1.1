"use client";
import Link from "next/link";
import Header from "../components/Header";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/Config";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { FlagIcon, SearchIcon } from "@heroicons/react/solid";
import Avatar from "../components/Avatar";

export default function CommunityPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);
  const [following, setFollowing] = useState([]); // list of follow docs for current user
  const [searchParams, setSearchParams] = useState({
    location: "",
    university: "",
    type: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/community";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "Users"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(list);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadUsers();
  }, [user, authLoading, router]);

  // Load following relationships for current user
  useEffect(() => {
    const loadFollowing = async () => {
      if (!user) return;
      try {
        const q1 = query(
          collection(db, "Follows"),
          where("followerId", "==", user.uid)
        );
        const snap = await getDocs(q1);
        setFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Failed to load following", e);
      }
    };
    loadFollowing();
  }, [user]);

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchReset = (e) => {
    e.preventDefault();
    setSearchParams({ location: "", university: "", type: "" });
  };

  const filteredMembers = useMemo(() => {
    const textIn = (a, b) =>
      String(a || "")
        .toLowerCase()
        .includes(String(b || "").toLowerCase());
    return users
      .filter((u) => !user || u.id !== user.uid)
      .filter(
        (u) =>
          !searchParams.location || textIn(u.location, searchParams.location)
      )
      .filter(
        (u) =>
          !searchParams.university ||
          textIn(u.university, searchParams.university)
      )
      .filter((u) => !searchParams.type || textIn(u.type, searchParams.type));
  }, [users, searchParams, user]);

  const followingSet = useMemo(() => {
    const set = new Set();
    following.forEach((f) => {
      if (f.followingId) set.add(f.followingId);
    });
    return set;
  }, [following]);

  const createOrGetChatRoom = async (otherUserId) => {
    if (!user) return null;
    // Find mapping where current user is present, then match the other user locally
    const q1 = query(
      collection(db, "chatRoomMapping"),
      where("userIds", "array-contains", user.uid)
    );
    const snap = await getDocs(q1);
    const existing = snap.docs.find(
      (d) =>
        Array.isArray(d.data()?.userIds) &&
        d.data().userIds.includes(otherUserId)
    );
    if (existing) return existing.data().roomId;
    // Create new room
    const room = await addDoc(collection(db, "chatRoom"), {
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(collection(db, "chatRoomMapping")), {
      roomId: room.id,
      userIds: [user.uid, otherUserId],
      timestamp: serverTimestamp(),
    });
    return room.id;
  };

  const startChat = async (uid) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const roomId = await createOrGetChatRoom(uid);
    if (roomId) router.push(`/chat/messagecenter?roomId=${roomId}`);
  };

  const followUser = async (targetId) => {
    if (!user || user.uid === targetId) return;
    try {
      await addDoc(collection(db, "Follows"), {
        followerId: user.uid,
        followingId: targetId,
        createdAt: serverTimestamp(),
      });
      // refresh local follows
      const q1 = query(
        collection(db, "Follows"),
        where("followerId", "==", user.uid)
      );
      const snap = await getDocs(q1);
      setFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to follow user", e);
    }
  };

  const unfollowUser = async (targetId) => {
    if (!user) return;
    try {
      const q1 = query(
        collection(db, "Follows"),
        where("followerId", "==", user.uid),
        where("followingId", "==", targetId)
      );
      const snap = await getDocs(q1);
      await Promise.all(
        snap.docs.map((d) => deleteDoc(doc(db, "Follows", d.id)))
      );
      // refresh local follows
      const q2 = query(
        collection(db, "Follows"),
        where("followerId", "==", user.uid)
      );
      const snap2 = await getDocs(q2);
      setFollowing(snap2.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to unfollow user", e);
    }
  };

  if (!user && authLoading) {
    return null;
  }
  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="border-b bg-white shadow-md">
          <div className="container flex items-center justify-between h-[60px] px-4 sm:px-6">
            <Link
              className="flex items-center gap-2 font-bold text-xl"
              href="#"
            >
              <FlagIcon className="w-6 h-6" />
              Community
            </Link>
            <nav className="hidden md:flex gap-4 text-lg">
              <Link
                className="font-medium hover:text-blue-500 transition"
                href="#"
              >
                Posts
              </Link>
              <Link
                className="font-medium hover:text-blue-500 transition"
                href="#"
              >
                Messages
              </Link>
              <Link
                className="font-medium hover:text-blue-500 transition"
                href="#"
              >
                Members
              </Link>
            </nav>
            <div className="flex items-center gap-4 md:gap-6">
              <form className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-gray-500" />
                <input
                  className="w-32 h-8 rounded-full border-2 border-gray-300 focus:outline-none px-2"
                  placeholder="Search"
                  type="search"
                  name="search"
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      location: e.target.value,
                      university: e.target.value,
                    })
                  }
                />
              </form>
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-900 dark:border-gray-50">
                <Avatar
                  src={user?.photoURL}
                  name={user?.displayName || user?.email}
                  size={40}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">
              Chat with students in your location and find prospective
              roommates!
            </h1>
            <div className="flex justify-center mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
                <input
                  className="w-full px-4 py-2 border rounded-full focus:outline-none"
                  name="location"
                  placeholder="Students Location"
                  value={searchParams.location}
                  onChange={handleSearchChange}
                />
                <input
                  className="w-full px-4 py-2 border rounded-full focus:outline-none"
                  name="university"
                  placeholder="University Name"
                  value={searchParams.university}
                  onChange={handleSearchChange}
                />
                <input
                  className="w-full px-4 py-2 border rounded-full focus:outline-none"
                  name="type"
                  placeholder="Type (e.g., Student, Owner)"
                  value={searchParams.type}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
                Search
              </button>
              <button
                className="px-6 py-2 bg-gray-300 rounded-full shadow-md hover:bg-gray-400 transition"
                onClick={handleSearchReset}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-center text-gray-500">
                Loading members…
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                No members found.
              </div>
            ) : (
              filteredMembers.slice(0, visibleCount).map((member) => (
                <div
                  key={member.id}
                  className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center text-center transition transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <Avatar
                    src={member.photoURL}
                    name={member.userName}
                    size={64}
                    className="mb-4"
                  />
                  <h3 className="text-lg font-semibold">
                    {member.userName || "Unknown"}
                  </h3>
                  <p className="text-gray-500">
                    {member.university || member.uni || "—"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {member.location || member.city || "—"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user?.uid &&
                      member.university &&
                      user?.providerData &&
                      member.university ===
                        users.find((u) => u.id === user.uid)?.university && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Same University
                        </span>
                      )}
                    {member.location &&
                      member.location ===
                        users.find((u) => u.id === user?.uid)?.location && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Nearby
                        </span>
                      )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
                      onClick={() => startChat(member.id)}
                    >
                      Chat
                    </button>
                    {followingSet.has(member.id) ? (
                      <button
                        className="px-3 py-1 text-sm bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-900 transition"
                        onClick={() => unfollowUser(member.id)}
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 text-sm bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition"
                        onClick={() => followUser(member.id)}
                      >
                        Follow
                      </button>
                    )}
                    <button
                      className="px-3 py-1 text-sm bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition"
                      onClick={() => router.push(`/profile/${member.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {filteredMembers.length > visibleCount && (
            <div className="flex justify-center mt-6">
              <button
                className="px-6 py-2 bg-black text-white rounded-full shadow hover:bg-gray-900"
                onClick={() => setVisibleCount((c) => c + 24)}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
