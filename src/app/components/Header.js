"use client";

import React, { useState } from "react";
import styles from "../styles/Header.module.css";
import Image from "next/image";
import kl from "../assets/Kl_christmas.png";
import { useRouter, usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/Config";
import LoginPromptModal from "./LoginPromptModal"; // Import the LoginPromptModal component
import Link from "next/link";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import PeopleIcon from "@mui/icons-material/People";
import HelpIcon from "@mui/icons-material/Help";
import ForumIcon from '@mui/icons-material/Forum';
import LoginIcon from '@mui/icons-material/Login';
const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalLogin = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <div className="bg-black fixed z-50" 
      style={{
        width:"100vw"
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
          <Link href="/" className="text-white flex flex-row items-center text-sm font-sans">
            <HomeIcon fontSize="18" className="mr-1" />
            Home
          </Link>
          <Link href="/profile?redirect=properties" className="text-white flex flex-row items-center text-sm font-sans">
            <FormatListBulletedIcon fontSize="18" className="mr-1" />
            Listing
          </Link>
          <Link href="/community" className="text-white flex flex-row items-center text-sm font-sans">
            <PeopleIcon fontSize="18" className="mr-1" />
            Community
          </Link>
          <Link href="/help" className="text-white flex flex-row items-center text-sm font-sans">
            <HelpIcon fontSize="18" className="mr-1" />
            Help
          </Link>
        </ul>
        {!user?
          <Link href={"/login"} className="text-white flex flex-row items-center text-sm font-sans">
            <LoginIcon fontSize="24" className="mr-1" />
            LOGIN
          </Link>
        :<div className="flex flex-row gap-4 items-center">
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
            <ForumIcon fontSize="24" className="mr-1" />
            CHAT
          </Link>
        </div>}
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
