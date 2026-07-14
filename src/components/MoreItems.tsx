"use client"
import type { Product, Clinic, Practitioner } from '@/lib/types'
import { MoreItemsScroller } from "./MoreItemsScroller"
import { isCity, isClinic, isPractitioner, isProduct, isTreatment } from "@/lib/utils";
import { PractitionerCard } from "./practitioner-card";
interface MoreItemsProps {
  items: Array<Product | Clinic | Practitioner|string|undefined>
  maxItems?: number
  scrollAmount?: number
}


const getEnhancedTreatment = (treatment: any) => {
    const mockData: Record<string, { satisfaction: number; averageCost: string; practitionerCount: number }> = {
      "Acne": { satisfaction: 82, averageCost: "$200-$800+", practitionerCount: 101 },
      "Botox": { satisfaction: 89, averageCost: "$150-$350", practitionerCount: 245 },
      "Fillers": { satisfaction: 85, averageCost: "$300-$600", practitionerCount: 178 }
    };
    
    const enhancement = mockData[treatment.name] || { 
      satisfaction: Math.floor(Math.random() * 20) + 75, 
      averageCost: `$${Math.floor(Math.random() * 500) + 200}-$${Math.floor(Math.random() * 500) + 600}+`,
      practitionerCount: Math.floor(Math.random() * 100) + 50 
    };
    
    return { ...treatment, ...enhancement };
  };
// function ProductCard({ product }: { product: Product }) {
//   return (
//     <Link href={`/products/${product.category}/${product.slug}`} className="flex grow h-full">
//       <Card className="gap-0 h-full w-full relative px-0 shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border-t-[1px] rounded-27 md:border md:border-[var(--alto)] cursor-pointer justify-between" aria-labelledby={`product-name-${product.slug}`}>
//         <CardHeader className="pb-2 px-2">
//           <div className="flex items-start gap-4">
//             <div className="text-center flex-1 min-w-0 items-center flex flex-col">
//               <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
//                 <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300 mb-4 mr-0">
//                   <img
//                     src={
//                       product.image_url?.replaceAll('"', "") ||
//                       "/placeholder.svg"
//                     }
//                     alt="Product"
//                     className="object-cover rounded-lg min-w-full min-h-full"
//                   />
//                 </div>

//                 <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full">
//                   {product.product_name && (
//                     <p className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-gray-200 text-[10px] px-3 py-1 mb-2">
//                       {decodeUnicodeEscapes(product?.distributor_cleaned.trim())}
//                     </p>
//                   )}

//                   <h3 className="mb-2 md:mb-0 flex text-left md:text-center md:align-items-center md:justify-center font-semibold text-xs md:text-md leading-relaxed text-balance line-clamp-2">
//                     {decodeUnicodeEscapes(product.product_name)}
//                   </h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="pt-0 px-0 md:px-4 space-y-4">
//           <div className="flex items-center justify-center gap-2 text-[11px] text-gray-600">
//             <span className="text-pretty text-center">
//               {decodeUnicodeEscapes(product.category.trim())}
//             </span>
//           </div>
//           <div>
//             <ul className="flex flex-wrap items-center justify-center gap-1 text-center" aria-label="Product prices">
//               {Array.isArray(product.all_prices) &&
//                 product.all_prices.map((value: any, index: number) => (
//                   <li key={index}>
//                     <Badge variant="outline" className="text-[11px] font-normal text-gray-500">
//                       {value.price}
//                     </Badge>
//                   </li>
//                 ))}
//             </ul>
//           </div>
//         </CardContent>
//       </Card>
//     </Link>
//   )
// }

// function ClinicCard({ clinic }: { clinic: Clinic }) {
//   const clinicName = clinic.slug!
//     .split("-")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ")

//   return (
//     <Link
//       href={`/clinics/${clinic.City}/clinic/${clinic.slug}`}
//       className="flex grow h-full"
//     >
//       <Card className="gap-0 relative px-4 md:px-0 shadow-sm transition-all duration-300 border border-[#E5E1DE] hover:shadow-2xl hover:-translate-y-1 rounded-lg cursor-pointer bg-white w-full justify-between">
//         <CardHeader className="p-0 md:pb-4 md:px-2">
//           <div className="flex items-start gap-4">
//             <div className="text-center flex-1 min-w-0 items-center flex flex-col">
//               <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
//                 <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-full bg-gray-300 md:mb-3 mr-0">
//                   <img
//                     src={clinic.image.split("?w")[0] || "/placeholder.svg"}
//                     alt="Profile"
//                     width={240}
//                     height={240}
//                     className="object-cover rounded-full w-full h-full"
//                   />
//                 </div>
//                 <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full">
//                   <h3 className="mb-2 md:mb-4 flex text-left md:text-center md:align-items-center md:justify-center font-semibold text-md md:text-lg transition-colors text-balance">
//                     {clinicName}
//                   </h3>

