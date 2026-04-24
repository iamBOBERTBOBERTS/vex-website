import Image from "next/image";
import Link from "next/link";
import { FEATURED_VEHICLES, formatPrice } from "@/lib/vehicles";
import { EntrySequence } from "@/components/entry/EntrySequence";
import { VehicleCard } from "@/components/VehicleCard";
import { MotionReveal } from "@/components/site/MotionReveal";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
const heroVideoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "";

const processSteps = [
  {
    number: "01",
    title: "Discover",
    copy: "Enter a curated collection where each vehicle is framed by rarity, use case, condition posture, and acquisition fit.",
  },
  {
    number: "02",
    title: "Verify",
    copy: "Review seller confidence, provenance notes, mileage quality, and market posture before moving into private discussion.",
  },
  {
    number: "03",
    title: "Consult",
    copy: "Work with a high-context concierge layer that clarifies intent, budget posture, ownership goals, and timing.",
  },
  {
    number: "04",
    title: "Acquire",
    copy: "Coordinate documentation, escrow path, seller communication, appraisal confidence, and final transaction movement.",
  },
  {
    number: "05",
    title: "Deliver",
    copy: "Close with transport planning, handover expectations, and a calmer post-acquisition path for the buyer or seller.",
  },
];

const trustSignals = [
  "Dealer verification badge",
  "Verified seller identity",
  "Secure escrow coordination",
  "White-glove logistics",
  "Concierge acquisition flow",
  "Financing layer support",
];

const confidenceCards = [
  {
    label: "Verification",
    title: "Every listing is framed with real trust signals.",
    copy: "Verified seller identity, dealer-level review, and a clear market stance give buyers confidence before they inquire.",
  },
  {
    label: "Transaction",
    title: "The path to closing feels white-glove, not improvised.",
    copy: "Escrow support, logistics guidance, financing coordination, and human concierge ownership reduce uncertainty across the deal.",
  },
];

const collectionPrinciples = [
  {
    title: "Curated before listed",
    copy: "VEX is built for vehicles that need context, not commodity placement. Every eligible car should enter with a point of view: why it matters, who it fits, and what makes the opportunity worth private attention.",
  },
  {
    title: "Private network first",
    copy: "The best exotic transactions often begin before public visibility. The platform is structured around qualified access, direct relationships, and controlled presentation instead of broad, low-signal exposure.",
  },
  {
    title: "Concierge owned",
    copy: "Acquisition is treated as a guided process. Inquiry, qualification, appraisal support, documentation, transport, and handover all need a single calm operating layer.",
  },
];

const verificationLayers = [
  "Seller identity review",
  "Dealer or specialist confidence signal",
  "VIN and listing consistency checks",
  "Condition and provenance notes",
  "Escrow and logistics coordination",
  "Human concierge follow-through",
];

const conciergeStages = [
  {
    stage: "Consult",
    copy: "Clarify intent, budget posture, collection goals, trade context, and acquisition timeline before surfacing serious opportunities.",
  },
  {
    stage: "Source",
    copy: "Match the buyer with visible and off-market inventory using rarity, condition, history, and ownership fit as the filter.",
  },
  {
    stage: "Secure",
    copy: "Coordinate appraisal confidence, seller communication, documentation, escrow path, transport planning, and final handover.",
  },
];

const intelligenceSignals = [
  { value: "Market position", label: "Pricing posture compared against comparable listings and recent movement." },
  { value: "Asset quality", label: "Mileage, configuration, history, demand profile, and condition class reviewed together." },
  { value: "Exit confidence", label: "Collector-grade framing helps buyers understand desirability beyond the first transaction." },
];

const collectionBadges = ["Verified", "Concierge available", "Condition class noted", "Private inquiry"];

