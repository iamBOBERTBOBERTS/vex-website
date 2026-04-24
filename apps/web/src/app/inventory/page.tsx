"use client";

import { useMemo, useState } from "react";
import { FEATURED_VEHICLES } from "@/lib/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { MotionReveal } from "@/components/site/MotionReveal";

const priceRanges = [
  { label: "All price bands", value: "all" },
  { label: "Under $300k", value: "under-300" },
  { label: "$300k - $500k", value: "300-500" },
  { label: "$500k+", value: "500-plus" },
];

const mileageRanges = [
  { label: "All mileage", value: "all" },
  { label: "Under 1,000 mi", value: "under-1000" },
  { label: "1,000 - 2,500 mi", value: "1000-2500" },
  { label: "2,500+ mi", value: "2500-plus" },
];

const sortOptions = [
  { label: "Newest arrivals", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

const collectionTabs = [
  {
    label: "All Collection",
    tag: "All Collection",
    intro: "The full VEX private collection, selected for presence, provenance posture, performance identity, and acquisition fit.",
    reason: "Use this view when the buyer is exploring across categories before narrowing by purpose.",
  },
  {
    label: "Ultra Rare",
    tag: "Ultra Rare",
    intro: "Scarcity-led vehicles where allocation, production posture, or market desirability drives private attention.",
    reason: "Built for collectors who care about access, story, and the difficulty of replacement.",
  },
  {
    label: "Investment Grade",
    tag: "Investment Grade",
    intro: "Vehicles with stronger long-term desirability signals, specification quality, and collector-grade presentation.",
    reason: "Useful when acquisition logic includes preservation, exit confidence, and market timing.",
  },
  {
    label: "Track Focused",
    tag: "Track Focused",
    intro: "Motorsport-bred inventory with aero, braking, chassis, and driver engagement as the primary appeal.",
    reason: "For buyers who want technical credibility and performance identity, not only visual drama.",
  },
  {
    label: "Grand Touring",
    tag: "Grand Touring",
    intro: "High-comfort exotic and ultra-luxury vehicles selected for distance, refinement, and daily ceremony.",
    reason: "For clients who want elegance, cabin quality, and effortless presence.",
  },
  {
    label: "Open-Air",
    tag: "Open-Air",
    intro: "Spiders, convertibles, and sensory machines with an emphasis on exposure, sound, and occasion.",
    reason: "For warm-weather collectors and buyers seeking emotional driving theater.",
  },
  {
    label: "New Arrivals",
    tag: "New Arrivals",
    intro: "Recently surfaced opportunities still moving through intake, verification, and private buyer matching.",
    reason: "This is where high-intent clients watch for fresh acquisition windows.",
  },
  {
    label: "Private Access",
    tag: "Private Access",
    intro: "Inventory that deserves a quieter room, controlled visibility, and concierge-led qualification.",
    reason: "For sensitive opportunities where discretion and buyer quality matter as much as speed.",
  },
];

export default function InventoryPage() {
  const [make, setMake] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [mileage, setMileage] = useState("all");
  const [sort, setSort] = useState("newest");
  const [collectionTab, setCollectionTab] = useState(collectionTabs[0].label);

  const makes = ["All", ...Array.from(new Set(FEATURED_VEHICLES.map((vehicle) => vehicle.make)))];
  const activeTab = collectionTabs.find((tab) => tab.label === collectionTab) ?? collectionTabs[0];
  const tabVehicles =
    activeTab.label === "All Collection"
      ? FEATURED_VEHICLES
      : FEATURED_VEHICLES.filter((vehicle) => vehicle.collectionTags.includes(activeTab.tag));

  const filtered = useMemo(() => {
    return tabVehicles.filter((vehicle) => {
      const matchMake = make === "All" || vehicle.make === make;
      const matchPrice =
        priceRange === "all" ||
        (priceRange === "under-300" && vehicle.price < 300000) ||
        (priceRange === "300-500" && vehicle.price >= 300000 && vehicle.price <= 500000) ||
        (priceRange === "500-plus" && vehicle.price > 500000);
      const matchMileage =
        mileage === "all" ||
        (mileage === "under-1000" && vehicle.miles < 1000) ||
        (mileage === "1000-2500" && vehicle.miles >= 1000 && vehicle.miles <= 2500) ||
        (mileage === "2500-plus" && vehicle.miles > 2500);
      return matchMake && matchPrice && matchMileage;
    });
  }, [make, mileage, priceRange, tabVehicles]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.id - a.id;
    });
  }, [filtered, sort]);

  const filters = [
    { label: "Make", value: make, onChange: setMake, options: makes.map((option) => ({ label: option, value: option })) },
    { label: "Price band", value: priceRange, onChange: setPriceRange, options: priceRanges },
    { label: "Mileage", value: mileage, onChange: setMileage, options: mileageRanges },
    { label: "Sort", value: sort, onChange: setSort, options: sortOptions },
  ];

  return (
    <main id="main-content" className="shell py-14 sm:py-18">
      <MotionReveal className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="section-kicker">Private inventory</p>
          <h1 className="section-title">A private collection organized by acquisition intent.</h1>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-6">
          <p className="text-sm leading-7 text-[#d8d0c2]">
            Every listing is framed with rarity context, verification posture, condition class, and a direct path to serious conversation.
            The collection behaves like a private archive, not a commodity search wall.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#a99f8d]">Verified vehicles</p>
              <p className="mt-2 text-3xl text-[#fff8eb]">{sorted.length}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#a99f8d]">Concierge support</p>
              <p className="mt-2 text-3xl text-[#fff8eb]">1:1</p>
            </div>
          </div>
        </div>
      </MotionReveal>

      <MotionReveal className="mt-10 cinema-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap gap-3">
          {collectionTabs.map((tab) => {
            const count =
              tab.label === "All Collection"
                ? FEATURED_VEHICLES.length
                : FEATURED_VEHICLES.filter((vehicle) => vehicle.collectionTags.includes(tab.tag)).length;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setCollectionTab(tab.label)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeTab.label === tab.label
                    ? "border-[#f1d38a]/45 bg-[#d4af37]/18 text-[#fff8eb]"
                    : "border-white/10 bg-white/[0.04] text-[#cfc4b2] hover:border-[#f1d38a]/24"
                }`}
              >
                {tab.label} <span className="text-[#f1d38a]">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">{activeTab.label}</p>
            <h2 className="mt-4 text-3xl text-[#fff8eb]">Curated reason for the category</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-black/24 p-5 text-sm leading-7 text-[#d8d0c2]">
              {activeTab.intro}
            </div>
            <div className="rounded-[1.35rem] border border-[#f1d38a]/16 bg-[#d4af37]/7 p-5 text-sm leading-7 text-[#d8d0c2]">
              {activeTab.reason}
            </div>
          </div>
        </div>
      </MotionReveal>

      <div className="mt-10 grid gap-6 xl:grid-cols-[320px_1fr]">
        <MotionReveal className="glass-panel rounded-[1.75rem] p-6 xl:sticky xl:top-28 xl:self-start">
          <p className="section-kicker">Refine the room</p>
          <h2 className="mt-4 text-3xl text-[#fff8eb]">Filter the collection</h2>

          <div className="mt-6 grid gap-5">
            {filters.map((filter) => (
              <label key={filter.label} className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.24em] text-[#b8ac98]">{filter.label}</span>
                <select
                  className="field-base"
                  value={filter.value}
                  onChange={(event) => filter.onChange(event.target.value)}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-[#f1d38a]/16 bg-[#d4af37]/7 p-4 text-sm leading-7 text-[#d8d0c2]">
            Collector-grade pace means fewer listings, tighter framing, stronger confidence, and category context that explains why each vehicle deserves private attention.
          </div>
        </MotionReveal>

        <div>
          <MotionReveal className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm uppercase tracking-[0.24em] text-[#a99f8d]">Showing {sorted.length} vehicles</p>
            <p className="text-sm text-[#bcae97]">Verified sellers, editorial framing, direct inquiry flow.</p>
          </MotionReveal>

          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {sorted.map((vehicle, index) => (
              <MotionReveal key={vehicle.id} delay={index * 0.04}>
                <VehicleCard vehicle={vehicle} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
