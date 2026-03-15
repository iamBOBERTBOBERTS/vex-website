import type { Metadata } from "next";
import { Montserrat, Poppins, Inter } from "next/font/google";
import { BuildProvider } from "@/contexts/BuildContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VEX | Vortex Exotic Exchange",
  description: "Luxury automotive marketplace — buy, build, and drive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body style={{ fontFamily: "var(--font-inter)" }}>
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
