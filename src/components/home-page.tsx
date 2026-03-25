"use client";
import { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import LogoLoop from "./LogoLoop";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Handshake,
  ChartBarDecreasing,
  CircleCheck,
} from "lucide-react";

const cityList = [
  "Aberaeron",
  "Aberdare",
  "Aberdeen",
  "Aberfeldy",
  "Abergavenny",
  "Abergele",
  "Aberpwll",
  "Abertillery",
  "Aberystwyth",
  "Abingdon",
  "Accrington",
  "Airdrie",
  "Alderley",
  "Alderminster",
  "Alexandria",
  "Alfreton",
  "Alloa",
  "Alton",
  "Altrincham",
  "Alva",
  "Anlaby",
  "Antrim",
  "Arbroath",
  "Armagh",
  "Arundel",
  "Ascot",
  "Ashford",
  "Ashton-under-Lyne",
  "Astwood",
  "Aughnacloy",
  "Avon",
  "Axbridge",
  "Aylesbury",
  "Ayr",
  "Bacup",
  "Bala",
  "Ballycastle",
  "Ballyclare",
  "Ballymena",
  "Ballymoney",
  "Ballynahinch",
  "Banbridge",
  "Banchory",
  "Bangor",
  "Banstead",
  "Banwell",
  "Bargoed",
  "Barking",
  "Barnet",
  "Barnoldswick",
  "Barnsley",
  "Barrow-upon-Humber",
  "Barry",
  "Barton-upon-Humber",
  "Basildon",
  "Basingstoke",
  "Bath",
  "Bathgate",
  "Batley",
  "Battle",
  "Beaconsfield",
  "Bebington",
  "Beckenham",
  "Bedale",
  "Bedford",
  "Bedfordshire",
  "Beds",
  "Bedworth",
  "Belfast",
  "Bellshill",
  "Belper",
  "Bembridge",
  "Benfleet",
  "Berkhamsted",
  "Berwick-upon-Tweed",
  "Beverley",
  "Bexhill-on-Sea",
  "Bexley",
  "Bexleyheath",
  "Biggar",
  "Biggleswade",
  "Billericay",
  "Billingham",
  "Bilston",
  "Bingley",
  "Birkenhead",
  "Birmingham",
  "Bishop",
  "Bishopton",
  "Blackburn",
  "Blackpool",
  "Blackwood",
  "Blaenau",
  "Blairgowrie",
  "Blyth",
  "Bodorgan",
  "Boldon",
  "Bolton",
  "Bo'ness",
  "Bonnybridge",
  "Bonnyrigg",
  "Bootle",
  "Borehamwood",
  "Borth",
  "Boston",
  "Bournemouth",
  "BOXSTART",
  "Bracknell",
  "Bradford",
  "Brechin",
  "Brentford",
  "Brentwood",
  "Bretton",
  "Bridge",
  "Bridgend",
  "Bridgnorth",
  "Bridgwater",
  "Brierley",
  "Brigg",
  "Brighouse",
  "Brighton",
  "Brinkworth",
  "Bristol",
  "Broadstone",
  "Bromley",
  "Bromsgrove",
  "Brough",
  "Broughshane",
  "Broughton",
  "Broxburn",
  "Bryngwran",
  "Buckie",
  "Buckingham",
  "Buckley",
  "Burgess",
  "Burnley",
  "Burton-on-Trent",
  "Bury",
  "Bushey",
  "Caernarfon",
  "Caerphilly",
  "Caldicot",
  "Callander",
  "Callington",
  "Cambridge",
  "Canford",
  "Canterbury",
  "Cardiff",
  "Cardigan",
  "Carmarthen",
  "Carmarthenshire",
  "Carnoustie",
  "Carrickfergus",
  "Carshalton",
  "Castlederg",
  "Castleford",
  "Castlewellan",
  "Chalfont",
  "Chatham",
  "Cheadle",
  "Chelmsford",
  "Cheltenham",
  "Chepstow",
  "Chesham",
  "Chester",
  "Chesterfield",
  "Chester-le-Street",
  "Chichester",
  "Chigwell",
  "Chippenham",
  "Chipping",
  "Chislehurst",
  "Chorley",
  "Christchurch",
  "Cirencester",
  "Clackmannan",
  "Cleckheaton",
  "Cleethorpes",
  "Clevedon",
  "Clitheroe",
  "Clogher",
  "Clydebank",
  "Coatbridge",
  "Cockermouth",
  "Colchester",
  "Coleraine",
  "Colne",
  "Colwyn",
  "Congleton",
  "Connah's",
  "Consett",
  "Conwy",
  "Cookstown",
  "Corby",
  "Cornwall",
  "Corwen",
  "Cottingham",
  "Coulsdon",
  "Coventry",
  "Cowbridge",
  "Cowes",
  "Cradley",
  "Craigavon",
  "Cramlington",
  "Cranbrook",
  "Crawley",
  "Crewe",
  "Crook",
  "Cross",
  "Crowborough",
  "Crowthorne",
  "Croydon",
  "Crumlin",
  "Cumnock",
  "Cwmbran",
  "Dagenham",
  "Dalkeith",
  "Dalry",
  "Darlington",
  "Dartford",
  "Darvel",
  "Darwen",
  "Deeside",
  "Denbigh",
  "Denny",
  "Derby",
  "Dereham",
  "Devizes",
  "Dewsbury",
  "Didcot",
  "Dinas",
  "Dolgellau",
  "Dollar",
  "Doncaster",
  "Dorchester",
  "Downpatrick",
  "Driffield",
  "Drumquin",
  "Dudley",
  "Dukinfield",
  "Dumbarton",
  "Dumfries",
  "Dunbar",
  "Dunblane",
  "Dundee",
  "Dunfermline",
  "Dungannon",
  "Dunoon",
  "Dunstable",
  "Durham",
  "Ealing",
  "East",
  "Eastbourne",
  "Eastleigh",
  "Ebbw",
  "Edgware",
  "Edinburgh",
  "Elgin",
  "Elland",
  "Ellesmere",
  "ELY",
  "EMCRF",
  "Enfield",
  "Enniskillen",
  "Epsom",
  "Erith",
  "Everlast",
  "Falkirk",
  "Falmouth",
  "Fareham",
  "Farnborough",
  "Farnham",
  "Ferryhill",
  "Flint",
  "Fochabers",
  "Forest",
  "Forfar",
  "Forres",
  "Frampton",
  "Freshwater",
  "Frodsham",
  "Gaerwen",
  "Gainsborough",
  "Gateshead",
  "Gerrards",
  "Gillingham",
  "Girvan",
  "Glasgow",
  "Glenrothes",
  "Glossop",
  "Gloucester",
  "Goole",
  "Gorebridge",
  "Gourock",
  "Grangemouth",
  "Gravesend",
  "Grays",
  "Great",
  "Greenhithe",
  "Greenock",
  "Grimsby",
  "Guisborough",
  "Gullane",
  "Gwynedd",
  "Haddington",
  "Hailsham",
  "Halesowen",
  "Halifax",
  "Hamilton",
  "Hampton",
  "Harlow",
  "Harpenden",
  "Harrogate",
  "Harrow",
  "Hartlepool",
  "Hassocks",
  "Hastings",
  "Hatfield",
  "Havant",
  "Haverfordwest",
  "Hawick",
  "Hayes",
  "Haywards",
  "HBTherapy",
  "Heanor",
  "Heathfield",
  "Hebden",
  "Helensburgh",
  "Helston",
  "Hemel",
  "Hengoed",
  "Henley-on-Thames",
  "Henlow",
  "Hereford",
  "Hertford",
  "Hessle",
  "Heywood",
  "High",
  "Hillsborough",
  "Hitchin",
  "hollow",
  "Holmfirth",
  "Holyhead",
  "Holywell",
  "Holywood",
  "Horley",
  "Hornchurch",
  "Horsham",
  "Houghton",
  "Hounslow",
  "Hove",
  "Hoylake",
  "Huddersfield",
  "Hull",
  "Hungerford",
  "Huntingdon",
  "Hyde",
  "Ilford",
  "Ilkley",
  "Immingham",
  "Inverness",
  "Irvine",
  "Isle",
  "Isleworth",
  "Jarrow",
  "Keighley",
  "Keith",
  "Kelso",
  "Kenilworth",
  "Kent",
  "Keston",
  "Kettering",
  "Kilgetty",
  "Kilmacolm",
  "Kilmarnock",
  "Kilrea",
  "Kilsyth",
  "Kilwinning",
  "Kings",
  "Kingston",
  "Kinross",
  "Kirkcaldy",
  "Kirkwall",
  "Kirriemuir",
  "Knaresborough",
  "Knottingley",
  "Knutsford",
  "Lampeter",
  "Lanark",
  "Lancaster",
  "Larbert",
  "Larkhall",
  "Larne",
  "Latchmeads",
  "Lauder",
  "Launceston",
  "Leamington",
  "Leeds",
  "Leicester",
  "Leicestershire",
  "Leigh",
  "Leigh-on-Sea",
  "Leighton",
  "Letchworth",
  "Lewes",
  "Leyland",
  "Limavady",
  "Lincoln",
  "Linlithgow",
  "Lisburn",
  "Liskeard",
  "Littleborough",
  "Littlehampton",
  "Liverpool",
  "Liversedge",
  "Livingston",
  "Llandrindod",
  "Llandudno",
  "Llandysul",
  "Llanelli",
  "Llanfairfechan",
  "Llanfairpwllgwyngyll",
  "Llangefni",
  "Llangollen",
  "Llannerch-y-medd",
  "Llanrwst",
  "Llanybydder",
  "Loanhead",
  "London",
  "Londonderry",
  "Longhope",
  "Lossiemouth",
  "Lostwithiel",
  "Loughborough",
  "Luton",
  "Lydney",
  "Lymm",
  "Lytham",
  "Macclesfield",
  "Maesteg",
  "Maghera",
  "Magherafelt",
  "Maidenhead",
  "Maidstone",
  "Maldon",
  "Malmesbury",
  "Manchester",
  "Marlborough",
  "Marlow",
  "Matlock",
  "Mauchline",
  "Maulden",
  "Mayfield",
  "Melksham",
  "Melrose",
  "Melton",
  "Menai",
  "Merseyside",
  "Merthyr",
  "Mexborough",
  "Middlesbrough",
  "Middlewich",
  "Milton",
  "Mirfield",
  "Mitcham",
  "Moffat",
  "Mold",
  "Monmouth",
  "Montrose",
  "Morpeth",
  "Motherwell",
  "Mountain",
  "Much",
  "Musselburgh",
  "Nailsworth",
  "Nantwich",
  "Narberth",
  "Neath",
  "Nelson",
  "New",
  "Newbury",
  "Newcastle",
  "Newcastle-under-Lyme",
  "Newhaven",
  "Newmarket",
  "Newmilns",
  "Newport",
  "Newquay",
  "Newry",
  "Newton",
  "Newton-le-Willows",
  "Newtownabbey",
  "Newtownards",
  "Newtownstewart",
  "Ninewells",
  "Normanton",
  "North",
  "Northampton",
  "Northwich",
  "Northwood",
  "Norwich",
  "Nottingham",
  "Oakham",
  "Oldbury",
  "Oldham",
  "Omagh",
  "Orkney",
  "Ormskirk",
  "Orpington",
  "Ossett",
  "Oswestry",
  "Otley",
  "Oxford",
  "Paisley",
  "parking",
  "Pathhead",
  "Peacehaven",
  "Peasedown",
  "Pembroke",
  "Penarth",
  "Pentraeth",
  "Penzance",
  "Perth",
  "Peterborough",
  "Peterculter",
  "Peterlee",
  "Pinner",
  "Plymouth",
  "Pontefract",
  "Pontyclun",
  "Pontypool",
  "Pontypridd",
  "Poole",
  "Port",
  "Porth",
  "Porthcawl",
  "Porthmadog",
  "Portsmouth",
  "Portstewart",
  "Potters",
  "Poulton-le-Fylde",
  "Prescot",
  "Prestatyn",
  "Preston",
  "Prestonpans",
  "Prestwick",
  "Pudsey",
  "Purfleet",
  "Purley",
  "Pwllheli",
  "Radstock",
  "Rainford",
  "Rainham",
  "Rayleigh",
  "Reading",
  "Redcar",
  "Redruth",
  "Renfrew",
  "Rhosneigr",
  "Rhyl",
  "Richmond",
  "Ringwood",
  "Robertsbridge",
  "Rochdale",
  "Rochester",
  "Romford",
  "Romsey",
  "Rossendale",
  "Ross-on-Wye",
  "Rotherham",
  "Rowlands",
  "Royal",
  "Rugby",
  "Ruislip",
  "Runcorn",
  "Ruthin",
  "Ryde",
  "Rye",
  "Saint",
  "Sale",
  "Salford",
  "Salisbury",
  "Saltburn-by-the-Sea",
  "Saltcoats",
  "Sandbach",
  "Sandown",
  "Scunthorpe",
  "Seaford",
  "Seaham",
  "Selby",
  "Sevenoaks",
  "Shanklin",
  "Sheffield",
  "Shefford",
  "Shetland",
  "Shipley",
  "Shoreham-by-Sea",
  "Shotts",
  "Shrewsbury",
  "Sidcup",
  "Silsoe",
  "Sittingbourne",
  "Skegness",
  "Skelmorlie",
  "Skipton",
  "Slough",
  "Smethwick",
  "Snodland",
  "Solihull",
  "South",
  "Southall",
  "Southampton",
  "Southend-on-Sea",
  "Southport",
  "Southsea",
  "Sowerby",
  "Spilsby",
  "St",
  "St.",
  "Stafford",
  "Staines",
  "Stalybridge",
  "Stamford",
  "Stanford-le-Hope",
  "Stanley",
  "Stanmore",
  "Stevenage",
  "Stirling",
  "Stockbridge",
  "Stockport",
  "Stockton-on-Tees",
  "Stoke-on-Trent",
  "Stornoway",
  "Stourbridge",
  "Strabane",
  "Stranraer",
  "Stratford-upon-Avon",
  "Strathaven",
  "Stretford",
  "Stromness",
  "Stroud",
  "Sunderland",
  "Surbiton",
  "Sutton",
  "Swadlincote",
  "Swansea",
  "Swindon",
  "Symington",
  "Tarbert",
  "Tarporley",
  "Teddington",
  "Telford",
  "Tetbury",
  "Thatcham",
  "The",
  "Thornton",
  "Thornton-Cleveleys",
  "Thurrock",
  "Tipton",
  "Todmorden",
  "Tonbridge",
  "Tonypandy",
  "Topiary",
  "Totland",
  "Tranent",
  "Treorchy",
  "Trimdon",
  "Troon",
  "Trowbridge",
  "Truro",
  "Tunbridge",
  "Twickenham",
  "Tyn-y-Gongl",
  "Uckfield",
  "UK",
  "Ulceby",
  "Upminster",
  "Uxbridge",
  "Ventnor",
  "Wakefield",
  "Wallasey",
  "Wallingford",
  "Wallington",
  "Wallsend",
  "Walsall",
  "Ware",
  "Warlingham",
  "Warrington",
  "Warwick",
  "Washington",
  "Waterlooville",
  "Wednesbury",
  "Welling",
  "Wells",
  "Wembley",
  "Wemyss",
  "West",
  "Westbury",
  "Westcliff-on-Sea",
  "Westerham",
  "Westhill",
  "Weston-super-Mare",
  "Wetherby",
  "Wexham",
  "Whitchurch",
  "Whitehaven",
  "Whitley",
  "Whitstable",
  "Wickford",
  "Widnes",
  "Wigan",
  "Wigston",
  "Willenhall",
  "Wilmslow",
  "Wimborne",
  "Winchester",
  "Windsor",
  "Wingate",
  "Winscombe",
  "Winsford",
  "Wirral",
  "Wishaw",
  "Witham",
  "WN58RR",
  "Wokingham",
  "Wolverhampton",
  "Wood",
  "Woodford",
  "Worcester",
  "Worthing",
  "Wotton-under-Edge",
  "Wrexham",
  "Y",
  "Yarm",
  "Yeovil",
  "York",
];

