"use client";

export default function DiscoverError({ reset }: { reset: () => void }) {
  return (
    <main className="container-page">
      <div className="card p-5 text-slate-700">
        <h1 className="text-xl font-semibold text-slate-950">Members could not be loaded</h1>
        <p className="mt-2">
          The member service returned an invalid response. Check the Supabase environment variables and try again.
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
