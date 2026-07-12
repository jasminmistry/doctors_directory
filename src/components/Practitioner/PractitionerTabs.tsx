"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function PractitionerTabs() {
  const sections = [
    { id: "treatments", label: "Treatments" },
    { id: "roles", label: "Roles" },
    { id: "qualifications", label: "Qualifications" },
    { id: "experience", label: "Experience" },
    { id: "news", label: "News" },
    { id: "awards", label: "Awards" },
    { id: "hours", label: "Hours" },
    { id: "insurance", label: "Insurance" },
    { id: "payments", label: "Payments" },
    { id: "fees", label: "Estimated Fees" },
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
