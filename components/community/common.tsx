"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Heart, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { useCommunity } from "./provider";
export function LoadingCards() {
  return (
    <div
      className="profile-grid"
      aria-busy="true"
      aria-label="Loading profiles"
    >
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return text ? (
    <p
      role={error ? "alert" : "status"}
      className={`notice ${error ? "error" : "success"}`}
    >
      {text}
    </p>
  ) : null;
}
export function MemberGate({
  children,
  profile = true,
  allowSuspended = false,
}: {
  children: React.ReactNode;
  profile?: boolean;
  allowSuspended?: boolean;
}) {
  const { user, me, loading, error, reload } = useCommunity();
  useEffect(() => {
    if (!loading && user && me && profile && !me.profile)
      window.location.replace("/onboarding");
  }, [loading, user, me, profile]);
  if (loading)
    return (
      <main className="page-wrap">
        <div className="page-heading">
          <span className="eyebrow">A LITTLE SPARK STARTS HERE</span>
          <h1>Getting things ready…</h1>
        </div>
        <LoadingCards />
      </main>
    );
  if (!user)
    return (
      <main className="page-wrap">
        <div className="empty-state">
          <div className="empty-icon">
            <Heart />
          </div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>
            Good connections
            <br />
            start with hello.
          </h1>
          <p>
            Join a community made for Ghanaians. Create your profile, find your
            people, and see where a little spark takes you.
          </p>
          <Link className="button primary" href="/signup">
            Create your free profile <ArrowRight size={17} />
          </Link>
          <p className="small">
            Already a member?{" "}
            <Link className="text-link" href="/login">
              Log in
            </Link>
          </p>
        </div>
      </main>
    );
  if (error)
    return (
      <main className="page-wrap">
        <div className="empty-state">
          <RefreshCw />
          <h1>A little interruption.</h1>
          <Notice text={error} error />
          <button className="button primary" onClick={() => void reload()}>
            Try again
          </button>
          <Link className="text-link" href="/login">
            Log in again
          </Link>
        </div>
      </main>
    );
  if (!me || (profile && !me.profile))
    return (
      <main className="page-wrap">
        <LoadingCards />
      </main>
    );
  if (me.profile?.suspended && !allowSuspended)
    return (
      <main className="page-wrap">
        <div className="empty-state">
          <ShieldCheck />
          <h1>Your profile is on hold.</h1>
          <p>
            Your profile is hidden while the community team reviews a safety
            concern.
          </p>
          <Link className="button" href="/settings">
            Account settings
          </Link>
          <Link className="text-link" href="/safety">
            Community safety
          </Link>
        </div>
      </main>
    );
  return <>{children}</>;
}
export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state compact">
      <div className="empty-icon">
        <Heart />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
