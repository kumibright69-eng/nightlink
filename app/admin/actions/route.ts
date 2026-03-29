import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") || "");
  const reportId = String(formData.get("report_id") || "");
  const verificationId = String(formData.get("verification_id") || "");
  const reportedUserId = String(formData.get("reported_user_id") || "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!actor || !["admin", "moderator"].includes(actor.role)) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  if (reportId && ["reviewing", "resolved", "dismissed"].includes(action)) {
    await supabase.from("reports").update({
      status: action,
      moderator_id: user.id
    }).eq("id", reportId);
  }

  if (verificationId && action === "approve_verification") {
    const { data: verification } = await supabase.from("verifications").select("user_id").eq("id", verificationId).maybeSingle();
    await supabase.from("verifications").update({ status: "approved" }).eq("id", verificationId);
    if (verification?.user_id) await supabase.from("profiles").update({ is_verified: true }).eq("id", verification.user_id);
  }

  if (verificationId && action === "reject_verification") {
    await supabase.from("verifications").update({ status: "rejected" }).eq("id", verificationId);
  }

  if (reportedUserId && action === "suspend_user") {
    await supabase.from("profiles").update({ is_active: false }).eq("id", reportedUserId);
  }

  if (reportedUserId && action === "restore_user") {
    await supabase.from("profiles").update({ is_active: true }).eq("id", reportedUserId);
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
