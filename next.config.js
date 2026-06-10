/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "helloaditya.me",
      "cdn.pixabay.com",
      "picsum.photos",
      "lh3.googleusercontent.com",
    ],
    // Add unoptimized setting for Netlify
    unoptimized: true,
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  // NOTE: do not use `output: "export"` — this app has dynamic routes
  // (/room/[roomid], /profile/[uid]) and force-dynamic pages, which require
  // a server runtime (Vercel/Netlify). Static export breaks the build.
  trailingSlash: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Disable static optimization for all pages
  optimizeFonts: false,
  experimental: {
    // Packages that should not be bundled and should remain external
    serverComponentsExternalPackages: [
      "firebase",
      "firebase-admin",
      "@firebase/firestore",
      "@firebase/auth",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
      "react-firebase-hooks",
    ],
    // Workaround for Firebase serialization issues
    esmExternals: "loose",
  },
};

module.exports = nextConfig;
