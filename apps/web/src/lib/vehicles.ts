export type VehicleImageStatus = "verified" | "pending";

export type VehicleMedia = {
  src: string | null;
  alt: string;
  status: VehicleImageStatus;
  label?: string;
};

export type VehicleCtas = {
  primary: string;
  secondary: string;
  tertiary?: string;
};

export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number | null;
  priceLabel?: string;
  miles: number;
  location: string;
  primaryImage: VehicleMedia;
  galleryImages: VehicleMedia[];
  drivetrain: string;
  engine: string;
  horsepower: number;
  transmission: string;
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  conditionClass: string;
  rarityTier: string;
  verificationStatus: string;
  acquisitionStatus: string;
  conciergeAvailability: string;
  listingBadge: string;
  editorialHeadline: string;
  description: string;
  wowFactors: string[];
  ctas: VehicleCtas;
  collectionTags: string[];
  sellerSince: string;
  imageVerificationNote?: string;
  availabilityBadge: string;
  verifiedBadge: string;
  badge: string;
  color: string;
  conciergeStatus: string;
  performance: string;
  image: string | null;
};

function buildGallery(make: string, model: string, status: VehicleImageStatus, labels: string[]): VehicleMedia[] {
  return labels.map((label) => ({
    src: null,
    alt: `${make} ${model} ${label}`,
    status,
    label,
  }));
}

function createVehicle(input: Omit<Vehicle, "badge" | "color" | "conciergeStatus" | "performance" | "image">): Vehicle {
  return {
    ...input,
    badge: input.listingBadge,
    color: input.exteriorColor,
    conciergeStatus: input.conciergeAvailability,
    performance: `${input.horsepower} hp · ${input.engine}`,
    image: input.primaryImage.src,
  };
}

