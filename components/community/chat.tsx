"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Send,
  ArrowLeft,
  Flag,
  UserRoundMinus,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { api, type Message, type PublicProfile } from "@/lib/community/client";
import { useCommunity } from "./provider";
import { MemberGate, Notice, LoadingCards } from "./common";
import { SafetyDialog } from "./safety-actions";
import { Modal } from "./modal";
export function Chat({ matchId }: { matchId: string }) {
  return (
    <MemberGate>
      <Conversation matchId={matchId} />
    </MemberGate>
  );
}
function Conversation({ matchId }: { matchId: string }) {
  const { user } = useCommunity();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [person, setPerson] = useState<PublicProfile | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [safety, setSafety] = useState(false);
  const [unmatch, setUnmatch] = useState(false);
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const pending = useRef<{ body: string; clientId: string } | null>(null);
  const unavailable = useRef(false);
  const closeSafety = useCallback(() => setSafety(false), []);
  const closeUnmatch = useCallback(() => setUnmatch(false), []);
  const load = useCallback(
    async (older = false) => {
      if (unavailable.current) return;
      if (older) setLoadingOlder(true);
      const nearBottom =
        !box.current ||
        box.current.scrollHeight -
          box.current.scrollTop -
          box.current.clientHeight <
          100;
      try {
        const before =
          older && messages[0]
            ? `?before=${encodeURIComponent(messages[0].id)}`
            : !older && messages.length
              ? `?after=${encodeURIComponent(messages[messages.length - 1].id)}`
              : "";
        const data = await api<{
          messages: Message[];
          hasMore: boolean;
          profile: PublicProfile;
          canSend: boolean;
        }>(`messages/${matchId}${before}`);
        setMessages((current) => {
          const merged = older
            ? [...data.messages, ...current]
            : [...current, ...data.messages];
          return [...new Map(merged.map((m) => [m.id, m])).values()].sort(
            (a, b) =>
              a.createdAt.localeCompare(b.createdAt) ||
              a.id.localeCompare(b.id),
          );
        });
        setPerson(data.profile);
        setCanSend(data.canSend);
        if (older || !person || !messages.length) setHasMore(data.hasMore);
        setError("");
        if (!older && nearBottom)
          setTimeout(() => {
            if (box.current) box.current.scrollTop = box.current.scrollHeight;
          }, 50);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Your conversation could not be loaded.",
        );
      } finally {
        setLoading(false);
        setLoadingOlder(false);
      }
    },
    [matchId, messages, person],
  );
  const latestLoad = useRef(load);
  useEffect(() => {
    latestLoad.current = load;
  }, [load]);
  useEffect(() => {
    void latestLoad.current();
    const timer = setInterval(() => {
      if (!document.hidden) void latestLoad.current();
    }, 5000);
    return () => clearInterval(timer);
  }, [matchId]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    if (!pending.current || pending.current.body !== text.trim())
      pending.current = { body: text.trim(), clientId: crypto.randomUUID() };
    try {
      await api<{ message: Message | null }>(`messages/${matchId}`, {
        method: "POST",
        body: JSON.stringify(pending.current),
      });
      setText("");
      pending.current = null;
      await latestLoad.current();
      setTimeout(() => {
        if (box.current) box.current.scrollTop = box.current.scrollHeight;
      }, 30);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your message wasn’t sent. You can try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function endMatch() {
    setBusy(true);
    try {
      await api(`matches/${matchId}`, { method: "DELETE" });
      unavailable.current = true;
      router.replace("/matches");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-wrap chat-page">
      <div className="page-heading">
        <Link className="text-link arrow-link" href="/matches">
          <ArrowLeft size={15} />
          All my matches
        </Link>
      </div>
      {loading ? (
        <LoadingCards />
      ) : !person ? (
        <div className="empty-state">
          <h1>A little interruption.</h1>
          <Notice text={error} error />
          <button className="button" onClick={() => void load()}>
            Try again
          </button>
          <Link href="/matches" className="text-link">
            Back to matches
          </Link>
        </div>
      ) : (
        <div className="chat-layout">
          <div className="chat-header">
            <div className="chat-person">
              <img src={person.photo} alt={person.name} />
              <div>
                <h1>
                  {person.name}, {person.age}
                </h1>
                <p>{person.city} · A mutual connection</p>
              </div>
            </div>
            <div className="chat-controls">
              <button
                className="icon-button"
                aria-label="Report or block this member"
                onClick={() => setSafety(true)}
              >
                <Flag size={16} />
              </button>
              <button
                className="icon-button"
                aria-label="End this match"
                onClick={() => setUnmatch(true)}
              >
                <UserRoundMinus size={17} />
              </button>
            </div>
          </div>
          <div
            className="chat-body"
            ref={box}
            role="log"
            aria-label="Conversation messages"
            aria-live="polite"
          >
            {hasMore && (
              <button
                className="text-button"
                onClick={() => void load(true)}
                disabled={loadingOlder}
              >
                {loadingOlder ? "Loading…" : "Load earlier messages"}
              </button>
            )}
            {!messages.length && (
              <div className="thread-empty">
                <Heart size={29} strokeWidth={1.2} />
                <h2>A little hello goes a long way.</h2>
                <p>
                  You both felt a spark. Ask about an interest you share, or
                  start with their perfect Ghanaian Sunday.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <div
                className={`chat-bubble ${m.senderId === user?.id ? "mine" : ""}`}
                key={m.id}
              >
                <p>{m.body}</p>
                <time dateTime={m.createdAt}>
                  {new Date(m.createdAt).toLocaleString("en-GH", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            ))}
          </div>
          <div className="chat-error">
            <Notice text={error} error />
          </div>
          {canSend ? (
            <form className="chat-compose" onSubmit={send}>
              <textarea
                aria-label="Your message"
                placeholder="Start with a little hello…"
                className="textarea"
                rows={1}
                maxLength={2000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <button
                className="button primary"
                disabled={busy || !text.trim()}
                aria-label="Send message"
              >
                <span className="send-label">{busy ? "Sending…" : "Send"}</span>
                <Send size={17} />
              </button>
            </form>
          ) : (
            <div className="chat-upgrade">
              <p>
                <strong>A little more room to connect.</strong>
                <br />
                Akoma Plus lets you send messages to your matches.
              </p>
              <Link href="/billing" className="button primary">
                Get Akoma Plus <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </div>
      )}
      {safety && person && (
        <SafetyDialog
          target={person}
          close={closeSafety}
          done={() => {
            unavailable.current = true;
            router.replace("/matches");
          }}
        />
      )}
      {unmatch && (
        <Modal title="End this connection?" close={closeUnmatch}>
          <div className="modal-body">
            <p>
              This removes the match and closes this conversation for both of
              you. You can’t undo this.
            </p>
            <Notice text={error} error />
          </div>
          <div className="modal-footer">
            <button className="button" onClick={closeUnmatch}>
              Keep the connection
            </button>
            <button
              className="button danger"
              onClick={() => void endMatch()}
              disabled={busy}
            >
              End match
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
