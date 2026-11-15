"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { logout, updateUser } from "@netlify/identity";
import { LogOut, Pause, Play, Trash2, ShieldCheck } from "lucide-react";
import { api, displayDate } from "@/lib/community/client";
import { useCommunity } from "./provider";
import { MemberGate, PageHeading, Notice } from "./common";
import { ProfileEditor } from "./profile-editor";
import { Modal } from "./modal";
export function Settings() {
  return (
    <MemberGate allowSuspended>
      <SettingsContent />
    </MemberGate>
  );
}
function SettingsContent() {
  const { me, reload } = useCommunity();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState<{ id: string; name: string }[]>([]);
  const [remove, setRemove] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const closeRemove = useCallback(() => setRemove(false), []);
  useEffect(() => {
    if (!me?.profile?.suspended)
      void api<{ blocks: { id: string; name: string }[] }>("blocks")
        .then((d) => setBlocked(d.blocks))
        .catch(() =>
          setError(
            "Blocked profiles could not be loaded. Refresh this page to try again.",
          ),
        );
  }, [me?.profile?.suspended]);
  async function pause() {
    if (!me?.profile) return;
    setBusy(true);
    setError("");
    try {
      await api("profile", {
        method: "PUT",
        body: JSON.stringify({
          ...me.profile,
          consent: true,
          paused: !me.profile.paused,
        }),
      });
      await reload();
      setMessage(
        me.profile.paused
          ? "Your profile is visible again. Welcome back."
          : "Your profile is paused and hidden from new people. Existing matches can still chat with you.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function unblock(id: string) {
    setBusy(true);
    setError("");
    try {
      await api(`blocks/${id}`, { method: "DELETE" });
      setBlocked((current) => current.filter((p) => p.id !== id));
      setMessage(
        "Member unblocked. Previous matches and conversations stay closed.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("account", {
        method: "DELETE",
        body: JSON.stringify({ confirmation }),
      });
      await logout();
      // A full navigation clears authenticated state after the sign-out mutation.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await updateUser({ password: String(data.get("password")) });
      form.reset();
      setMessage("Your password is updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function support(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await api("support", {
        method: "POST",
        body: JSON.stringify({ details: data.get("details") }),
      });
      form.reset();
      setMessage(
        "Your message is saved for the community team. Account review results appear on your profile or membership page.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="ENTIRELY YOU. ALWAYS YOUR CHOICE."
        title="Your little corner of Akoma."
      >
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
              // A full navigation clears authenticated state after the sign-out mutation.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/";
            } catch {
              setError("Couldn’t log out. Please try again.");
              setBusy(false);
            }
          }}
        >
          <LogOut size={15} />
          Log out
        </button>
      </PageHeading>
      <Notice text={error} error />
      <Notice text={message} />
      {me?.profile?.suspended ? (
        <Notice
          error
          text="Your profile is suspended and hidden. You can request an account review below or remove your dating profile."
        />
      ) : (
        <ProfileEditor />
      )}
      <div className="settings-grid">
        <section className="card">
          <h2>A little breathing room.</h2>
          <p>
            {me?.profile?.paused
              ? "Your profile is paused. New people cannot see it, but your existing matches remain available."
              : "Take a break whenever you need. Pausing hides your profile from discovery while keeping your matches."}
          </p>
          <button
            className="button"
            disabled={busy || me?.profile?.suspended}
            onClick={() => void pause()}
          >
            {me?.profile?.paused ? <Play size={15} /> : <Pause size={15} />}{" "}
            {me?.profile?.paused ? "Resume my profile" : "Pause my profile"}
          </button>
        </section>
        <section className="card">
          <h2>Your membership.</h2>
          <p>
            {me?.membership && me.profile?.membershipUntil
              ? `Your Akoma Plus membership is active until ${displayDate(me.profile.membershipUntil)}.`
              : "Your profile and matches are free. Akoma Plus unlocks sending messages to your mutual matches."}
          </p>
          <Link className="button" href="/billing">
            Manage Akoma Plus
          </Link>
        </section>
        <section className="card">
          <h2>Your boundaries.</h2>
          <p>
            Blocked members cannot see your profile or message you. Unblocking
            does not restore an old match.
          </p>
          {blocked.length ? (
            blocked.map((p) => (
              <div className="blocked-row" key={p.id}>
                <span>{p.name}</span>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => void unblock(p.id)}
                >
                  Unblock
                </button>
              </div>
            ))
          ) : (
            <span className="small muted">No blocked members.</span>
          )}
          <p>
            <Link className="text-link" href="/safety">
              Read our community guidelines
            </Link>
          </p>
        </section>
        <section className="card">
          <h2>Keep your account yours.</h2>
          <p>
            Signed in as {me?.user.email}. Use a strong password you don’t use
            anywhere else.
          </p>
          <form className="form-stack" onSubmit={changePassword}>
            <label>
              New password
              <input
                className="input"
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                required
                placeholder="At least 10 characters"
              />
            </label>
            <button className="button" disabled={busy}>
              <ShieldCheck size={15} />
              Update password
            </button>
          </form>
        </section>
        <section className="card full-width">
          <h2>A little help from the team.</h2>
          <p>
            Send an account review request, a membership question, or a privacy
            request. Include a payment transaction ID if relevant. Never send
            passwords, MoMo PINs, or OTPs. If you need an account reply, include
            a contact email you’re comfortable sharing with the administrators.
          </p>
          <form className="form-stack" onSubmit={support}>
            <label>
              Your message
              <textarea
                name="details"
                className="textarea"
                minLength={15}
                maxLength={2000}
                required
                placeholder="Tell the community team how they can help."
              />
            </label>
            <button className="button" disabled={busy}>
              Send to community team
            </button>
          </form>
        </section>
        <section className="card full-width">
          <h2>Close this chapter.</h2>
          <p>
            Removing your dating profile deletes your photo, matches, and
            messages. Your login remains registered, and payment records and
            safety reports are retained for review. To request removal of your
            remaining account records, send a privacy request above before
            removing your profile.
          </p>
          <button className="button danger" onClick={() => setRemove(true)}>
            <Trash2 size={15} />
            Remove dating profile
          </button>
        </section>
      </div>
      {remove && (
        <Modal title="Remove your dating profile?" close={closeRemove}>
          <form onSubmit={deleteProfile}>
            <div className="modal-body">
              <p>
                Your photo, profile, matches, and messages will be deleted. This
                cannot be undone. Your sign-in account stays registered.
                Membership time is not refunded or carried over to a new
                profile.
              </p>
              <label>
                Type DELETE to confirm
                <input
                  className="input"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="off"
                  required
                  pattern="DELETE"
                />
              </label>
              <Notice text={error} error />
            </div>
            <div className="modal-footer">
              <button className="button" type="button" onClick={closeRemove}>
                Keep my profile
              </button>
              <button
                className="button danger"
                disabled={busy || confirmation !== "DELETE"}
              >
                {busy ? "Removing…" : "Remove profile"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