const cityItems: {
  node: React.ReactNode;
}[] = cityList.map((city) => ({
  node: (
    <Link
      href={`/clinics/${city.toLowerCase()}`}
      className="flex items-center justify-center bg-[var(--alabaster)] border border-gray-300 rounded-full w-44 h-44 text-lg text-center font-medium hover:border-black transition-shadow"
      title={`Find Top-Rated Aesthetic clinics in ${city}`}
      aria-label={`Find Top-Rated Aesthetic clinics in ${city}`}
    >
      {city}
    </Link>
  ),
}));

const imageLogos = [
  {
    src: "/directory/HIS.jpg",
    alt: "HIS",
    href: "https://www.healthcareimprovementscotland.scot/",
  },
  { src: "/directory/HIW.jpg", alt: "HIW", href: "https://www.hiw.org.uk" },
  { src: "/directory/jccp.jpg", alt: "JCCP", href: "https://www.jccp.org.uk/" },
  { src: "/directory/qcc.jpg", alt: "CQC", href: "https://cqc.org.uk" },
  { src: "/directory/rqia.jpg", alt: "RQIA", href: "https://www.rqia.org.uk/" },
  {
    src: "/directory/save-face-partner.jpg",
    alt: "Save Face",
    href: "https://www.saveface.co.uk/",
  },
];

