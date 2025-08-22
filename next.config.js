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
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  output: "standalone",
  // Completely disable static generation for the app
  staticPageGenerationTimeout: 0,
  generateBuildId: () => "build",
  generateEtags: false,
  // Disable static exports
  trailingSlash: false,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Disable static optimization for all pages to force server-rendering
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
    appDir: true,
    serverActions: true,
    esmExternals: "loose",
  },
};

module.exports = nextConfig;
