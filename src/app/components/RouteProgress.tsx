"use client";
import { useEffect } from "react";
import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.15 });

export default function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();

  // Start the bar the moment an internal link is clicked — not after the
  // destination has rendered. Without this the bar only appears once the
  // new page is already loading, so a slow route (or a dev-mode compile)
  // feels like a dead click for seconds.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank") return;
      // Internal navigation only, and not a link to the current URL
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search)
        return;
      NProgress.start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Finish the bar once the route actually changes.
  useEffect(() => {
    NProgress.done();
  }, [pathname, search?.toString()]);

  return null;
}
