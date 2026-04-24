export type Vehicle = {
  id: number;
  year: number;
  make: string;
  model: string;
  price: number;
  miles: number;
  color: string;
  image: string;
  badge: string;
  vin: string;
  description: string;
  sellerSince: number;
  rarityTier: string;
  verificationStatus: string;
  acquisitionStatus: string;
  conciergeStatus: string;
  conditionClass: string;
  drivetrain: string;
  performance: string;
  collectionTags: string[];
};

export const FEATURED_VEHICLES: Vehicle[] = [
  {
    id: 1,
    year: 2024,
    make: "Lamborghini",
    model: "Huracan Sterrato",
    price: 285000,
    miles: 1200,
    color: "Grigio Lynx",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80",
    badge: "NEW ARRIVAL",
    vin: "ZHWUF3ZD0MLA12345",
    description:
      "A limited-run off-road supercar with artistic presence, ready for private acquisition and bespoke delivery.",
    sellerSince: 2020,
    rarityTier: "Limited terrain series",
    verificationStatus: "Seller verified",
    acquisitionStatus: "New arrival review",
    conciergeStatus: "Concierge available",
    conditionClass: "Low-mile collector",
    drivetrain: "AWD V10",
    performance: "Rally-bred supercar geometry",
    collectionTags: ["New Arrivals", "Ultra Rare", "Open-Air"],
  },
  {
    id: 2,
    year: 2023,
    make: "Ferrari",
    model: "296 GTB",
    price: 390000,
    miles: 800,
    color: "Rosso Corsa",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80",
    badge: "VERIFIED",
    vin: "ZFFPY64A9R0234567",
    description:
      "Ultra-responsive V6 hybrid performance, curated for collectors who value route-winning agility and provenance.",
    sellerSince: 2019,
    rarityTier: "Hybrid performance allocation",
    verificationStatus: "Dealer reviewed",
    acquisitionStatus: "Private acquisition ready",
    conciergeStatus: "Concierge available",
    conditionClass: "Delivery-mile quality",
    drivetrain: "RWD hybrid V6",
    performance: "819 hp electrified response",
    collectionTags: ["Investment Grade", "Grand Touring", "All Collection"],
  },
  {
    id: 3,
    year: 2024,
    make: "Porsche",
    model: "911 GT3 RS",
    price: 248000,
    miles: 450,
    color: "GT Silver",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    badge: "EXCLUSIVE",
    vin: "WP0AC2A95RS123456",
    description:
      "A track-bred legend with aerodynamic precision and a restrained interior, offered off-market to qualified buyers.",
    sellerSince: 2021,
    rarityTier: "Track-focused allocation",
    verificationStatus: "Specialist reviewed",
    acquisitionStatus: "Qualified inquiry",
    conciergeStatus: "Concierge available",
    conditionClass: "Track prepared",
    drivetrain: "RWD flat-six",
    performance: "Motorsport aero package",
    collectionTags: ["Track Focused", "Investment Grade", "All Collection"],
  },
  {
    id: 4,
    year: 2022,
    make: "McLaren",
    model: "765LT Spider",
    price: 475000,
    miles: 2100,
    color: "Papaya Spark",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    badge: "VERIFIED",
    vin: "SBM14DCA3MW123456",
    description:
      "A drop-top supercar with hypercar-level performance and an intimate membership-only acquisition pathway.",
    sellerSince: 2018,
    rarityTier: "Longtail open-air",
    verificationStatus: "Seller verified",
    acquisitionStatus: "Private access",
    conciergeStatus: "Concierge available",
    conditionClass: "Enthusiast driven",
    drivetrain: "RWD twin-turbo V8",
    performance: "765PS longtail calibration",
    collectionTags: ["Open-Air", "Ultra Rare", "Private Access"],
  },
  {
    id: 5,
    year: 2024,
    make: "Rolls-Royce",
    model: "Spectre",
    price: 420000,
    miles: 300,
    color: "Arctic White",
    image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=80",
    badge: "BESPOKE",
    vin: "SCA1J8M02RUX12345",
    description:
      "A whisper-quiet, all-electric grand tourer that blends hand-finished luxury with an invitation-only customer experience.",
    sellerSince: 2022,
    rarityTier: "Bespoke electric GT",
    verificationStatus: "Dealer reviewed",
    acquisitionStatus: "Commission inquiry",
    conciergeStatus: "Concierge available",
    conditionClass: "Commission grade",
    drivetrain: "Dual-motor electric",
    performance: "Silent grand touring torque",
    collectionTags: ["Grand Touring", "Investment Grade", "All Collection"],
  },
  {
    id: 6,
    year: 2023,
    make: "Bugatti",
    model: "Chiron Sport",
    price: 3200000,
    miles: 180,
    color: "Nocturne Blue",
    image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=1200&q=80",
    badge: "RARE",
    vin: "VF9SA2MF8M1234567",
    description:
      "One of the most collectible hypercars on earth, delivered with discreet concierge service and secure handover.",
    sellerSince: 2017,
    rarityTier: "Hypercar reserve",
    verificationStatus: "Specialist reviewed",
    acquisitionStatus: "Private access only",
    conciergeStatus: "Dedicated concierge",
    conditionClass: "Museum-grade",
    drivetrain: "AWD quad-turbo W16",
    performance: "1,479 hp collector benchmark",
    collectionTags: ["Ultra Rare", "Investment Grade", "Private Access"],
  },
];

export function getVehicleById(id: string | number) {
  return FEATURED_VEHICLES.find((vehicle) => vehicle.id === Number(id));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
