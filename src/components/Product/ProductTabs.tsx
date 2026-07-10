"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function PractitionerTabs() {
  const sections = [
    { id: "description", label: "Description" },
    { id: "benefits", label: "Benefits" },
    { id: "indications", label: "Indications" },
    { id: "composition", label: "Composition" },
    { id: "formulation", label: "Formulation" },
    { id: "packaging", label: "Packaging" },
    { id: "usage", label: "Usage" },
    { id: "duration", label: "Duration" },
    { id: "onset_of_effect", label: "Onset" },
    { id: "contraindications", label: "Contraindications" },
    { id: "adverse_effects", label: "Adverse Effects" },
    { id: "storage_conditions", label: "Storage Conditions" },
  ];
  return (
    <Tabs
      defaultValue="roles"
      className="w-full sticky top-0 bg-white z-20 pb-4 mb-6 border-b overflow-x-auto"
    >
      <TabsList className="flex flex-nowrap gap-2 overflow-x-auto">
        {sections.map((s) => (
          <TabsTrigger
            key={s.id}
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
        ))}
      </TabsList>
    </Tabs>
  );
}
