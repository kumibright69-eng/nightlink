import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paypalFetch } from "@/lib/paypal/client";

async function verifyWebhook(req: NextRequest, body: string) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("Missing PAYPAL_WEBHOOK_ID");

  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: req.headers.get("paypal-auth-algo"),
      cert_url: req.headers.get("paypal-cert-url"),
      transmission_id: req.headers.get("paypal-transmission-id"),
      transmission_sig: req.headers.get("paypal-transmission-sig"),
      transmission_time: req.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  if (!res.ok) return false;
  const json = await res.json();
  return json.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  try {
    const valid = await verifyWebhook(req, body);
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const admin = createAdminClient();
    const resource = event.resource || {};
    const subscriptionId = resource.id || resource.billing_agreement_id || resource.subscription_id || null;

    await admin.from("payment_events").upsert({
      provider: "paypal",
      paypal_event_id: event.id,
      event_type: event.event_type,
      resource_id: subscriptionId,
      payload: event,
    }, { onConflict: "paypal_event_id" });

    if (subscriptionId) {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") patch.status = "active";
      if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") patch.status = "cancelled";
      if (event.event_type === "BILLING.SUBSCRIPTION.SUSPENDED") patch.status = "suspended";
      if (event.event_type === "BILLING.SUBSCRIPTION.EXPIRED") patch.status = "expired";
      if (event.event_type === "PAYMENT.SALE.COMPLETED") {
        patch.status = "active";
        patch.current_period_start = resource.create_time || new Date().toISOString();
      }
      await admin.from("subscriptions").update(patch).eq("paypal_subscription_id", subscriptionId);
    }

    return NextResponse.json({ received: true, event_type: event.event_type });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook failed" }, { status: 500 });
  }
}
