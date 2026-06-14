import Image from "next/image";
import React from "react";

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
  // Only render the image when there's a real, non-empty src. Otherwise fall
  // back to initials so a missing profile pic never shows a broken image.
  if (src && String(src).trim().length > 0) {
    return (
      <Image
        src={src}
        alt={name || "avatar"}
        width={size}
        height={size}
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
