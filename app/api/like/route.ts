import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const receiver_id = String(formData.get("receiver_id") || "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!receiver_id) return NextResponse.redirect(new URL("/discover", request.url));

  await supabase.from("likes").upsert({
    sender_id: user.id,
    receiver_id,
    created_at: new Date().toISOString()
  });

  const { data: reverseLike } = await supabase
    .from("likes")
    .select("id")
    .eq("sender_id", receiver_id)
    .eq("receiver_id", user.id)
    .maybeSingle();

  if (reverseLike) {
    const [userOne, userTwo] = [user.id, receiver_id].sort();
    await supabase.from("matches").upsert({ user_one: userOne, user_two: userTwo });
  }

  return NextResponse.redirect(new URL("/discover", request.url));
}
