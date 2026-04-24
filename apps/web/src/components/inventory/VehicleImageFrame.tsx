import Image from "next/image";
import { colors, gradients, typography } from "@vex/design-system";
import type { Vehicle } from "@/lib/vehicles";
import { responsiveImage } from "@/lib/media/responsiveImage";

type VehicleImageFrameProps = {
  vehicle: Vehicle;
  className?: string;
  priority?: boolean;
  variant?: "card" | "hero" | "detail" | "gallery";
};

const variantAspectClass: Record<NonNullable<VehicleImageFrameProps["variant"]>, string> = {
  card: "aspect-[16/11]",
  hero: "aspect-[16/10]",
  detail: "aspect-[16/10]",
  gallery: "aspect-[4/3]",
};

export function VehicleImageFrame({
  vehicle,
  className = "",
  priority = false,
  variant = "card",
}: VehicleImageFrameProps) {
  const hasImage = Boolean(vehicle.primaryImage.src);

  return (
    <div className={`relative overflow-hidden ${variantAspectClass[variant]} ${className}`}>
      {hasImage ? (
        <Image
          {...responsiveImage(vehicle.primaryImage.src as string, variant === "hero" ? "hero" : "editorial")}
          alt={vehicle.primaryImage.alt}
          fill
          priority={priority}
          className="luxury-photo object-cover"
        />
      ) : (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: gradients.showroom,
            }}
          />
          <div className="absolute inset-x-[-20%] top-[-12%] h-[48%] rotate-[-8deg] bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_65%)] blur-3xl" />
          <div className="absolute inset-x-[10%] bottom-[-20%] h-[46%] rounded-[50%] bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),transparent_22%,transparent_68%,rgba(227,184,115,0.1))]" />
          <div className="absolute inset-x-[12%] top-[22%] h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-75" />
          <div className="absolute inset-x-[12%] top-[58%] h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
          <div className="absolute inset-y-[18%] right-[10%] w-[1px] bg-[linear-gradient(180deg,transparent,rgba(212,175,55,0.35),transparent)] opacity-70" />

          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <span
                className="rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[#f1d38a]"
                style={typography.metadata}
              >
                {vehicle.primaryImage.label ?? "Image verification pending"}
              </span>
              <span
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[#d8d0c2]"
                style={typography.metadata}
              >
                {vehicle.location}
              </span>
            </div>

            <div className="max-w-xl">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[#bba88a]" style={typography.metadata}>
                Private vehicle file
              </p>
              <h3
                className="mt-3 text-[#fff8eb]"
                style={{
                  ...typography.displaySection,
                  fontSize: variant === "card" ? "clamp(1.8rem, 4vw, 2.5rem)" : "clamp(2.35rem, 5vw, 4.25rem)",
                }}
              >
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-[#d8d0c2]">{vehicle.trim}</p>
              <p className="mt-4 max-w-lg text-sm leading-7" style={{ ...typography.bodyStandard, color: colors.textSoft }}>
                {vehicle.imageVerificationNote ?? "Verified media is being staged before public publication."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_24%),linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.12)_54%,transparent)]" />
    </div>
  );
}
