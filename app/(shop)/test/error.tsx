"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";

export default function TestError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In a real app you'd report this to your error tracking service.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
      <h1 className="text-xl font-semibold text-red-800">
        Une erreur est survenue
      </h1>
      <p className="text-sm text-red-700">{error.message}</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
      >
        Réessayer
      </button>
    </div>
  );
}
