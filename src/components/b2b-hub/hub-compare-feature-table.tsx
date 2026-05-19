type AltCell = "limited" | "dash" | "check";

const ROWS: { feature: string; alt: AltCell }[] = [
  { feature: "Aesthetic clinic focus", alt: "limited" },
  { feature: "Patient records", alt: "limited" },
  { feature: "Digital consent forms", alt: "dash" },
  { feature: "Treatment notes", alt: "limited" },
  { feature: "CQC / compliance tools", alt: "dash" },
  { feature: "Marketing template library", alt: "limited" },
  { feature: "Email campaigns", alt: "limited" },
  { feature: "Follow-up workflows", alt: "dash" },
  { feature: "Website builder", alt: "dash" },
  { feature: "Booking workflows", alt: "check" },
  { feature: "Team communication", alt: "limited" },
  { feature: "Built for independent clinic growth", alt: "dash" },
];

function AltValue({ value }: { value: AltCell }) {
  if (value === "dash") {
    return <span className="text-xs text-[#928b82] sm:text-[13px]">—</span>;
  }
  if (value === "check") {
    return (
      <span className="text-sm font-semibold text-[#2e2e2e] sm:text-base" aria-label="Included">
        ✓
      </span>
    );
  }
  return <span className="text-sm text-[#928b82] sm:text-xl">Limited</span>;
}

type Props = {
  id?: string;
  competitorLabel: string;
};

export function HubCompareFeatureTable({ id, competitorLabel }: Props) {
  const altHeading = competitorLabel.toUpperCase();

  return (
    <section id={id} className="mb-12 w-full min-w-0 scroll-mt-24 sm:mb-16">
      <div className="mb-8 text-center sm:mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[#2e2e2e] sm:text-3xl md:text-4xl md:leading-[44px]">
          Why Choose Consentz Over {competitorLabel}?
        </h2>
      </div>
      <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-[#e6e0d8] bg-white">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm sm:min-w-[640px] md:text-base">
          <thead>
            <tr className="bg-[#1a1a1a] text-white">
              <th className="px-3 py-3 text-sm font-semibold sm:px-6 sm:py-[18px] sm:text-base md:text-xl">
                Feature
              </th>
              <th className="w-[100px] bg-[#106057] px-2 py-3 text-center text-sm font-bold sm:w-[140px] sm:px-4 sm:py-[18px] sm:text-base md:w-[200px] md:text-xl">
                Consentz
              </th>
              <th className="w-[100px] px-2 py-3 text-center text-xs font-semibold text-[#a6a6a6] sm:w-[140px] sm:px-4 sm:py-[18px] sm:text-sm md:w-[200px] md:text-xl">
                {altHeading}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const stripe = i % 2 === 1 ? "bg-[#faf8f5]" : "bg-white";
              const czBg = i % 2 === 1 ? "bg-[#f1f8f6]" : "bg-[#f5fbf9]";
              return (
                <tr key={row.feature} className={stripe}>
                  <td className="border-t border-[#e6e0d8] px-3 py-3 font-normal leading-snug text-[#2e2e2e] sm:px-6 sm:py-[15px] sm:leading-5">
                    {row.feature}
                  </td>
                  <td
                    className={`border-t border-[#e6e0d8] ${czBg} px-2 py-3 text-center text-sm font-semibold text-[#1a877a] sm:px-4 sm:py-[15px] sm:text-base`}
                  >
                    ✓
                  </td>
                  <td className="border-t border-[#e6e0d8] px-2 py-3 text-center sm:px-4 sm:py-[15px]">
                    <AltValue value={row.alt} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
