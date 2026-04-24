"use client";

import { useMemo, useState } from "react";
import { colors, typography } from "@vex/design-system";
import { AutomotiveAtmosphere } from "@/components/atmosphere";
import { VehicleCard } from "@/components/VehicleCard";
import { CollectionNarrativeEngine } from "@/components/inventory/CollectionNarrativeEngine";
import { EditorialContainer, EditorialHeader, SectionShell } from "@/components/layout";
import { MotionReveal } from "@/components/site/MotionReveal";
import { FEATURED_VEHICLES, formatPrice } from "@/lib/vehicles";

const collectionTabs = [
  {
    label: "All",
    tag: "All",
    intro: "The complete VEX curated vault, organized for serious acquisition rather than casual browsing.",
  },
  {
    label: "Ultra Rare",
    tag: "Ultra Rare",
    intro: "Scarcity-led inventory where replacement difficulty and collector posture matter immediately.",
  },
  {
    label: "Investment Grade",
    tag: "Investment Grade",
    intro: "Vehicles framed around long-term desirability, specification quality, and exit confidence.",
  },
  {
    label: "Track Focused",
    tag: "Track Focused",
    intro: "Motorsport-bred machines selected for technical credibility and serious driver appeal.",
  },
  {
    label: "Grand Touring",
    tag: "Grand Touring",
    intro: "High-comfort exotic and luxury inventory suited to distance, ceremony, and private arrival.",
  },
  {
    label: "Open-Air",
    tag: "Open-Air",
    intro: "Spider and convertible inventory built around occasion, sound, and exposure.",
  },
  {
    label: "New Arrivals",
    tag: "New Arrivals",
    intro: "Fresh opportunities moving through intake, verification, and buyer matching.",
  },
  {
    label: "Private Access",
    tag: "Private Access",
    intro: "Sensitive opportunities best handled through discreet qualification and concierge-led access.",
  },
];

const priceRanges = [
  { label: "All pricing", value: "all" },
  { label: "Under $250k", value: "under-250" },
  { label: "$250k-$500k", value: "250-500" },
  { label: "$500k-$1M", value: "500-1000" },
  { label: "$1M+", value: "1000-plus" },
];

