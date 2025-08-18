"use client";
import { useEffect } from "react";
import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 200);
    return () => clearTimeout(t);
  }, [pathname, search?.toString()]);
  return null;
}
