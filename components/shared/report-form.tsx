"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/constants";

export function ReportForm({ reportedUserId }: { reportedUserId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" className="btn" onClick={() => setOpen((v) => !v)}>
        {open ? "Cancel report" : "Report"}
      </button>

      {open ? (
        <form action="/api/report" method="post" className="mt-3 space-y-3 rounded-xl border p-3">
          <input type="hidden" name="reported_user_id" value={reportedUserId} />
          <select name="reason" className="select" defaultValue={REPORT_REASONS[0]}>
            {REPORT_REASONS.map((reason) => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
          <textarea name="notes" className="textarea min-h-24" placeholder="Extra context for moderators" />
          <button className="btn btn-primary">Submit report</button>
        </form>
      ) : null}
    </div>
  );
}
