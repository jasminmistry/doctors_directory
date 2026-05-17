export type HubTestimonial = {
  quote: string
  name: string
  role: string
  initials: string
  tag: string
  avatarSrc: string
}

export const hubBuyerHubTestimonials: readonly HubTestimonial[] = [
  {
    quote: "Consentz transformed how we handle patient consent.",
    name: "Sarah Mitchell",
    role: "Clinic Director · Clarity Aesthetics, London",
    initials: "SM",
    tag: "Inspection-ready workflows",
    avatarSrc: "/directory/images/hub-testimonials/sarah-mitchell.png",
  },
  {
    quote:
      "We cut our admin time by nearly 40%. The automated reminders and digital consent flow means our team focuses on patients.",
    name: "Dr. James Okafor",
    role: "Medical Director · Revive Clinic Group",
    initials: "JO",
    tag: "Reduced admin workload",
    avatarSrc: "/directory/images/hub-testimonials/james-okafor.png",
  },
  {
    quote:
      "Patient follow-up used to be a manual headache. Consentz handles it automatically.",
    name: "Priya Sharma",
    role: "Practice Manager · Luminary Medical Aesthetics",
    initials: "PS",
    tag: "Faster patient follow-up",
    avatarSrc: "/directory/images/hub-testimonials/priya-sharma.png",
  },
]
