/**
 * Medical template library cards — only listings that exist on Consentz today.
 * Each `href` is the real template article URL (not the index page).
 * @see https://www.consentz.com/medical-templates/
 */
export type HubTemplateLibraryFormat =
  | "all"
  | "carousels"
  | "stories"
  | "reels"
  | "email"
  | "forms"
  | "cqc";

export type HubTemplateLibraryItem = {
  id: string;
  title: string;
  date: string;
  format: Exclude<HubTemplateLibraryFormat, "all">;
  image: string;
  href: string;
};

export const HUB_TEMPLATE_LIBRARY_ITEMS: HubTemplateLibraryItem[] = [
  {
    id: "brochure",
    title: "Medical Brochure Templates For Healthcare Practices [2026 Guide]",
    date: "December 6, 2025",
    format: "carousels",
    image: "/directory/images/Aesthetic-Clinic-Marketing-Guide-1536x864.webp",
    href: "https://www.consentz.com/medical-brochure-templates/",
  },
  {
    id: "records",
    title: "Medical Records Request Form Template: HIPAA-Compliant Guide [2026]",
    date: "December 4, 2025",
    format: "forms",
    image: "/directory/images/HIPAA-Compliant-Medical-Spa-Software-768x432.webp",
    href: "https://www.consentz.com/medical-records-request-form-templates/",
  },
  {
    id: "directive",
    title: "Medical Directive Template For Clinics: Free Download Guide",
    date: "December 2, 2025",
    format: "forms",
    image: "/directory/images/cqc-hub/mid-caring.png",
    href: "https://www.consentz.com/medical-directive-templates/",
  },
  {
    id: "website",
    title: "Medical Website Templates & Page Designs [2026]",
    date: "November 30, 2025",
    format: "stories",
    image: "/directory/images/Aesthetic Software Interface.webp",
    href: "https://www.consentz.com/medical-website-templates/",
  },
];
