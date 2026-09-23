"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (e.g., Sentry)
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-sm text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-2">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <div>
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground mb-2">
            Something Went Wrong
          </h2>
          <p className="text-muted-foreground text-sm">
            We encountered an unexpected error while loading this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 btn-primary"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider border border-border text-foreground hover:bg-muted transition-colors rounded-sm"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-left mt-4 p-4 bg-muted rounded-sm text-xs font-mono text-muted-foreground overflow-x-auto">
            <summary className="cursor-pointer font-bold mb-2">Developer Details</summary>
            <p>{error.message}</p>
            {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
          </details>
        )}
      </div>
    </div>
  );
}