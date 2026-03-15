"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/demo" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{ background: "var(--cream)", borderBottom: "1px solid var(--border)" }}
      className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--indigo)" }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--ink)", fontSize: 18 }}>
            IndiaLeads
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href}
              style={{ color: "var(--muted)", fontSize: 15, fontWeight: 500 }}
              className="hover:opacity-100 transition-opacity">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="http://app.indialeadscrm.com/login"
            style={{ color: "var(--ink)", fontSize: 14, fontWeight: 500 }}
            className="hover:opacity-70 transition-opacity">
            Sign In
          </Link>
          <Link href="http://app.indialeadscrm.com/register"
            style={{
              background: "var(--indigo)", color: "white",
              padding: "8px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
            }}
            className="hover:opacity-90 transition-opacity">
            Start Free
          </Link>
        </div>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div style={{ background: "var(--cream)", borderTop: "1px solid var(--border)" }}
          className="md:hidden px-6 py-4 space-y-3">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block py-2" style={{ color: "var(--ink)", fontWeight: 500 }}>
              {label}
            </Link>
          ))}
          <Link href="http://app.indialeadscrm.com/register"
            style={{ background: "var(--indigo)", color: "white", padding: "10px 20px", borderRadius: 8, fontWeight: 600 }}
            className="block text-center">
            Start Free Trial
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "var(--ink)", color: "rgba(255,255,255,0.6)" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: "var(--saffron)" }}>
                <Zap size={14} color="white" />
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", color: "white", fontWeight: 700 }}>
                IndiaLeads
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              WhatsApp CRM built for Indian B2B sales teams.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Demo", "Changelog"] },
            { title: "Company", links: ["About", "Contact", "Blog", "Careers"] },
            { title: "Legal", links: ["Privacy", "Terms", "Refunds", "Security"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 13 }}>{title}</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: 13 }} className="hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <span>© 2025 IndiaLeads CRM. All rights reserved.</span>
          <span>Made with ♥ in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
