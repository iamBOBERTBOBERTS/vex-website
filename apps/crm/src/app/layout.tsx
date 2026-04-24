import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantThemeProvider } from "@/components/TenantThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEX CRM",
  description: "Staff portal — leads, orders, inventory, customers",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Vex CRM" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TenantThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </TenantThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
