"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Check,
  Copy,
  Smartphone,
  ArrowUpRight,
  RefreshCw,
  Heart,
} from "lucide-react";
import { MEMBERSHIP } from "@/lib/constants";
import { api, displayDate } from "@/lib/community/client";
import { useCommunity } from "./provider";
import { MemberGate, PageHeading, Notice } from "./common";
type Payment = {
  id: string;
  transactionId: string;
  amount: number;
  days: number;
  status: string;
  note: string;
  createdAt: string;
};
export function Billing() {
  const { user, loading } = useCommunity();
  if (!loading && user)
    return (
      <MemberGate>
        <BillingContent member />
      </MemberGate>
    );
  return <BillingContent member={false} />;
}
function BillingContent({ member }: { member: boolean }) {
  const { me, reload } = useCommunity();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(member);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(me?.membership || false);
  const [until, setUntil] = useState(me?.profile?.membershipUntil || null);
  async function load() {
    try {
      const data = await api<{
        payments: Payment[];
        active: boolean;
        membershipUntil: string | null;
      }>("payments");
      setPayments(data.payments);
      setActive(data.active);
      setUntil(data.membershipUntil);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Payment history could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!member) return;
    let active = true;
    api<{
      payments: Payment[];
      active: boolean;
      membershipUntil: string | null;
    }>("payments")
      .then((data) => {
        if (active) {
          setPayments(data.payments);
          setActive(data.active);
          setUntil(data.membershipUntil);
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Payment history could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [member]);
  const pending = payments.some((p) => p.status === "pending");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      await api("payments", {
        method: "POST",
        body: JSON.stringify({
          payerName: data.get("payerName"),
          phone: data.get("phone"),
          transactionId: data.get("transactionId"),
        }),
      });
      setMessage(
        "Your payment details are submitted. Membership starts after an administrator verifies the transfer. You can check the status below.",
      );
      await load();
      await reload();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your details could not be submitted.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="A LITTLE MORE ROOM TO CONNECT"
        title="Let the conversation begin."
      />
      <p className="page-subtitle">
        Joining, creating a profile, and finding a mutual match are free. Akoma
        Plus gives your connections room to grow.
      </p>
      <div className="billing-layout">
        <aside className="membership-card">
          <span className="eyebrow">AKOMA PLUS</span>
          <h2>
            A spark.
            <br />A hello.
            <br />
            <em>Something more.</em>
          </h2>
          <div className="membership-price">
            <span>GHS</span>
            <strong>{MEMBERSHIP.price}</strong>
            <span>/ month ({MEMBERSHIP.days} days)</span>
          </div>
          <p>One payment. No automatic renewals.</p>
          <div className="membership-features">
            <span>
              <Check />
              Send messages to all your mutual matches
            </span>
            <span>
              <Check />
              Keep reading conversations after membership expires
            </span>
            <span>
              <Check />
              Renew whenever it feels right for you
            </span>
            <span>
              <Smartphone />
              Pay directly with Mobile Money
            </span>
          </div>
          <p className="membership-fine">
            Manual verification is required. A transaction submission does not
            activate membership. Your {MEMBERSHIP.days} days begin when payment
            is approved. Renewals extend an existing active membership.
          </p>
          {active && until && (
            <p className="notice">
              <strong>Your Plus membership is active.</strong>
              <br />
              Until {displayDate(until)}
            </p>
          )}
        </aside>
        <section className="payment-panel">
          <h2>A familiar way to pay.</h2>
          <p>
            Send GHS {MEMBERSHIP.price} with MoMo, share your transaction
            details, and the community team checks your payment.
          </p>
          {!member ? (
            <div className="card">
              <Heart size={26} strokeWidth={1.2} />
              <h3 style={{ marginTop: 15 }}>Your next chapter starts free.</h3>
              <p style={{ margin: "15px 0 22px" }}>
                Create your account and complete your profile before paying. A
                Plus membership is optional until you’re ready to send messages.
              </p>
              <Link href="/signup" className="button primary">
                Join Akoma free <ArrowUpRight size={16} />
              </Link>
              <p style={{ fontSize: 11, marginTop: 18 }}>
                Already here?{" "}
                <Link className="text-link" href="/login">
                  Log in
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="payment-steps">
                <div className="payment-step">
                  <span>1</span>
                  <div>
                    <h3>Send GHS {MEMBERSHIP.price} to the number below.</h3>
                    <p>
                      Use your network’s Mobile Money transfer menu. Confirm the
                      recipient name displayed by your network before
                      authorising the transfer. Network fees may apply.
                    </p>
                  </div>
                </div>
                <div className="momo-number">
                  <div>
                    <small>MOBILE MONEY RECIPIENT</small>
                    <strong>{MEMBERSHIP.phone}</strong>
                  </div>
                  <button
                    className="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(MEMBERSHIP.phone);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      } catch {
                        setMessage(`Copy this number: ${MEMBERSHIP.phone}`);
                      }
                    }}
                  >
                    <Copy size={14} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="payment-step">
                  <span>2</span>
                  <div>
                    <h3>Keep your MoMo transaction ID.</h3>
                    <p>
                      It’s in the confirmation message from your network. Submit
                      the exact ID below. Never share your MoMo PIN, OTP, or
                      account password.
                    </p>
                  </div>
                </div>
                <div className="payment-step">
                  <span>3</span>
                  <div>
                    <h3>We verify. You connect.</h3>
                    <p>
                      An administrator checks the transfer against the receiving
                      wallet. Your membership activates only after approval.
                      Check this page for the review result.
                    </p>
                  </div>
                </div>
              </div>
              <Notice text={error} error />
              <Notice text={message} />
              {pending ? (
                <div className="notice" role="status">
                  <strong>Your payment is awaiting review.</strong>
                  <br />
                  Please don’t send another payment for this request. Your
                  status updates here after the team reviews it.
                  <button
                    className="text-button"
                    style={{ display: "block", marginTop: 10 }}
                    onClick={() => void load()}
                  >
                    Check payment status
                  </button>
                </div>
              ) : (
                <form className="payment-form form-stack" onSubmit={submit}>
                  <h3>Already sent the payment?</h3>
                  <p className="small muted">
                    If a submission was rejected, check the team’s note, correct
                    your sending details, and resubmit the same transaction ID.
                    Do not pay again to correct a form error.
                  </p>
                  <label>
                    Name on your MoMo account
                    <input
                      className="input"
                      name="payerName"
                      placeholder="As shown on the transfer"
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </label>
                  <label>
                    Your sending phone number
                    <input
                      className="input"
                      type="tel"
                      name="phone"
                      placeholder="024 000 0000"
                      pattern="(0[235][0-9]{8}|\+233[235][0-9]{8})"
                      title="Enter 10 digits without spaces, or use +233 followed by 9 digits."
                      required
                    />
                    <small>
                      Use digits without spaces, for example 0240000000.
                    </small>
                  </label>
                  <label>
                    MoMo transaction ID
                    <input
                      className="input"
                      name="transactionId"
                      placeholder="From your transfer confirmation"
                      minLength={6}
                      maxLength={60}
                      pattern="[A-Za-z0-9-]+"
                      required
                    />
                  </label>
                  <label className="check-label">
                    <input type="checkbox" required />
                    <span>
                      I sent GHS {MEMBERSHIP.price} to {MEMBERSHIP.phone} and
                      understand that membership starts after manual
                      verification.
                    </span>
                  </label>
                  <button className="button primary" disabled={busy || loading}>
                    {busy ? "Submitting…" : "Submit payment for review"}
                    <ArrowUpRight size={16} />
                  </button>
                </form>
              )}
              <section className="payment-history">
                <div
                  className="inline-actions"
                  style={{ justifyContent: "space-between" }}
                >
                  <h2>My payment history</h2>
                  <button
                    className="icon-button"
                    aria-label="Refresh payment status"
                    onClick={() => void load()}
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
                {loading ? (
                  <p className="small muted">Loading your payments…</p>
                ) : !payments.length ? (
                  <p className="small muted">
                    Your submitted payments and review results appear here.
                  </p>
                ) : (
                  payments.map((p) => (
                    <div className="payment-row" key={p.id}>
                      <div>
                        <strong>
                          GHS {p.amount} · {p.days} days
                        </strong>
                        <p>Transaction {p.transactionId}</p>
                        <p>{displayDate(p.createdAt)}</p>
                        {p.note && (
                          <p className="payment-note">Team note: {p.note}</p>
                        )}
                      </div>
                      <span className={`status ${p.status}`}>{p.status}</span>
                    </div>
                  ))
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
