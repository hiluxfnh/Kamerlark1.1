"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Spinner from "./Spinner";

export default function GlobalNavSpinner() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 300);
    return () => clearTimeout(t);
  }, [pathname, search?.toString()]);
  return busy ? <Spinner /> : null;
}
