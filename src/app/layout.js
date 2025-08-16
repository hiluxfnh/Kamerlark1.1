import { Inter } from "next/font/google";
import "./globals.css";
import FooterGuard from "./components/FooterGuard";
import AuthGate from "./components/AuthGate";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KamerLark",
  description: "KamerLark helps students find housing and roommates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthGate>{children}</AuthGate>
        <FooterGuard />
      </body>
    </html>
  );
}
