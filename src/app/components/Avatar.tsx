"use client";
import React, { useState } from "react";

type Props = {
  src?: string | null;
  name?: string | null;
  size?: number; // pixels
  className?: string;
  rounded?: boolean;
};

function hashColor(str: string) {
  const colors = [
    "#0ea5e9",
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#14b8a6",
    "#a855f7",
    "#f43f5e",
  ];
  if (!str) return colors[0];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  const idx = Math.abs(h) % colors.length;
  return colors[idx];
}

// First letter of the first name + first letter of the last name, e.g.
// "Tom Jerry" -> "TJ". Single names give a single initial; empty -> "?".
function getInitials(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const Avatar: React.FC<Props> = ({ src, name, size = 40, className = "", rounded = true }) => {
  const initials = getInitials(name);
  const [imgError, setImgError] = useState(false);
  // Render the image only when there's a real src AND it hasn't failed to load.
  // A broken/expired photoURL (e.g. revoked Google avatar) triggers onError and
  // falls back to initials instead of showing a broken-image icon.
  if (src && String(src).trim().length > 0 && !imgError) {
    // Native <img> (not next/image): images are globally `unoptimized` so
    // next/image adds no benefit here, and its onError is unreliable for remote
    // 404s. A plain img fires onError reliably, so a broken/expired photoURL
    // cleanly falls back to initials instead of a broken-image icon.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name || "avatar"}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        style={{ width: size, height: size }}
        className={`${rounded ? "rounded-full" : "rounded-md"} object-cover ${className}`}
      />
    );
  }
  const bg = hashColor(name || initials);
  return (
    <div
      className={`flex items-center justify-center select-none ${rounded ? "rounded-full" : "rounded-md"} ${className}`}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-label={name || "avatar"}
    >
      <span className="text-white font-semibold" style={{ fontSize: Math.max(11, Math.floor(size * (initials.length > 1 ? 0.38 : 0.45))) }}>
        {initials}
      </span>
    </div>
  );
};

export default Avatar;
