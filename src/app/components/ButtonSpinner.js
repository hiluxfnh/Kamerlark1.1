"use client";
import React from "react";

/**
 * Inline, color-inheriting loading spinner for buttons and small UI bits.
 * Sits inline with text and spins smoothly using `currentColor`, so it
 * automatically matches whatever button it lives in (white on dark, etc.).
 *
 * Usage:
 *   {busy ? (<><ButtonSpinner /> {t("...")}</>) : t("...")}
 */
export default function ButtonSpinner({ size = 16, className = "" }) {
  return (
    <svg
      className={`kl-spin shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      {/* faint full track */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      {/* bright leading arc */}
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
