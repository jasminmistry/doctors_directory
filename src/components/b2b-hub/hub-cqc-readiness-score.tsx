"use client"

import { b2bBookDemoHref } from "@/lib/b2b-hub/seo"
import { useMemo, useState } from "react"
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

const QUESTIONS = [
  "Do you have digital consent records for every treatment stored against the patient record?",
  "Are your clinic policies version-controlled and reviewed within the last 12 months?",
  "Do you track complaints, incidents, complications, and outcomes centrally?",
  "Can you evidence practitioner training, qualifications, insurance, and competency records?",
  "Can you produce a full audit trail showing who did what, when, and what corrective action was taken?",
] as const

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

function readinessLabel(score: number): { label: string; detail: string; tone: string } {
  if (score >= 5) {
    return {
      label: toDisplayTitle("High readiness"),
      detail: "Strong inspection-ready signals. Focus on continuous evidence and spot-checks before your next review.",
      tone: "bg-emerald-50 text-emerald-900 border-emerald-200",
    }
  }
  if (score >= 3) {
    return {
      label: toDisplayTitle("Medium readiness"),
      detail: "Foundations exist but gaps remain. Prioritise central records, policy versioning, and audit trails.",
      tone: "bg-amber-50 text-amber-900 border-amber-200",
    }
  }
  return {
    label: toDisplayTitle("Low readiness"),
    detail: "Significant compliance risk. Book a readiness demo to map consent, governance, and evidence workflows.",
    tone: "bg-red-50 text-red-900 border-red-200",
  }
}

type AnswerChoice = "yes" | "no" | null

export function HubCqcReadinessScore() {
  const [answers, setAnswers] = useState<AnswerChoice[]>(() =>
    QUESTIONS.map(() => null)
  )

  const score = useMemo(
    () => answers.reduce((sum, choice) => sum + (choice === "yes" ? 1 : 0), 0),
    [answers]
  )
  const result = readinessLabel(score)

  return (
    <section className="mb-12 rounded-lg border border-[#e0e0e0] bg-white p-6 md:p-8 shadow-sm">
      <h2 className="mb-2 text-2xl font-semibold text-[#111111]">
        {toDisplayTitle("Is your clinic inspection-ready?")}
      </h2>
      <p className="mb-6 text-base text-[#6B6B6B]">
        Answer five yes/no questions. Yes = 1 point, No = 0.
      </p>

      <ol className="mb-8 space-y-4">
        {QUESTIONS.map((question, index) => (
          <li key={question} className="rounded-lg border border-[#e0e0e0] bg-[#fbfbfb] p-4">
            <p className="mb-3 text-sm font-medium text-[#111111] md:text-base">
              {index + 1}. {question}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setAnswers((prev) => {
                    const next = [...prev]
                    next[index] = "yes"
                    return next
                  })
                }
                className={
                  answers[index] === "yes"
                    ? "rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#374151]"
                }
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() =>
                  setAnswers((prev) => {
                    const next = [...prev]
                    next[index] = "no"
                    return next
                  })
                }
                className={
                  answers[index] === "no"
                    ? "rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#374151]"
                }
              >
                No
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className={`mb-6 rounded-lg border px-5 py-4 ${result.tone}`}>
        <p className="text-lg font-semibold">
          Score: {score}/5 ({result.label})
        </p>
        <p className="mt-2 text-sm leading-relaxed">{result.detail}</p>
      </div>

      <a href={b2bBookDemoHref()} className={HUB_CTA_PRIMARY_CLASS}>
        {toDisplayTitle("Book a CQC readiness demo")}
      </a>
    </section>
  )
}
