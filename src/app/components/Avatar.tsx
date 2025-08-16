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

const Avatar: React.FC<Props> = ({ src, name, size = 40, className = "", rounded = true }) => {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (src) {
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
  const bg = hashColor(name || initial);
  return (
    <div
      className={`flex items-center justify-center select-none ${rounded ? "rounded-full" : "rounded-md"} ${className}`}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-label={name || "avatar"}
    >
      <span className="text-white font-semibold" style={{ fontSize: Math.max(12, Math.floor(size * 0.45)) }}>
        {initial}
      </span>
    </div>
  );
};

export default Avatar;
