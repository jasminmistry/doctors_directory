const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "Consentz",
  image: "https://www.consentz.com/wp-content/uploads/2024/08/logo.png",
  description:
    "Consentz is clinic management software designed by an aesthetic doctor to record treatments, manage the day to day running of a clinical business and maintain and grow patient relationships.",
  brand: {
    "@type": "Brand",
    name: "Consentz",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "157",
  },
} as const

export function HubProductSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  )
}