export default function HomePage() {
  const spotlightVehicle = FEATURED_VEHICLES[0];

  return (
    <main id="main-content">
      <EntrySequence />
      <section id="universe" className="cinematic-gate-hero relative overflow-hidden pb-20 pt-10 sm:pt-16">
        {heroVideoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            autoPlay
            muted
            loop
            playsInline
            src={heroVideoUrl}
          />
        ) : null}
        <div className="gate-backplate" aria-hidden />
        <div className="gate-beams" aria-hidden />
        <div className="gate-aperture" aria-hidden />
        <div className="gate-film" aria-hidden />
        <div className="gate-grade" aria-hidden />

        <div className="shell hero-stage relative">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.86fr] lg:gap-14">
            <MotionReveal className="hero-copy-lux">
              <p className="section-kicker">Iron gate private market</p>
              <h1 className="hero-title-lux mt-6 font-[var(--font-display)] text-5xl leading-[0.92] tracking-[-0.06em] text-[#fff8eb] sm:text-6xl lg:text-7xl">
                Private access to the next era of exotic acquisition.
              </h1>
              <p className="hero-lede-lux mt-7 text-base leading-8 text-[#d8d0c2] sm:text-lg">
                A cinematic marketplace for verified exotic inventory, private appraisal, and concierge acquisition.
                Built to feel calm, expensive, and deliberately out of reach.
              </p>

              <div className="hero-actions-lux mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/inventory" className="gold-button" data-magnetic="true">
                  Explore Inventory
                </Link>
                <Link href="/appraisal" className="ghost-button" data-magnetic="true">
                  Request Private Appraisal
                </Link>
              </div>

              <div className="hero-trust-strip mt-9" aria-label="Platform trust signals">
                {trustSignals.slice(0, 4).map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>

              <div className="hero-metrics-lux mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { value: `${FEATURED_VEHICLES.length}`, label: "spotlight vehicles" },
                  { value: "24h", label: "average response target" },
                  { value: "1:1", label: "concierge ownership" },
                ].map((metric) => (
                  <div key={metric.label} className="glass-panel stat-glass rounded-[1.35rem] p-5">
                    <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#a99f8d]">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[#fff8eb]">{metric.value}</p>
                  </div>
                ))}
              </div>
            </MotionReveal>

            <MotionReveal delay={0.1} className="relative">
              <div className="gate-specular-line" aria-hidden />
              <div className="cinema-panel gate-showpiece relative overflow-hidden rounded-[2rem] p-6 sm:p-8 md:[transform:perspective(1400px)_rotateY(-8deg)_rotateX(2deg)] md:transition-transform md:duration-500 md:hover:[transform:perspective(1400px)_rotateY(-4deg)_rotateX(0deg)]">
                <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.14),transparent_34%,transparent_68%,rgba(241,211,138,0.16))]" />
                <div className="relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#f1d38a]/70">Current spotlight</p>
                      <p className="mt-2 text-xl text-[#fff8eb]">{spotlightVehicle.year} {spotlightVehicle.make} {spotlightVehicle.model}</p>
                    </div>
                    <span className="rounded-full border border-[#f1d38a]/18 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#f1d38a]">
                      {spotlightVehicle.badge}
                    </span>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-[1.75rem]">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={spotlightVehicle.image}
                        alt={`${spotlightVehicle.year} ${spotlightVehicle.make} ${spotlightVehicle.model}`}
                        fill
                        priority
                        className="luxury-photo object-cover"
                        sizes="(max-width: 1100px) 100vw, 34vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4">
                        <p className="text-3xl font-medium tracking-[-0.05em] text-[#fff8eb]">{formatPrice(spotlightVehicle.price)}</p>
                        <p className="mt-1 text-sm text-[#d8d0c2]">
                          {spotlightVehicle.color} | {spotlightVehicle.miles.toLocaleString()} miles
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[#d8d0c2]">
                    {spotlightVehicle.description} Presented with the atmosphere, scarcity, and polish expected of a private market object.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section className="shell py-10">
        <MotionReveal className="glass-panel rounded-[1.75rem] px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.76rem] uppercase tracking-[0.28em] text-[#d9cfbe]">
            {trustSignals.map((signal) => (
              <span key={signal} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" aria-hidden="true" />
                {signal}
              </span>
            ))}
          </div>
        </MotionReveal>
      </section>

      <section className="shell py-20">
        <MotionReveal className="max-w-3xl">
          <p className="section-kicker">Private collection philosophy</p>
          <h2 className="section-title">The platform exists for vehicles that deserve context before exposure.</h2>
          <p className="section-copy">
            VEX is not trying to become another high-volume listing wall. It is designed for curated exotic acquisition,
            controlled seller visibility, and buyer confidence around assets where provenance, condition, rarity, and timing matter.
          </p>
        </MotionReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {collectionPrinciples.map((pillar, index) => (
            <MotionReveal key={pillar.title} delay={index * 0.08} className="glass-panel rounded-[1.75rem] p-6">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#f1d38a]/20 bg-[#d4af37]/10 text-sm font-semibold text-[#f1d38a]">
                0{index + 1}
              </div>
              <h3 className="text-2xl text-[#fff8eb]">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#d8d0c2]">{pillar.copy}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="shell py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <MotionReveal>
            <p className="section-kicker">Verification layer</p>
            <h2 className="section-title">Trust is presented as part of the product, not hidden behind the inquiry.</h2>
            <p className="section-copy">
              Exotic buyers do not only evaluate design, mileage, and price. They evaluate confidence. VEX surfaces the
              checks and ownership signals that reduce uncertainty before the conversation becomes serious.
            </p>
          </MotionReveal>

          <MotionReveal delay={0.08} className="cinema-panel rounded-[2rem] p-7 sm:p-9">
            <div className="grid gap-4 sm:grid-cols-2">
              {verificationLayers.map((signal) => (
                <div key={signal} className="rounded-[1.35rem] border border-white/10 bg-black/24 p-5">
                  <span className="mb-4 block h-1 w-12 rounded-full bg-[#f1d38a]" aria-hidden="true" />
                  <p className="text-lg text-[#fff8eb]">{signal}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 text-sm leading-7 text-[#a99f8d]">
              The goal is not to overpromise automation. The goal is to make the confidence layer visible, human-owned,
              and consistent across inventory, appraisal, and acquisition flows.
            </p>
          </MotionReveal>
        </div>
      </section>

      <section className="shell py-20">
        <MotionReveal className="cinema-panel rounded-[2rem] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="section-kicker">Concierge acquisition</p>
              <h2 className="section-title">A private purchase should feel orchestrated from the first conversation.</h2>
              <p className="section-copy max-w-xl">
                The VEX acquisition flow is built around fewer unknowns: buyer intent, collection fit, seller readiness,
                appraisal confidence, logistics, and final delivery are treated as one connected experience.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {conciergeStages.map((item, index) => (
                <div key={item.stage} className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#f1d38a]/70">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl text-[#fff8eb]">{item.stage}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#d8d0c2]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionReveal>
      </section>

      <section className="shell py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <MotionReveal>
            <p className="section-kicker">Market intelligence</p>
            <h2 className="section-title">The appraisal layer gives the experience financial gravity.</h2>
            <p className="section-copy">
              Premium presentation has to be supported by pricing awareness. VEX frames each acquisition or appraisal
              with the signals that matter to owners, collectors, dealers, and high-intent buyers.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.08} className="glass-panel rounded-[2rem] p-7">
            <div className="space-y-5">
              {intelligenceSignals.map((signal) => (
                <div key={signal.value} className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0">
                  <p className="text-xl text-[#fff8eb]">{signal.value}</p>
                  <p className="mt-2 text-sm leading-7 text-[#a99f8d]">{signal.label}</p>
                </div>
              ))}
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="shell py-20">
        <MotionReveal className="max-w-3xl">
          <p className="section-kicker">Confidence layer</p>
          <h2 className="section-title">Luxury buyers still buy confidence before they buy rarity.</h2>
          <p className="section-copy">
            The visual atmosphere creates desire. The trust layer closes the gap between intrigue and action.
            VEX now presents confidence explicitly through verification, transaction clarity, and concierge ownership.
          </p>
        </MotionReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {confidenceCards.map((card, index) => (
            <MotionReveal key={card.title} delay={index * 0.08} className="cinema-panel rounded-[1.9rem] p-7">
              <p className="section-kicker">{card.label}</p>
              <h3 className="mt-4 text-3xl text-[#fff8eb]">{card.title}</h3>
              <p className="mt-5 text-base leading-8 text-[#d8d0c2]">{card.copy}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="shell py-20">
        <MotionReveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Featured private collection</p>
            <h2 className="section-title">A tighter collection framed like an editorial acquisition file.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#ad9f8a]">
            Fewer listings, richer presentation, stronger hierarchy, and visible confidence signals before the buyer opens a detail page.
          </p>
        </MotionReveal>

        <MotionReveal delay={0.05} className="mt-8 flex flex-wrap gap-3">
          {collectionBadges.map((badge) => (
            <span key={badge} className="rounded-full border border-[#f1d38a]/18 bg-[#d4af37]/10 px-4 py-2 text-xs uppercase text-[#f1d38a]">
              {badge}
            </span>
          ))}
        </MotionReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {FEATURED_VEHICLES.slice(0, 6).map((vehicle, index) => (
            <MotionReveal key={vehicle.id} delay={index * 0.05}>
              <VehicleCard vehicle={vehicle} />
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="shell py-20">
        <MotionReveal className="cinema-panel rounded-[2rem] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="section-kicker">Process</p>
              <h2 className="section-title">A concierge journey with less friction and more control.</h2>
              <p className="section-copy max-w-xl">
                VEX is designed to feel expensive because every stage is tighter: stronger presentation,
                qualified access, and real human orchestration around the transaction.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {processSteps.map((step) => (
                <div key={step.number} className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
                  <p className="text-3xl text-[#f1d38a]">{step.number}</p>
                  <p className="mt-4 text-lg text-[#fff8eb]">{step.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#d8d0c2]">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionReveal>
      </section>

      <section className="shell py-20">
        <MotionReveal className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="glass-panel rounded-[2rem] p-7 sm:p-10">
            <p className="section-kicker">Direct line</p>
            <h2 className="section-title">Ready to acquire, consign, or structure a private deal?</h2>
            <p className="section-copy max-w-xl">
              Reach the team directly for discreet market guidance, curated acquisition support, or a seller-first review.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact" className="gold-button" data-magnetic="true">
                Request Private Access
              </Link>
              <Link href="/inventory" className="ghost-button" data-magnetic="true">
                Explore The Collection
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-7 sm:p-10">
            <p className="section-kicker">Contact</p>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[#d8d0c2]">
              <p>{contactPhone || "Phone line configured on request"}</p>
              <p>{contactEmail || "Email contact configured on request"}</p>
              <p>Human response only. No generic queue, no low-context handoff.</p>
            </div>
          </div>
        </MotionReveal>
      </section>
    </main>
  );
}
