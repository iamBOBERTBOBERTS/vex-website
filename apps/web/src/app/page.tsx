import Link from "next/link";
import { colors, radius, spacing, typography } from "@vex/design-system";
import { FEATURED_VEHICLES, formatPrice } from "@/lib/vehicles";
import { AutomotiveAtmosphere } from "@/components/atmosphere";
import { EntrySequence } from "@/components/entry/EntrySequence";
import { EditorialContainer, EditorialHeader, FeatureGrid, SectionShell } from "@/components/layout";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleImageFrame } from "@/components/inventory/VehicleImageFrame";
import { MotionReveal } from "@/components/site/MotionReveal";
import { getVideoProps } from "@/lib/media/videoLoader";

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
      <SectionShell
        id="universe"
        variant="hero"
        className="cinematic-gate-hero relative overflow-hidden pb-20 pt-10 sm:pt-16"
        atmosphere={<AutomotiveAtmosphere variant="hero" intensity="high" />}
      >
        {heroVideoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            autoPlay
            loop
            src={heroVideoUrl}
            {...getVideoProps("hero")}
          />
        ) : null}
        <div className="gate-backplate" aria-hidden />
        <div className="gate-beams" aria-hidden />
        <div className="gate-aperture" aria-hidden />
        <div className="gate-film" aria-hidden />
        <div className="gate-grade" aria-hidden />

        <EditorialContainer width="feature" className="hero-stage relative">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.86fr] lg:gap-14">
            <MotionReveal className="hero-copy-lux">
              <p className="section-kicker" style={{ ...typography.sectionEyebrow }}>Private market operating layer</p>
              <h1 className="hero-title-lux mt-6 text-[#fff8eb]" style={typography.displayHero}>
                A private exotic vehicle operating environment for serious acquisition.
              </h1>
              <p className="hero-lede-lux mt-7 sm:text-lg" style={{ ...typography.bodyLarge, color: colors.textSoft }}>
                VEX organizes verified collection access, valuation confidence, and white-glove transaction flow inside one
                calmer automotive platform. The atmosphere should feel like a discreet showroom, not a public marketplace.
              </p>

              <div className="hero-actions-lux mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/inventory"
                  className="gold-button"
                  data-magnetic="true"
                  data-analytics-event="hero_cta_click"
                  data-analytics-surface="homepage_hero"
                >
                  Explore Inventory
                </Link>
                <Link
                  href="/appraisal"
                  className="ghost-button"
                  data-magnetic="true"
                  data-analytics-event="concierge_cta_click"
                  data-analytics-surface="homepage_hero"
                >
                  Request Private Appraisal
                </Link>
              </div>

              <div className="hero-trust-strip mt-9" aria-label="Platform trust signals">
                {["Verified provenance posture", "White-glove acquisition support", "Private archive presentation", "Human-led close coordination"].map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>

              <div className="hero-metrics-lux mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { value: `${FEATURED_VEHICLES.length}`, label: "spotlight vehicles" },
                  { value: "24h", label: "average response target" },
                  { value: "1:1", label: "concierge ownership" },
                ].map((metric) => (
                  <div key={metric.label} className="glass-panel editorial-stat stat-glass rounded-[1.35rem] p-5">
                    <p style={{ ...typography.metadata, color: colors.textMuted }}>{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[#fff8eb]">{metric.value}</p>
                  </div>
                ))}
              </div>
            </MotionReveal>

            <MotionReveal delay={0.1} className="relative">
              <div className="gate-specular-line" aria-hidden />
              <div
                className="vault-panel gate-showpiece relative overflow-hidden p-6 sm:p-8 md:[transform:perspective(1400px)_rotateY(-8deg)_rotateX(2deg)] md:transition-transform md:duration-500 md:hover:[transform:perspective(1400px)_rotateY(-4deg)_rotateX(0deg)]"
                style={{ borderRadius: radius.heroPanel }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.14),transparent_34%,transparent_68%,rgba(241,211,138,0.16))]" />
                <div className="relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p style={{ ...typography.metadata, color: colors.goldSoft }}>Current spotlight</p>
                      <p className="mt-2 text-xl text-[#fff8eb]">{spotlightVehicle.year} {spotlightVehicle.make} {spotlightVehicle.model}</p>
                    </div>
                    <span className="rounded-full border border-[#f1d38a]/18 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#f1d38a]">
                      {spotlightVehicle.badge}
                    </span>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-[1.75rem]">
                    <div className="relative">
                      <VehicleImageFrame vehicle={spotlightVehicle} variant="hero" priority />
                      <div className="absolute inset-x-4 bottom-4">
                        <p className="text-3xl font-medium tracking-[-0.05em] text-[#fff8eb]">{formatPrice(spotlightVehicle.price)}</p>
                        <p className="mt-1 text-sm text-[#d8d0c2]">
                          {spotlightVehicle.color} | {spotlightVehicle.miles.toLocaleString()} miles
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[#d8d0c2]">
                    {spotlightVehicle.description} Presented with enough editorial structure to feel like a private acquisition brief,
                    not a basic listing card.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="compact">
        <EditorialContainer>
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
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="default">
        <EditorialContainer>
        <MotionReveal>
          <EditorialHeader
            eyebrow="Private collection philosophy"
            title="The platform exists for vehicles that deserve context before exposure."
            description="VEX is not trying to become another high-volume listing wall. It is designed for curated exotic acquisition, controlled seller visibility, and buyer confidence around assets where provenance, condition, rarity, and timing matter."
          />
        </MotionReveal>

        <FeatureGrid className="mt-10" columns={3}>
          {collectionPrinciples.map((pillar, index) => (
            <MotionReveal key={pillar.title} delay={index * 0.08} className="glass-panel rounded-[1.75rem] p-6">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#f1d38a]/20 bg-[#d4af37]/10 text-sm font-semibold text-[#f1d38a]">
                0{index + 1}
              </div>
              <h3 className="text-2xl text-[#fff8eb]">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#d8d0c2]">{pillar.copy}</p>
            </MotionReveal>
          ))}
        </FeatureGrid>
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="default">
        <EditorialContainer>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <MotionReveal>
            <EditorialHeader
              eyebrow="Verification confidence"
              title="Trust is presented as part of the product, not hidden behind the inquiry."
              description="Exotic buyers do not only evaluate design, mileage, and price. They evaluate confidence. VEX surfaces the checks and ownership signals that reduce uncertainty before the conversation becomes serious."
            />
          </MotionReveal>

          <MotionReveal delay={0.08} className="vault-panel rounded-[2rem] p-7 sm:p-9">
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
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="cinematic">
        <EditorialContainer>
        <MotionReveal className="vault-panel rounded-[2rem] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <EditorialHeader
                eyebrow="Concierge acquisition flow"
                title="A private purchase should feel orchestrated from the first conversation."
                description="The VEX acquisition flow is built around fewer unknowns: buyer intent, collection fit, seller readiness, appraisal confidence, logistics, and final delivery are treated as one connected experience."
              />
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
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="default">
        <EditorialContainer>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <MotionReveal>
            <EditorialHeader
              eyebrow="Market intelligence"
              title="The appraisal layer gives the experience financial gravity."
              description="Premium presentation has to be supported by pricing awareness. VEX frames each acquisition or appraisal with the signals that matter to owners, collectors, dealers, and high-intent buyers."
            />
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
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="default">
        <EditorialContainer>
        <MotionReveal>
          <EditorialHeader
            eyebrow="Verification confidence"
            title="Luxury buyers still buy confidence before they buy rarity."
            description="The visual atmosphere creates desire. The trust layer closes the gap between intrigue and action. VEX now presents confidence explicitly through verification, transaction clarity, and concierge ownership."
          />
        </MotionReveal>

        <FeatureGrid className="mt-10" columns={2}>
          {confidenceCards.map((card, index) => (
            <MotionReveal key={card.title} delay={index * 0.08} className="vault-panel rounded-[1.9rem] p-7">
              <p className="section-kicker">{card.label}</p>
              <h3 className="mt-4 text-3xl text-[#fff8eb]">{card.title}</h3>
              <p className="mt-5 text-base leading-8 text-[#d8d0c2]">{card.copy}</p>
            </MotionReveal>
          ))}
        </FeatureGrid>
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="cinematic" atmosphere={<AutomotiveAtmosphere variant="collection" intensity="medium" />}>
        <EditorialContainer>
        <MotionReveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <EditorialHeader
              eyebrow="Featured private collection"
              title="A tighter collection framed like a private vault, not a listing grid."
              description=""
            />
          </div>
          <p className="max-w-md text-sm leading-7 text-[#ad9f8a]" style={{ ...typography.bodyStandard, color: colors.textMuted }}>
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
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="default">
        <EditorialContainer>
        <MotionReveal className="vault-panel rounded-[2rem] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <EditorialHeader
                eyebrow="White-glove process"
                title="A concierge journey with less friction and more control."
                description="VEX is designed to feel expensive because every stage is tighter: stronger presentation, qualified access, and real human orchestration around the transaction."
              />
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
        </EditorialContainer>
      </SectionShell>

      <SectionShell variant="cinematic" atmosphere={<AutomotiveAtmosphere variant="cta" intensity="high" />}>
        <EditorialContainer>
        <MotionReveal className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="vault-panel rounded-[2rem] p-7 sm:p-10">
            <p className="section-kicker">Final private access</p>
            <h2 className="section-title">Ready to open a discreet acquisition channel, consign with context, or structure a serious private deal?</h2>
            <p className="section-copy max-w-xl">
              Reach the team for discreet market guidance, curated acquisition support, seller-first review, or access to inventory that should not read like an open marketplace.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Response standard", value: "24h" },
                { label: "Concierge ownership", value: "1:1" },
                { label: "Private handoff", value: "Human-led" },
              ].map((signal) => (
                <div key={signal.label} className="rounded-[1.25rem] border border-white/10 bg-black/24 p-4">
                  <p style={{ ...typography.metadata, color: colors.textMuted }}>{signal.label}</p>
                  <p className="mt-3 text-xl text-[#fff8eb]">{signal.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="gold-button"
                data-magnetic="true"
                data-analytics-event="concierge_cta_click"
                data-analytics-surface="homepage_final_cta"
              >
                Request Private Access
              </Link>
              <Link
                href="/inventory"
                className="ghost-button"
                data-magnetic="true"
                data-analytics-event="collection_engagement"
                data-analytics-surface="homepage_final_cta"
              >
                Explore The Collection
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-7 sm:p-10">
            <p className="section-kicker">Response protocol</p>
            <h3 className="mt-4 text-3xl text-[#fff8eb]">A flagship CTA should feel like handing the keys to a private concierge desk.</h3>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[#d8d0c2]">
              <p>Every inquiry is expected to move into a controlled, high-context conversation with verification, timing, and next-step clarity.</p>
              <p>{contactPhone || "Phone line configured on request"}</p>
              <p>{contactEmail || "Email contact configured on request"}</p>
              <p>Human response only. No generic queue, no low-context handoff.</p>
            </div>
          </div>
        </MotionReveal>
        </EditorialContainer>
      </SectionShell>
    </main>
  );
}
