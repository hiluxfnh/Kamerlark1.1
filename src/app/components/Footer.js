// components/Footer.js
import React from "react";
import Image from "next/image";
import kl from "../assets/kamerlark.png";
import Link from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const LINKS = [
  { href: "/search", label: "Search" },
  { href: "/community", label: "Community" },
  { href: "/help", label: "Help & FAQ" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const Footer = () => {
  return (
    <footer
      className="bg-black text-sm text-gray-300"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + contact */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="Go to home"
            >
              <Image src={kl} alt="KamerLark" width={34} height={34} className="rounded" />
              <span className="text-xl font-semibold text-white">KAMERLARK</span>
            </Link>
            <p className="mt-3 text-gray-400">
              Your trusted accommodation platform for students and young
              professionals.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:info.kamerlark@gmail.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <EmailIcon fontSize="small" />
                info.kamerlark@gmail.com
              </a>
              <a
                href="https://wa.me/79692005991"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon fontSize="small" />
                +7 969 200 5991 (WhatsApp)
              </a>
            </div>
          </div>

          {/* Links + social */}
          <div className="flex flex-col gap-5">
            <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-2">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                aria-label="Facebook"
                className="rounded-md bg-white/5 p-2 hover:bg-white/10 transition-colors"
              >
                <FacebookIcon fontSize="small" />
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                className="rounded-md bg-white/5 p-2 hover:bg-white/10 transition-colors"
              >
                <TwitterIcon fontSize="small" />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="rounded-md bg-white/5 p-2 hover:bg-white/10 transition-colors"
              >
                <InstagramIcon fontSize="small" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-400 sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} KamerLark. All rights reserved.</p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-white/80 hover:text-white"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
