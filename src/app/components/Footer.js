// components/Footer.js
import React from "react";
import Image from "next/image";
import kl from "../assets/klchristmas.png";
import Link from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 text-sm">
      <div className="w-256 max-w-[90vw] mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={kl}
                alt="KamerLark"
                width={36}
                height={36}
                className="rounded"
              />
              <span className="text-xl font-semibold text-white">
                KAMERLARK
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted accommodation platform for students and young
              professionals.
            </p>
            <div className="mt-4 space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <EmailIcon fontSize="small" /> info@kamerlark.com
              </div>
              <div className="flex items-center gap-2">
                <LocalPhoneIcon fontSize="small" /> +123 456 7890
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/community"
                  className="hover:text-white transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-white transition-colors"
                >
                  Help & FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/search"
                  className="hover:text-white transition-colors"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  href="/listing"
                  className="hover:text-white transition-colors"
                >
                  Post a Listing
                </Link>
              </li>
              <li>
                <Link
                  href="/mylisting"
                  className="hover:text-white transition-colors"
                >
                  My Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                aria-label="Facebook"
                className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                <FacebookIcon fontSize="small" />
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                <TwitterIcon fontSize="small" />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                <InstagramIcon fontSize="small" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="w-256 max-w-[90vw] mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} KamerLark. All rights reserved.
          </p>
          <p>Built for comfortable living and smarter renting.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
