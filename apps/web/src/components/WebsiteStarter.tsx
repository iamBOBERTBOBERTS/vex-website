import Link from "next/link";
import styles from "./WebsiteStarter.module.css";

const features = [
  {
    title: "Fast by default",
    text: "Built with a lightweight structure, clean spacing, and simple interactions so the experience feels smooth on phones and desktops.",
  },
  {
    title: "Mobile-first design",
    text: "Every section stacks cleanly on smaller screens, then expands beautifully for tablets and larger monitors.",
  },
  {
    title: "Premium visual feel",
    text: "Rounded surfaces, subtle shadows, balanced typography, and clear calls to action create a polished modern brand presence.",
  },
];

const cards = [
  {
    title: "Beautiful landing page",
    text: "A clean hero section, benefit-driven messaging, trust signals, and a strong conversion path.",
  },
  {
    title: "Service or product showcase",
    text: "Highlight what you offer with elegant cards, short copy, and a layout that stays readable everywhere.",
  },
  {
    title: "Easy contact flow",
    text: "Simple forms and clear calls to action make it easy for visitors to reach out or get started quickly.",
  },
];

const stats = [
  { value: "Fast", label: "Smooth browsing" },
  { value: "Clean", label: "Modern visuals" },
  { value: "Responsive", label: "Phone to desktop" },
];

export default function WebsiteStarter() {
  return (
    <div className={styles.page}>
      <div className={styles.ambient}>
        <div className={styles.glowPrimary} />
        <div className={styles.glowSecondary} />
        <div className={styles.glowTertiary} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.brand}>Your Brand</p>

          <nav className={styles.nav} aria-label="Website starter sections">
            <a href="#features">Features</a>
            <a href="#showcase">Showcase</a>
            <a href="#contact">Contact</a>
          </nav>

          <a href="#contact" className={styles.headerCta}>
            Get Started
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.badge}>Clean design • Fast feel • Mobile ready</div>

            <h1 className={styles.title}>A beautiful website that feels premium, smooth, and easy to use.</h1>

            <p className={styles.lede}>
              Create a strong first impression with a sleek, modern site that looks great on phones, tablets, and
              desktops without feeling heavy or cluttered.
            </p>

            <div className={styles.heroActions}>
              <a href="#contact" className={styles.primaryCta}>
                Build My Site
              </a>
              <a href="#showcase" className={styles.secondaryCta}>
                View Layout
              </a>
            </div>

            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <article key={stat.value} className={styles.statCard}>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.previewShell} aria-label="Website starter preview">
            <div className={styles.previewChrome}>
              <span />
              <span />
              <span />
            </div>

            <div className={styles.previewStage}>
              <div className={styles.previewHero}>
                <p className={styles.previewEyebrow}>Launch-ready template</p>
                <h2>Modern web presence for service businesses, creators, and premium brands.</h2>
                <div className={styles.previewButtons}>
                  <span className={styles.previewButtonPrimary}>Primary CTA</span>
                  <span className={styles.previewButtonGhost}>Secondary</span>
                </div>
              </div>

              <div className={styles.previewPanels}>
                <article className={styles.previewPanel}>
                  <p>Trust signals</p>
                  <strong>Testimonials, logos, proof</strong>
                </article>
                <article className={styles.previewPanel}>
                  <p>Showcase block</p>
                  <strong>Cards, offers, outcomes</strong>
                </article>
              </div>

              <div className={styles.previewFooterRow}>
                <div className={styles.previewBarWide} />
                <div className={styles.previewBarShort} />
              </div>
            </div>
          </aside>
        </section>

        <section id="features" className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>Why it works</p>
            <h2>Designed to feel polished from the first scroll to the final call to action.</h2>
            <p>
              This starter keeps the structure simple and high-conviction: a clear hero, readable sections, and
              consistent spacing that makes the whole experience feel more expensive than it is.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureAccent} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="showcase" className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>Showcase</p>
            <h2>Flexible enough for a landing page, service site, or premium one-page brand launch.</h2>
            <p>
              The layout is intentionally modular, so sections can be expanded, simplified, or repurposed without
              breaking the overall rhythm.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {cards.map((card, index) => (
              <article key={card.title} className={styles.showcaseCard}>
                <p className={styles.cardIndex}>0{index + 1}</p>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactCopy}>
            <p className={styles.sectionEyebrow}>Contact</p>
            <h2>Ready to turn this starter into a finished website that matches your brand?</h2>
            <p>
              Use this as the foundation, then tailor the copy, imagery, and offers to your business. The structure is
              already designed to convert attention into action.
            </p>

            <div className={styles.contactActions}>
              <Link href="/contact" className={styles.primaryCta}>
                Start a Project
              </Link>
              <a href="mailto:hello@example.com" className={styles.secondaryCta}>
                Email Us
              </a>
            </div>
          </div>

          <article className={styles.contactCard}>
            <p className={styles.contactLabel}>Simple next steps</p>
            <ul className={styles.contactList}>
              <li>Share your brand name, offer, and target customer.</li>
              <li>Choose the sections you want to keep or expand.</li>
              <li>Launch with a layout that already looks refined on mobile and desktop.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
