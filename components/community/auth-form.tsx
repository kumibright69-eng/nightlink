"use client";
import Link from "next/link";
import { useState } from "react";
import {
  login,
  signup,
  getUser,
  requestPasswordRecovery,
  updateUser,
} from "@netlify/identity";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Notice } from "./common";
export function AuthForm({ mode }: { mode: "login" | "signup" | "reset" }) {
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    try {
      if (forgot) {
        await requestPasswordRecovery(email);
        setMessage(
          "If an account exists for this email, a password reset link is on its way. Check your inbox and spam folder.",
        );
      } else if (isReset) {
        if (!(await getUser()))
          throw new Error(
            "Open the password reset link in your email first, or request a new link from the log in page.",
          );
        await updateUser({ password });
        window.location.replace("/discover");
      } else if (isSignup) {
        if (!values.get("consent"))
          throw new Error(
            "Confirm you are 18 or older and accept the terms to continue.",
          );
        await signup(email, password, {
          full_name: String(values.get("name") || "").trim(),
        });
        if (await getUser()) window.location.replace("/onboarding");
        else
          setMessage(
            "Your account is created. Check your email to confirm your address, then finish your profile. Please check your spam folder too.",
          );
      } else {
        await login(email, password);
        window.location.replace("/discover");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We couldn’t complete that. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-shell">
      <div className="auth-art">
        <img
          src="/images/connection.jpg"
          alt="A celebration of individuality and Ghanaian style"
        />
        <div className="auth-art-copy">
          <span className="eyebrow">A CONNECTION CLOSER TO HOME</span>
          <h2>
            Your story deserves
            <br />a little heart.
          </h2>
          <p>
            A familiar world. A new possibility.
            <br />
            Find your kind of connection on Akoma.
          </p>
        </div>
      </div>
      <div className="form-card">
        <span className="eyebrow">
          {forgot
            ? "LET’S GET YOU BACK IN"
            : isReset
              ? "A FRESH START"
              : isSignup
                ? "SOMETHING REAL STARTS HERE"
                : "GOOD TO SEE YOU AGAIN"}
        </span>
        <h1>
          {forgot
            ? "Forgot your password?"
            : isReset
              ? "A new password."
              : isSignup
                ? "Your person is out there."
                : "Welcome back."}
        </h1>
        <p>
          {forgot
            ? "Enter your email and we’ll send you a link to reset your password."
            : isReset
              ? "Choose a strong password with at least 10 characters."
              : isSignup
                ? "A little about you. A whole world of possibility. Create your free account to get started."
                : "A familiar face, a new conversation. Log in to pick up where you left off."}
        </p>
        <form onSubmit={submit}>
          {isSignup && !forgot && (
            <label>
              Your first name
              <input
                className="input"
                name="name"
                autoComplete="given-name"
                placeholder="What should we call you?"
                minLength={2}
                maxLength={40}
                required
              />
            </label>
          )}
          {!isReset && (
            <label>
              Email address
              <input
                className="input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={254}
                required
              />
            </label>
          )}
          {!forgot && (
            <label>
              {isReset ? "New password" : "Password"}
              <input
                className="input"
                type="password"
                name="password"
                autoComplete={
                  isSignup || isReset ? "new-password" : "current-password"
                }
                minLength={isSignup || isReset ? 10 : 1}
                maxLength={128}
                placeholder={
                  isSignup || isReset
                    ? "At least 10 characters"
                    : "Your password"
                }
                required
              />
            </label>
          )}
          {mode === "login" && !forgot && (
            <div className="form-link-row">
              <span className="small muted">Your next chapter is waiting.</span>
              <button
                type="button"
                onClick={() => {
                  setForgot(true);
                  setError("");
                  setMessage("");
                }}
              >
                Forgot password?
              </button>
            </div>
          )}
          {isSignup && !forgot && (
            <label className="check-label">
              <input type="checkbox" name="consent" required />
              <span>
                I am 18 or older and agree to the{" "}
                <Link href="/terms" target="_blank">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}
          <Notice text={error} error />
          <Notice text={message} />
          <button className="button primary large-button" disabled={busy}>
            {busy
              ? "One moment…"
              : forgot
                ? "Send reset link"
                : isReset
                  ? "Save new password"
                  : isSignup
                    ? "Create my free account"
                    : "Let’s get you connected"}
            <ArrowUpRight size={18} />
          </button>
          {forgot && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setForgot(false);
                setError("");
                setMessage("");
              }}
            >
              Back to log in
            </button>
          )}
        </form>
        <div className="auth-alternate">
          {isSignup ? (
            <>
              Already part of Akoma? <Link href="/login">Log in</Link>
            </>
          ) : (
            <>
              New to Akoma? <Link href="/signup">Find your person</Link>
            </>
          )}
        </div>
        <p
          className="small muted"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            fontSize: 10,
          }}
        >
          <ShieldCheck size={14} /> For adults 18+. Your full birthday stays
          private.
        </p>
      </div>
    </main>
  );
}
