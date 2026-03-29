import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { PhotoUpload } from "@/components/profile/photo-upload";

export default async function SettingsPage() {
  const { supabase, user, profile } = await requireProfile();

  async function togglePrivacy(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUserForAction();
    await supabase.from("profiles").update({ is_private: formData.get("is_private") === "on" }).eq("id", user.id);
    redirect("/settings");
  }

  async function signOut() {
    "use server";
    const supabase = await (await import("@/lib/supabase/server")).createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  async function requireUserForAction() {
    const mod = await import("@/lib/auth");
    return mod.requireUser();
  }

  return (
    <main className="container-page max-w-2xl">
      <h1 className="mb-6 text-3xl font-semibold">Settings</h1>

      <div className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Profile photo</h2>
        <PhotoUpload userId={user.id} currentUrl={profile.avatar_url} />
      </div>

      <form action={togglePrivacy} className="mt-4 space-y-4 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <label className="flex items-center gap-3">
          <input name="is_private" type="checkbox" defaultChecked={Boolean(profile?.is_private)} />
          Private mode
        </label>
        <button className="btn btn-primary">Save settings</button>
      </form>

      <form action={signOut} className="mt-4">
        <button className="btn">Log out</button>
      </form>
    </main>
  );
}
