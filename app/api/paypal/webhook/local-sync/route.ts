import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { paypalFetch } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  const { subscriptionId } = await req.json();
  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`, { method: "GET" });
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  const details = await res.json();
  const admin = createAdminClient();

  const nextBillingTime = details.billing_info?.next_billing_time || null;
  const lastPaymentTime = details.billing_info?.last_payment?.time || null;

  const { error } = await admin.from("subscriptions").upsert({
    user_id: user.id,
    provider: "paypal",
    paypal_subscription_id: details.id,
    plan_name: details.plan_overridden ? "NightLink Premium Quarterly (custom)" : "NightLink Premium Quarterly",
    merchant_email: process.env.PAYPAL_EXPECTED_MERCHANT_EMAIL || "Rusty3994@gmail.com",
    status: String(details.status || "APPROVAL_PENDING").toLowerCase(),
    currency_code: process.env.PAYPAL_PLAN_CURRENCY || "GHS",
    amount: Number(process.env.PAYPAL_PLAN_AMOUNT || "150.00"),
    interval_unit: process.env.PAYPAL_PLAN_INTERVAL_UNIT || "MONTH",
    interval_count: Number(process.env.PAYPAL_PLAN_INTERVAL_COUNT || 3),
    trial_interval_unit: process.env.PAYPAL_TRIAL_INTERVAL_UNIT || "MONTH",
    trial_interval_count: Number(process.env.PAYPAL_TRIAL_INTERVAL_COUNT || 2),
    trial_started_at: details.start_time || new Date().toISOString(),
    trial_ends_at: nextBillingTime,
    current_period_start: lastPaymentTime || details.start_time || new Date().toISOString(),
    current_period_end: nextBillingTime,
    updated_at: new Date().toISOString(),
  }, { onConflict: "paypal_subscription_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subscriptionId: details.id, status: details.status });
}
