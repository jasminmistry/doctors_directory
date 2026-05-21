type ToolSeed = {
  slug: string
  title: string
  summary: string
  officialUrl: string
}

const TOOL_SEEDS: ToolSeed[] = [
  {
    slug: "n8n-automation-tool",
    title: "n8n automation for clinics",
    summary:
      "Connect clinical, marketing, and ops systems with open workflow automation. Start free and scale when your clinic is ready.",
    officialUrl: "https://n8n.io",
  },
  {
    slug: "zapier-automation-tool",
    title: "Zapier automation for clinics",
    summary:
      "Link booking, CRM, email, and spreadsheets without code. Useful for quick wins before you centralise on a governed clinic platform.",
    officialUrl: "https://zapier.com",
  },
  {
    slug: "gohighlevel-automation-tool",
    title: "GoHighLevel (GHL) automation for clinics",
    summary:
      "Run funnels, SMS, and pipeline automations for growth-focused clinics. Map where GHL fits versus a regulated patient record.",
    officialUrl: "https://www.gohighlevel.com",
  },
  {
    slug: "make-automation-tool",
    title: "Make automation for clinics",
    summary:
      "Visual scenarios for multi-step clinic workflows — reminders, lead routing, and handoffs between tools.",
    officialUrl: "https://www.make.com",
  },
  {
    slug: "power-automate-automation-tool",
    title: "Microsoft Power Automate for clinics",
    summary:
      "Automate tasks across Microsoft 365, Teams, and clinic apps. Strong fit when your group already runs on Microsoft.",
    officialUrl: "https://www.microsoft.com/en-us/power-platform/products/power-automate",
  },
  {
    slug: "ifttt-automation-tool",
    title: "IFTTT automation for clinics",
    summary:
      "Lightweight triggers between apps for simple clinic automations — good for experiments, less for governed clinical records.",
    officialUrl: "https://ifttt.com",
  },
  {
    slug: "hubspot-automation-tool",
    title: "HubSpot automation for clinics",
    summary:
      "CRM workflows, email sequences, and lead scoring for clinics investing in inbound marketing and sales follow-up.",
    officialUrl: "https://www.hubspot.com",
  },
  {
    slug: "activecampaign-automation-tool",
    title: "ActiveCampaign automation for clinics",
    summary:
      "Email and SMS automations with tagging and pipelines — often used for nurture before patients reach your booking stack.",
    officialUrl: "https://www.activecampaign.com",
  },
  {
    slug: "mailchimp-automation-tool",
    title: "Mailchimp automation for clinics",
    summary:
      "Campaign and customer journey automations for clinics that want approachable email marketing without heavy setup.",
    officialUrl: "https://mailchimp.com",
  },
  {
    slug: "chatgpt-automation-tool",
    title: "ChatGPT automation for clinics",
    summary:
      "Draft patient comms, SOPs, and internal templates faster. Pair AI output with human review and your consent policies.",
    officialUrl: "https://chatgpt.com",
  },
  {
    slug: "claude-automation-tool",
    title: "Claude automation for clinics",
    summary:
      "Use Claude for long-form policies, aftercare copy, and workflow documentation — always governed by your clinical team.",
    officialUrl: "https://claude.ai",
  },
  {
    slug: "docker-automation-tool",
    title: "Docker automation for clinics",
    summary:
      "Package and deploy clinic integrations reliably. Relevant for tech-savvy groups building custom connectors around their stack.",
    officialUrl: "https://www.docker.com",
  },
  {
    slug: "calendly-automation-tool",
    title: "Calendly automation for clinics",
    summary:
      "Scheduling links and reminder flows that reduce no-shows. Often combined with CRM or practice software via Zapier or native integrations.",
    officialUrl: "https://calendly.com",
  },
  {
    slug: "twilio-automation-tool",
    title: "Twilio automation for clinics",
    summary:
      "Programmable SMS and voice for appointment reminders and two-way messaging — wire into your compliance and consent rules.",
    officialUrl: "https://www.twilio.com",
  },
  {
    slug: "slack-automation-tool",
    title: "Slack automation for clinics",
    summary:
      "Alert front desk and practitioners when bookings, forms, or payments need action. Keeps ops visible without email overload.",
    officialUrl: "https://slack.com",
  },
  {
    slug: "airtable-automation-tool",
    title: "Airtable automation for clinics",
    summary:
      "Flexible bases and automations for campaigns, inventory, and project tracking alongside clinical work.",
    officialUrl: "https://www.airtable.com",
  },
  {
    slug: "pabbly-connect-automation-tool",
    title: "Pabbly Connect automation for clinics",
    summary:
      "Cost-effective workflow automation between apps — useful for smaller clinics testing integrations on a budget.",
    officialUrl: "https://www.pabbly.com/connect",
  },
  {
    slug: "workato-automation-tool",
    title: "Workato automation for clinics",
    summary:
      "Enterprise-grade integration and automation for multi-site groups with IT oversight and audit requirements.",
    officialUrl: "https://www.workato.com",
  },
  {
    slug: "tray-io-automation-tool",
    title: "Tray.io automation for clinics",
    summary:
      "Composable automations across SaaS tools — suited to clinic groups with dedicated operations or RevOps support.",
    officialUrl: "https://tray.io",
  },
  {
    slug: "monday-automation-tool",
    title: "Monday.com automation for clinics",
    summary:
      "Boards and automations for projects, onboarding, and marketing ops parallel to day-to-day patient care.",
    officialUrl: "https://monday.com",
  },
  {
    slug: "notion-automation-tool",
    title: "Notion automation for clinics",
    summary:
      "Internal wikis, SOPs, and light workflows for training and policy — complement, not replace, your clinical record.",
    officialUrl: "https://www.notion.com",
  },
  {
    slug: "typeform-automation-tool",
    title: "Typeform automation for clinics",
    summary:
      "Branded intake and lead forms that feed automations. Connect responses to CRM, email, or your practice platform.",
    officialUrl: "https://www.typeform.com",
  },
  {
    slug: "stripe-automation-tool",
    title: "Stripe automation for clinics",
    summary:
      "Payment events that trigger receipts, CRM updates, and follow-up journeys when paired with your booking and consent stack.",
    officialUrl: "https://stripe.com",
  },
]

export const AUTOMATION_TOOL_ENTRIES = TOOL_SEEDS.map((t) => ({
  segment: "automation" as const,
  slug: t.slug,
  title: t.title,
  summary: t.summary,
}))

const OFFICIAL_URL_BY_SLUG = Object.fromEntries(
  TOOL_SEEDS.map((t) => [t.slug, t.officialUrl])
) as Record<string, string>

export const AUTOMATION_TOOL_ORDER = TOOL_SEEDS.map((t) => t.slug)

export function isAutomationToolHubSlug(slug: string): boolean {
  return slug.endsWith("-automation-tool")
}

export function getAutomationToolOfficialUrl(slug: string): string | undefined {
  return OFFICIAL_URL_BY_SLUG[slug]
}

export function automationToolDisplayName(slug: string): string {
  const base = slug.replace(/-automation-tool$/, "")
  if (base === "gohighlevel") return "GoHighLevel"
  if (base === "power-automate") return "Power Automate"
  if (base === "pabbly-connect") return "Pabbly Connect"
  if (base === "tray-io") return "Tray.io"
  if (base === "chatgpt") return "ChatGPT"
  if (base === "n8n") return "n8n"
  return base
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
