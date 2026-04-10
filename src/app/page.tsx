import HomePage from "@/components/home-page"
import { toDirectoryCanonical } from "@/lib/seo"

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/"),
  },
}

export default async function Home() {
  
  return (
    <>
      <HomePage />
    </>
  )
}