const specialists = [
  {
    name: "Facial Aesthetics",
    image: "directory/images/Facial Aesthetics Specialist.webp",
    url: "/treatments/Facial%20Treatments",
  },
  {
    name: "Cosmetology",
    image: "directory/images/Cosmetology Specialist.webp",
    url: "/treatments/Lips",
  },
  {
    name: "Hair & Scalp",
    image: "directory/images/Hair & Scalp Specialist.webp",
    url: "/treatments/Hair%20Treatments",
  },
  {
    name: "Skin Technology & Laser",
    image: "directory/images/Skin Technology & Laser Specialist.webp",
    url: "/treatments/Skin%20Booster",
  },
  {
    name: "Wellness",
    image: "directory/images/Wellness Specialist.webp",
    url: "/treatments/Massage",
  },
];

const treatments = [
  { name: "Facial", image: "directory/images/Facial Treatment.webp", url: "/treatments/Facial%20Treatments" },
  { name: "Massage", image: "directory/treatments/massage.webp", url: "/treatments/Massage" },
  { name: "Lips", image: "directory/treatments/lips.webp", url: "/treatments/Lips" },
  { name: "Skin", image: "directory/images/Skin Treatment.webp", url: "/treatments/Skin%20Booster" },
  { name: "Hairline", image: "directory/images/Hairline Treatment.webp", url: "/treatments/Hair%20Treatments" },
];

