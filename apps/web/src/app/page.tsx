import { Header } from "@/components/Header";
import "./home-landing.css";
import {
  AutonomousAgentsShowcase,
  DealerProgramHero,
  MarketplaceSubletTeaser,
  PaymentOrchestrationBar,
} from "@/components/landing";
import { ScrollStorySection } from "@/components/ScrollStorySection";
import { AmbientIdentityModule } from "@/components/AmbientIdentityModule";
import { PrestigeMarquee } from "@/components/PrestigeMarquee";
import { ExoticPillars } from "@/components/ExoticPillars";
import { ConfiguratorPreview } from "@/components/ConfiguratorPreview";
import { FeaturedInventory } from "@/components/FeaturedInventory";
import { PremiumServices } from "@/components/PremiumServices";
import { TestDriveStrip } from "@/components/TestDriveStrip";
import { TrustStrip } from "@/components/TrustStrip";

export default function HomePage() {
  return (
    <>
      <Header />
      <AmbientIdentityModule />
      <main id="main-content" className="home-main home-landing" aria-label="Vortex Exotic Exchange home">
        <DealerProgramHero />
        <AutonomousAgentsShowcase />
        <MarketplaceSubletTeaser />
        <PaymentOrchestrationBar />
        <ScrollStorySection />
        <PrestigeMarquee />
        <ExoticPillars />
        <ConfiguratorPreview />
        <FeaturedInventory />
        <PremiumServices />
        <TestDriveStrip />
        <TrustStrip />
      </main>
    </>
  );
}
