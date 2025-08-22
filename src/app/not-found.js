// This is a temporary file to disable static generation for the entire app
// and force server-side rendering for all pages
export const generateStaticParams = () => {
  return [];
};

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store';
