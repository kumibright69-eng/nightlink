import { requireAdmin } from "@/lib/auth";
import { ReportActions } from "@/components/moderation/report-actions";

export default async function AdminPage() {
  const { supabase, profile } = await requireAdmin();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, reason, status, created_at, reported_user_id, notes")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: verifications } = await supabase
    .from("verifications")
    .select("id, user_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: flaggedUsers } = await supabase
    .from("profiles")
    .select("id, username, is_active, is_verified, role")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">Signed in as {profile.username} ({profile.role})</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Moderation queue</h2>
          <div className="space-y-4">
            {reports?.map((report: any) => (
              <div key={report.id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{report.reason}</div>
                  <span className="badge">{report.status}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{report.notes || "No moderator notes yet."}</div>
                <ReportActions reportId={report.id} reportedUserId={report.reported_user_id} />
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Verification queue</h2>
          <div className="space-y-4">
            {verifications?.map((item: any) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                <div className="font-medium">User {item.user_id.slice(0, 8)}</div>
                <div className="mt-1 text-sm text-slate-500">{item.status}</div>
                <div className="mt-3 flex gap-2">
                  <form action="/admin/actions" method="post">
                    <input type="hidden" name="verification_id" value={item.id} />
                    <input type="hidden" name="action" value="approve_verification" />
                    <button className="btn btn-primary">Approve</button>
                  </form>
                  <form action="/admin/actions" method="post">
                    <input type="hidden" name="verification_id" value={item.id} />
                    <input type="hidden" name="action" value="reject_verification" />
                    <button className="btn">Reject</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">User moderation</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {flaggedUsers?.map((member: any) => (
            <div key={member.id} className="rounded-xl bg-slate-50 p-4">
              <div className="font-medium">{member.username}</div>
              <div className="mt-1 text-sm text-slate-500">Role: {member.role}</div>
              <div className="mt-1 text-sm text-slate-500">Status: {member.is_active ? "active" : "suspended"}</div>
              <div className="mt-3 flex gap-2">
                <form action="/admin/actions" method="post">
                  <input type="hidden" name="reported_user_id" value={member.id} />
                  <input type="hidden" name="action" value="restore_user" />
                  <button className="btn">Restore</button>
                </form>
                <form action="/admin/actions" method="post">
                  <input type="hidden" name="reported_user_id" value={member.id} />
                  <input type="hidden" name="action" value="suspend_user" />
                  <button className="btn">Suspend</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
