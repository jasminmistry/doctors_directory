import SearchPage from "@/components/search/searchClient";
import { toDirectoryCanonical } from "@/lib/seo";

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/products/brands"),
  },
};

export default function ProfilePage() {
  return <SearchPage forcedType="Product" />;
}

// export async function generateStaticParams() {

//   const filePath = path.join(process.cwd(), 'public', 'derms_processed.json');
//   const fileContents = fs.readFileSync(filePath, 'utf-8');
//   const clinics: Practitioner[] = JSON.parse(fileContents);
//   return clinics.map((clinic) => ({
//     slug: clinic.practitioner_name,
//   }));
// }

// export async function generateMetadata() {
//   const filePath = path.join(process.cwd(), "public", "products_processed_new.json");
//   const fileContents = fs.readFileSync(filePath, "utf-8");
//   const clinics: Product[] = JSON.parse(fileContents);





//   return {
//     title: `${category} - Healthcare Directory`,
//     description: `View the best prices in the ${category} segment.}`,
//     openGraph: {
//       title: `${category} - Consentz`,
//       description: `View the best prices in the ${category} segment.`,
//       images: [
//         {
//           url: similarProducts[0]?.image_url || "/og-image.png",
//           width: 1200,
//           height: 630,
//           alt: `${category} profile picture`,
//         },
//       ],
//     },
//   };
// }