export const FEATURED_VEHICLES: Vehicle[] = [
  createVehicle({
    id: "bugatti-chiron-sport-2023",
    year: 2023,
    make: "Bugatti",
    model: "Chiron",
    trim: "Sport",
    price: 3895000,
    miles: 312,
    location: "Scottsdale, Arizona",
    primaryImage: {
      src: null,
      alt: "2023 Bugatti Chiron Sport image verification pending",
      status: "pending",
      label: "Primary image verification pending",
    },
    galleryImages: buildGallery("Bugatti", "Chiron Sport", "pending", [
      "Front three-quarter verification pending",
      "Interior verification pending",
      "Rear profile verification pending",
    ]),
    drivetrain: "AWD",
    engine: "8.0L quad-turbo W16",
    horsepower: 1479,
    transmission: "7-speed dual-clutch",
    exteriorColor: "Nocturne Blue carbon",
    interiorColor: "Beluga black / French racing blue",
    vin: "VF9SP3V31PM795412",
    conditionClass: "Collector-grade",
    rarityTier: "Ultra Rare",
    verificationStatus: "Verified listing",
    acquisitionStatus: "Private access",
    conciergeAvailability: "Dedicated concierge",
    listingBadge: "Flagship hypercar",
    editorialHeadline: "A collector-grade W16 allocation with hypercar final-era gravity.",
    description:
      "Presented as a private acquisition file with verified listing posture, concierge review, and an ownership profile built for clients who care about scarcity, replacement difficulty, and quiet confidence.",
    wowFactors: [
      "Quad-turbo W16 provenance with final-era hypercar significance",
      "Collector-grade mileage and private-acquisition posture",
      "Verification-led presentation before access is opened",
    ],
    ctas: {
      primary: "Request Private Access",
      secondary: "View Details",
      tertiary: "Request Appraisal / Trade",
    },
    collectionTags: ["Ultra Rare", "Investment Grade", "Private Access", "New Arrivals"],
    sellerSince: "2024",
    imageVerificationNote: "Image verification pending. Photography will only appear after vehicle-media confirmation.",
    availabilityBadge: "Private access",
    verifiedBadge: "Verified",
  }),
  createVehicle({
    id: "lamborghini-huracan-sterrato-2024",
    year: 2024,
    make: "Lamborghini",
    model: "Huracan",
    trim: "Sterrato",
    price: 412500,
    miles: 684,
    location: "Miami, Florida",
    primaryImage: {
      src: null,
      alt: "2024 Lamborghini Huracan Sterrato image verification pending",
      status: "pending",
      label: "Primary image verification pending",
    },
    galleryImages: buildGallery("Lamborghini", "Huracan Sterrato", "pending", [
      "Exterior verification pending",
      "Cockpit verification pending",
      "Rear detail verification pending",
    ]),
    drivetrain: "AWD",
    engine: "5.2L naturally aspirated V10",
    horsepower: 602,
    transmission: "7-speed dual-clutch",
    exteriorColor: "Verde Gea matte",
    interiorColor: "Nero Ade / Verde Sterrato",
    vin: "ZHWUF6ZF7RLA19624",
    conditionClass: "Delivery-mile",
    rarityTier: "Track Focused",
    verificationStatus: "Verified listing",
    acquisitionStatus: "Available now",
    conciergeAvailability: "Dedicated concierge",
    listingBadge: "New arrival",
    editorialHeadline: "An all-terrain V10 sendoff with collector-theater and genuine rarity.",
    description:
      "This Sterrato is positioned for buyers who want naturally aspirated drama with a specification that feels more like a closing chapter than another Huracan derivative.",
    wowFactors: [
      "Naturally aspirated V10 with final-generation Lamborghini character",
      "Rally-raised stance that stands apart from standard supercar inventory",
      "High-visibility collector appeal without losing daily usability",
    ],
    ctas: {
      primary: "Request Private Access",
      secondary: "View Details",
      tertiary: "Request Appraisal / Trade",
    },
    collectionTags: ["Track Focused", "New Arrivals", "Private Access"],
    sellerSince: "2025",
    imageVerificationNote: "Image verification pending. Incorrect cross-brand imagery has been removed from this listing.",
    availabilityBadge: "Available",
    verifiedBadge: "Verified",
  }),
  createVehicle({
    id: "porsche-911-gt3-rs-2024",
    year: 2024,
    make: "Porsche",
    model: "911",
    trim: "GT3 RS",
    price: 468900,
    miles: 128,
    location: "Newport Beach, California",
    primaryImage: {
      src: null,
      alt: "2024 Porsche 911 GT3 RS image verification pending",
      status: "pending",
      label: "Primary image verification pending",
    },
    galleryImages: buildGallery("Porsche", "911 GT3 RS", "pending", [
      "Cabin image pending",
      "Aero detail pending",
      "Rear wing detail pending",
    ]),
    drivetrain: "RWD",
    engine: "4.0L naturally aspirated flat-six",
    horsepower: 518,
    transmission: "7-speed PDK",
    exteriorColor: "Arctic Grey",
    interiorColor: "Black leather / Race-Tex guards red",
    vin: "WP0AF2A94RS260188",
    conditionClass: "Collector-grade",
    rarityTier: "Track Focused",
    verificationStatus: "Verified listing",
    acquisitionStatus: "Available now",
    conciergeAvailability: "Track-side concierge",
    listingBadge: "Driver-spec",
    editorialHeadline: "A motorsport-derived aero statement for buyers who want precision over spectacle.",
    description:
      "Configured for the client who understands why the GT3 RS matters: high-revving character, chassis credibility, and a market profile that rewards disciplined specification.",
    wowFactors: [
      "Track-focused aero package with real circuit intent",
      "High-revving motorsport DNA in a collector-friendly specification",
      "Verified acquisition profile for serious driver-collectors",
    ],
    ctas: {
      primary: "Request Private Access",
      secondary: "View Details",
      tertiary: "Request Appraisal / Trade",
    },
    collectionTags: ["Track Focused", "Investment Grade", "New Arrivals"],
    sellerSince: "2024",
    imageVerificationNote: "Image verification pending. Supplemental photography is being normalized before publication.",
    availabilityBadge: "Available",
    verifiedBadge: "Verified",
  }),
  createVehicle({
    id: "ferrari-812-gts-2022",
    year: 2022,
    make: "Ferrari",
    model: "812",
    trim: "GTS",
    price: 579000,
    miles: 1422,
    location: "Dallas, Texas",
    primaryImage: {
      src: null,
      alt: "2022 Ferrari 812 GTS image verification pending",
      status: "pending",
      label: "Primary image verification pending",
    },
    galleryImages: buildGallery("Ferrari", "812 GTS", "pending", [
      "Open-air roofline image pending",
      "Interior image pending",
      "Rear diffuser detail pending",
    ]),
    drivetrain: "RWD",
    engine: "6.5L naturally aspirated V12",
    horsepower: 789,
    transmission: "7-speed dual-clutch",
    exteriorColor: "Rosso Corsa",
    interiorColor: "Sabbia / Nero",
    vin: "ZFF97CMA9N0275418",
    conditionClass: "Low-mile",
    rarityTier: "Open-Air",
    verificationStatus: "Verified listing",
    acquisitionStatus: "Available now",
    conciergeAvailability: "Dedicated concierge",
    listingBadge: "Open-air V12",
    editorialHeadline: "A front-engined Ferrari V12 with theatrical delivery and collector credibility.",
    description:
      "For buyers who want the emotional weight of a naturally aspirated Ferrari flagship with the added ceremony of open-air ownership, this GTS is presented with verification-first confidence.",
    wowFactors: [
      "Naturally aspirated Ferrari V12 with open-top occasion factor",
      "Front-engine grand-touring flagship with collector-grade presence",
      "Curated specification that balances drama and long-term desirability",
    ],
    ctas: {
      primary: "Request Private Access",
      secondary: "View Details",
      tertiary: "Request Appraisal / Trade",
    },
    collectionTags: ["Open-Air", "Grand Touring", "Investment Grade"],
    sellerSince: "2023",
    imageVerificationNote: "Image verification pending. Gallery completion is in progress before live media publication.",
    availabilityBadge: "Available",
    verifiedBadge: "Verified",
  }),
  createVehicle({
    id: "mclaren-765lt-spider-2022",
    year: 2022,
    make: "McLaren",
    model: "765LT",
    trim: "Spider",
    price: 649500,
    miles: 938,
    location: "Las Vegas, Nevada",
    primaryImage: {
      src: null,
      alt: "2022 McLaren 765LT Spider image verification pending",
      status: "pending",
      label: "Primary image verification pending",
    },
    galleryImages: buildGallery("McLaren", "765LT Spider", "pending", [
      "Front image pending",
      "Carbon detail pending",
      "Open-air cockpit pending",
    ]),
    drivetrain: "RWD",
    engine: "4.0L twin-turbo V8",
    horsepower: 755,
    transmission: "7-speed dual-clutch",
    exteriorColor: "Saros grey",
    interiorColor: "Carbon black / orange accents",
    vin: "SBM14TCA0NW002417",
    conditionClass: "Collector-grade",
    rarityTier: "Ultra Rare",
    verificationStatus: "Concierge reviewed",
    acquisitionStatus: "Private access",
    conciergeAvailability: "Dedicated concierge",
    listingBadge: "Carbon-intensive flagship",
    editorialHeadline: "A longtail open-air specification with serious performance and scarcity posture.",
    description:
      "The 765LT Spider sits at the intersection of dramatic power-to-weight ratio, carbon-heavy construction, and acquisition rarity. This file is positioned for high-intent clients only.",
    wowFactors: [
      "Longtail performance profile with lightweight carbon emphasis",
      "Open-air delivery without losing the core LT aggression",
      "Private-access presentation suited to serious McLaren collectors",
    ],
    ctas: {
      primary: "Request Private Access",
      secondary: "View Details",
      tertiary: "Request Appraisal / Trade",
    },
    collectionTags: ["Ultra Rare", "Open-Air", "Private Access", "Track Focused"],
    sellerSince: "2024",
    imageVerificationNote: "Image verification pending. Photography is withheld until the media set is confirmed.",
    availabilityBadge: "Private access",
    verifiedBadge: "Concierge reviewed",
  }),
  createVehicle({
    id: "rolls-royce-ghost-black-badge-2023",
    year: 2023,
    make: "Rolls-Royce",
    model: "Ghost",
    trim: "Black Badge",
    price: 418000,
    miles: 2210,
    location: "Beverly Hills, California",
    primaryImage: {
      src: null,
      alt: "2023 Rolls-Royce Ghost Black Badge image verification pending",
      status: "pending",
      label: "Primary image verification pending",
    },
    galleryImages: buildGallery("Rolls-Royce", "Ghost Black Badge", "pending", [
      "Cabin image pending",
      "Rear lounge image pending",
      "Wheel detail pending",
    ]),
    drivetrain: "AWD",
    engine: "6.75L twin-turbo V12",
    horsepower: 591,
    transmission: "8-speed automatic",
    exteriorColor: "Diamond Black",
    interiorColor: "Ardent red / black",
    vin: "SCATD6C09PU214873",
    conditionClass: "Low-mile",
    rarityTier: "Grand Touring",
    verificationStatus: "Verified listing",
    acquisitionStatus: "Available now",
    conciergeAvailability: "White-glove concierge",
    listingBadge: "Executive flagship",
    editorialHeadline: "A blacked-out grand-touring flagship built for discreet arrival rather than noise.",
    description:
      "For buyers prioritizing serene power, rear-cabin ceremony, and street presence without public drama, this Ghost Black Badge carries the right tone and transaction profile.",
    wowFactors: [
      "Twin-turbo V12 serenity with Black Badge visual authority",
      "Executive-cabin presence suited to high-trust private ownership",
      "White-glove acquisition path for clients prioritizing discretion",
    ],
    ctas: {
      primary: "Request Private Access",
      secondary: "View Details",
      tertiary: "Request Appraisal / Trade",
    },
    collectionTags: ["Grand Touring", "Investment Grade", "Private Access"],
    sellerSince: "2023",
    imageVerificationNote: "Image verification pending. Interior photography will be expanded after staging review.",
    availabilityBadge: "Available",
    verifiedBadge: "Verified",
  }),
];

export function getVehicleById(id: string) {
  return FEATURED_VEHICLES.find((vehicle) => vehicle.id === id);
}

export function formatPrice(price: number | null) {
  if (price === null) {
    return "Private pricing";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
