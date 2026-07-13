import { Clinic } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClinicLabelsProps = {
  clinic: Clinic
  size?: "sm" | "md"
}

export default function ClinicLabels({ clinic, size = "md" }: Readonly<ClinicLabelsProps>) {
  const labels = clinic.isCQC?.[0] || clinic.isHIW?.[0] || clinic.isHIS?.[0] || clinic.isJCCP?.[0] || clinic.isRQIA?.[0] || clinic.isSaveFace
  const iconClass = size === "sm"
    ? "h-5 w-5 rounded-full object-cover ring-1 ring-white shadow-sm"
    : "h-8 w-8 md:h-9 md:w-9 rounded-full object-cover"

  if (!labels) return null

  return (
    <div className={cn("flex items-center", size === "sm" ? "gap-0.5" : "gap-2")}>
      {clinic.isCQC?.[0] && (
        <img src="/directory/qcc_logo.jpg" alt="CQC" title="CQC — Care Quality Commission" className={iconClass} />
      )}
      {clinic.isHIW?.[0] && (
        <img src="/directory/HIW_logo.jpg" alt="HIW" title="HIW — Healthcare Inspectorate Wales" className={iconClass} />
      )}
      {clinic.isHIS?.[0] && (
        <img src="/directory/HIS_logo.jpg" alt="HIS" title="HIS — Healthcare Improvement Scotland" className={iconClass} />
      )}
      {clinic.isJCCP?.[0] && (
        <img src="/directory/jccp.jpg" alt="JCCP" title="JCCP — Joint Council for Cosmetic Practitioners" className={iconClass} />
      )}
      {clinic.isRQIA?.[0] && (
        <img src="/directory/rqia_logo.jpg" alt="RQIA" title="RQIA — Regulation and Quality Improvement Authority" className={iconClass} />
      )}
      {clinic.isSaveFace && (
        <img src="/directory/save-face-partner.jpg" alt="Save Face" title="Save Face — Save Face Accredited Practitioner" className={iconClass} />
      )}
    </div>
  );
}
