import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { RealtimeChat } from "@/components/chat/realtime-chat";

export default async function ChatPage({ params }: { params: { matchId: string } }) {
  const { supabase, user } = await requireUser();

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_one, user_two")
    .eq("id", params.matchId)
    .maybeSingle();

  if (!match || (match.user_one !== user.id && match.user_two !== user.id)) {
    redirect("/matches");
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, content, created_at")
    .eq("match_id", params.matchId)
    .order("created_at", { ascending: true });

  return (
    <main className="container-page max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold">Chat</h1>
      <RealtimeChat matchId={params.matchId} userId={user.id} initialMessages={messages || []} />
    </main>
  );
}
