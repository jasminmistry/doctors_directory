"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import  Link  from "next/link"
import { Link as LinkIcon} from "lucide-react"
import { Clinic } from "@/lib/types";
interface ClinicTabsHeaderProps {
  k_value: Clinic;
  clinic_list: string[]
  selected?: string
  onSelect?: (clinic: string) => void
}

export default function ClinicTabsHeader({k_value, clinic_list, selected, onSelect} : ClinicTabsHeaderProps) {
  let sections: {id: string,label: string}[] = []
  clinic_list.forEach((clinic: string) => {
    sections.push({ id: clinic, label: clinic })
  })
  
  return (
    <Tabs
      defaultValue="roles"
      className="w-full sticky top-0 bg-(--primary-bg-color) z-10 border-0 mt-4"
    >
      <TabsList className="bg-(--primary-bg-color) flex flex-nowrap gap-2 overflow-x-auto">
        {sections.map((s) => (
          <Link href={`/clinics/${k_value.City.toLowerCase()}/clinic/${s.id}`} className="text-xs text-white hover:text-gray-700 transition-colors">
       
          <div key={s.id} className=" mb-2 bg-(--primary-bg-color) flex flex-colmin-w-max">
            
            <TabsTrigger
              value={s.id.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              onClick={() => {
                document.getElementById(s.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                onSelect?.(s.id)
              }}
              className="bg-purple-100 text-sm font-medium text-black hover:text-black transition-colors cursor-pointer"
            >
              {s.label.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
            </TabsTrigger>
            
            
          </div></Link>
        ))}
      </TabsList>
    </Tabs>
  );
}
