import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/vehicles";
import type { Vehicle } from "@/lib/vehicles";

function getVehicleMetadata(vehicle: Vehicle) {
  const mileageQuality = vehicle.miles < 500 ? "Delivery-mile" : vehicle.miles < 1500 ? "Low-mile" : "Driven";

  return [
    vehicle.verificationStatus,
    mileageQuality,
    vehicle.conditionClass,
    vehicle.acquisitionStatus,
  ];
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const metadata = getVehicleMetadata(vehicle);

  return (
    <Link
      href={`/inventory/${vehicle.id}`}
      prefetch={false}
      className="group glass-panel vehicle-tile overflow-hidden rounded-[1.55rem] transition duration-300 hover:-translate-y-1 hover:border-[#f1d38a]/32"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={vehicle.image}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 980px) 100vw, 33vw"
          className="luxury-photo object-cover transition duration-700 group-hover:scale-[1.045]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_22%),linear-gradient(0deg,rgba(0,0,0,0.82),rgba(0,0,0,0.08)_58%,transparent)]" />
        <span className="absolute left-4 top-4 rounded-full border border-[#f1d38a]/22 bg-black/55 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-[#f1d38a]">
          {vehicle.badge}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="font-[var(--font-display)] text-3xl leading-none tracking-[-0.04em] text-[#fff8eb]">
            {vehicle.year} {vehicle.make}
          </p>
          <p className="mt-1 text-base text-[#d8d0c2]">{vehicle.model}</p>
        </div>
        <p className="text-sm text-[#a99f8d]">
          {vehicle.color} | {vehicle.miles.toLocaleString()} mi
        </p>
        <div className="grid gap-2 rounded-[1.2rem] border border-[#f1d38a]/12 bg-[#d4af37]/7 p-3">
          <p className="text-[0.68rem] uppercase text-[#f1d38a]">Rarity tier</p>
          <p className="text-sm leading-6 text-[#fff8eb]">{vehicle.rarityTier}</p>
          <p className="text-xs leading-5 text-[#a99f8d]">
            {vehicle.drivetrain} | {vehicle.performance}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {metadata.map((item) => (
            <span
              key={item}
              className="flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-[0.68rem] uppercase leading-4 text-[#cfc4b2]"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xl font-semibold text-[#f1d38a]">{formatPrice(vehicle.price)}</p>
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm text-[#f5f1e8] transition group-hover:border-[#f1d38a]/30 group-hover:text-[#fff8eb]">
            Private file
          </span>
        </div>
      </div>
    </Link>
  );
}
