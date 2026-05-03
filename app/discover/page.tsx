import { requireProfile } from "@/lib/auth";
import { ReportForm } from "@/components/shared/report-form";
import { BlockButton } from "@/components/shared/block-button";

function MembersLoadError() {
  return (
    <main className="container-page">
      <div className="card p-5 text-slate-700">
        Members could not be loaded. Check the Supabase configuration and database permissions, then try again.
      </div>
    </main>
  );
}

export default async function DiscoverPage() {
  const { supabase, user, profile } = await requireProfile();

  const { data: blocks, error: blocksError } = await supabase
    .from("blocks")
    .select("blocked_user_id, blocker_id")
    .or(`blocker_id.eq.${user.id},blocked_user_id.eq.${user.id}`);

  if (blocksError) {
    return <MembersLoadError />;
  }

  const blockedIds = new Set<string>();
  (blocks || []).forEach((b: any) => {
    blockedIds.add(b.blocked_user_id);
    blockedIds.add(b.blocker_id);
  });

  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select("id, username, age, city, country, bio, is_verified, is_private, avatar_url")
    .neq("id", user.id)
    .eq("is_active", true)
    .eq("city", profile.city)
    .limit(24);

  if (membersError) {
    return <MembersLoadError />;
  }

  const visibleMembers = (members || []).filter((member: any) => !blockedIds.has(member.id));

  return (
    <main className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Discover</h1>
        <p className="mt-2 text-slate-600">People near you in {profile.city}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleMembers.map((member: any) => (
          <div key={member.id} className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full border bg-slate-100">
                {member.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatar_url} alt={member.username} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{member.username}, {member.age ?? "—"}</h2>
                <p className="text-sm text-slate-500">{member.city}, {member.country}</p>
              </div>
              {member.is_verified ? <span className="badge">Verified</span> : null}
            </div>

            <p className="text-sm text-slate-700">
              {member.is_private ? "Private profile. Match to learn more." : member.bio || "No bio yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <form action="/api/like" method="post">
                <input type="hidden" name="receiver_id" value={member.id} />
                <button className="btn btn-primary">Like</button>
              </form>
              <BlockButton userId={member.id} />
              <ReportForm reportedUserId={member.id} />
            </div>
          </div>
        ))}

        {!visibleMembers.length ? (
          <div className="card p-5 text-slate-600">No members found in your city yet.</div>
        ) : null}
      </div>
    </main>
  );
}
