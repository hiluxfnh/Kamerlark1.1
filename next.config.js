/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tree-shake big barrel packages. Named imports like
  // `import { Button } from "@mui/material"` otherwise pull a large slice of
  // the whole library into every route; this rewrites them to direct deep
  // imports, cutting both bundle size and dev compile time substantially.
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@mui/x-date-pickers-pro",
      "dayjs",
    ],
  },
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "res.cloudinary.com",
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
  // NOTE: do NOT add serverComponentsExternalPackages for firebase or
  // react-firebase-hooks, and do not set esmExternals. Externalizing them
  // loads a second copy of React during SSR ("Invalid hook call",
  // "Cannot read properties of null (reading 'useReducer')") and 500s
  // every page that renders AuthGate.
};

module.exports = nextConfig;
