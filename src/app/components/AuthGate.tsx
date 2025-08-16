"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/Config";

const PUBLIC_PATHS = new Set(["/", "/help", "/contact", "/login", "/search"]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const isPublic = PUBLIC_PATHS.has(pathname);

  if (loading) return null;
  if (!user && !isPublic) {
    const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : pathname;
    router.push(`/login?next=${encodeURIComponent(next)}`);
    return null;
  }
  return <>{children}</>;
}