const blogs = [
  {
    id: 1,
    title: "10 Best HIPAA Compliant Medical Spa Software in 2025",
    img: "/directory/images/HIPAA-Compliant-Medical-Spa-Software-768x432.webp",
    link: "https://www.consentz.com/hipaa-compliant-medical-spa-software",
  },
  {
    id: 2,
    title: "Top 10 Clinical Data Management Software Solutions in the USA",
    img: "/directory/images/Top-Clinical-Data-Management-Software-in-the-USA.webp",
    link: "https://www.consentz.com/clinical-data-management-software",
  },
  {
    id: 3,
    title: "Aesthetic Clinic Marketing: Complete Guide [2025]",
    img: "/directory/images/Aesthetic-Clinic-Marketing-Guide-1536x864.webp",
    link: "https://www.consentz.com/aesthetic-clinic-marketing",
  },
];

const faqData = [
  {
    q: "What is the Consentz Aesthetic Directory?",
    a: "The Consentz Aesthetic Directory is a verified platform within our clinic management system that connects patients with certified aesthetic and healthcare professionals. It allows patients to discover verified providers, read authentic reviews, and book appointments with confidence.",
  },
  {
    q: "How is the directory different from the clinic management software?",
    a: "The Consentz Directory is one component of our comprehensive platform. While our clinic management software helps practitioners run their businesses, the directory helps patients find and connect with these verified aesthetic professionals for treatments.",
  },
  {
    q: "Who can be listed in the directory?",
    a: "Only verified, certified aesthetic and healthcare professionals who use Consentz clinic management software can be listed. All providers are vetted to ensure they meet regulatory standards and maintain proper certifications.",
  },
  {
    q: "What specialties are featured in the directory?",
    a: "The directory includes specialists in: Facial Aesthetics, Dermatology, Hair & Scalp treatments, Skin Technology & Laser procedures, and Wellness services.",
  },
  {
    q: "How do I search for treatments?",
    a: "Browse our 'Most Popular Treatments' section featuring face, neck, eyes, skin, and jawline procedures, or click 'See all Treatments' to explore the complete range of aesthetic services available through our verified providers.",
  },
];

