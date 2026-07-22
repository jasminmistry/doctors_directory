"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 };

const PLANS: {
  id: "free" | "pay_per_lead" | "subscription";
  label: string;
  price: string;
  cadence: string;
  color: string;
  features: string[];
}[] = [
  {
    id: "free",
    label: "Free",
    price: "£0",
    cadence: "No charge",
    color: "text-gray-600 bg-gray-100",
    features: [
      "Portal access and profile management",
      "Prospects inbox (leads visible, details locked)",
      "Consultation chat — local only, no Core sync",
    ],
  },
  {
    id: "pay_per_lead",
    label: "Pay Per Lead",
    price: "£15",
    cadence: "per lead unlock",
    color: "text-violet-700 bg-violet-100",
    features: [
      "Everything in Free",
      "Unlock individual lead details for £15 each",
      "Calendar and appointment booking",
      "Full Consentz Core chat sync",
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    price: "£99",
    cadence: "per month",
    color: "text-cyan-700 bg-cyan-100",
    features: [
      "Everything in Pay Per Lead",
      "All lead details visible — no per-lead charge",
      "Automatic booking sync from Core",
      "Priority listing placement",
    ],
  },
];

export default function UpgradePage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/directory/api/portal/clinic")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentPlan(data?.subscription?.plan ?? "free"))
      .catch(() => setCurrentPlan("free"))
      .finally(() => setLoaded(true));
  }, []);

  async function handleUpgrade(plan: string) {
    setError(null);
    setPendingPlan(plan);
    try {
      const res = await fetch("/directory/api/portal/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to start checkout. Please try again.");
        setPendingPlan(null);
        return;
      }
      window.location.href = data.redirect;
    } catch {
      setError("Failed to start checkout. Please try again.");
      setPendingPlan(null);
    }
  }

  const currentRank = PLAN_ORDER[currentPlan ?? "free"] ?? 0;

  return (
    <div className="w-full mx-auto space-y-6">
      <div>
        <h1 className="text-xs font-medium text-black uppercase tracking-[0.2em] mb-1">
          Upgrade your plan
        </h1>
        <p className="text-sm text-gray-600">
          Unlock full lead details, calendar bookings, and Core sync by upgrading your plan.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const rank = PLAN_ORDER[plan.id];
          const isCurrent = loaded && currentPlan === plan.id;
          const isDowngrade = loaded && rank < currentRank;
          const isBusy = pendingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl border bg-white p-6 flex flex-col",
                isCurrent ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200"
              )}
            >
              <span className={cn("self-start rounded-full px-3 py-1 text-xs font-semibold mb-4", plan.color)}>
                {plan.label}
              </span>
              <div className="mb-4">
                <span className="text-2xl font-semibold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500"> {plan.cadence}</span>
              </div>
              <div className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{f}</p>
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <Button disabled variant="outline" className="w-full">
                  Current plan
                </Button>
              ) : isDowngrade || plan.id === "free" ? (
                <Button disabled variant="outline" className="w-full">
                  Not available
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={!loaded || pendingPlan !== null}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting to checkout…
                    </>
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Downgrades and cancellations can be managed from your{" "}
        <a href="/directory/portal/clinic" className="underline hover:no-underline">
          clinic settings
        </a>
        .
      </p>
    </div>
  );
}
