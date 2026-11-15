"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  X,
  MapPin,
  SlidersHorizontal,
  MoreHorizontal,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { CITIES } from "@/lib/constants";
import { api, type PublicProfile } from "@/lib/community/client";
import { useCommunity } from "./provider";
import {
  MemberGate,
  PageHeading,
  EmptyState,
  Notice,
  LoadingCards,
} from "./common";
import { Modal } from "./modal";
import { SafetyDialog } from "./safety-actions";
export function Discover() {
  return (
    <MemberGate>
      <DiscoverContent />
    </MemberGate>
  );
}
function DiscoverContent() {
  const { me } = useCommunity();
  const [filters, setFilters] = useState({ city: "", min: 18, max: 65 });
  const [people, setPeople] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [detail, setDetail] = useState<PublicProfile | null>(null);
  const [safety, setSafety] = useState<PublicProfile | null>(null);
  const [newMatch, setNewMatch] = useState<{ id: string; name: string } | null>(
    null,
  );
  const closeDetail = useCallback(() => setDetail(null), []);
  const closeSafety = useCallback(() => setSafety(null), []);
  const load = useCallback(
    async (offset = 0) => {
      setLoading(true);
      setError("");
      try {
        const data = await api<{ profiles: PublicProfile[]; hasMore: boolean }>(
          `discover?${new URLSearchParams({ city: filters.city, min: String(filters.min), max: String(filters.max), offset: String(offset) })}`,
        );
        setPeople((current) =>
          offset ? [...current, ...data.profiles] : data.profiles,
        );
        setHasMore(data.hasMore);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Profiles could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );
  useEffect(() => {
    let active = true;
    api<{ profiles: PublicProfile[]; hasMore: boolean }>(
      `discover?${new URLSearchParams({ city: filters.city, min: String(filters.min), max: String(filters.max), offset: "0" })}`,
    )
      .then((data) => {
        if (active) {
          setPeople(data.profiles);
          setHasMore(data.hasMore);
          setError("");
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Profiles could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters]);
  async function react(p: PublicProfile, liked: boolean) {
    setBusy(p.id);
    setError("");
    try {
      const result = await api<{ matchId: string | null }>("reactions", {
        method: "POST",
        body: JSON.stringify({ targetId: p.id, liked }),
      });
      setPeople((current) => current.filter((x) => x.id !== p.id));
      setDetail(null);
      if (result.matchId) setNewMatch({ id: result.matchId, name: p.name });
      else if (liked)
        setNotice(
          `A little spark sent to ${p.name}. If the feeling is mutual, you’ll find them in your matches.`,
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }
  async function reset() {
    setBusy("reset");
    setError("");
    try {
      await api("reset-passes", { method: "POST" });
      await load();
      setNotice("Previously passed profiles can now appear again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="A FAMILIAR WORLD. A NEW POSSIBILITY."
        title={`Find your kind of spark${me?.profile?.name ? `, ${me.profile.name}` : ""}.`}
      >
        <Link className="button" href="/settings">
          Edit my profile <ArrowRight size={15} />
        </Link>
      </PageHeading>
      <p className="page-subtitle">
        A shared interest. A familiar city. Someone worth a hello. Meet people
        looking for the same kind of connection.
      </p>
      {me?.profile?.paused && (
        <Notice text="Your profile is paused. Resume it in settings to appear in discovery and meet new people." />
      )}
      {newMatch && (
        <div className="match-banner" role="status">
          <div>
            <h2>It’s a mutual kind of feeling.</h2>
            <p>
              You and {newMatch.name} liked each other. Your next chapter could
              start with hello.
            </p>
          </div>
          <Link className="button" href={`/chat/${newMatch.id}`}>
            Meet your match <Heart size={15} />
          </Link>
        </div>
      )}
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const min = Number(data.get("min"));
          const max = Number(data.get("max"));
          if (min > max) {
            setError(
              "The minimum age must be less than or equal to the maximum age.",
            );
            return;
          }
          setLoading(true);
          setFilters({ city: String(data.get("city")), min, max });
          setNotice("");
        }}
      >
        <label>
          Somewhere close to your heart
          <select name="city" className="select" defaultValue="">
            <option value="">All of Ghana</option>
            {CITIES.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <label>
          Age from
          <input
            type="number"
            name="min"
            className="input"
            min={18}
            max={100}
            defaultValue={18}
            required
          />
        </label>
        <label>
          Age to
          <input
            type="number"
            name="max"
            className="input"
            min={18}
            max={100}
            defaultValue={65}
            required
          />
        </label>
        <button className="button primary" disabled={loading}>
          <SlidersHorizontal size={15} />
          Find my people
        </button>
      </form>
      <Notice text={error} error />
      <Notice text={notice} />
      {error && (
        <button className="text-button" onClick={() => void load()}>
          Try loading profiles again
        </button>
      )}
      {loading && !people.length ? (
        <LoadingCards />
      ) : people.length ? (
        <>
          <div className="filter-count">
            <span>Real people. Shared possibilities.</span>
            <span>Preferences from your profile</span>
          </div>
          <div className="profile-grid">
            {people.map((p, index) => (
              <article
                className="profile-card"
                key={p.id}
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <button
                  className="profile-picture"
                  onClick={() => setDetail(p)}
                  aria-label={`View ${p.name}’s profile`}
                >
                  <img
                    src={p.photo}
                    alt={`${p.name}’s profile photo`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/profile-placeholder.svg";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <span className="profile-overlay" />
                  <div className="profile-card-title">
                    <h2>
                      {p.name}, <span>{p.age}</span>
                    </h2>
                    <p>
                      <MapPin size={12} />
                      {p.city}, Ghana
                    </p>
                  </div>
                </button>
                <div className="profile-card-body">
                  <div className="profile-interest">
                    {p.interests.slice(0, 3).map((i) => (
                      <span className="tag" key={i}>
                        {i}
                      </span>
                    ))}
                  </div>
                  <p className="profile-bio">{p.bio}</p>
                  <div className="profile-actions">
                    <button
                      className="button pass-button"
                      disabled={!!busy}
                      onClick={() => void react(p, false)}
                      aria-label={`Pass on ${p.name}`}
                    >
                      <X size={15} />
                      Pass
                    </button>
                    <button
                      className="button like-button"
                      disabled={!!busy}
                      onClick={() => void react(p, true)}
                      aria-label={`Like ${p.name}`}
                    >
                      <Heart size={15} />
                      {busy === p.id ? "Sending…" : "Like"}
                    </button>
                    <button
                      className="more-button"
                      onClick={() => setSafety(p)}
                      aria-label={`Report or block ${p.name}`}
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        !error && (
          <EmptyState
            title={
              me?.profile?.paused
                ? "Take all the time you need."
                : "Your kind of people are worth the wait."
            }
            text={
              me?.profile?.paused
                ? "Your profile is hidden from new people. Your existing matches remain available."
                : "There are no new profiles matching these preferences yet. Try another city, broaden your age range, or come back as the community grows."
            }
          >
            {me?.profile?.paused ? (
              <Link className="button primary" href="/settings">
                Manage my profile
              </Link>
            ) : (
              <>
                <button
                  className="button"
                  disabled={!!busy}
                  onClick={() => void reset()}
                >
                  <RefreshCw size={15} />
                  Revisit people I passed
                </button>
                <Link className="text-link" href="/settings">
                  Update who I’d like to meet
                </Link>
              </>
            )}
          </EmptyState>
        )
      )}
      {hasMore && (
        <div className="pagination-actions">
          <button
            className="button"
            onClick={() => void load(people.length)}
            disabled={loading}
          >
            {loading ? "Finding more people…" : "Discover more people"}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
      {detail && (
        <Modal title="A little more about them." close={closeDetail}>
          <img
            className="modal-profile-photo"
            src={detail.photo}
            alt={detail.name}
          />
          <div className="modal-body">
            <div className="modal-profile-heading">
              <h2>
                {detail.name}, {detail.age}
              </h2>
              <p>{detail.city}, Ghana</p>
            </div>
            <div className="modal-profile-meta">
              {detail.occupation && `${detail.occupation} · `}
              {detail.intention}
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{detail.bio}</p>
            <div className="profile-interest">
              {detail.interests.map((i) => (
                <span className="tag" key={i}>
                  {i}
                </span>
              ))}
            </div>
            <button
              className="text-button"
              onClick={() => {
                setSafety(detail);
                setDetail(null);
              }}
            >
              Report or block
            </button>
            <Notice text={error} error />
          </div>
          <div className="modal-footer">
            <button
              className="button"
              disabled={!!busy}
              onClick={() => void react(detail, false)}
            >
              <X size={16} />
              Pass
            </button>
            <button
              className="button primary"
              disabled={!!busy}
              onClick={() => void react(detail, true)}
            >
              <Heart size={16} />
              Send a little spark
            </button>
          </div>
        </Modal>
      )}
      {safety && (
        <SafetyDialog
          target={safety}
          close={closeSafety}
          done={() => {
            setPeople((current) => current.filter((p) => p.id !== safety.id));
            setNotice(
              "This member is blocked. Any report you submitted is saved for the community team.",
            );
            setSafety(null);
          }}
        />
      )}
    </main>
  );
}
