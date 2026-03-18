import { Accreditation } from "@/lib/types";
import { decodeUnicodeEscapes, fixMojibake } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function createBullets(text: string) {
  const spliText = text.split(";");
  if (spliText.length <= 1) {
    return decodeUnicodeEscapes(text);
  }
  const bulletItems = spliText.map((item, key) => (
    <li className="text-sm leading-relaxed" key={key}>{decodeUnicodeEscapes(fixMojibake(fixMojibake(fixMojibake(item.trim())))).trim().charAt(0).toUpperCase() + decodeUnicodeEscapes(fixMojibake(fixMojibake(fixMojibake(item.trim()))).trim().slice(1))}</li>
  ));
  return (
    <div className="mt-2 space-y-2">
      <ul className="list-disc list-inside pl-6 space-y-1">
        {bulletItems}
      </ul>
    </div>
  );
}

interface CredentialPageDataProps {
  credentialSlug: string;
  credentialData: Accreditation;
}

export function CredentialPageData({ credentialSlug, credentialData }: CredentialPageDataProps) {
  const formattedSlug = credentialSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <div className="bg-white rounded p-4 mb-4">
        {/* Credential Header with Image */}
        <section className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center overflow-hidden rounded-lg bg-gray-300">
                <img
                  src={credentialData.image}
                  alt={`${formattedSlug} credential logo`}
                  className="object-cover w-full h-full"
                  
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-sm md:text-2xl md:font-semibold mb-4">{formattedSlug}</h1>
              {createBullets(credentialData.overview.description)}
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Overview</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="founded-year">
              <strong>Founded Year:</strong> {credentialData.overview.founded_year}
            </div>
            <div data-testid="founder">
              <strong>Founder:</strong> {credentialData.overview.founder}
            </div>
            <div data-testid="purpose">
              <strong>Purpose:</strong> {createBullets(credentialData.overview.purpose)}
            </div>
          </div>
        </section>

        {/* Governing Body Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Governing Body</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="organisation-name">
              <strong>Organisation Name:</strong> {credentialData.governing_body.organisation_name}
            </div>
            <div data-testid="company-status">
              <strong>Company Status:</strong> {createBullets(credentialData.governing_body.company_status)}
            </div>
            <div data-testid="regulatory-status">
              <strong>Regulatory Status:</strong> {createBullets(credentialData.governing_body.regulatory_status)}
            </div>
            <div data-testid="industry-standing">
              <strong>Industry Standing:</strong> {createBullets(credentialData.governing_body.industry_standing)}
            </div>
          </div>
        </section>

        {/* Eligibility Criteria Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Eligibility Criteria</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="who-can-apply">
              <strong>Who Can Apply:</strong> {createBullets(credentialData.eligibility_criteria.who_can_apply)}
            </div>
            <div>
              <strong>Requirements:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.eligibility_criteria.requirements.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item.substring(0, 50)}{item.length > 50 ? "..." : ""}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Restrictions:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.eligibility_criteria.restrictions.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item.substring(0, 50)}{item.length > 50 ? "..." : ""}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Judging Criteria Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Judging Criteria</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong>Evaluation Factors:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.judging_criteria.evaluation_factors.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Categories</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong>Available Categories:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.categories.available_categories.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Accreditation Requirements Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Accreditation Requirements</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="inspection-required">
              <strong>Inspection Required:</strong> {createBullets(credentialData.accreditation_requirements.inspection_required)}
            </div>
            <div>
              <strong>Documentation Required:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.accreditation_requirements.documentation_required.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item.substring(0, 50)}{item.length > 50 ? "..." : ""}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Compliance Standards:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.accreditation_requirements.compliance_standards.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item.substring(0, 50)}{item.length > 50 ? "..." : ""}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Sources:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.accreditation_requirements.sources.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Verification Process Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Verification Process</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="public-register">
              <strong>Public Register:</strong> {createBullets(credentialData.verification_process.public_register)}
            </div>
            <div data-testid="certificate-validation">
              <strong>Certificate Validation Method:</strong> {createBullets(credentialData.verification_process.certificate_validation_method)}
            </div>
            <div>
              <strong>Sources:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.verification_process.sources.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Renewal & Compliance Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Renewal & Compliance</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="renewal-frequency">
              <strong>Renewal Frequency:</strong> {createBullets(credentialData.renewal_and_compliance.renewal_frequency)}
            </div>
            <div data-testid="cpd-requirements">
              <strong>CPD Requirements:</strong> {createBullets(credentialData.renewal_and_compliance.cpd_requirements)}
            </div>
            <div data-testid="audit-process">
              <strong>Audit Process:</strong> {createBullets(credentialData.renewal_and_compliance.audit_process)}
            </div>
            <div>
              <strong>Sources:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.renewal_and_compliance.sources.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Benefits</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="reputation">
              <strong>Reputation:</strong> {createBullets(credentialData.benefits.reputation)}
            </div>
            <div data-testid="patient-trust">
              <strong>Patient Trust Impact:</strong> {createBullets(credentialData.benefits.patient_trust_impact)}
            </div>
          </div>
        </section>

        {/* Patient Safety Impact Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Patient Safety Impact</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong>Mechanisms of Protection:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.patient_safety_impact.mechanisms_of_protection.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Limitations:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.patient_safety_impact.limitations.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison with Other Bodies Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Comparison with Other Bodies</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong>Comparable Entities:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.comparison_with_other_bodies.comparable_entities.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Key Differences:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.comparison_with_other_bodies.key_differences.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Industry Recognition Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Industry Recognition</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong>Media Mentions:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.industry_recognition.media_mentions.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Endorsements:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.industry_recognition.endorsements.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Credibility Signals:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {credentialData.industry_recognition.credibility_signals.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100 border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Government Regulation Status Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Government Regulation Status</h2>
          <div className="space-y-3 text-muted-foreground">
            <div data-testid="statutory-backing">
              <strong>Statutory Backing:</strong> {createBullets(credentialData.government_regulation_status.statutory_backing)}
            </div>
            <div data-testid="regulated-by">
              <strong>Regulated By:</strong> {createBullets(credentialData.government_regulation_status.regulated_by)}
            </div>
            <div data-testid="legal-status">
              <strong>Legal Status:</strong> {createBullets(credentialData.government_regulation_status.legal_status)}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {credentialData.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 pb-2 text-muted-foreground">
                    {createBullets(faq.answer)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </>
  );
}
