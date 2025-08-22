"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-red-600">Error</h1>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Something went wrong!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          An unexpected error occurred.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
