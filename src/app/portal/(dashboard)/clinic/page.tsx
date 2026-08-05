"use client";

import { useEffect, useState, useCallback } from "react";
import { format, addMonths } from "date-fns";
import { CheckCircle2, Info, PoundSterling, Clock, RotateCcw, AlertCircle, XCircle, CreditCard } from "lucide-react";
import { ClinicForm } from "@/components/admin/forms/ClinicForm";
import { CoreIntegrationPanel } from "@/components/portal/CoreIntegrationPanel";
import { cn } from "@/lib/utils";
import { commissionPct, clinicNetRate, PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const PLAN_META: Record<
  string,
  { label: string; price: string; cadence: string; color: string; features: string[] }
> = {
  free: {
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
  pay_per_lead: {
    label: "Pay Per Lead",
    price: `£${PPL_LEAD_PRICE} / lead`,
    cadence: "Pay per unlock",
    color: "text-violet-700 bg-violet-100",
    features: [
      "Everything in Free",
      `Unlock individual lead details for £${PPL_LEAD_PRICE} each`,
      "Calendar and appointment booking",
      "Full Consentz Core chat sync",
    ],
  },
  subscription: {
    label: "Subscription",
    price: `£${SUBSCRIPTION_MONTHLY_PRICE} / month`,
    cadence: "Monthly, auto-renews",
    color: "text-cyan-700 bg-cyan-100",
    features: [
      "Everything in Pay Per Lead",
      "All lead details visible — no per-lead charge",
      "Automatic booking sync from Core",
      "Priority listing placement",
    ],
  },
};

interface SubscriptionInfo {
  plan: string | null;
  stripeSubscriptionId: string | null;
  approvedAt: string | null;
  stripeStatus: string | null;
  cancelAt: string | null;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-3.5 w-3.5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function CommercialPanel({ subscription }: { subscription: SubscriptionInfo }) {
  const meta = PLAN_META[subscription.plan ?? "free"] ?? PLAN_META.free;
  const renewalDate = subscription.approvedAt
    ? addMonths(new Date(subscription.approvedAt), 1)
    : null;
  const isPastDue   = subscription.stripeStatus === 'past_due' || subscription.stripeStatus === 'unpaid';
  const isCancelling = subscription.stripeStatus === 'cancel_at_period_end';
  const isCancelled  = subscription.stripeStatus === 'canceled' || subscription.plan === 'free';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs font-medium text-black uppercase tracking-[0.2em] mb-1">
            Plan &amp; Commercial
          </h2>
          <p className="text-sm text-gray-600">Your plan, fees, payouts, and cancellation rules.</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", meta.color)}>
          {meta.label}
        </span>
      </div>

      {/* Subscription status banners */}
      {isPastDue && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <CreditCard className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">Payment failed — subscription at risk</p>
            <p className="mt-0.5 text-xs">
              Your last renewal payment was declined. Stripe will retry automatically. Please update
              your payment method to avoid losing subscription access.
            </p>
          </div>
        </div>
      )}

      {isCancelling && subscription.cancelAt && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Subscription cancels on {format(new Date(subscription.cancelAt), "d MMMM yyyy")}</p>
            <p className="mt-0.5 text-xs">
              You cancelled your subscription in Stripe. You keep full access until the end of your
              current billing period. After that, your account will revert to the Free plan.
            </p>
          </div>
        </div>
      )}

      {isCancelled && subscription.stripeStatus === 'canceled' && (
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <XCircle className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Subscription ended</p>
            <p className="mt-0.5 text-xs">
              Your subscription has been cancelled and your account is now on the Free plan.{" "}
              <a href="/directory/portal/upgrade" className="font-medium underline hover:no-underline">
                Resubscribe →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Plan details */}
      <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 p-4">
        <InfoRow icon={PoundSterling} label="Price" value={`${meta.price} — ${meta.cadence}`} />
        {subscription.approvedAt && (
          <InfoRow
            icon={Clock}
            label="Active since"
            value={format(new Date(subscription.approvedAt), "d MMMM yyyy")}
          />
        )}
        {subscription.stripeSubscriptionId && !isCancelling && !isCancelled && renewalDate && (
          <InfoRow
            icon={RotateCcw}
            label="Next renewal"
            value={format(renewalDate, "d MMMM yyyy")}
          />
        )}
        {isCancelling && subscription.cancelAt && (
          <InfoRow
            icon={XCircle}
            label="Access until"
            value={format(new Date(subscription.cancelAt), "d MMMM yyyy")}
          />
        )}
      </div>

      {/* Features */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Included features</p>
        {meta.features.map((f) => (
          <div key={f} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">{f}</p>
          </div>
        ))}
      </div>

      {/* Fees */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Platform fees &amp; payouts</p>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-medium text-gray-900">Platform fee: </span>
            {(subscription.plan === 'subscription' || subscription.plan === 'pay_per_lead')
              ? `Consentz retains ${commissionPct(subscription.plan)}% of each teleconsult fee (inclusive of Stripe processing). You keep ${Math.round(clinicNetRate(subscription.plan) * 100)}% of what patients pay.`
              : 'Teleconsult payments are not available on the Free plan.'}
          </p>
          <p>
            <span className="font-medium text-gray-900">Payouts: </span>
            Stripe settles funds to your connected bank account on a rolling 7-day basis. Your first
            payout may take up to 14 days. You can view your payout schedule in the Stripe dashboard.
          </p>
        </div>
      </div>

      {/* Refunds / cancellations */}
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">No-refund policy</p>
        </div>
        <div className="space-y-2 text-sm text-amber-900">
          <p>
            All teleconsult fees collected through the directory are non-refundable. This applies to
            patient cancellations, no-shows, and clinic-side cancellations.
          </p>
          <p>
            <span className="font-medium">Discretionary refunds: </span>
            If you choose to refund a patient as a goodwill gesture, you may issue a manual refund
            directly from the Stripe dashboard. Consentz does not facilitate or process refunds on
            your behalf.
          </p>
        </div>
      </div>

      {subscription.plan === "free" && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Upgrade to Pay Per Lead or Subscription to unlock patient contact details, calendar bookings,
            and Core sync.{" "}
            <a href="/directory/portal/upgrade" className="font-semibold underline hover:no-underline">
              View upgrade options →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default function PortalClinicPage() {
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const [entitySlug, setEntitySlug] = useState<string | null>(null);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [hasCoreLink, setHasCoreLink] = useState(false);
  const [coreUnlinkRequestedAt, setCoreUnlinkRequestedAt] = useState<string | null>(null);

  const fetchClinicData = useCallback(() => {
    setVerificationChecked(false);
    fetch("/directory/api/portal/clinic/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setIdVerified(data.idVerified ?? false);
        setEntitySlug(data.slug ?? null);
        setSubscription(data.subscription ?? null);
        setHasCoreLink(!!data.coreClinicId);
        setCoreUnlinkRequestedAt(data.coreUnlinkRequestedAt ?? null);
      })
      .catch(() => {})
      .finally(() => setVerificationChecked(true));
  }, []);

  useEffect(() => { fetchClinicData(); }, [fetchClinicData]);

  return (
    <div className="w-full mx-auto px-0 space-y-6">
      {/* ID Verification */}
      {idVerified === false && entitySlug && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-xs font-medium text-black uppercase tracking-[0.2em] mb-3">
            Identity Verification
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Verify your identity to display an &ldquo;ID Verified&rdquo; badge on your clinic profile,
            building trust with potential patients.
          </p>
          <a
            href={`/directory/verify/clinic/${entitySlug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Get ID Verified
          </a>
        </div>
      )}

      {/* Profile editor */}
      {verificationChecked && (
        <ClinicForm
          fetchUrl="/directory/api/portal/clinic/"
          saveUrl="/directory/api/portal/clinic/"
          mode="portal"
          disabled={idVerified !== true}
          onSaved={fetchClinicData}
        />
      )}

      {/* Commercial panel */}
      {subscription && <CommercialPanel subscription={subscription} />}

      {/* Core integration */}
      <CoreIntegrationPanel
        hasCoreLink={hasCoreLink}
        unlinkRequestedAt={coreUnlinkRequestedAt}
        onRefresh={fetchClinicData}
      />
    </div>
  );
}
