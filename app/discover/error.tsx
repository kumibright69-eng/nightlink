"use client";
export default function DiscoverError({ reset }: { reset: () => void }) {
  return (
    <main className="page-wrap">
      <div className="empty-state">
        <h1>A little interruption.</h1>
        <p>Discovery couldn’t load. Please try again.</p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
