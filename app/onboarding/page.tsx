import { redirect } from "next/navigation";
import { CITIES, COUNTRY_BY_CITY } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  async function saveProfile(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const raw = {
      username: String(formData.get("username") || ""),
      full_name: String(formData.get("full_name") || ""),
      age: Number(formData.get("age") || 18),
      city: String(formData.get("city") || "Lagos"),
      bio: String(formData.get("bio") || ""),
      is_private: formData.get("is_private") === "on"
    };

    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) {
      redirect("/onboarding?error=invalid_profile");
    }

    const values = parsed.data;
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: values.username,
      full_name: values.full_name || null,
      age: values.age,
      city: values.city,
      country: COUNTRY_BY_CITY[values.city],
      bio: values.bio || null,
      is_private: values.is_private ?? true
    });

    if (error) redirect("/onboarding?error=save_failed");
    redirect("/settings");
  }

  return (
    <main className="container-page">
      <form action={saveProfile} className="mx-auto max-w-2xl space-y-4 rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Complete your profile</h1>
        <p className="text-sm text-slate-600">You can upload your photo on the next screen.</p>
        <input name="username" className="input" placeholder="Username" required />
        <input name="full_name" className="input" placeholder="Full name" />
        <input name="age" type="number" min={18} className="input" placeholder="Age" required />
        <select name="city" className="select" defaultValue="Lagos">
          {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        <textarea name="bio" className="textarea min-h-32" placeholder="Tell people a little about yourself" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input name="is_private" type="checkbox" defaultChecked /> Enable private mode
        </label>
        <button className="btn btn-primary">Save and continue</button>
      </form>
    </main>
  );
}
