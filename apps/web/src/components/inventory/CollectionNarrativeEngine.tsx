import Link from "next/link";
import { FEATURED_VEHICLES, formatPrice } from "@/lib/vehicles";
import { VehicleImageFrame } from "@/components/inventory/VehicleImageFrame";

const categoryStories = [
  {
    title: "Ultra Rare",
    copy: "Inventory where scarcity, allocation posture, and replacement difficulty change the acquisition conversation immediately.",
    signal: "Access-first",
  },
  {
    title: "Investment Grade",
    copy: "Vehicles framed by specification quality, mileage posture, desirability, and longer-term ownership confidence.",
    signal: "Market-aware",
  },
  {
    title: "Track Focused",
    copy: "Motorsport-bred machines where aero, braking, chassis, and driver engagement are part of the reason the file matters.",
    signal: "Technical proof",
  },
];

export function CollectionNarrativeEngine() {
  const signatureVehicle = FEATURED_VEHICLES.find((vehicle) => vehicle.rarityTier === "Ultra Rare") ?? FEATURED_VEHICLES[0];

  return (
    <section className="mt-12 space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
        <div className="cinema-panel rounded-[2rem] p-7 sm:p-9">
          <p className="section-kicker">Collection narrative</p>
          <h2 className="section-title">A private archive should explain why each vehicle deserves access.</h2>
          <p className="section-copy">
            The VEX collection is organized around acquisition standards: rarity, condition class, market confidence,
            verification posture, and how the vehicle fits a serious collector or high-intent buyer.
          </p>
          <div className="mt-7 grid gap-3 text-sm text-[#d8d0c2]">
            {[
              "Curated intake before public exposure",
              "Visible confidence signals before inquiry",
              "Private-access CTAs instead of generic lead routing",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-[#f1d38a]" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <Link
          href={`/inventory/${signatureVehicle.id}`}
          prefetch={false}
          data-analytics-event="vehicle_detail_engagement"
          data-analytics-surface="collection_signature_highlight"
          data-analytics-vehicle-id={String(signatureVehicle.id)}
          className="group glass-panel overflow-hidden rounded-[2rem]"
        >
          <div className="grid min-h-full md:grid-cols-[1.05fr_0.95fr]">
            <VehicleImageFrame vehicle={signatureVehicle} variant="hero" />
            <div className="flex flex-col justify-between p-7 sm:p-9">
              <div>
                <p className="section-kicker">Signature vehicle highlight</p>
                <h3 className="mt-5 font-[var(--font-display)] text-4xl leading-none text-[#fff8eb]">
                  {signatureVehicle.year} {signatureVehicle.make} {signatureVehicle.model}
                </h3>
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[#bba88a]">{signatureVehicle.trim}</p>
                <p className="mt-5 text-sm leading-7 text-[#d8d0c2]">{signatureVehicle.editorialHeadline}</p>
              </div>
              <div className="mt-8 grid gap-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[#a99f8d]">Rarity</span>
                  <span className="text-[#fff8eb]">{signatureVehicle.rarityTier}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[#a99f8d]">Confidence</span>
                  <span className="text-[#fff8eb]">{signatureVehicle.verificationStatus}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[#a99f8d]">Media integrity</span>
                  <span className="text-[#fff8eb]">
                    {signatureVehicle.primaryImage.status === "pending" ? "Verification pending" : "Verified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a99f8d]">Private file</span>
                  <span className="text-[#f1d38a]">{formatPrice(signatureVehicle.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {categoryStories.map((story) => (
          <article key={story.title} className="glass-panel rounded-[1.65rem] p-6">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#f1d38a]/70">{story.signal}</p>
            <h3 className="mt-4 text-2xl text-[#fff8eb]">{story.title}</h3>
            <p className="mt-4 text-sm leading-7 text-[#d8d0c2]">{story.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
