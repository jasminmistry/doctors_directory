import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toUrlSlug } from "@/lib/utils";
import {
  modalities,
  edu,
  accreditations,
  brands,
  product_categories,
  locations,
} from "@/lib/data";

export function Footer() {
  const recognitions = [...accreditations, ...edu];
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";
  return (
    <>
      <footer className="bg-[var(--dune)] py-16 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center flex-col md:flex-row justify-between">
            <div className="w-full md:w-auto">
              <section className="text-lg md:text-4xl font-bold mb-2">
                Ready To Get Started?
              </section>
              <p className="">
                Join over 200+ clinics already growing with Consentz.
              </p>
            </div>
            <div className="flex justify-start w-full md:w-auto pt-10 md:pt-0">
              <a
                href={`${baseUrl}/book-demo/?source=${baseUrl}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="h-auto rounded-lg md:text-lg px-4 py-2 md:px-5 md:py-2 bg-white text-black hover:bg-gray-200 hover:cursor-pointer">
                  BOOK DEMO
                </Button>
              </a>
            </div>
          </div>
          <div className="border-t border-white my-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {/* CONSENTZ + Contact */}
            <div>
              <div className="font-bold text-lg mb-6">
                <img
                  src="/directory/images/Consentz Logo light.svg"
                  alt="Logo"
                  width={180}
                />
              </div>
              <h3 className="sr-only">Contact Information</h3>
              <div className="text-sm  space-y-2">
                <p className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>[UK] +44 (0) 208 050 3372</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>(US) +1 646 786 1949</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>contact@consentz.com</span>
                </p>
              </div>
            </div>

            {/* Consentz vs Column */}
            <div>
              <h3 className="font-bold text-lg text-white mb-6">Consentz vs</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`${baseUrl}/zenoti-alternative/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Zenoti
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/aestheticspro-alternatives/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    AestheticsPro
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/pabau-alternatives/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Pabau
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/aesthetic-record-alternatives/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Aesthetic Record
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/consentz-vs-clinicsense/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Clinicsense
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/consentz-vs-nextech/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Nextech
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/vagaro-alternative/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Vagaro
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/glowdaypro-alternative/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    GlowdayPRO
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/patientnow-alternative/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    PatientNow
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/mangomint-alternative/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Mangomint
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/boulevard-alternative/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Boulevard
                  </a>
                </li>
              </ul>
            </div>

            {/* Features Column */}
            <div>
              <h3 className="font-bold text-lg text-white mb-6">Features</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`${baseUrl}/clinic-management-software/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Clinic Management
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/what-is-patient-management-software/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Patient Engagement
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/photos-records/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Photos and Records
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/personalise/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Personalise
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/analytics/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/stock-and-billing/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Stock and Billing
                  </a>
                </li>
              </ul>
            </div>

            {/* Useful Links Column */}
            <div>
              <h3 className="font-bold text-lg text-white mb-6">Marketing</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`${baseUrl}/healthcare-marketing-software/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Marketing
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/medical-templates/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Medical Templates
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/faqs/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/blog/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/category/articles/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Articles
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:care@consentz.com"
                    className="text-left w-full hover:text-white transition"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/terms/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/partners/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Partners
                  </a>
                </li>
                <li>
                  <a
                    href={`${baseUrl}/privacy-policy/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left w-full hover:text-white transition"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Get the App Column */}
            <div>
              <h3 className="font-bold text-lg text-white mb-6">Get the app</h3>
              <div className="">
                <a
                  href="https://apps.apple.com/us/app/consentz/id1292663553"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/directory/images/Consentz Iphone App.webp"
                    alt=""
                    width={139}
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white my-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-sm">
            {/* Column 1: Description */}
            <div>
              <h3 className="sr-only">About the Directory</h3>
              <p className=" text-white mb-3">
                Find qualified healthcare and aesthetic practitioners in your
                area. Verified profiles, authentic reviews, and regulatory
                compliance.
              </p>
            </div>

            {/* Column 2: Clinics */}
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">
                  <Link
                    prefetch={false}
                    href="/practitioners"
                    className="block text-sm"
                  >
                    Top Practitioners in {locations.length} cities
                  </Link>
              </h4>
              <h4 className="font-semibold">
                  <Link prefetch={false} href="/clinics" className="block text-sm">
                    {" "}
                    Top Clinics in {locations.length} cities
                  </Link>
              </h4>
              <h4 className="font-semibold">
                {" "}
                <Link
                  prefetch={false}
                  href={`/clinics/treatment-by-city`}
                  className="block text-sm"
                >
                  Treatments by City (Clinics)
                </Link>
              </h4>
              <h4 className="font-semibold">
                {" "}
                <Link
                  prefetch={false}
                  href={`/practitioners/treatment-by-city`}
                  className="block text-sm"
                >
                  Treatments by City (Practitioner)
                </Link>
              </h4>

              <ul className="gap-2 max-h-[100px] overflow-auto [&>li]:flex [&>li]:before:content-['-'] [&>li]:before:mr-2">
                {locations.slice(0, 1).map((city, index) => {
                  return modalities.slice(0, 5).map((treatment, index_t) => (
                    <li key={index_t}>
                      <Link
                        prefetch={false}
                        href={`/practitioners/${toUrlSlug(city)}/treatments/${toUrlSlug(treatment)}`}
                        className="block text-sm"
                      >
                        {treatment} in {city}
                      </Link>
                    </li>
                  ));
                })}
              </ul>
              <h4 className="font-semibold">
                {" "}
                <Link
                  prefetch={false}
                  href={`/accredited`}
                  className="block text-sm"
                >
                  Accredited Clinics & Practitioners
                </Link>
              </h4>
              <h4 className="font-semibold">
                <Link
                  prefetch={false}
                  href="/practitioners/credentials"
                  className="block text-sm"
                >
                  {" "}
                  Awards and Acolades
                </Link>
              </h4>

              <h4 className="font-semibold">
                <Link
                  prefetch={false}
                  href={`/products/brands/`}
                  className="block text-sm"
                >
                  Products by Brand
                </Link>
              </h4>

              <h4 className="font-semibold">
                <Link
                  prefetch={false}
                  href={`/products/category/`}
                  className="block text-sm"
                >
                  Products by Category
                </Link>
              </h4>
            </div>

            {/* Column 3: For Practitioners */}
            <div>
              <h3 className="font-bold text-lg text-white mb-4">
                For Practitioners
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://v3.consentz.com/admin/registration"
                    className="block text-sm hover:text-white transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Directory
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://v3.consentz.com/admin/registration"
                    className="block text-sm hover:text-white transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Update Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${baseUrl}/clinic-management-software/`}
                    className="block text-sm hover:text-white transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verification Process
                  </Link>
                </li>
                <li>
                  <Link
                    href={`mailto:care@consentz.com`}
                    className="block text-sm hover:text-white transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="font-bold text-lg text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    className="text-left w-full hover:text-white transition"
                    type="button"
                  >
                    Info@healthdirectory.com
                  </button>
                </li>
                <li>
                  <button
                    className="text-left w-full hover:text-white transition"
                    type="button"
                  >
                    +44 208 050 3372
                  </button>
                </li>
                <li>
                  <button
                    className="text-left w-full hover:text-white transition"
                    type="button"
                  >
                    Contact@consentz.com
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            {/* <div>
              <h3 className="font-bold text-lg text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <div className="hover:text-white transition">
                    Info@healthdirectory.com
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition">
                    +44 208 050 3372
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition">
                    Contact@consentz.com
                  </div>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
      </footer>
    </>
  );
}
