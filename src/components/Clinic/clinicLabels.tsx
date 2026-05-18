import { Clinic } from "@/lib/types";

export default function ClinicLabels({ clinic }: Readonly<{ readonly clinic: Clinic }>) {
  const labels = clinic.isCQC?.[0] || clinic.isHIW?.[0] || clinic.isHIS?.[0] || clinic.isJCCP?.[0] || clinic.isRQIA?.[0] || clinic.isSaveFace
      
  return (
    <div className="flex justify-center align-items-center gap-2 flex-col">
      {/* {clinic.isDoctor && (
        <div className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-green-300 text-xs px-3 py-1">
          <span>Licensed Medical Practitioner</span>
        </div>
      )} */}
      {labels && (
        <div className="flex gap-3 items-center">
          {clinic.isCQC?.[0] && (
            <img src="/directory/qcc_logo.jpg" alt="CQC" title="CQC — Care Quality Commission" className="w-10 h-auto rounded-full" />
          )}
          {clinic.isHIW?.[0] && (
            <img src="/directory/HIW_logo.jpg" alt="HIW" title="HIW — Healthcare Inspectorate Wales" className="w-10 h-auto" />
          )}
          {clinic.isHIS?.[0] && (
            <img src="/directory/HIS_logo.jpg" alt="HIS" title="HIS — Healthcare Improvement Scotland" className="w-10 h-auto" />
          )}
          {clinic.isJCCP?.[0] && (
            <img src="/directory/jccp.jpg" alt="JCCP" title="JCCP — Joint Council for Cosmetic Practitioners" className="w-8 h-auto" />
          )}
          {clinic.isRQIA?.[0] && (
            <img src="/directory/rqia_logo.jpg" alt="RQIA" title="RQIA — Regulation and Quality Improvement Authority" className="w-10 h-auto" />
          )}
          {clinic.isSaveFace && (
            <img src="/directory/save-face-partner.jpg" alt="Save Face" title="Save Face — Save Face Accredited Practitioner" className="w-8 h-auto" />
          )}
        </div>
      )}
    </div>
  );
}
