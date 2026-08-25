"use client";

import { useState } from "react";
import { format, addMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { commissionPct, clinicNetRate, PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from "@/lib/pricing";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClockHour4,
  IconCreditCard,
  IconCurrencyPound,
  IconInfoCircle,
  IconRotate,
  IconXboxX,
} from "@tabler/icons-react";

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

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 };

const UPGRADE_TARGETS: { key: "pay_per_lead" | "subscription"; label: string; description: string }[] = [
  {
    key: "pay_per_lead",
    label: `Pay Per Lead — £${PPL_LEAD_PRICE}/lead`,
    description: "Calendar, full Core chat sync — pay only when you unlock a lead",
  },
  {
    key: "subscription",
    label: `Subscription — £${SUBSCRIPTION_MONTHLY_PRICE}/mo`,
    description: "Everything unlocked, no per-lead charge",
  },
];

export interface SubscriptionInfo {
  plan: string | null;
  stripeSubscriptionId: string | null;
  approvedAt: string | null;
  stripeStatus: string | null;
  cancelAt: string | null;
  downgradeToPlan?: string | null;
}

interface Props {
  subscription: SubscriptionInfo;
  entityType: "clinic" | "practitioner";
  onChanged: () => void;
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

function CancelDialog({
  open,
  currentPlan,
  onClose,
  onDone,
}: {
  open: boolean;
  currentPlan: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const currentRank = PLAN_ORDER[currentPlan] ?? 0;
  const targets = (["pay_per_lead", "free"] as const).filter((t) => PLAN_ORDER[t] < currentRank);
  const [target, setTarget] = useState<string>(targets[0] ?? "free");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/directory/api/portal/subscription/cancel/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      onDone();
      onClose();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !submitting) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel or downgrade your plan</DialogTitle>
          <DialogDescription>
            {currentPlan === "subscription"
              ? "Choose the plan you'd like to move to. You'll keep full access to your current plan until the end of your billing period."
              : "Pay-Per-Lead has no recurring charge, so this takes effect immediately."}
          </DialogDescription>
        </DialogHeader>

        {targets.length > 1 && (
          <div className="space-y-2">
            {targets.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTarget(t)}
                className={cn(
                  "w-full text-left rounded-lg border-2 p-3 transition-colors",
                  target === t ? "border-foreground bg-muted/50" : "border-border hover:border-muted-foreground/50",
                )}
              >
                <p className="text-sm font-semibold">{PLAN_META[t].label}</p>
                <p className="text-xs text-muted-foreground">{PLAN_META[t].price}</p>
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Never mind
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Processing…" : `Confirm — move to ${PLAN_META[target]?.label ?? target}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CommercialPanel({ subscription, entityType, onChanged }: Readonly<Props>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const meta = PLAN_META[subscription.plan ?? "free"] ?? PLAN_META.free;
  const renewalDate = subscription.approvedAt
    ? addMonths(new Date(subscription.approvedAt), 1)
    : null;
  const isPastDue   = subscription.stripeStatus === 'past_due' || subscription.stripeStatus === 'unpaid';
  const isCancelling = subscription.stripeStatus === 'cancel_at_period_end';
  const isCancelled  = subscription.stripeStatus === 'canceled' || subscription.plan === 'free';

  async function handleResume() {
    setResuming(true);
    setResumeError(null);
    try {
      const res = await fetch("/directory/api/portal/subscription/resume/", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResumeError(typeof data.error === "string" ? data.error : "Failed to resume plan.");
        return;
      }
      onChanged();
    } catch {
      setResumeError("Network error. Please check your connection and try again.");
    } finally {
      setResuming(false);
    }
  }

  async function handleUpgrade(plan: string) {
    setUpgrading(plan);
    setUpgradeError(null);
    try {
      const res = await fetch("/directory/api/portal/upgrade/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpgradeError(typeof data.error === "string" ? data.error : "Upgrade failed. Please try again.");
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.upgraded) {
        onChanged();
      }
    } catch {
      setUpgradeError("Network error. Please check your connection and try again.");
    } finally {
      setUpgrading(null);
    }
  }

  const currentRank = PLAN_ORDER[subscription.plan ?? "free"] ?? 0;
  const upgradeOptions = UPGRADE_TARGETS.filter((o) => PLAN_ORDER[o.key] > currentRank);

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
          <IconCreditCard className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
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
          <IconAlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-amber-800">
            <p className="font-semibold">Plan changes on {format(new Date(subscription.cancelAt), "d MMMM yyyy")}</p>
            <p className="mt-0.5 text-xs">
              You keep full access to your current plan until the end of your current billing period.
              {subscription.downgradeToPlan && (
                <> You'll then move to the <strong>{PLAN_META[subscription.downgradeToPlan]?.label ?? subscription.downgradeToPlan}</strong> plan.</>
              )}
            </p>
            {resumeError && <p className="mt-1 text-xs text-red-700">{resumeError}</p>}
            <Button size="sm" variant="outline" className="mt-2" onClick={handleResume} disabled={resuming}>
              {resuming ? "Resuming…" : "Resume subscription"}
            </Button>
          </div>
        </div>
      )}

      {isCancelled && subscription.stripeStatus === 'canceled' && (
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <IconXboxX className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Subscription ended</p>
            <p className="mt-0.5 text-xs">
              Your subscription has been cancelled and your account is now on the Free plan.{" "}
              <a href={`/directory/portal/${entityType === "clinic" ? "upgrade" : "practitioner"}`} className="font-medium underline hover:no-underline">
                Resubscribe →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Upgrade options — always shown alongside downgrade so users can move either direction */}
      {upgradeOptions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Upgrade plan</p>
          {upgradeError && <p className="text-sm text-destructive mb-2">{upgradeError}</p>}
          <div className="flex flex-col sm:flex-row gap-2">
            {upgradeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleUpgrade(opt.key)}
                disabled={upgrading === opt.key}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {upgrading === opt.key ? "Redirecting…" : opt.label}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan details */}
      <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 p-4">
        <InfoRow icon={IconCurrencyPound} label="Price" value={`${meta.price} — ${meta.cadence}`} />
        {subscription.approvedAt && (
          <InfoRow
            icon={IconClockHour4}
            label="Active since"
            value={format(new Date(subscription.approvedAt), "d MMMM yyyy")}
          />
        )}
        {subscription.stripeSubscriptionId && !isCancelling && !isCancelled && renewalDate && (
          <InfoRow
            icon={IconRotate}
            label="Next renewal"
            value={format(renewalDate, "d MMMM yyyy")}
          />
        )}
        {isCancelling && subscription.cancelAt && (
          <InfoRow
            icon={IconXboxX}
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
            <IconCircleCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
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
          <IconAlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
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
          <IconInfoCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Upgrade to Pay Per Lead or Subscription to unlock patient contact details, calendar bookings,
            and Core sync.
          </p>
        </div>
      )}

      {/* Cancel / downgrade */}
      {subscription.plan && subscription.plan !== "free" && !isCancelling && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-gray-500">Need to scale back? You can cancel or downgrade at any time.</p>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            Cancel / downgrade plan
          </Button>
        </div>
      )}

      <CancelDialog
        open={dialogOpen}
        currentPlan={subscription.plan ?? "free"}
        onClose={() => setDialogOpen(false)}
        onDone={onChanged}
      />
    </div>
  );
}
