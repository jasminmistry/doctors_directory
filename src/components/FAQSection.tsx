'use client';

import { useState } from 'react';

export type FAQInput = Record<
  string,
  string | string[] | Record<string, string | string[]>
>;

function formatQuestion(key: string): string {
  return key
    .replaceAll('_', " ")
    .replaceAll(/\bvs\b/gi, "vs")
    .replaceAll(/\bUK\b/g, "UK")
    .replaceAll(/\bFDA\b/g, "FDA")
    .replaceAll(/\bNICE\b/g, "NICE")
    .replaceAll(/\bMHRA\b/g, "MHRA")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function cleanText(text: string): string {
  return text.replaceAll(/:contentReference\[.*?\]\{.*?\}/g, "").trim();
}

type FAQProps = {
  data: FAQInput;
  stripCitations?: boolean;
};

function renderValue(
  value: string | string[] | Record<string, any>,
  stripCitations: boolean
): React.JSX.Element {
  if (typeof value === "string") {
    return <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
      {stripCitations ? cleanText(value) : value}
    </p>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {value.map((item, i) => (
          <li key={i} className="text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <span className="text-black mt-0">•</span>
            <span className="flex-1">
              {stripCitations && typeof item === "string"
                ? cleanText(item)
                : item}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // Nested object (Pros / Cons, Mild / Severe, etc.)
  return (
    <div className="space-y-4">
      {Object.entries(value).map(([subKey, subValue]) => (
        <div key={subKey} className="">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {formatQuestion(subKey)}
          </h3>
          {renderValue(subValue, stripCitations)}
        </div>
      ))}
    </div>
  );
}

export function FAQ({ data, stripCitations = true }: FAQProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const handleToggle = (key: string) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    const isOpen = details.open;
    toggleExpanded(key);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="sr-only">Frequently Asked Questions</h2>
      <div className="space-y-6 bg-white rounded-lg px-8 py-8">
        {Object.entries(data).map(([rawKey, value]) => {
          const question = formatQuestion(rawKey);
          const isExpanded = expandedItems.has(rawKey);

          return (
            <details
              key={rawKey}
              open={isExpanded}
              onToggle={handleToggle(rawKey)}
              className="border rounded-lg dark:bg-slate-900 transition-all duration-200 overflow-hidden"
            >
              <summary className="px-4 py-4 bg-[var(--alabaster)] border-b border-b-1 font-semibold text-slate-800 dark:text-slate-200 text-left text-lg pr-4 cursor-pointer list-none">
                {question}
              </summary>

              <div className="px-4 py-4">
                <div className="text-slate-600 dark:text-slate-300">
                  {renderValue(value, stripCitations)}
                </div>
              </div>
            </details>
          );
        })}
      </div>
      
      {Object.keys(data).length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No FAQ items available</p>
        </div>
      )}
    </section>
  );
}
