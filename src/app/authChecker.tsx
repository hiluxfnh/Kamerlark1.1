"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/Config";

interface AuthCheckerProps {
  children: ReactNode;
  redirectTo?: string;
  loadingFallback?: ReactNode;
}

const AuthChecker = ({
  children,
  redirectTo = "/login",
  loadingFallback = null,
}: AuthCheckerProps) => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, user, redirectTo, router]);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthChecker;
