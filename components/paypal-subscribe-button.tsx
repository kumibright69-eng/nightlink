"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PaypalSubscribeButton({ planId }: { planId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
      return;
    }

    const renderButtons = () => {
      if (!window.paypal || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          style: { layout: "vertical", shape: "rect", label: "subscribe" },
          createSubscription: (_data: unknown, actions: any) => {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: async (data: any) => {
            const res = await fetch("/api/paypal/webhook/local-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscriptionId: data.subscriptionID }),
            });
            if (!res.ok) {
              setError("Subscription was approved, but local sync failed.");
              return;
            }
            window.location.href = "/billing?success=1";
          },
          onError: (err: unknown) => {
            console.error(err);
            setError("PayPal subscription setup failed.");
          },
        })
        .render(containerRef.current);
    };

    const existing = document.querySelector('script[data-paypal-sdk="true"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.async = true;
      script.dataset.paypalSdk = "true";
      script.onload = renderButtons;
      script.onerror = () => setError("Failed to load PayPal SDK.");
      document.body.appendChild(script);
    } else {
      renderButtons();
    }
  }, [planId]);

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <div ref={containerRef} />
    </div>
  );
}
