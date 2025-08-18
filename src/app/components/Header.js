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
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
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
    const qRef = query(
      collection(db, "chatRoomMapping"),
      where("userIds", "array-contains", user.uid)
    );
    const unsub = onSnapshot(qRef, (snap) => {
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

  const handleModalClose = () => setShowModal(false);
  const handleModalLogin = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <div className="bg-black fixed z-[9999] w-full">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-3 focus:py-1 focus:rounded"
      >
        Skip to content
      </a>
      <header className="w-256 max-w-[90vw] mx-auto flex items-center justify-between p-2">
        <Link href="/" className="flex items-center" aria-label="Go to home">
          <Image src={kl} alt="KamerLark Logo" className={styles.logoImage} />
          <span className="ml-1 text-lg text-white">KAMERLARK</span>
        </Link>

        {/* Primary nav (desktop) */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`text-white flex items-center text-sm font-sans hover:opacity-90 ${
              pathname === "/" ? "underline underline-offset-4" : ""
            }`}
          >
            <HomeIcon fontSize="18" className="mr-1" />
            Home
          </Link>
          <Link
            href="/profile?redirect=properties"
            aria-current={pathname?.startsWith("/profile") ? "page" : undefined}
            className={`text-white flex items-center text-sm font-sans hover:opacity-90 ${
              pathname?.startsWith("/profile")
                ? "underline underline-offset-4"
                : ""
            }`}
          >
            <FormatListBulletedIcon fontSize="18" className="mr-1" />
            Listing
          </Link>
          <Link
            href="/community"
            aria-current={pathname === "/community" ? "page" : undefined}
            className={`text-white flex items-center text-sm font-sans hover:opacity-90 ${
              pathname === "/community" ? "underline underline-offset-4" : ""
            }`}
          >
            <PeopleIcon fontSize="18" className="mr-1" />
            Community
          </Link>
          <Link
            href="/help"
            aria-current={pathname === "/help" ? "page" : undefined}
            className={`text-white flex items-center text-sm font-sans hover:opacity-90 ${
              pathname === "/help" ? "underline underline-offset-4" : ""
            }`}
          >
            <HelpIcon fontSize="18" className="mr-1" />
            Help
          </Link>
        </nav>

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <Link
              href="/login"
              className="text-white flex items-center text-sm font-sans"
            >
              <LoginIcon fontSize="24" className="mr-1" /> LOGIN
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                className="text-white flex items-center text-sm font-sans"
              >
                <PermIdentityIcon fontSize="24" className="mr-1" /> PROFILE
              </Link>
              <Link
                href="/listing"
                className="text-white flex items-center text-sm font-sans"
              >
                <PlaylistAddCircleIcon fontSize="24" className="mr-1" /> ADD
                LISTING
              </Link>
              <Link
                href="/chat/messagecenter"
                className="text-white flex items-center text-sm font-sans"
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
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen((s) => !s)}
        >
          {isNavOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* Mobile menu */}
      {isNavOpen && (
        <nav
          aria-label="Mobile"
          className="md:hidden w-256 max-w-[90vw] mx-auto px-2 pb-3"
        >
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-white py-2 border-b border-white/10">
              Home
            </Link>
            <Link
              href="/profile?redirect=properties"
              className="text-white py-2 border-b border-white/10"
            >
              Listing
            </Link>
            <Link
              href="/community"
              className="text-white py-2 border-b border-white/10"
            >
              Community
            </Link>
            <Link href="/help" className="text-white py-2">
              Help
            </Link>
            <div className="h-px bg-white/10 my-2" />
            {!user ? (
              <Link href="/login" className="text-white py-2">
                Login
              </Link>
            ) : (
              <>
                <Link href="/profile" className="text-white py-2">
                  Profile
                </Link>
                <Link href="/listing" className="text-white py-2">
                  Add listing
                </Link>
                <Link href="/chat/messagecenter" className="text-white py-2">
                  Chat {unreadCount > 0 ? `(${unreadCount})` : ""}
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
      <LoginPromptModal
        show={showModal}
        handleClose={handleModalClose}
        handleLogin={handleModalLogin}
      />
    </div>
  );
};

export default Header;