//                   <div className="flex justify-center flex-wrap items-center gap-2">
//                     <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-300 text-xs">
//                       {clinic.category}
//                     </span>
//                   </div>

//                   <p className="pt-2 mb-2 text-pretty">Specialties</p>
//                 </div>
//               </div>
//               <div className="flex flex-row gap-2 pt-3 items-center text-sm">
//                 <div className="flex items-center gap-1">
//                   <div className="flex items-center">
//                     {Array.from({ length: 5 }, (_, i) => (
//                       <Star
//                         key={i}
//                         aria-hidden="true"
//                         className={`h-4 w-4 ${
//                           i < clinic.rating
//                             ? "fill-black text-black"
//                             : "text-muted-foreground/30"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <span className="border-l border-black pl-2 underline">
//                   ({clinic.reviewCount} reviews)
//                 </span>
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="pt-0 px-0 md:px-4 space-y-4">
//           <div className="flex items-start gap-2 text-sm">
//             <MapPin className="h-4 w-4 mt-0 flex-shrink-0" aria-hidden="true" />
//             <span className="text-pretty">
//               {clinic.gmapsAddress.split(",")[
//                 clinic.gmapsAddress.split(",").length - 2
//               ] +
//                 ", " +
//                 clinic.gmapsAddress.split(",")[
//                   clinic.gmapsAddress.split(",").length - 1
//                 ]}
//             </span>
//           </div>

//           {clinic.Treatments && clinic.Treatments.length > 0 && (
//             <div>
//               <h4 className="sr-only">Treatments offered</h4>
//               <ul
//                 className="flex flex-wrap gap-1 pt-4"
//                 aria-label="Treatments offered"
//               >
//                 {clinic.Treatments.slice(0, 2).map((modality, index) => (
//                   <li key={index}>
//                     <Badge variant="outline" className="text-xs">
//                       {modality.charAt(0).toUpperCase() + modality.slice(1)}
//                     </Badge>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </Link>
//   );
// }

// function TreatmentCard({ treatment }: { treatment: string }) {
//    const enhancedTreatment = getEnhancedTreatment(treatment);
//    const treatmentValue = treatment?.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ").replace("Hifu", "HIFU").replace("Coolsculpting", "CoolSculpting");
            


//     return (
//         <Link
//         key={treatment}
//           href={`/treatments/${treatmentValue}`}
//           title={`Learn about ${treatmentValue} treatments and find qualified specialists`}
//           className="flex grow h-full"
//         >
//           <Card className="group bg-white transition-all duration-300 cursor-pointer border border-[#BDBDBD] md:border-0 rounded-lg sm:bg-transparent sm:border-0 sm:hover:border-accent/50 sm:flex sm:flex-col sm:gap-5  w-100">
//             <CardContent className="p-4 sm:p-0 sm:flex sm:items-center sm:justify-center sm:pt-0">
//               <div className="flex items-center gap-4 sm:flex-col sm:gap-5">
//                 <div className="flex-shrink-0">
//                   <img
//                     src={TreatmentMap[treatmentValue]}
//                     alt={treatmentValue}
//                     width={60}
//                     height={60}
//                     className="object-cover rounded-full w-24 h-24 sm:w-60 sm:h-60"
//                   />
//                 </div>
//                 <div className="flex-1 min-w-0 sm:text-center">
//                   <h3 className="font-semibold text-lg text-foreground group-hover:text-primary/70 transition-colors mb-3 sm:mb-0 sm:text-sm">
//                     {treatmentValue}
//                   </h3>

//                   <div className="space-y-2 sm:hidden">
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <ThumbsUp className="h-4 w-4 text-black" />
//                       <span className="font-medium">
//                         {enhancedTreatment.satisfaction}%
//                       </span>
//                       <span>Satisfaction</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <DollarSign className="h-4 w-4 text-black" />
//                       <span className="font-medium">
//                         {enhancedTreatment.averageCost}
//                       </span>
//                       <span>Avg Cost</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <Users className="h-4 w-4 text-black" />
//                       <span className="font-medium">
//                         {enhancedTreatment.practitionerCount}
//                       </span>
//                       <span>Practitioners</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </Link>
//     );}
   
