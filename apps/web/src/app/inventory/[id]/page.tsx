import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getVehicleById } from "@/lib/vehicles";
import styles from "./detail.module.css";

const SERVICE_POINTS = [
  "Private introductions handled by a concierge, not an anonymous lead queue.",
  "Inspection, shipping, and final handover coordinated around buyer and seller timelines.",
  "Presentation built for confidence: verified seller status, tighter storytelling, and reduced noise.",
];

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = getVehicleById(params.id);

  if (!vehicle) {
    notFound();
  }

  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
  const phoneHref = contactPhone.replace(/\D/g, "");
  const maskedVin = `${"*".repeat(Math.max(0, vehicle.vin.length - 6))}${vehicle.vin.slice(-6)}`;

  return (
    <main className={styles.main}>
      <Link href="/inventory" className={styles.back}>
        Back to inventory
      </Link>

      <section className={styles.hero}>
        <div className={styles.mediaPanel}>
          <div className={styles.imageFrame}>
            <Image
              src={vehicle.image}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              fill
              priority
              className={styles.heroImage}
              sizes="(max-width: 960px) 100vw, 58vw"
            />
          </div>

          <div className={styles.serviceStrip}>
            {SERVICE_POINTS.map((point) => (
              <article key={point} className={styles.serviceCard}>
                <p className={styles.serviceCopy}>{point}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.summaryPanel}>
          <p className={styles.badge}>{vehicle.badge}</p>
          <h1 className={styles.title}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className={styles.meta}>
            {vehicle.color} / {vehicle.miles.toLocaleString()} miles / VIN {maskedVin}
          </p>
          <p className={styles.price}>{formatPrice(vehicle.price)}</p>
          <p className={styles.description}>{vehicle.description}</p>

          <div className={styles.ctas}>
            <Link href={`/contact?vehicle=${vehicle.id}`} className={styles.primaryCta}>
              Request more information
            </Link>
            <Link href="/contact" className={styles.secondaryCta}>
              Schedule private viewing
            </Link>
          </div>

          <div className={styles.specPanel}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Seller status</span>
              <span className={styles.specValue}>Verified since {vehicle.sellerSince}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Market stance</span>
              <span className={styles.specValue}>Privately presented</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Delivery support</span>
              <span className={styles.specValue}>Inspection, transport, and handover</span>
            </div>
          </div>

          <div className={styles.contactPanel}>
            <p className={styles.contactEyebrow}>Direct line</p>
            <p className={styles.contactCopy}>
              A dedicated VEX concierge handles this vehicle from first inquiry through final closing.
            </p>
            {phoneHref ? (
              <a href={`tel:${phoneHref}`} className={styles.phoneLink}>
                {contactPhone}
              </a>
            ) : (
              <p className={styles.contactCopy}>Phone contact is not configured.</p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
