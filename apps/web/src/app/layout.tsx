import type { Metadata } from "next";
import { Syne, Fraunces, Plus_Jakarta_Sans, Outfit, Playfair_Display } from "next/font/google";
import { BuildProvider } from "@/contexts/BuildContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantThemeProvider } from "@/components/TenantThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Footer } from "@/components/Footer";
import { SkipToContent } from "@/components/SkipToContent";
import { AmbientShell } from "@/components/ambient";
import { CinematicMotionProvider, LuxuryEdgeAccent, SceneAwareFx } from "@/components/fx";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

/**
 * Typography stack (CSS variable names kept for existing modules):
 * - --font-montserrat → Syne (bold gallery/display for UI, labels, section titles)
 * - --font-display → Playfair (hero & marquee-scale headlines)
 * - --font-serif → Fraunces (italic ledes, editorial moments)
 * - --font-inter → Plus Jakarta Sans (body, forms, readable UI)
 * - --font-poppins → Outfit (nav, cards, secondary UI)
 */
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "VEX | Vortex Exotic Exchange",
  description:
    "The private exchange for exotic vehicles — curated lots, sealed bids, and white-glove delivery for collectors worldwide.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Vex" },
  openGraph: {
    title: "VEX Dealer Platform",
    description: "CRM + inventory + portal + appraisals for modern auto dealers.",
    type: "website",
    url: siteUrl,
    images: [{ url: "/og-vex-appraisals.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VEX Dealer Platform",
    description: "White-label dealer SaaS with analytics and appraisals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      className={`${syne.variable} ${playfair.variable} ${fraunces.variable} ${plusJakarta.variable} ${outfit.variable}`}
    >
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <SkipToContent />
        <AmbientShell />
        <CinematicMotionProvider>
          <LuxuryEdgeAccent />
          <SceneAwareFx />
          <TenantThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <BuildProvider>
                  {children}
                  <Footer />
                </BuildProvider>
              </AuthProvider>
            </QueryProvider>
          </TenantThemeProvider>
        </CinematicMotionProvider>
      </body>
    </html>
  );
}
