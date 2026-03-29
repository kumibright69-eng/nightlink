import { PaypalSubscribeButton } from "@/components/paypal-subscribe-button";
import { requireProfile } from "@/lib/auth";

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: { success?: string };
}) {
  await requireProfile();

  const planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "REPLACE_WITH_PLAN_ID";
  const merchantEmail = process.env.PAYPAL_EXPECTED_MERCHANT_EMAIL || "Rusty3994@gmail.com";
  const usdAmount = process.env.NEXT_PUBLIC_PAYPAL_PRICE_USD || "13.99";
  const ghsReference = process.env.NEXT_PUBLIC_GHS_REFERENCE_AMOUNT || "150";
  const success = searchParams?.success === "1";

  return (
    <main className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-semibold">Billing</h1>
        <p className="mb-6 text-slate-600">
          Premium includes a 2-month free trial, then <strong>USD {usdAmount}</strong> every 3 months
          <span className="text-slate-500"> (about GHS {ghsReference})</span>.
        </p>

        {success ? (
          <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            Subscription activated. Your billing now shows both the PayPal charge currency and the Ghana cedi reference amount.
          </div>
        ) : null}

        <div className="space-y-4 rounded-2xl border p-6">
          <div>
            <h2 className="font-semibold">Premium plan</h2>
            <p className="text-sm text-slate-600">
              Start free for 2 months, then renew quarterly for <strong>USD {usdAmount}</strong>
              <span className="text-slate-500"> (about GHS {ghsReference})</span>.
            </p>
          </div>

          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">PayPal charge</div>
              <div className="font-semibold">USD {usdAmount} / 3 months</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Local reference</div>
              <div className="font-semibold">About GHS {ghsReference} / 3 months</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Merchant account reference: <strong>{merchantEmail}</strong>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Important: the payment only settles to that PayPal account if your live PayPal API credentials belong to that receiving merchant account.
          </div>
          <PaypalSubscribeButton planId={planId} />
        </div>
      </div>
    </main>
  );
}
