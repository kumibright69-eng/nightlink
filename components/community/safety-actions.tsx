"use client";
import { useState } from "react";
import { api } from "@/lib/community/client";
import { REPORT_REASONS } from "@/lib/constants";
import { Modal } from "./modal";
import { Notice } from "./common";
export function SafetyDialog({
  target,
  close,
  done,
}: {
  target: { id: string; name: string };
  close: () => void;
  done: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function block() {
    setBusy(true);
    setError("");
    try {
      await api("blocks", {
        method: "POST",
        body: JSON.stringify({ targetId: target.id }),
      });
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function report(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      await api("reports", {
        method: "POST",
        body: JSON.stringify({
          targetId: target.id,
          reason: data.get("reason"),
          details: data.get("details"),
        }),
      });
      done();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Your comfort comes first." close={close}>
      <div className="modal-body">
        <p className="report-description">
          Blocking {target.name} hides your profiles from each other and ends
          your conversation. Reports also block this member and go to the
          community team. Your report is not shared with them.
        </p>
        <button className="button" onClick={() => void block()} disabled={busy}>
          Block {target.name}
        </button>
        <h3 className="section-label">Or report a safety concern</h3>
        <form className="form-stack" onSubmit={report}>
          <label>
            What happened?
            <select name="reason" className="select" required>
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            A little more detail <span className="muted">(optional)</span>
            <textarea
              className="textarea"
              name="details"
              maxLength={2000}
              placeholder="Help the team understand what happened."
            />
          </label>
          <Notice text={error} error />
          <button className="button primary" disabled={busy}>
            {busy ? "Sending…" : "Submit report & block"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
