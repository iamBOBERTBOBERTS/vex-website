import Image from "next/image";
import Link from "next/link";
import { FEATURED_VEHICLES, formatPrice } from "@/lib/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { MotionReveal } from "@/components/site/MotionReveal";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
const heroVideoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "";

const pillars = [
  {
    title: "Private market presence",
    copy: "An atmosphere built around scarcity, confidence, and editorial control rather than the noise of public marketplaces.",
  },
  {
    title: "Concierge-led transaction flow",
    copy: "Qualified access, high-context communication, and human-led support from first inquiry through transport and handover.",
  },
  {
    title: "Dealer-grade operating logic",
    copy: "The frontend looks rare, but the platform underneath still supports appraisal, inventory, lead, and subscription workflows.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Frame the opportunity",
    copy: "Every vehicle is positioned with stronger narrative, cleaner hierarchy, and a visual system worthy of the asset.",
  },
  {
    number: "02",
    title: "Qualify the room",
    copy: "Buyer and seller interactions are filtered toward serious, high-intent conversations rather than generic traffic.",
  },
  {
    number: "03",
    title: "Close with control",
    copy: "Appraisal, concierge coordination, logistics, and direct communication move inside a calmer premium flow.",
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

export default function HomePage() {
  const spotlightVehicle = FEATURED_VEHICLES[0];

  return (
    <main id="main-content">
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
          <p className="section-kicker">Foundation</p>
          <h2 className="section-title">A luxury frontend sitting on usable platform logic.</h2>
          <p className="section-copy">
            The aesthetic is cinematic, but the structure remains practical: inventory routes, appraisal flows,
            lead capture, subscriptions, and dealer-grade operations are all still part of the product surface.
          </p>
        </MotionReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
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
            <p className="section-kicker">Featured inventory</p>
            <h2 className="section-title">A tighter collection framed like a private catalog.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#ad9f8a]">
            Fewer listings, richer presentation, stronger hierarchy, and a calmer path to inquiry.
          </p>
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
            <div className="grid gap-4 sm:grid-cols-3">
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
                Begin an inquiry
              </Link>
              <Link href="/how-it-works" className="ghost-button" data-magnetic="true">
                Review the process
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