const mileageRanges = [
  { label: "All mileage", value: "all" },
  { label: "Under 1k", value: "under-1000" },
  { label: "Under 5k", value: "under-5000" },
  { label: "Under 15k", value: "under-15000" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price high-low", value: "price-desc" },
  { label: "Price low-high", value: "price-asc" },
  { label: "Mileage low-high", value: "miles-asc" },
  { label: "Rarity", value: "rarity" },
];

const rarityOrder = ["Ultra Rare", "Investment Grade", "Track Focused", "Grand Touring", "Open-Air"];

function filterByPrice(price: number | null, value: string) {
  if (price === null || value === "all") {
    return true;
  }

  if (value === "under-250") return price < 250000;
  if (value === "250-500") return price >= 250000 && price <= 500000;
  if (value === "500-1000") return price > 500000 && price <= 1000000;
  return price > 1000000;
}

function filterByMileage(miles: number, value: string) {
  if (value === "all") return true;
  if (value === "under-1000") return miles < 1000;
  if (value === "under-5000") return miles < 5000;
  return miles < 15000;
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
        active
          ? "border-[#f1d38a]/42 bg-[#d4af37]/16 text-[#fff6de]"
          : "border-white/10 bg-white/[0.04] text-[#cfc4b2] hover:border-[#f1d38a]/22 hover:text-[#fff8eb]"
      }`}
    >
      {label}
    </button>
  );
}

export default function InventoryPage() {
  const [collection, setCollection] = useState("All");
  const [make, setMake] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [mileageRange, setMileageRange] = useState("all");
  const [sort, setSort] = useState("newest");

  const makes = ["All", ...Array.from(new Set(FEATURED_VEHICLES.map((vehicle) => vehicle.make)))];
  const activeCollection = collectionTabs.find((tab) => tab.label === collection) ?? collectionTabs[0];

  const filtered = useMemo(() => {
    const byCollection =
      activeCollection.tag === "All"
        ? FEATURED_VEHICLES
        : FEATURED_VEHICLES.filter((vehicle) => vehicle.collectionTags.includes(activeCollection.tag));

    return byCollection.filter((vehicle) => {
      const matchesMake = make === "All" || vehicle.make === make;
      return matchesMake && filterByPrice(vehicle.price, priceRange) && filterByMileage(vehicle.miles, mileageRange);
    });
  }, [activeCollection.tag, make, mileageRange, priceRange]);

  const sorted = useMemo(() => {
    return [...filtered].sort((left, right) => {
      if (sort === "price-desc") return (right.price ?? 0) - (left.price ?? 0);
      if (sort === "price-asc") return (left.price ?? 0) - (right.price ?? 0);
      if (sort === "miles-asc") return left.miles - right.miles;
      if (sort === "rarity") return rarityOrder.indexOf(left.rarityTier) - rarityOrder.indexOf(right.rarityTier);
      return right.year - left.year;
    });
  }, [filtered, sort]);

  const pendingImageCount = sorted.filter((vehicle) => vehicle.primaryImage.status === "pending").length;
  const topVehicle = sorted[0] ?? FEATURED_VEHICLES[0];
  const hasActiveFilters = collection !== "All" || make !== "All" || priceRange !== "all" || mileageRange !== "all" || sort !== "newest";

  const resetFilters = () => {
    setCollection("All");
    setMake("All");
    setPriceRange("all");
    setMileageRange("all");
    setSort("newest");
  };

  return (
    <main id="main-content">
      <SectionShell variant="default" atmosphere={<AutomotiveAtmosphere variant="inventory" intensity="medium" />}>
        <EditorialContainer>
          <MotionReveal className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <EditorialHeader
                eyebrow="Private inventory"
                title="A curated exotic vehicle vault built for serious buyer decisions."
                description="Each file is framed to answer the key questions fast: what the vehicle is, why it matters, whether it is verified, what it costs, and how to move into a private acquisition conversation."
              />
            </div>

            <div className="vault-panel rounded-[1.85rem] p-6 sm:p-7">
              <p className="text-sm leading-7 text-[#d8d0c2]">
                Inventory is now structured around conversion clarity. Wrong cross-brand imagery is removed, pricing is visible,
                trust signals are explicit, and every listing has a direct path into private access or trade/appraisal inquiry.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#a99f8d]">Collection count</p>
                  <p className="mt-2 text-3xl text-[#fff8eb]">{sorted.length}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#a99f8d]">Image review status</p>
                  <p className="mt-2 text-3xl text-[#fff8eb]">{pendingImageCount}</p>
                </div>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.05}>
            <CollectionNarrativeEngine />
          </MotionReveal>

          <MotionReveal delay={0.08} className="mt-10 cinema-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-wrap gap-3">
              {collectionTabs.map((tab) => (
                <FilterPill key={tab.label} label={tab.label} active={collection === tab.label} onClick={() => setCollection(tab.label)} />
              ))}
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="section-kicker">Collection focus</p>
                <h2 className="mt-4 text-3xl text-[#fff8eb]">{activeCollection.label === "All" ? "Private vault overview" : activeCollection.label}</h2>
              </div>
              <div className="rounded-[1.45rem] border border-[#f1d38a]/14 bg-[#d4af37]/8 p-5 text-sm leading-7 text-[#d8d0c2]">
                {activeCollection.intro}
              </div>
            </div>
          </MotionReveal>

          <div className="mt-10 grid gap-8 xl:grid-cols-[360px_1fr]">
            <MotionReveal className="vault-panel rounded-[2rem] p-6 xl:sticky xl:top-28 xl:self-start">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker">Refine the room</p>
                  <h2 className="mt-4 text-3xl text-[#fff8eb]">Filter the collection</h2>
                </div>
                {hasActiveFilters ? (
                  <button type="button" className="ghost-button !px-4 !py-2" onClick={resetFilters}>
                    Reset
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-5">
                <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
                  <p style={{ ...typography.formLabel, color: colors.textMuted }}>Make</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {makes.map((option) => (
                      <FilterPill key={option} label={option} active={make === option} onClick={() => setMake(option)} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
                  <p style={{ ...typography.formLabel, color: colors.textMuted }}>Price</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {priceRanges.map((option) => (
                      <FilterPill
                        key={option.value}
                        label={option.label}
                        active={priceRange === option.value}
                        onClick={() => setPriceRange(option.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
                  <p style={{ ...typography.formLabel, color: colors.textMuted }}>Mileage</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mileageRanges.map((option) => (
                      <FilterPill
                        key={option.value}
                        label={option.label}
                        active={mileageRange === option.value}
                        onClick={() => setMileageRange(option.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
                  <p style={{ ...typography.formLabel, color: colors.textMuted }}>Sort</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <FilterPill key={option.value} label={option.label} active={sort === option.value} onClick={() => setSort(option.value)} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.45rem] border border-[#f1d38a]/16 bg-[#d4af37]/8 p-4 text-sm leading-7 text-[#d8d0c2]">
                {pendingImageCount > 0
                  ? `${pendingImageCount} listing${pendingImageCount > 1 ? "s" : ""} currently use a premium placeholder until the matching media set is verified.`
                  : "All visible listings currently have verified media sets."}
              </div>
            </MotionReveal>

            <div>
              <MotionReveal className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#a99f8d]">Showing {sorted.length} vehicles</p>
                  <p className="mt-2 text-sm leading-7 text-[#d8d0c2]">
                    {topVehicle
                      ? `Fast buyer view: ${topVehicle.year} ${topVehicle.make} ${topVehicle.model} starts at ${formatPrice(topVehicle.price)} and carries ${topVehicle.verificationStatus.toLowerCase()}.`
                      : "No vehicles match the current room."}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#d8d0c2]">
                  Primary CTA: Request Private Access
                </div>
              </MotionReveal>

              <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                {sorted.length > 0 ? (
                  sorted.map((vehicle, index) => (
                    <MotionReveal key={vehicle.id} delay={index * 0.04}>
                      <VehicleCard vehicle={vehicle} />
                    </MotionReveal>
                  ))
                ) : (
                  <MotionReveal className="cinema-panel rounded-[2rem] p-8 lg:col-span-2 2xl:col-span-3">
                    <p className="section-kicker">Private archive</p>
                    <h3 className="mt-4 text-3xl text-[#fff8eb]">No vehicles match this buyer room.</h3>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d8d0c2]">
                      Adjust the filters or move directly into concierge sourcing for a vehicle that fits the intended acquisition profile.
                    </p>
                  </MotionReveal>
                )}
              </div>
            </div>
          </div>
        </EditorialContainer>
      </SectionShell>
    </main>
  );
}
