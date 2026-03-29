import { NextResponse } from "next/server";
import { paypalFetch } from "@/lib/paypal/client";

export async function POST() {
  try {
    const currency = process.env.PAYPAL_PLAN_CURRENCY || "GHS";
    const amount = process.env.PAYPAL_PLAN_AMOUNT || "150.00";
    const intervalUnit = process.env.PAYPAL_PLAN_INTERVAL_UNIT || "MONTH";
    const intervalCount = Number(process.env.PAYPAL_PLAN_INTERVAL_COUNT || 3);
    const trialUnit = process.env.PAYPAL_TRIAL_INTERVAL_UNIT || "MONTH";
    const trialCount = Number(process.env.PAYPAL_TRIAL_INTERVAL_COUNT || 2);
    const trialAmount = process.env.PAYPAL_TRIAL_AMOUNT || "0.00";
    const merchantEmail = process.env.PAYPAL_EXPECTED_MERCHANT_EMAIL || "Rusty3994@gmail.com";

    const productRes = await paypalFetch("/v1/catalogs/products", {
      method: "POST",
      body: JSON.stringify({
        name: "NightLink Premium",
        description: `Merchant account expected: ${merchantEmail}`,
        type: "SERVICE",
        category: "SOFTWARE",
        home_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      }),
    });

    if (!productRes.ok) {
      return NextResponse.json({ error: await productRes.text() }, { status: 500 });
    }

    const product = await productRes.json();

    const planRes = await paypalFetch("/v1/billing/plans", {
      method: "POST",
      body: JSON.stringify({
        product_id: product.id,
        name: "NightLink Premium Quarterly",
        description: `2 months free, then ${currency} ${amount} every ${intervalCount} months.`,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: trialUnit, interval_count: trialCount },
            tenure_type: "TRIAL",
            sequence: 1,
            total_cycles: 1,
            pricing_scheme: { fixed_price: { value: trialAmount, currency_code: currency } },
          },
          {
            frequency: { interval_unit: intervalUnit, interval_count: intervalCount },
            tenure_type: "REGULAR",
            sequence: 2,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: amount, currency_code: currency } },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: "0", currency_code: currency },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
      }),
    });

    if (!planRes.ok) {
      return NextResponse.json({ error: await planRes.text() }, { status: 500 });
    }

    const plan = await planRes.json();
    return NextResponse.json({ plan_id: plan.id, product_id: product.id, merchant_email_reference: merchantEmail });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
