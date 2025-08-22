// 404 page - displayed when a page isn't found
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Dynamic rendering configuration
export const dynamic = "force-dynamic";
