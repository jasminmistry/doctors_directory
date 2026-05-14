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
    return <span className="text-[13px] text-[#928b82]">—</span>;
  }
  if (value === "check") {
    return (
      <span className="text-base font-semibold text-[#2e2e2e]" aria-label="Included">
        ✓
      </span>
    );
  }
  return <span className="text-xl text-[#928b82]">Limited</span>;
}

type Props = {
  id?: string;
  competitorLabel: string;
};

/**
 * Three-column comparison from Figma
 * [4365:586](https://www.figma.com/design/jcl0S9CTyKRH2q2PKcTspr/Consentz-Health-Directory?node-id=4365-586&m=dev).
 */
export function HubCompareFeatureTable({ id, competitorLabel }: Props) {
  const altHeading = competitorLabel.toUpperCase();

  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="mx-auto mb-10 max-w-[1120px] text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[#2e2e2e] md:text-4xl md:leading-[44px]">
          Why Choose Consentz Over {competitorLabel}?
        </h2>
      </div>
      <div className="mx-auto max-w-[1200px] overflow-x-auto rounded-xl border border-[#e6e0d8] bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left text-xl">
          <thead>
            <tr className="bg-[#1a1a1a] text-white">
              <th className="px-6 py-[18px] text-xl font-semibold">Feature</th>
              <th className="w-[240px] bg-[#106057] px-4 py-[18px] text-center text-xl font-bold">
                Consentz
              </th>
              <th className="w-[240px] px-4 py-[18px] text-center text-xl font-semibold text-[#a6a6a6]">
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
                  <td className="border-t border-[#e6e0d8] px-6 py-[15px] font-normal leading-5 text-[#2e2e2e]">
                    {row.feature}
                  </td>
                  <td
                    className={`border-t border-[#e6e0d8] ${czBg} px-4 py-[15px] text-center text-base font-semibold text-[#1a877a]`}
                  >
                    ✓
                  </td>
                  <td className="border-t border-[#e6e0d8] px-4 py-[15px] text-center">
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
