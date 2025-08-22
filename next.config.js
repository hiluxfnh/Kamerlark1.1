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
  // Changed to export for Firebase Hosting
  output: "export",
  // Configure for dynamic paths in exported static files
  trailingSlash: true,
  // Disable static optimization for all pages
  optimizeFonts: false,
  // Remove experimental features that cause issues with static export
  experimental: {
    // Still keep external packages configuration
    esmExternals: true,
    // Allow certain packages to remain external
    transpilePackages: [
      "firebase",
      "firebase-admin",
      "@firebase/firestore",
      "@firebase/auth",
    ],
  },
  // Disable strict mode for production
  reactStrictMode: false,
  // Add this to handle Firebase objects in static export
  env: {
    NEXT_PUBLIC_SKIP_SERIALIZABLE_VALIDATION: "1",
  },
};

module.exports = nextConfig;
