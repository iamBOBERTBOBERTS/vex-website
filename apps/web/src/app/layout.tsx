import type { Metadata } from "next";
import { Oswald, Cormorant_Garamond, Inter, Poppins } from "next/font/google";
import { BuildProvider } from "@/contexts/BuildContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { AmbientShell } from "@/components/ambient";
import "./globals.css";

/* Sleek display + editorial serif — variable names preserved for existing CSS */
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VEX | Vortex Exotic Exchange",
  description:
    "The private exchange for exotic vehicles — curated lots, sealed bids, and white-glove delivery for collectors worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={`${oswald.variable} ${cormorant.variable} ${inter.variable} ${poppins.variable}`}>
      <body style={{ fontFamily: "var(--font-inter)" }}>
        <AmbientShell />
        <AuthProvider>
          <BuildProvider>
            {children}
            <Footer />
          </BuildProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
