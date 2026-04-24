import Link from "next/link";
import { notFound } from "next/navigation";
import { AutomotiveAtmosphere } from "@/components/atmosphere";
import { VehicleImageFrame } from "@/components/inventory/VehicleImageFrame";
import { WowFactorList } from "@/components/inventory/WowFactorList";
import { EditorialContainer, EditorialHeader, FeatureGrid, SectionShell } from "@/components/layout";
import { MotionReveal } from "@/components/site/MotionReveal";
import { FEATURED_VEHICLES, formatPrice, getVehicleById } from "@/lib/vehicles";

const verificationConfidence = [
  "Verified listing posture",
  "Concierge reviewed acquisition path",
  "Market intelligence available on request",
  "Trade and appraisal support available",
];

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  const relatedVehicles = FEATURED_VEHICLES.filter((candidate) => candidate.id !== vehicle.id && candidate.make !== vehicle.make).slice(0, 3);
  const maskedVin = `${"*".repeat(Math.max(0, vehicle.vin.length - 6))}${vehicle.vin.slice(-6)}`;

  return (
    <main id="main-content">
      <SectionShell variant="default" atmosphere={<AutomotiveAtmosphere variant="inventory" intensity="medium" />}>
        <EditorialContainer>
          <MotionReveal>
            <Link href="/inventory" className="inline-flex items-center gap-2 text-sm text-[#bcae97] transition hover:text-[#fff8eb]">
              <span aria-hidden="true">←</span>
              Back to inventory
            </Link>
          </MotionReveal>

          <div className="mt-6 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <MotionReveal className="space-y-5">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/25">
                <VehicleImageFrame vehicle={vehicle} variant="detail" priority />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {vehicle.galleryImages.map((media) => (
                  <div key={media.alt} className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-black/20">
                    <VehicleImageFrame vehicle={{ ...vehicle, primaryImage: media }} variant="gallery" />
                  </div>
                ))}
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08} className="cinema-panel rounded-[2rem] p-7 sm:p-9">
              <p className="section-kicker">{vehicle.listingBadge}</p>
              <h1 className="mt-4 font-[var(--font-display)] text-5xl leading-[0.94] tracking-[-0.05em] text-[#fff8eb]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[#b8ac98]">{vehicle.trim}</p>
              <p className="mt-4 text-base leading-8 text-[#d8d0c2]">{vehicle.editorialHeadline}</p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-[#f1d38a]/16 bg-[#d4af37]/8 p-5">
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#f1d38a]/72">Private file value</p>
                  <p className="mt-3 text-4xl font-semibold text-[#f1d38a]">{formatPrice(vehicle.price)}</p>
                  <p className="mt-3 text-sm leading-7 text-[#e6dcc7]">{vehicle.acquisitionStatus}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-black/22 p-5">
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#a99f8d]">Vehicle overview</p>
                  <div className="mt-3 grid gap-2 text-sm text-[#fff8eb]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#a99f8d]">Mileage</span>
                      <span>{vehicle.miles.toLocaleString()} mi</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#a99f8d]">Location</span>
                      <span>{vehicle.location}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#a99f8d]">VIN</span>
                      <span>{maskedVin}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link href={`/contact?vehicle=${vehicle.id}`} className="gold-button">
                  {vehicle.ctas.primary}
                </Link>
                <Link href={`/appraisal?vehicle=${vehicle.id}`} className="ghost-button">
                  {vehicle.ctas.tertiary ?? "Request Appraisal / Trade"}
                </Link>
                <Link href="/contact" className="ghost-button">
                  Ask About This Vehicle
                </Link>
              </div>

              <div className="mt-7 rounded-[1.45rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#f1d38a]/72">Image integrity</p>
                <p className="mt-3 text-sm leading-7 text-[#d8d0c2]">
                  {vehicle.imageVerificationNote ?? "Vehicle imagery is managed under a verification-first media policy."}
                </p>
              </div>
            </MotionReveal>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <MotionReveal>
              <EditorialHeader
                eyebrow="Why this vehicle matters"
                title="A collector-facing file should explain the emotional and financial logic."
                description={vehicle.description}
              />
            </MotionReveal>

            <MotionReveal delay={0.08}>
              <WowFactorList items={vehicle.wowFactors} />
            </MotionReveal>
          </div>

          <FeatureGrid className="mt-10" columns={2}>
            <MotionReveal className="vault-panel rounded-[1.9rem] p-7">
              <p className="section-kicker">Key specs</p>
              <div className="mt-6 grid gap-3 text-sm text-[#e7dece]">
                {[
                  ["Engine", vehicle.engine],
                  ["Horsepower", `${vehicle.horsepower} hp`],
                  ["Transmission", vehicle.transmission],
                  ["Drivetrain", vehicle.drivetrain],
                  ["Exterior", vehicle.exteriorColor],
                  ["Interior", vehicle.interiorColor],
                  ["Condition", vehicle.conditionClass],
                  ["Rarity", vehicle.rarityTier],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/10 bg-black/20 px-4 py-3">
                    <span className="text-[#a99f8d]">{label}</span>
                    <span className="text-right text-[#fff8eb]">{value}</span>
                  </div>
                ))}
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08} className="glass-panel rounded-[1.9rem] p-7">
              <p className="section-kicker">Rarity and provenance</p>
              <div className="mt-6 grid gap-4">
                {[
                  `Rarity tier: ${vehicle.rarityTier}`,
                  `Verification status: ${vehicle.verificationStatus}`,
                  `Acquisition status: ${vehicle.acquisitionStatus}`,
                  `Concierge availability: ${vehicle.conciergeAvailability}`,
                ].map((item) => (
                  <div key={item} className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-[#d8d0c2]">
                    {item}
                  </div>
                ))}
              </div>
            </MotionReveal>
          </FeatureGrid>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <MotionReveal className="vault-panel rounded-[1.9rem] p-7">
              <p className="section-kicker">Verification confidence</p>
              <div className="mt-6 grid gap-3">
                {verificationConfidence.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-black/22 px-4 py-4 text-sm text-[#e6dece]">
                    <span className="h-2 w-2 rounded-full bg-[#f1d38a]" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08} className="cinema-panel rounded-[1.9rem] p-7">
              <p className="section-kicker">Concierge acquisition panel</p>
              <h2 className="mt-4 text-3xl text-[#fff8eb]">Move from interest to access with a higher-trust handoff.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[#d8d0c2]">
                <p>Inquiry routing is structured for serious buyer context, not anonymous lead volume.</p>
                <p>Trade, appraisal, logistics, and transaction coordination stay available even if backend lead capture is degraded.</p>
                <p>Private access remains the primary conversion action for this file.</p>
              </div>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link href={`/contact?vehicle=${vehicle.id}`} className="gold-button">
                  Request Private Access
                </Link>
                <Link href={`/appraisal?vehicle=${vehicle.id}`} className="ghost-button">
                  Trade / Appraisal Inquiry
                </Link>
              </div>
            </MotionReveal>
          </div>

          <MotionReveal className="mt-12">
            <EditorialHeader
              eyebrow="Similar vehicles"
              title="Continue the shortlist inside the same curated room."
              description="Related opportunities stay framed with the same trust, rarity, and acquisition posture instead of dropping back into a generic grid."
            />
          </MotionReveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {relatedVehicles.map((candidate, index) => (
              <MotionReveal key={candidate.id} delay={index * 0.05} className="glass-panel rounded-[1.6rem] p-5">
                <p className="section-kicker">{candidate.rarityTier}</p>
                <h3 className="mt-4 text-2xl text-[#fff8eb]">
                  {candidate.year} {candidate.make} {candidate.model}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#d8d0c2]">{candidate.editorialHeadline}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-[#f1d38a]">{formatPrice(candidate.price)}</span>
                  <Link href={`/inventory/${candidate.id}`} className="ghost-button !px-4 !py-2">
                    View Details
                  </Link>
                </div>
              </MotionReveal>
            ))}
          </div>
        </EditorialContainer>
      </SectionShell>

      <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
        <div className="rounded-[1.35rem] border border-white/12 bg-[#080809]/94 p-3 shadow-[0_20px_45px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#a99f8d]">Private file value</p>
              <p className="mt-1 text-lg text-[#f1d38a]">{formatPrice(vehicle.price)}</p>
            </div>
            <div className="text-right text-[0.72rem] uppercase tracking-[0.2em] text-[#d8d0c2]">{vehicle.availabilityBadge}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/contact?vehicle=${vehicle.id}`} className="gold-button !px-4 !py-3 text-center">
              Access
            </Link>
            <Link href={`/appraisal?vehicle=${vehicle.id}`} className="ghost-button !px-4 !py-3 text-center">
              Trade
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
