"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCw, Check, X, AlertTriangle } from "lucide-react";
import { api, displayDate } from "@/lib/community/client";
import { useCommunity } from "./provider";
import { MemberGate, PageHeading, EmptyState, Notice } from "./common";
import { Modal } from "./modal";
type PaymentReview = {
  payment: {
    id: string;
    userId: string | null;
    payerName: string;
    phone: string;
    transactionId: string;
    amount: number;
    days: number;
    createdAt: string;
  };
  memberName: string | null;
};
type Report = {
  id: string;
  subjectId: string | null;
  subjectName: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
};
export function Admin() {
  return (
    <MemberGate>
      <AdminContent />
    </MemberGate>
  );
}
function AdminContent() {
  const { me } = useCommunity();
  const [payments, setPayments] = useState<PaymentReview[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState<PaymentReview | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const closeReview = useCallback(() => setReview(null), []);
  const load = useCallback(async () => {
    if (!me?.user.admin) return;
    setLoading(true);
    try {
      const data = await api<{ payments: PaymentReview[]; reports: Report[] }>(
        "admin",
      );
      setPayments(data.payments);
      setReports(data.reports);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The queue could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [me?.user.admin]);
  useEffect(() => {
    if (!me?.user.admin) return;
    let active = true;
    api<{ payments: PaymentReview[]; reports: Report[] }>("admin")
      .then((data) => {
        if (active) {
          setPayments(data.payments);
          setReports(data.reports);
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "The queue could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [me?.user.admin]);
  if (!me?.user.admin)
    return (
      <main className="page-wrap">
        <EmptyState
          title="This space is for the community team."
          text="Only authorised administrators can review payments and safety reports."
        >
          <Link className="button primary" href="/discover">
            Back to discovery
          </Link>
        </EmptyState>
      </main>
    );
  async function paymentDecision(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!review) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("admin/payment", {
        method: "POST",
        body: JSON.stringify({
          paymentId: review.payment.id,
          decision,
          note: form.get("note"),
        }),
      });
      setReview(null);
      setMessage(
        decision === "approved"
          ? "Payment approved. The member’s messaging access is activated."
          : "Payment rejected. The review note is visible in the member’s payment history.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function reportDecision(
    reportId: string,
    choice: "dismiss" | "suspend" | "restore",
  ) {
    setBusy(true);
    setError("");
    try {
      await api("admin/report", {
        method: "POST",
        body: JSON.stringify({ reportId, decision: choice }),
      });
      setMessage(
        choice === "suspend"
          ? "Profile suspended and hidden from the community."
          : choice === "restore"
            ? "Profile restored. The review is resolved."
            : "Review marked resolved.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="CARE FOR THE COMMUNITY"
        title="A little care behind every connection."
      >
        <button
          className="button"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh queues
        </button>
      </PageHeading>
      <p className="page-subtitle">
        Check every MoMo transfer against the receiving wallet before approving
        it. A submitted transaction ID is a claim, not proof of payment.
      </p>
      <Notice text={error} error />
      <Notice text={message} />
      <div className="admin-grid">
        <section className="card">
          <div className="inline-actions">
            <ShieldCheck size={21} />
            <h2>Payments to verify</h2>
            <span className="status">{payments.length} pending</span>
          </div>
          {loading ? (
            <p className="small muted" style={{ marginTop: 20 }}>
              Loading the payment queue…
            </p>
          ) : !payments.length ? (
            <p className="small muted" style={{ marginTop: 20 }}>
              All caught up. New payment requests appear here.
            </p>
          ) : (
            payments.map((row) => (
              <article className="admin-item" key={row.payment.id}>
                <h3>{row.memberName || "Removed profile"}</h3>
                <dl>
                  <dt>Amount</dt>
                  <dd>
                    GHS {row.payment.amount} · {row.payment.days} days
                  </dd>
                  <dt>Sender name</dt>
                  <dd>{row.payment.payerName}</dd>
                  <dt>Sender phone</dt>
                  <dd>{row.payment.phone}</dd>
                  <dt>Transaction</dt>
                  <dd>{row.payment.transactionId}</dd>
                  <dt>Submitted</dt>
                  <dd>{displayDate(row.payment.createdAt)}</dd>
                </dl>
                <div className="admin-actions">
                  <button
                    className="button primary"
                    disabled={busy || !row.payment.userId}
                    onClick={() => {
                      setReview(row);
                      setDecision("approved");
                    }}
                  >
                    <Check size={14} />
                    Verify & approve
                  </button>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => {
                      setReview(row);
                      setDecision("rejected");
                    }}
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
        <section className="card">
          <div className="inline-actions">
            <AlertTriangle size={21} />
            <h2>Community reviews</h2>
          </div>
          {loading ? (
            <p className="small muted" style={{ marginTop: 20 }}>
              Loading community reviews…
            </p>
          ) : !reports.length ? (
            <p className="small muted" style={{ marginTop: 20 }}>
              No open reports or support requests.
            </p>
          ) : (
            reports.map((r) => (
              <article className="admin-item" key={r.id}>
                <div className="inline-actions">
                  <h3>{r.subjectName}</h3>
                  <span className="status">{r.status}</span>
                </div>
                <p>
                  <strong>{r.reason}</strong> · {displayDate(r.createdAt)}
                </p>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {r.details || "No additional details supplied."}
                </p>
                <div className="admin-actions">
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => void reportDecision(r.id, "dismiss")}
                  >
                    Resolve review
                  </button>
                  {r.subjectId && (
                    <>
                      <button
                        className="button danger"
                        disabled={busy}
                        onClick={() => void reportDecision(r.id, "suspend")}
                      >
                        Suspend profile
                      </button>
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => void reportDecision(r.id, "restore")}
                      >
                        Restore profile
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
      {review && (
        <Modal
          title={
            decision === "approved"
              ? "Verify this MoMo payment."
              : "Reject this payment?"
          }
          close={closeReview}
        >
          <form onSubmit={paymentDecision}>
            <div className="modal-body">
              <p>
                {decision === "approved"
                  ? `Confirm that GHS ${review.payment.amount} was actually received in the designated wallet, with transaction ID ${review.payment.transactionId}. This activates or extends messaging access by ${review.payment.days} days.`
                  : "Add a clear reason so the member knows what to correct. Rejected submissions do not activate membership."}
              </p>
              <label>
                Note to member{" "}
                {decision === "rejected" ? "(required)" : "(optional)"}
                <textarea
                  className="textarea"
                  name="note"
                  maxLength={500}
                  minLength={decision === "rejected" ? 5 : 0}
                  required={decision === "rejected"}
                  placeholder={
                    decision === "rejected"
                      ? "Explain why the payment could not be verified."
                      : "Payment verified against the receiving wallet."
                  }
                />
              </label>
              {decision === "approved" && (
                <label className="check-label" style={{ marginTop: 20 }}>
                  <input type="checkbox" required />
                  <span>
                    I independently verified the amount, sender, and transaction
                    ID in the receiving wallet.
                  </span>
                </label>
              )}
              <Notice text={error} error />
            </div>
            <div className="modal-footer">
              <button className="button" type="button" onClick={closeReview}>
                Cancel
              </button>
              <button
                className={`button ${decision === "approved" ? "primary" : "danger"}`}
                disabled={busy}
              >
                {busy
                  ? "Saving…"
                  : decision === "approved"
                    ? "Approve & activate"
                    : "Reject payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
