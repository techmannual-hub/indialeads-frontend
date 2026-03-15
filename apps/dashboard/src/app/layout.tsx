import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "IndiaLeads CRM",
  description: "WhatsApp CRM for Indian businesses",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(222 40% 7%)",
              border: "1px solid hsl(222 30% 14%)",
              color: "hsl(210 40% 95%)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
