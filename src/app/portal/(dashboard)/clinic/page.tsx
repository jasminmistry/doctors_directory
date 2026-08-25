"use client";

import { useEffect, useState, useCallback } from "react";
import { ClinicForm } from "@/components/admin/forms/ClinicForm";
import { CoreIntegrationPanel } from "@/components/portal/CoreIntegrationPanel";
import { DangerZonePanel } from "@/components/portal/danger-zone-panel";
import { cn } from "@/lib/utils";
import { commissionPct, clinicNetRate, PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from "@/lib/pricing";
import { IconAlertCircle, IconCircleCheck, IconClockHour4, IconCreditCard, IconCurrencyPound, IconInfoCircle, IconRotate, IconXboxX } from "@tabler/icons-react";
import { CommercialPanel, type SubscriptionInfo } from "@/components/portal/CommercialPanel";

export const dynamic = "force-dynamic";

export default function PortalClinicPage() {
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const [entitySlug, setEntitySlug] = useState<string | null>(null);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [hasCoreLink, setHasCoreLink] = useState(false);
  const [coreUnlinkRequestedAt, setCoreUnlinkRequestedAt] = useState<string | null>(null);
  const [entityName, setEntityName] = useState<string | null>(null);

  const fetchClinicData = useCallback(() => {
    setVerificationChecked(false);
    fetch("/directory/api/portal/clinic/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setIdVerified(data.idVerified ?? false);
        setEntitySlug(data.slug ?? null);
        setEntityName(data.name ?? data.slug ?? null);
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
      {subscription && (
        <CommercialPanel subscription={subscription} entityType="clinic" onChanged={fetchClinicData} />
      )}

      {/* Core integration */}
      <CoreIntegrationPanel
        hasCoreLink={hasCoreLink}
        unlinkRequestedAt={coreUnlinkRequestedAt}
        onRefresh={fetchClinicData}
      />

      {/* Danger zone */}
      {entityName && <DangerZonePanel entityType="clinic" entityName={entityName} plan={subscription?.plan} />}
    </div>
  );
}
