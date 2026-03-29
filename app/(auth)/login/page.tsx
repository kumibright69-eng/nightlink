"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { otpSchema } from "@/lib/validators";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = otpSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter a valid email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/discover` : undefined
      }
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Your login link or code is on the way.");
  }

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="text-sm text-slate-600">Use your email to receive a one-time sign-in link or code.</p>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? "Sending..." : "Email me a login code"}
        </button>
        <p className="text-sm text-slate-600">
          New here? <Link href="/signup" className="underline">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
