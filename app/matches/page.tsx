import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function MatchesPage() {
  const { supabase, user } = await requireUser();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_one, user_two, created_at")
    .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <main className="container-page">
      <h1 className="mb-8 text-3xl font-semibold">Your matches</h1>
      <div className="space-y-3">
        {matches?.length ? (
          matches.map((match: any) => (
            <Link key={match.id} href={`/chat/${match.id}`} className="block rounded-2xl border p-5 transition hover:bg-slate-50">
              <div className="font-medium">Match #{match.id.slice(0, 8)}</div>
              <div className="mt-1 text-sm text-slate-500">Open conversation</div>
            </Link>
          ))
        ) : (
          <div className="card p-5 text-slate-600">No matches yet.</div>
        )}
      </div>
    </main>
  );
}
