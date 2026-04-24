import Link from "next/link";
import { colors, glass, radius, spacing, typography } from "@vex/design-system";
import type { Vehicle } from "@/lib/vehicles";
import { formatPrice } from "@/lib/vehicles";
import { SaveVehicleButton } from "@/components/inventory/SaveVehicleButton";
import { VehicleImageFrame } from "@/components/inventory/VehicleImageFrame";
import { WowFactorList } from "@/components/inventory/WowFactorList";

function metadataPills(vehicle: Vehicle) {
  return [vehicle.verifiedBadge, vehicle.availabilityBadge, vehicle.conditionClass];
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const metadata = metadataPills(vehicle);

  return (
    <article
      className="group overflow-hidden border border-white/10 bg-[#090909]/82 transition duration-300 hover:-translate-y-1 hover:border-[#f1d38a]/30"
      style={{ borderRadius: radius.xl, background: glass.cardGlass }}
    >
      <div className="relative">
        <Link
          href={`/inventory/${vehicle.id}`}
          prefetch={false}
          data-analytics-event="vehicle_detail_engagement"
          data-analytics-surface="vehicle_card_image"
          data-analytics-vehicle-id={String(vehicle.id)}
          data-analytics-vehicle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="block"
        >
          <VehicleImageFrame vehicle={vehicle} />
          <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap gap-2">
            {[vehicle.listingBadge, vehicle.rarityTier, vehicle.primaryImage.status === "pending" ? "Image verification pending" : null]
              .filter(Boolean)
              .map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-black/45 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-[#fff3cf]"
                  style={typography.metadata}
                >
                  {item}
                </span>
              ))}
          </div>
        </Link>
      </div>

      <div className="space-y-5 p-5 sm:p-6" style={{ padding: spacing.stackLg }}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[#fff8eb]" style={{ ...typography.displaySection, fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="mt-1 text-sm uppercase tracking-[0.22em] text-[#bfa987]">{vehicle.trim}</p>
            </div>
            <div className="text-right">
              <p style={{ ...typography.metadata, color: colors.textMuted }}>Private file value</p>
              <p className="mt-2 text-2xl font-semibold text-[#f1d38a]">{formatPrice(vehicle.price)}</p>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-[#d8d0c2]" style={typography.bodyStandard}>
            {vehicle.editorialHeadline}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
            <p style={{ ...typography.metadata, color: colors.textMuted }}>At a glance</p>
            <div className="mt-3 grid gap-2 text-sm text-[#e8dfd1]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#a99f8d]">Mileage</span>
                <span>{vehicle.miles.toLocaleString()} mi</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#a99f8d]">Location</span>
                <span>{vehicle.location}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#a99f8d]">Availability</span>
                <span>{vehicle.acquisitionStatus}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-[#f1d38a]/16 bg-[#d4af37]/8 p-4">
            <p style={{ ...typography.metadata, color: colors.goldSoft }}>Key spec profile</p>
            <div className="mt-3 grid gap-2 text-sm text-[#fff8eb]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#d9c9ad]">Power</span>
                <span>{vehicle.horsepower} hp</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#d9c9ad]">Drive</span>
                <span>{vehicle.drivetrain}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#d9c9ad]">Transmission</span>
                <span>{vehicle.transmission}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {metadata.map((item) => (
            <span
              key={item}
              className="flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-[#d6ccbc]"
              style={{ ...typography.metadata, letterSpacing: "0.14em" }}
            >
              {item}
            </span>
          ))}
        </div>

        <div>
          <p className="mb-3 text-[0.72rem] uppercase tracking-[0.26em] text-[#a99f8d]" style={typography.metadata}>
            Why this vehicle matters
          </p>
          <WowFactorList items={vehicle.wowFactors} compact />
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-black/24 p-4">
          <div className="grid gap-2 text-sm text-[#d8d0c2]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a99f8d]">Exterior / Interior</span>
              <span>{vehicle.exteriorColor} / {vehicle.interiorColor}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a99f8d]">Engine</span>
              <span>{vehicle.engine}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a99f8d]">Concierge</span>
              <span>{vehicle.conciergeAvailability}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <Link href={`/contact?vehicle=${vehicle.id}`} className="gold-button text-center">
              {vehicle.ctas.primary}
            </Link>
            <Link href={`/inventory/${vehicle.id}`} className="ghost-button text-center">
              {vehicle.ctas.secondary}
            </Link>
            <Link href={`/appraisal?vehicle=${vehicle.id}`} className="ghost-button text-center">
              {vehicle.ctas.tertiary}
            </Link>
          </div>
          <SaveVehicleButton vehicleId={vehicle.id} />
        </div>
      </div>
    </article>
  );
}
