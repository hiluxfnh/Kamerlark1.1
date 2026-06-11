"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/Config";

const PUBLIC_PATHS = new Set([
  "/",
  "/help",
  "/contact",
  "/login",
  "/search",
  "/terms",
  "/privacy",
]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname() || "/";
  // trailingSlash: true means paths arrive as "/login/" — normalize before
  // matching, or the login page redirects to itself in a loop (white screen).
  const pathname =
    rawPathname.length > 1 && rawPathname.endsWith("/")
      ? rawPathname.slice(0, -1)
      : rawPathname;
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  // Room detail pages are browsable without an account — gating discovery
  // behind signup kills conversion. Booking/chat still require login.
  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith("/room/");
  const shouldRedirect = !loading && !user && !isPublic;

  // Navigation is a side effect — never call router.push during render.
  useEffect(() => {
    if (shouldRedirect) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : pathname;
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [shouldRedirect, pathname, router]);

  if (loading || shouldRedirect) return null;
  return <>{children}</>;
}
