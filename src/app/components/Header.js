"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/Header.module.css";
import Image from "next/image";
import kl from "../assets/kamerlark.png";
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
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Avatar from "./Avatar";
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

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (!isNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isNavOpen]);

  const closeNav = () => setIsNavOpen(false);

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
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between p-2 px-4 sm:px-6">
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
            href="/search?view=all"
            aria-current={pathname === "/search" ? "page" : undefined}
            className={`text-white flex items-center text-sm font-sans hover:opacity-90 ${
              pathname === "/search" ? "underline underline-offset-4" : ""
            }`}
          >
            <FormatListBulletedIcon fontSize="18" className="mr-1" />
            Explore
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
            <>
              <Link
                href="/login"
                className="text-white flex items-center text-sm font-sans hover:opacity-90"
              >
                <LoginIcon fontSize="24" className="mr-1" /> LOGIN
              </Link>
              <Link
                href="/listing"
                className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
              >
                Post a listing
              </Link>
            </>
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
          className="md:hidden mx-auto w-full max-w-6xl overflow-y-auto px-4 pb-8 pt-1 sm:px-6"
          style={{
            minHeight: "calc(100dvh - 52px)",
            maxHeight: "calc(100dvh - 52px)",
            animation: "klMenuIn .18s ease-out",
          }}
        >
          {/* Account chip (signed in) */}
          {user && (
            <Link
              href="/profile"
              onClick={closeNav}
              className="mb-3 flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3 transition-colors active:bg-white/[0.12]"
            >
              <Avatar
                src={user.photoURL}
                name={user.displayName || user.email}
                size={46}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">
                  {user.displayName || "Your account"}
                </p>
                <p className="truncate text-xs text-white/50">{user.email}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70">
                View
              </span>
            </Link>
          )}

          <div className="flex flex-col gap-0.5">
            {[
              { href: "/", label: "Home", Icon: HomeIcon, match: "/" },
              {
                href: "/search?view=all",
                label: "Explore",
                Icon: FormatListBulletedIcon,
                match: "/search",
              },
              {
                href: "/community",
                label: "Community",
                Icon: PeopleIcon,
                match: "/community",
              },
              { href: "/help", label: "Help", Icon: HelpIcon, match: "/help" },
              ...(user
                ? [
                    {
                      href: "/chat/messagecenter",
                      label: "Messages",
                      Icon: ForumIcon,
                      match: "/chat/messagecenter",
                      badge: unreadCount,
                    },
                  ]
                : []),
            ].map(({ href, label, Icon, match, badge }) => {
              // Normalise trailing slashes and match sub-paths so the current
              // page is reliably highlighted.
              const here = (pathname || "/").replace(/\/+$/, "") || "/";
              const m = match.replace(/\/+$/, "") || "/";
              const active = m === "/" ? here === "/" : here === m || here.startsWith(m + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeNav}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors ${
                    active
                      ? "bg-white/[0.12] text-white"
                      : "text-white/80 active:bg-white/[0.06]"
                  }`}
                >
                  <Icon
                    fontSize="small"
                    className={active ? "text-white" : "text-white/55"}
                  />
                  <span>{label}</span>
                  {badge > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                      {badge}
                    </span>
                  )}
                  <KeyboardArrowRightIcon
                    fontSize="small"
                    className="ml-auto text-white/25"
                  />
                </Link>
              );
            })}
          </div>

          {/* Primary actions */}
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            <Link
              href="/listing"
              onClick={closeNav}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors active:bg-gray-200"
            >
              <PlaylistAddCircleIcon fontSize="small" />
              {user ? "Add a listing" : "Post a listing — it's free"}
            </Link>
            {!user && (
              <Link
                href="/login"
                onClick={closeNav}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold text-white transition-colors active:bg-white/10"
              >
                <LoginIcon fontSize="small" />
                Log in
              </Link>
            )}
          </div>
        </nav>
      )}
      <style jsx global>{`
        @keyframes klMenuIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <LoginPromptModal
        show={showModal}
        handleClose={handleModalClose}
        handleLogin={handleModalLogin}
      />
    </div>
  );
};

export default Header;
