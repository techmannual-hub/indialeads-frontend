"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    leads: "500 leads",
    messages: "200 msg/day",
    features: ["Excel lead import", "Manual followups", "WhatsApp inbox", "Basic analytics"],
    cta: "Get Started Free",
    href: "http://app.indialeadscrm.com/register",
    highlight: false,
  },
  {
    name: "Starter",
    monthly: 999,
    yearly: 799,
    leads: "5,000 leads",
    messages: "1,000 msg/day",
    features: [
      "Everything in Free",
      "Broadcast messaging",
      "Template builder",
      "3-stage followups",
      "Automation rules",
    ],
    cta: "Start Free Trial",
    href: "http://app.indialeadscrm.com/register?plan=starter",
    highlight: true,
  },
  {
    name: "Growth",
    monthly: 2499,
    yearly: 1999,
    leads: "25,000 leads",
    messages: "5,000 msg/day",
    features: [
      "Everything in Starter",
      "Catalog integration",
      "Advanced analytics",
      "Priority support",
      "Custom fields",
    ],
    cta: "Start Free Trial",
    href: "http://app.indialeadscrm.com/register?plan=growth",
    highlight: false,
  },
];

function formatINR(n: number) {
  return n === 0 ? "Free" : `₹${n.toLocaleString("en-IN")}`;
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ padding: "60px 0 80px" }}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800 }}>
            Simple, honest pricing
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 12 }}>
            No hidden fees. No per-message charges. Just flat monthly plans.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span style={{ fontSize: 14, color: !yearly ? "var(--ink)" : "var(--muted)", fontWeight: !yearly ? 600 : 400 }}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: yearly ? "var(--indigo)" : "var(--border)" }}
            >
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
                style={{ left: yearly ? "calc(100% - 22px)" : 2 }} />
            </button>
            <span style={{ fontSize: 14, color: yearly ? "var(--ink)" : "var(--muted)", fontWeight: yearly ? 600 : 400 }}>
              Yearly
              <span style={{ fontSize: 11, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 99, marginLeft: 8, fontWeight: 600 }}>
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                borderRadius: 16,
                border: plan.highlight ? `2px solid var(--indigo)` : "1.5px solid var(--border)",
                background: plan.highlight ? "var(--indigo)" : "white",
                padding: 32,
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--saffron)", color: "white", fontSize: 11, fontWeight: 700,
                  padding: "4px 16px", borderRadius: 99, whiteSpace: "nowrap",
                }}>
                  MOST POPULAR
                </div>
              )}

              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20,
                color: plan.highlight ? "rgba(255,255,255,0.9)" : "var(--ink)", marginBottom: 8,
              }}>
                {plan.name}
              </p>

              <div style={{ marginBottom: 24 }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800,
                  color: plan.highlight ? "white" : "var(--ink)",
                }}>
                  {formatINR(yearly ? plan.yearly : plan.monthly)}
                </span>
                {(yearly ? plan.yearly : plan.monthly) > 0 && (
                  <span style={{ fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.6)" : "var(--muted)", marginLeft: 4 }}>
                    /mo
                  </span>
                )}
              </div>

              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 20,
                background: plan.highlight ? "rgba(255,255,255,0.1)" : "var(--cream)",
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--muted)" }}>
                  {plan.leads}
                </span>
                <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--muted)" }}>
                  {plan.messages}
                </span>
              </div>

              <ul style={{ marginBottom: 28, space: 8 }} className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} style={{ color: plan.highlight ? "#86efac" : "#22c55e", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.85)" : "var(--ink)" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 15,
                  background: plan.highlight ? "var(--saffron)" : "var(--indigo)",
                  color: "white",
                }}
                className="hover:opacity-90 transition-opacity">
                {plan.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise row */}
        <div style={{
          marginTop: 32, padding: "24px 32px", borderRadius: 16,
          border: "1.5px solid var(--border)", background: "white",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18 }}>Enterprise</p>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
              25,000+ leads, 10,000 msg/day, dedicated support, custom integrations
            </p>
          </div>
          <Link href="/contact"
            style={{
              padding: "12px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
              border: "1.5px solid var(--indigo)", color: "var(--indigo)",
            }}
            className="hover:bg-indigo-50 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
