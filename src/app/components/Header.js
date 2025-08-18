"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/Header.module.css";
import Image from "next/image";
import kl from "../assets/klchristmas.png";
import { useRouter, usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/Config";
import LoginPromptModal from "./LoginPromptModal"; // Import the LoginPromptModal component
import Link from "next/link";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import HomeIcon from "@mui/icons-material/Home";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import PeopleIcon from "@mui/icons-material/People";
import HelpIcon from "@mui/icons-material/Help";
import ForumIcon from "@mui/icons-material/Forum";
import LoginIcon from "@mui/icons-material/Login";
import { collection, onSnapshot, query, where } from "firebase/firestore";
const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Compute lightweight unread count from chatRoomMapping: lastMessageTs > lastRead[uid]
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const q = query(
      collection(db, "chatRoomMapping"),
      where("userIds", "array-contains", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach((doc) => {
        const d = doc.data();
        const lastMsg = d?.lastMessageTs;
        const lastRead = d?.lastRead && d.lastRead[user.uid];
        const lastMsgMs = lastMsg?.toMillis
          ? lastMsg.toMillis()
          : typeof lastMsg === "number"
          ? lastMsg
          : 0;
        const lastReadMs = lastRead?.toMillis
          ? lastRead.toMillis()
          : typeof lastRead === "number"
          ? lastRead
          : 0;
        if (lastMsgMs && lastMsgMs > lastReadMs) count += 1;
      });
      setUnreadCount(count);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalLogin = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <div
      className="bg-black fixed z-50"
      style={{
        width: "100vw",
      }}
    >
      <header className="w-256 mx-auto flex flex-row justify-between p-2 relative">
        <div className="flex flex-row items-center">
          <Image src={kl} alt="Logo" className={styles.logoImage} />
          <span className="text-lg text-white">KAMERLARK</span>
        </div>
        <ul
          className="flex flex-row gap-6 absolute top-1/2 left-1/2"
          style={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Link
            href="/"
            className="text-white flex flex-row items-center text-sm font-sans"
          >
            <HomeIcon fontSize="18" className="mr-1" />
            Home
          </Link>
          <Link
            href="/profile?redirect=properties"
            className="text-white flex flex-row items-center text-sm font-sans"
          >
            <FormatListBulletedIcon fontSize="18" className="mr-1" />
            Listing
          </Link>
          <Link
            href="/community"
            className="text-white flex flex-row items-center text-sm font-sans"
          >
            <PeopleIcon fontSize="18" className="mr-1" />
            Community
          </Link>
          <Link
            href="/help"
            className="text-white flex flex-row items-center text-sm font-sans"
          >
            <HelpIcon fontSize="18" className="mr-1" />
            Help
          </Link>
        </ul>
        {!user ? (
          <Link
            href={"/login"}
            className="text-white flex flex-row items-center text-sm font-sans"
          >
            <LoginIcon fontSize="24" className="mr-1" />
            LOGIN
          </Link>
        ) : (
          <div className="flex flex-row gap-4 items-center">
            <Link
              href="/profile"
              className="text-white flex flex-row items-center text-sm font-sans"
            >
              <PermIdentityIcon fontSize="24" className="mr-1" />
              PROFILE
            </Link>
            <Link
              href={!user ? "/login" : "/listing"}
              className="text-white flex flex-row items-center text-sm font-sans"
            >
              <PlaylistAddCircleIcon fontSize="24" className="mr-1" />
              ADD LISTING
            </Link>
            <Link
              href={"/chat/messagecenter"}
              className="text-white flex flex-row items-center text-sm font-sans"
            >
              <span className="relative mr-1 inline-block">
                <ForumIcon fontSize="24" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none">
                    {unreadCount}
                  </span>
                )}
              </span>
              CHAT
            </Link>
          </div>
        )}
        <LoginPromptModal
          show={showModal}
          handleClose={handleModalClose}
          handleLogin={handleModalLogin}
        />
      </header>
    </div>
  );
};

export default Header;
