import { Inter } from "next/font/google";
import "./globals.css";
import FooterGuard from "./components/FooterGuard";
import RouteProgress from "./components/RouteProgress";
import AuthGate from "./components/AuthGate";
import GlobalNavSpinner from "./components/GlobalNavSpinner";
const inter = Inter({ subsets: ["latin"] });

// Force dynamic rendering for all routes to avoid serialization issues with Firebase
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "KamerLark",
  description: "KamerLark helps students find housing and roommates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} data-theme="system">
        <AuthGate>
          <>
            <RouteProgress />
            <GlobalNavSpinner />
            {children}
            <FooterGuard />
          </>
        </AuthGate>
      </body>
    </html>
  );
}
