import SearchPage from "@/components/search/searchClient"
import { toDirectoryCanonical } from "@/lib/seo"

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/search"),
  },
}


export default async function Page() {

  return (
    <SearchPage 
      
    />
  )
}
