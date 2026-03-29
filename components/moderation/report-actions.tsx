export function ReportActions({ reportId, reportedUserId }: { reportId: string; reportedUserId: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <form action="/admin/actions" method="post">
        <input type="hidden" name="report_id" value={reportId} />
        <input type="hidden" name="action" value="reviewing" />
        <button className="btn">Mark reviewing</button>
      </form>
      <form action="/admin/actions" method="post">
        <input type="hidden" name="report_id" value={reportId} />
        <input type="hidden" name="action" value="resolved" />
        <button className="btn btn-primary">Resolve</button>
      </form>
      <form action="/admin/actions" method="post">
        <input type="hidden" name="report_id" value={reportId} />
        <input type="hidden" name="action" value="dismissed" />
        <button className="btn">Dismiss</button>
      </form>
      <form action="/admin/actions" method="post">
        <input type="hidden" name="reported_user_id" value={reportedUserId} />
        <input type="hidden" name="action" value="suspend_user" />
        <button className="btn">Suspend user</button>
      </form>
    </div>
  );
}
