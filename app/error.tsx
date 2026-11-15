"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-wrap">
      <div className="empty-state">
        <h1>A little interruption.</h1>
        <p>Something didn’t load correctly. Please try again.</p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
        <Link className="text-link" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
