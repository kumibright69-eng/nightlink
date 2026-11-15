import { Chat } from "@/components/community/chat";
export default async function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  return <Chat matchId={matchId} />;
}
