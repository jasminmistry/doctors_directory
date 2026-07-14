"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function ClinicTabs() {
  const sections = [
    { id: "treatments", label: "Treatments" },
    { id: "about", label: "About" },
    { id: "accreditations", label: "Accreditations" },
    { id: "awards", label: "Awards" },
    { id: "affiliations", label: "Affiliations" },
    { id: "hours", label: "Hours" },
    { id: "insurance", label: "Insurance" },
    { id: "payments", label: "Payments" },
    { id: "fees", label: "Estimated Fees" },
  ];

  const defaultTab = sections[0]?.id;

  return (
    <Tabs
      defaultValue={defaultTab}
      className="w-full sticky top-0 bg-white z-20 pb-4 mb-6 border-b overflow-x-auto"
    >
      <TabsList className="flex flex-nowrap gap-2 overflow-x-auto">
        {sections.map((s) => (
          <div key={s.id} className="min-w-max">
            <TabsTrigger
              value={s.id}
              onClick={() => {
                document.getElementById(s.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="capitalize data-[state=active]:font-medium data-[state=active]:shadow-none"
            >
              {s.label}
            </TabsTrigger>
          </div>
        ))}
      </TabsList>
    </Tabs>
  );
}
