import Image from "next/image";
import Link from "next/link";
import { FEATURED_VEHICLES } from "@/lib/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import styles from "./home.module.css";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
const heroVideoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Qualify the room",
    copy: "Every introduction begins with identity, intent, and capital verification so each listing is shown to credible buyers only.",
  },
  {
    number: "02",
    title: "Shape the narrative",
    copy: "We frame provenance, specification, and condition with editorial discipline so the vehicle lands with the right audience instantly.",
  },
  {
    number: "03",
    title: "Close without friction",
    copy: "Inspection, transport, escrow, and handover are coordinated through one concierge lane designed for discreet, high-value transactions.",
  },
];

const SELLER_PROMISE = [
  {
    title: "Private by default",
    copy: "Your vehicle is not thrown into an open listing sea. Exposure stays targeted, measured, and brand-safe.",
  },
  {
    title: "High-context buyers",
    copy: "We connect sellers with buyers who understand rarity, service history, and collector-grade execution.",
  },
  {
    title: "White-glove orchestration",
    copy: "From initial inquiry through transport, every step is handled like a flagship client experience rather than a commodity transaction.",
  },
];

export default function HomePage() {
  const spotlightVehicle = FEATURED_VEHICLES[0];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        {heroVideoUrl ? <video className={styles.heroVideo} autoPlay muted loop playsInline src={heroVideoUrl} /> : null}
        <div className={styles.heroShade} />

        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrowRow}>
                <p className={styles.eyebrow}>Private market architecture</p>
                <span className={styles.eyebrowNote}>Concierge-led acquisition flow</span>
              </div>

              <h1 className={styles.headline}>The private market for vehicles that should never feel public.</h1>

              <p className={styles.lede}>
                VEX is designed for high-trust buying and selling in the exotic and ultra-luxury segment. Every detail
                is curated to feel deliberate: fewer listings, sharper presentation, and a transaction path that moves
                like a flagship hospitality brand.
              </p>

              <div className={styles.actions}>
                <Link href="/inventory" className="btn btnPrimary">
                  Browse the collection
                </Link>
                <Link href="/sell" className="btn btnGhost">
                  Submit a private vehicle
                </Link>
                <div className={styles.actionMeta}>
                  <span className={styles.metaStrong}>Designed for rare inventory, discreet sellers, and serious buyers.</span>
                  <span>Editorial presentation, verified access, human-led closing.</span>
                </div>
              </div>

              <div className={styles.metricRail}>
                <div className={styles.metricCard}>
                  <div className={styles.metricValue}>6</div>
                  <div className={styles.metricLabel}>Current spotlight vehicles</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricValue}>24h</div>
                  <div className={styles.metricLabel}>Average response target</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricValue}>1:1</div>
                  <div className={styles.metricLabel}>Concierge deal ownership</div>
                </div>
              </div>
            </div>

            <aside className={styles.spotlight}>
              <span className={styles.spotlightLabel}>Current spotlight</span>
              <div className={styles.spotlightMedia}>
                <Image
                  src={spotlightVehicle.image}
                  alt={`${spotlightVehicle.year} ${spotlightVehicle.make} ${spotlightVehicle.model}`}
                  fill
                  priority
                  className={styles.spotlightImage}
                  sizes="(max-width: 1100px) 100vw, 34vw"
                />
                <div className={styles.spotlightOverlay}>
                  <p className={styles.spotlightTitle}>
                    {spotlightVehicle.year} {spotlightVehicle.make} {spotlightVehicle.model}
                  </p>
                  <p className={styles.spotlightMeta}>
                    {spotlightVehicle.color} / {spotlightVehicle.miles.toLocaleString()} miles / {spotlightVehicle.badge}
                  </p>
                </div>
              </div>
              <p className={styles.spotlightCopy}>
                {spotlightVehicle.description} Presented with the kind of atmosphere, scarcity, and precision that
                elevates a vehicle from listing to object of desire.
              </p>
            </aside>
          </div>

          <div className={styles.ticker}>
            <span className={styles.tickerItem}>Verified sellers only</span>
            <span className={styles.tickerItem}>Qualified buyer access</span>
            <span className={styles.tickerItem}>Private transaction support</span>
            <span className={styles.tickerItem}>Concierge transport and handover</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionSplit}>
          <div>
            <span className={styles.sectionTag}>Experience design</span>
            <h2 className={styles.sectionTitle}>A marketplace built more like a private salon than a classifieds feed.</h2>
          </div>
          <p className={styles.sectionText}>
            The site is structured around emotional control. Buyers need clarity without clutter. Sellers need prestige
            without noise. Every panel, transition, and content block should reinforce confidence, scarcity, and
            discretion rather than making the visitor work to understand what makes the experience special.
          </p>
        </div>

        <div className={styles.editorialGrid}>
          <article className={styles.editorialFeature}>
            <p className={styles.sectionTag}>Atmosphere first</p>
            <h3 className={styles.editorialFeatureTitle}>Quiet power. Warm metal. Cinematic restraint.</h3>
            <p className={styles.editorialFeatureCopy}>
              Luxury on the web becomes forgettable when it shouts. VEX should feel like stepping into a dimly lit
              delivery suite: polished surfaces, measured confidence, and enough drama to make every frame memorable.
            </p>
            <div className={styles.editorialStat}>
              <span className={styles.editorialStatValue}>Collector-grade trust</span>
              <span className={styles.sectionText}>Presentation quality is part of the transaction quality.</span>
            </div>
          </article>

          <div className={styles.editorialStack}>
            <article className={styles.stackCard}>
              <h3 className={styles.stackTitle}>Seamless inner workings</h3>
              <p className={styles.stackCopy}>
                Inventory, inquiry flow, qualification, and seller submission should feel connected, not stitched
                together. The website must move visitors naturally from intrigue to action.
              </p>
            </article>
            <article className={styles.stackCard}>
              <h3 className={styles.stackTitle}>Editorial scarcity</h3>
              <p className={styles.stackCopy}>
                A tighter collection with stronger framing will always feel more luxurious than a dense feed. The site
                should privilege curation over volume.
              </p>
            </article>
            <article className={styles.stackCard}>
              <h3 className={styles.stackTitle}>Operational polish</h3>
              <p className={styles.stackCopy}>
                Premium visuals only matter if the underlying flow is smooth. The public experience needs equal weight
                on clarity, responsiveness, and conversion path quality.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.collectionHeader}>
          <div>
            <span className={styles.sectionTag}>Curated inventory</span>
            <h2 className={styles.sectionTitle}>Featured collection</h2>
          </div>
          <p className={styles.collectionNote}>
            Vehicles are framed like objects in a private catalog: high signal, intentional spacing, and immediate
            confidence in what matters.
          </p>
        </div>

        <div className={styles.vehicleGrid}>
          {FEATURED_VEHICLES.slice(0, 6).map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.processPanel}>
          <span className={styles.sectionTag}>Concierge sequence</span>
          <h2 className={styles.sectionTitle}>A transaction journey that feels frictionless from first click to final handover.</h2>
          <div className={styles.processGrid}>
            {PROCESS_STEPS.map((step) => (
              <article key={step.number} className={styles.processCard}>
                <p className={styles.processNumber}>{step.number}</p>
                <h3 className={styles.processTitle}>{step.title}</h3>
                <p className={styles.processCopy}>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sellerPanel}>
          <div className={styles.sellerContent}>
            <span className={styles.sectionTag}>Seller promise</span>
            <h2 className={styles.sectionTitle}>For owners who want prestige, privacy, and a buyer pool worthy of the car.</h2>
            <p className={styles.sectionText}>
              The seller flow should feel as elevated as the buyer flow. Listing with VEX is about control over how the
              vehicle is introduced, who sees it, and how the conversation is handled from start to finish.
            </p>
          </div>
          <div className={styles.sellerList}>
            {SELLER_PROMISE.map((item) => (
              <article key={item.title} className={styles.sellerItem}>
                <h3 className={styles.sellerItemTitle}>{item.title}</h3>
                <p className={styles.sellerItemCopy}>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.ctaPanel}>
          <div>
            <span className={styles.sectionTag}>Start the conversation</span>
            <h2 className={styles.ctaHeading}>Ready to acquire, consign, or architect a private deal?</h2>
            <p className={styles.ctaCopy}>
              The closing experience should feel personal from the first interaction. Reach the team directly, or enter
              through the tailored inquiry flow built for discreet, high-value transactions.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn btnPrimary">
                Begin an inquiry
              </Link>
              <Link href="/how-it-works" className="btn btnGhost">
                See how the process works
              </Link>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <span className={styles.ctaLabel}>Direct contact</span>
            <p className={styles.contactLine}>{contactPhone || "Phone line configured on request"}</p>
            <p className={styles.contactLine}>{contactEmail || "Email contact configured on request"}</p>
            <p className={styles.sectionText}>
              No forms-first dead end. Human response, contextual qualification, and a communication tone that matches
              the caliber of the inventory.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
