"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Props = {
  matchId: string;
  userId: string;
  initialMessages: Message[];
};

export function RealtimeChat({ matchId, userId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const value = content.trim();
    if (!value) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({ match_id: matchId, sender_id: userId, content: value });
    setSending(false);
    if (!error) setContent("");
  }

  return (
    <>
      <div className="min-h-[420px] space-y-3 rounded-2xl border p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.sender_id === userId ? "ml-auto bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            {message.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input flex-1"
          placeholder="Write a message"
        />
        <button className="btn btn-primary" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </>
  );
}
