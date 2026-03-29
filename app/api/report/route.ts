import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const reported_user_id = String(formData.get("reported_user_id") || "");
  const reason = String(formData.get("reason") || "");
  const notes = String(formData.get("notes") || "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!reported_user_id || !reason) return NextResponse.redirect(new URL("/discover", request.url));

  await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id,
    reason,
    notes: notes || null
  });

  return NextResponse.redirect(new URL("/discover?reported=1", request.url));
}
