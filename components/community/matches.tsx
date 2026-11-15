"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, RefreshCw } from "lucide-react";
import { api, displayDate, type Match } from "@/lib/community/client";
import {
  MemberGate,
  PageHeading,
  EmptyState,
  Notice,
  LoadingCards,
} from "./common";
export function Matches() {
  return (
    <MemberGate>
      <MatchList />
    </MemberGate>
  );
}
function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await api<{ matches: Match[] }>("matches");
      setMatches(data.matches);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    api<{ matches: Match[] }>("matches")
      .then((data) => {
        if (active) setMatches(data.matches);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const timer = setInterval(() => {
      if (!document.hidden) void load(true);
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="THE FEELING IS MUTUAL"
        title="A good place to say hello."
      >
        <button
          className="button"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </PageHeading>
      <p className="page-subtitle">
        You liked them. They liked you. Now there’s a little room for
        possibility. Akoma Plus is required to send messages.
      </p>
      <Notice text={error} error />
      {loading ? (
        <LoadingCards />
      ) : matches.length ? (
        <div className="match-grid">
          {matches.map((m) => (
            <Link className="match-card" key={m.id} href={`/chat/${m.id}`}>
              <img
                src={m.profile.photo}
                alt={m.profile.name}
                onError={(e) => {
                  e.currentTarget.src = "/profile-placeholder.svg";
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="match-card-info">
                <h2>
                  {m.profile.name}, {m.profile.age}
                </h2>
                <small>
                  {m.profile.city} · Matched {displayDate(m.createdAt)}
                </small>
                <p>
                  {m.lastMessage?.body ||
                    "A mutual spark. Your first hello is waiting."}
                </p>
              </div>
              {m.lastMessage ? <ArrowUpRight /> : <Heart />}
            </Link>
          ))}
        </div>
      ) : (
        !error && (
          <EmptyState
            title="A spark takes two."
            text="When you and someone else like each other, you’ll find your match here. Take a look around. Someone might just surprise you."
          >
            <Link className="button primary" href="/discover">
              Find your kind of spark <ArrowUpRight size={16} />
            </Link>
          </EmptyState>
        )
      )}
    </main>
  );
}
