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
  output: 'standalone',
  experimental: {
    // This will force all pages to be rendered at request time
    // which will solve serialization issues
    serverComponentsExternalPackages: ['firebase'],
  },
};

module.exports = nextConfig;
