import { Inter } from "next/font/google";
import "./globals.css";
import FooterGuard from "./components/FooterGuard";
import RouteProgress from "./components/RouteProgress";
import AuthGate from "./components/AuthGate";
import { I18nProvider } from "./lib/i18n";
const inter = Inter({ subsets: ["latin"] });

// Force dynamic rendering for all routes to avoid serialization issues with Firebase
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kamerlark.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KamerLark — Student housing in Cameroon",
    template: "%s | KamerLark",
  },
  description:
    "Find rooms, studios and apartments near universities across Cameroon. Verified owners, direct chat, no agency fees.",
  keywords: [
    "student housing",
    "Cameroon",
    "rooms for rent",
    "university accommodation",
    "roommate",
    "KamerLark",
  ],
  applicationName: "KamerLark",
  openGraph: {
    type: "website",
    siteName: "KamerLark",
    title: "KamerLark — Student housing in Cameroon",
    description:
      "Rooms, studios and apartments near universities across Cameroon — verified owners, direct chat, no agency fees.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "KamerLark — Student housing in Cameroon",
    description:
      "Rooms, studios and apartments near universities across Cameroon.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} data-theme="system">
        <I18nProvider>
          <AuthGate>
            <>
              <RouteProgress />
              {children}
              <FooterGuard />
            </>
          </AuthGate>
        </I18nProvider>
      </body>
    </html>
  );
}
