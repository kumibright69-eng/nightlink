import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const blocked_user_id = String(formData.get("blocked_user_id") || "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!blocked_user_id) return NextResponse.redirect(new URL("/discover", request.url));

  await supabase.from("blocks").upsert({
    blocker_id: user.id,
    blocked_user_id
  });

  return NextResponse.redirect(new URL("/discover?blocked=1", request.url));
}
