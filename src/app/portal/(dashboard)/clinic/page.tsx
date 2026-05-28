"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ClinicForm } from "@/components/admin/forms/ClinicForm";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pay_per_lead: "Pay-Per-Lead",
  subscription: "Subscription",
};

interface SubscriptionInfo {
  plan: string | null;
  stripeSubscriptionId: string | null;
  approvedAt: string | null;
}

export default function PortalClinicPage() {
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const [entitySlug, setEntitySlug] = useState<string | null>(null);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );

  useEffect(() => {
    fetch("/directory/api/portal/clinic")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setIdVerified(data.idVerified ?? false);
        setEntitySlug(data.slug ?? null);
        setSubscription(data.subscription ?? null);
      })
      .catch(() => {})
      .finally(() => setVerificationChecked(true));
  }, []);

  return (
    <div className="w-full mx-auto px-0 space-y-6">
      {/* Subscription */}

      {/* ID Verification */}
      {idVerified === false && entitySlug && (
        <div className="rounded-2xl border border-[#e4dccf] bg-[#f2eee5] p-6">
          <h2 className="text-xs font-bold text-[#000000] uppercase tracking-[0.2em] mb-3">
            Identity Verification
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Verify your identity to display an &ldquo;ID Verified&rdquo; badge
            on your clinic profile, building trust with potential patients.
          </p>
          <a
            href={`/directory/verify/clinic/${entitySlug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Get ID Verified
          </a>
        </div>
      )}

      {/* Profile editor — only mount once verification status is known */}
      {verificationChecked && (
        <ClinicForm
          fetchUrl="/directory/api/portal/clinic"
          saveUrl="/directory/api/portal/clinic"
          mode="portal"
          disabled={idVerified !== true}
          onSaved={() => {}}
        />
      )}
      {subscription && (
        <div className="relative overflow-hidden rounded-2xl border border-[#e4dccf] bg-[#f2eee5] p-6">
          <div className="relative flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xs font-bold text-[#000000] uppercase tracking-[0.2em] mb-2">
                Subscription
              </h2>
              <p className="text-sm text-[#000000]">
                Active premium subscription details
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ddd3c3] bg-white text-[#6b5b4d] shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 20h20" />
                <path d="m5 20 1-10 6 5 6-5 1 10" />
                <path d="M12 4v4" />
              </svg>
            </div>
          </div>

          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#e2d8c8] bg-white p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Plan</p>
              <p className="text-sm font-semibold text-gray-900">
                {PLAN_LABELS[subscription.plan ?? ""] ??
                  subscription.plan ??
                  "—"}
              </p>
            </div>

            {subscription.approvedAt && (
              <div className="rounded-xl border border-[#e2d8c8] bg-white p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Active since
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(subscription.approvedAt), "d MMM yyyy")}
                </p>
              </div>
            )}

            {subscription.stripeSubscriptionId && (
              <div className="rounded-xl border border-[#e2d8c8] bg-white p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Billing
                </p>
                <p className="text-sm font-semibold text-gray-900">Monthly</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
