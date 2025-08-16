"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGuard() {
  const pathname = usePathname() || "";
  const hide = pathname.startsWith("/chat");
  if (hide) return null;
  return <Footer />;
}
