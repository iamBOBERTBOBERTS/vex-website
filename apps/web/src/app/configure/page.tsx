import Link from "next/link";
import { ConfigureExperienceClient } from "./ConfigureExperienceClient";

export const metadata = {
  title: "Configure · VEX",
  description: "Real-time 3D configuration — colors, wheels, interior, live pricing.",
};

export default function ConfigurePage() {
  return (
    <main id="main-content" className="shell py-14 sm:py-18" style={{ minHeight: "100vh" }}>
      <div className="grid gap-8">
        <div className="max-w-3xl">
          <p className="section-kicker">Build your Vortex</p>
          <h1 className="section-title">Configuration preview with live material context.</h1>
          <p className="section-copy">
            This route hosts the shared <code style={{ fontSize: "0.85em" }}>@vex/ui/3d</code> viewer and keeps the
            build flow visible while the deeper pricing and checkout layers continue hardening.
          </p>
          <p className="mt-6">
            <Link href="/build" className="ghost-button">
            Open full build flow →
            </Link>
          </p>
        </div>
        <div className="glass-panel overflow-visible rounded-[1.6rem] border border-white/10 p-3 sm:p-4">
          <ConfigureExperienceClient />
        </div>
      </div>
    </main>
  );
}
