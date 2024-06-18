"use client";

import React, { useState } from "react";
import styles from "../styles/Header.module.css";
import Image from "next/image";
import kl from "../assets/Kl_christmas.png";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/Config";
import LoginPromptModal from "./LoginPromptModal"; // Import the LoginPromptModal component
import Link from "next/link";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const listingpage = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/listing");
    }
  };

  const handleNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogin = () => {
    if (!user) {
      router.push("/login");
    } else {
      auth.signOut().then(() => {
        if (pathname !== "/") {
          router.push("/login");
        }
      });
    }
  };

  const handleNavLinkClick = (e, path) => {
    if (!user && path !== "/" && path !== "/help") {
      e.preventDefault();
      setShowModal(true);
    } else {
      router.push(path);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalLogin = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <div className="bg-black">
    <header className="w-256 mx-auto flex flex-row justify-between p-2 relative">
      <div className="flex flex-row items-center">
        <Image src={kl} alt="Logo" className={styles.logoImage} />
        <span className="text-xl text-white">KamerLark</span>
      </div>
        <ul className="flex flex-row gap-4 absolute top-1/2 left-1/2" style={{
          transform:"translate(-50%,-50%)"
        }}>
          <Link href="/" className="text-white">
            Home
          </Link>
          <Link href="/mylisting" className="text-white">
            Listing
          </Link>
          <Link href="/community" className="text-white">
            Community
          </Link>
          <Link href="/profile" className="text-white">
            Profile
          </Link>
          <Link href="/help" className="text-white">
            Help
          </Link>
        </ul>
      <div className={styles.actions}>
        <button className="text-white p-3 rounded-lg mr-4 text-sm" style={{
          backgroundColor:"#0a3d66",
        }} onClick={listingpage}>
          <FontAwesomeIcon icon={faPlus} /> Add Listing
        </button>
        <button className="text-white p-3 rounded-lg text-sm" style={{
          backgroundColor:"#0a3d66",
        }} onClick={handleLogin}>
          {user ? "Logout" : "Login"}
        </button>
      </div>
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
