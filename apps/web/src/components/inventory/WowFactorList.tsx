import { typography } from "@vex/design-system";

export function WowFactorList({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3"}>
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-[#e6dece]"
        >
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#f1d38a]" aria-hidden="true" />
          <span style={typography.bodyStandard}>{item}</span>
        </div>
      ))}
    </div>
  );
}
