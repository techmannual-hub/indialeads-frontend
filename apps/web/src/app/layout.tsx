import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "IndiaLeads CRM — WhatsApp CRM for Indian Businesses",
  description: "Manage leads, send WhatsApp broadcasts, automate follow-ups. Built for Indian B2B sales teams.",
  openGraph: {
    title: "IndiaLeads CRM",
    description: "India's most powerful WhatsApp CRM for lead management.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
