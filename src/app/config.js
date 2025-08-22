// This file configures global rendering settings for Next.js

// Force dynamic rendering for all routes
export const dynamic = "force-dynamic";

// Use Node.js runtime
export const runtime = "nodejs";

// Disable static generation
export const generateStaticParams = () => {
  return [];
};

// Never use static rendering
export const dynamicParams = true;

// Disable revalidation
export const revalidate = 0;

// Always fetch fresh data
export const fetchCache = "force-no-store";