// function PractitionerCard({ practitioner }: { practitioner: Practitioner }) {
//   const practitionerName = practitioner.practitioner_name
//     ? practitioner.practitioner_name
//         .split("-")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ")
//     : practitioner.slug!
//         .split("-")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ")

//   return (
//     <Link href={`/profile/${practitioner.practitioner_name}`} className="block">
//       <Card className="gap-0 relative px-4 md:px-0 shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border-t-[1px] rounded-27 md:border md:border-[var(--alto)] cursor-pointer">
//         <CardHeader className="pb-4 px-2">
//           <h2 className="sr-only">{practitionerName}</h2>

//           <div className="flex items-start gap-4">
//             <div className="text-center flex-1 min-w-0 items-center flex flex-col">
//               <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
//                 <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-full bg-gray-300 md:mb-3 mr-0">
//                   <img
//                     src={practitioner.image || "/placeholder.svg"}
//                     alt="Profile"
//                     className="object-cover rounded-full min-w-full min-h-full"
//                   />
//                 </div>
//                 <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full">
//                   {practitioner.practitioner_title && (
//                     <p className="text-xs text-gray-500 mb-1">
//                       {practitioner.practitioner_title
//                         .split("/")[0]
//                         .split("(")[0]
//                         .trim()}
//                     </p>
//                   )}

//                   <h3 className="mb-2 md:mb-4 flex text-left md:text-center md:align-items-center md:justify-center font-semibold text-md md:text-lg transition-colors text-balance">
//                     {practitionerName}
//                   </h3>

//                   {practitioner.category && (
//                     <p className="pt-2 mb-2 text-sm">
//                       {practitioner.category.trim()}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <h4 className="sr-only">Rating</h4>
//               <div className="flex flex-row gap-2 pt-3 items-center justify-start md:justify-center w-full text-sm" aria-label={`Rating: ${practitioner.rating} out of 5 stars, ${practitioner.reviewCount} reviews`}>
//                 <div className="inline-flex items-center gap-1">
//                   <div className="flex items-center">
//                     {Array.from({ length: 5 }, (_, i) => (
//                       <Star
//                         key={i}
//                         aria-hidden="true"
//                         className={`h-4 w-4 ${
//                           i < practitioner.rating!
//                             ? "fill-black text-black"
//                             : "text-muted-foreground/30"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <span className="border-l border-black pl-2 underline">
//                   ({practitioner.reviewCount} reviews)
//                 </span>
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="pt-0 px-0 md:px-4 space-y-4">
//           <h4 className="sr-only">Location</h4>
//           <div className="flex items-start gap-2 text-sm">
//             <MapPin className="h-4 w-4 mt-0 flex-shrink-0" aria-hidden="true" />
//             <span className="text-pretty">
//               {practitioner.gmapsAddress!.split(",")[
//                 practitioner.gmapsAddress!.split(",").length - 2
//               ] +
//                 ", " +
//                 practitioner.gmapsAddress!.split(",")[
//                   practitioner.gmapsAddress!.split(",").length - 1
//                 ]}
//             </span>
//           </div>

//           <Button
//             variant="default"
//             className="mt-4 mb-0 flex border rounded-lg w-full px-4 py-2 bg-black text-white hover:bg-white hover:text-black"
//           >
//             Contact
//           </Button>

//           {practitioner.Treatments && practitioner.Treatments.length > 0 && (
//             <div>
//               <h4 className="sr-only">Treatments offered</h4>
//               <ul className="flex flex-wrap gap-1 pt-4" aria-label="Treatments offered">
//                 {practitioner.Treatments.slice(0, 2).map((modality, index) => (
//                   <li key={index}>
//                     <Badge variant="outline" className="text-xs">
//                       {modality.charAt(0).toUpperCase() + modality.slice(1)}
//                     </Badge>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </Link>
//   )
// }

export function MoreItems({ items, maxItems = 15 }: MoreItemsProps) {

  return (
    <MoreItemsScroller>
      {items.slice(0, maxItems).map((item, index) => {
  if (
    isProduct(item) ||
    isClinic(item) ||
    isPractitioner(item) ||
    isTreatment(item) ||
    isCity(item)
  ) {
    return (
      <div
        key={typeof item === "string" ? item : item!.slug ?? index}
        className="shrink-0 grow w-[320px]"
      >
        <PractitionerCard
                key={typeof item === "string" ? item : ("practitioner_name" in item ? item.practitioner_name!+item.practitioner_title : item.slug)}
              practitioner={item}
            />
      </div>
    );
  }

  return null;
})}

    </MoreItemsScroller>
  );
}