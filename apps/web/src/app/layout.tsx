import type { Metadata } from "next";
import { Syne, Fraunces, Plus_Jakarta_Sans, Outfit, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BuildProvider } from "@/contexts/BuildContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantThemeProvider } from "@/components/TenantThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SkipToContent } from "@/components/SkipToContent";
import { AmbientShell } from "@/components/ambient";
import { CinematicMotionProvider, LuxuryEdgeAccent, SceneAwareFx } from "@/components/fx";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

/**
 * Typography stack (CSS variable names kept for existing modules):
 * - --font-montserrat -> Syne (bold gallery/display for UI, labels, section titles)
 * - --font-display -> Playfair (hero and marquee-scale headlines)
 * - --font-serif -> Fraunces (italic ledes, editorial moments)
 * - --font-inter -> Plus Jakarta Sans (body, forms, readable UI)
 * - --font-poppins -> Outfit (nav, cards, secondary UI)
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
  title: "VEX Atelier | Private Market Luxury Automotive Platform",
  description:
    "Luxury cinematic vehicle platform for private inventory, concierge transactions, appraisals, and premium dealer operations.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Vex" },
  openGraph: {
    title: "VEX Atelier",
    description: "A luxury cinematic platform for private vehicle discovery, appraisal, and concierge acquisition flow.",
    type: "website",
    url: siteUrl,
    images: [{ url: "/og-vex-appraisals.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VEX Atelier",
    description: "Luxury cinematic website for private inventory, appraisals, and dealer-grade operations.",
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
      <body className="site-shell" style={{ fontFamily: "var(--font-body), var(--font-inter), system-ui, sans-serif" }}>
        <SkipToContent />
        <AmbientShell />
        <CinematicMotionProvider>
          <LuxuryEdgeAccent />
          <SceneAwareFx />
          <TenantThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <BuildProvider>
                  <Header />
                  {children}
                  <Footer />
                </BuildProvider>
              </AuthProvider>
            </QueryProvider>
          </TenantThemeProvider>
        </CinematicMotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
