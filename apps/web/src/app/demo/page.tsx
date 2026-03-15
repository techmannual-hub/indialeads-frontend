import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

const DEMO_FEATURES = [
  { title: "Lead Management", desc: "500 pre-loaded demo leads with various statuses" },
  { title: "Broadcast Messaging", desc: "Send demo broadcasts — no real messages sent" },
  { title: "Inbox Conversations", desc: "Pre-populated chat threads to explore" },
  { title: "Analytics Dashboard", desc: "Real charts with synthetic historical data" },
];

export default function DemoPage() {
  return (
    <div style={{ padding: "60px 0 80px" }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <AlertTriangle size={14} style={{ color: "#c2410c" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#c2410c" }}>
              DEMO MODE — No real WhatsApp messages will be sent
            </span>
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800 }}>
            Try IndiaLeads CRM
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 12 }}>
            Explore the full CRM with demo data. No signup required for a quick look.
          </p>
        </div>

        {/* Demo features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {DEMO_FEATURES.map(({ title, desc }) => (
            <div key={title} style={{ border: "1.5px solid var(--border)", background: "white", borderRadius: 12, padding: 20 }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</p>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Login card */}
        <div style={{
          borderRadius: 20, border: "1.5px solid var(--border)",
          background: "white", padding: 40, maxWidth: 380, margin: "0 auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
            Demo Access
          </p>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
            Use these credentials to log in to the demo CRM.
          </p>

          <div style={{ background: "var(--cream)", borderRadius: 10, padding: 16, marginBottom: 24, fontFamily: "monospace" }}>
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Email</span>
              <span style={{ fontSize: 13 }}>demo@indialeadscrm.com</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Password</span>
              <span style={{ fontSize: 13 }}>demo@1234</span>
            </div>
          </div>

          <Link href="http://app.indialeadscrm.com/login"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "var(--indigo)", color: "white",
              padding: "14px 24px", borderRadius: 10,
              fontWeight: 700, fontSize: 16, width: "100%",
            }}
            className="hover:opacity-90 transition-opacity">
            Open Demo CRM <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