const ITEMS_PER_PAGE = 9;

export default function HomePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number | null) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main>
      <HeroSection />
      <section className="bg-white-50 py-15 md:py-20" aria-labelledby="specialists-heading">
        <h2 id="specialists-heading" className="sr-only">Contact a Specialist</h2>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-16">
            Contact a Specialist
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 align-items-center">
            {specialists.map((specialist, index) => (
              <article key={index} className="flex flex-col items-center gap-4">
                <Link
                  href={specialist.url}
                  className="flex flex-col items-center gap-4 hover:opacity-90"
                  title={`Explore ${specialist.name} treatments`}
                  aria-label={`Explore ${specialist.name} treatments`}
                >
                  <div className="flex items-center justify-center transition">
                    <img
                      src={`/${specialist.image || "placeholder.svg"}`}
                      alt={specialist.name || "Placeholder"}
                      className="w-[100px] h-[100px] object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-base font-medium text-center">
                    {specialist.name}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white-50 py-5 md:py-5">
        <h2 className="text-xl md:text-3xl font-bold text-center mb-16">
        Find Top-Rated Aesthetic Clinics Near You
        </h2>
        <div className="w-full">
          <LogoLoop
            logos={cityItems}
            speed={50}
            direction="left"
            gap={16}
            pauseOnHover={true}
            scaleOnHover={false}
            width="100%"
          />
        </div>
      </section>
      {/* Most Popular Treatments */}
      <section className="py-15 md:py-20 relative" aria-labelledby="treatments-heading">
        <h2 id="treatments-heading" className="sr-only">Most Popular Treatments</h2>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center flex-col justify-between mb-12">
            <h2 className="text-xl md:text-4xl font-bold text-center mb-10">
              Most Popular Treatments
            </h2>

          </div>
          <div className="relative flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 justify-items-center items-center gap-4 pb-4 w-full">
              {treatments.map((treatment, index) => (
                <article key={index} className="flex-shrink-0">
                  <div
    className="mx-auto
               w-32 aspect-square
               rounded-full overflow-hidden"
  >               <Link href={treatment.url}>
                  <img
                   
                    src={`/${treatment.image || "/placeholder.svg"}`}
                    alt={treatment.name}
                    className="w-32 h-32 md:w-38 md:h-38 lg:w-45 lg:h-45 ml-auto mr-auto object-cover object-center rounded-lg"
                  /></Link></div>
                  <p className="mt-4 text-base font-medium text-center">
                    {treatment.name}
                  </p>
                </article>
              ))}
            </div>
            <Button
  asChild
  className="bg-[var(--text-color)] hover:bg-black
                         h-auto rounded-lg text-lg px-7 py-3 text-white cursor-pointer"
>
  <Link href="/treatments">
    See all Treatments
  </Link>
</Button>

          </div>



         </div>
       </section>
      <section className="py-10 md:py-15 relative" aria-labelledby="regulatory-heading">
        <h2 id="regulatory-heading" className="sr-only">Trusted Regulatory Partners</h2>
        <LogoLoop
          logos={imageLogos}
          speed={100}
          direction="left"
          logoHeight={48}
          gap={40}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="#ffffff"
          ariaLabel="Regulatory Compliance"
          className="py-10 md:py-15 relative"
        />
      </section>
      {/* Trust Section */}
      <section className="py-15 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            Building trust and clarity in healthcare
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-12">
            {[
              {
                icon: Handshake,
                title: "Our commitment",
                desc: "We deliver a home to real ethical professionals. All professionals boast on our platform are verified and trusted by patients.",
              },
              {
                icon: ChartBarDecreasing,
                title: "Insight that matters",
                desc: "We ensure that patient reviews are genuine, with verified services with confidence by providing transparent information.",
              },
              {
                icon: CircleCheck,
                title: "Safe & reliable",
                desc: "We protect your data and ensure secure medical quality information is secured and protected from abuse, helping them.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="info-card bg-[var(--alabaster)] border-1 border-[var(--alto)] rounded-xl py-8 px-6 md:py-12 md:px-8 flex items-center flex-col"
              >
                <item.icon className="w-12 h-12 mb-8 hidden md:flex" />
                <h3 className="font-bold text-lg mb-4">{item.title}</h3>
                <p className="text-base font-normal text-center text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* For Service Providers Section */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-2 items-center">
            <div>
              <h2 className="text-lg md:text-3xl text-center md:text-left md:text-4xl font-bold mb-7">
                For Service Providers
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 items-start">
                  <CircleCheck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-base">
                    Gather verified patient reviews with our digital platform.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <CircleCheck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-base">
                    Showcase and validate your clinical expertise.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <CircleCheck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-base">
                    Connect, engage, and better understand your patients.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <CircleCheck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-base">
                    Access real-time insights to continually enhance your care.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <CircleCheck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-base">
                    Connect with like-minded healthcare professionals.
                  </span>
                </li>
              </ul>
              <div className="text-center md:text-left mb-10 md:mb-0">
                <Button className="bg-[var(--text-color)] hover:bg-black h-auto rounded-lg text-lg px-7 py-3 text-white">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/Aesthetic Software Interface.webp"
                alt="Healthcare dashboard on laptop"
                className="max-w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started CTA Section */}
      <section className="bg-[var(--dune)] py-20 text-white hidden">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300">
              Join over 250+ clinics already growing with Consentz
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-gray-200">
            BOOK DEMO
          </Button>
        </div>
      </section>

      {/* Latest blogs */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12" aria-labelledby="blog-heading">
        {/* Header */}
        <h2 id="blog-heading" className="sr-only">Our Latest Blogs</h2>
        <div className="max-w-3xl mb-10">
          <h2 className="text-lg md:text-3xl text-center md:text-left md:text-4xl font-bold mb-6">
            Our Latest Blogs
          </h2>
          <p className="text-gray-700 text-base leading-relaxed">
            Explore insights and tips to help you manage and grow your
            aesthetics clinic efficiently. Stay informed with our latest
            articles.
          </p>
        </div>

        {/* Blog cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(({ id, title, img, link }) => (
            <article
              key={id}
              className="bg-gray-100 border border-gray-400 rounded-xl p-6 relative overflow-hidden"
            >
              <a href={link} className="block">
                <img
                  src={img}
                  alt={title}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </a>

              <div className="mt-5">
                <a
                  href={link}
                  className="text-gray-900 underline hover:text-gray-700"
                >
                  {title}
                </a>

                <a
                  href={link}
                  className="block mt-4 underline hover:text-gray-700"
                >
                  Read More &rarr;
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="flex align-items-center justify-center pt-6 mt-6 mb-4">
          <Button
            onClick={() => globalThis.location.href='https://www.consentz.com/blog'}
            className="bg-[var(--text-color)] hover:bg-black h-auto rounded-lg text-lg px-7 py-3 text-white cursor-pointer"
          >
            View All Blogs
          </Button>
        </div>
      </section>
      {/* FAQ */}
      <section className="max-w-4xl mx-auto pt-4 pb-20 px-6" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-lg md:text-3xl text-center md:text-4xl font-bold mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Find quick answers to common questions about the Consentz Aesthetic
          Directory.
        </p>

        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <details
                key={index}
                open={isOpen}
                onToggle={() => toggleFAQ(index)}
                className="border border-gray-300 rounded-3xl p-4 transition-all duration-300"
              >
                <summary className="w-full flex items-center gap-4 text-left text-lg font-semibold cursor-pointer flex flex-row flex-wrap pl-10 relative list-none">
                  <span className="text-2xl font-normal text-center w-7 h-7 rounded-full leading-6 text-black transition-all select-none bg-black text-white absolute left-0">
                    {isOpen ? "−" : "+"}
                  </span>
                  <span className="font-medium">{item.q}</span>
                </summary>

                <div className="mt-4">
                  <p className="text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              </details>
            );
          })}
        </div>
        <div className="flex align-items-center justify-center pt-6 mt-6 mb-4">
          <Button
            onClick={() => globalThis.location.href='https://www.consentz.com/faqs/'}
            className="bg-[var(--text-color)] hover:bg-black h-auto rounded-lg text-lg px-7 py-3 text-white cursor-pointer"
          >
            Read All FAQ'S
          </Button>
        </div>
      </section>
    </main>
  );
}
