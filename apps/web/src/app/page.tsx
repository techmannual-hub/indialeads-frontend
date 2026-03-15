import Link from "next/link";
import {
  Upload, Send, MessageSquare, BarChart2, Zap,
  ArrowRight, CheckCircle2, Phone,
} from "lucide-react";

const FEATURES = [
  { icon: Upload, title: "Excel Lead Import", desc: "Upload .xlsx files with name, phone, product. Smart deduplication handles repeated uploads automatically." },
  { icon: Send, title: "WhatsApp Broadcasts", desc: "Send bulk messages with 20–40s smart delays to avoid bans. 1000 messages/day limit per number." },
  { icon: MessageSquare, title: "Real-Time Inbox", desc: "Every reply lands in your inbox instantly. Full conversation history. Mark leads LIVE automatically on reply." },
  { icon: Zap, title: "Automation Rules", desc: "Trigger actions when leads reply, change status, or read your broadcast. Zero manual work." },
  { icon: BarChart2, title: "Analytics Dashboard", desc: "Track delivery rate, read rate, lead growth, and followup performance in real time." },
  { icon: Phone, title: "3-Stage Followups", desc: "Manual followup system with 3 escalating templates. Lead auto-marked DEAD after 3 unanswered stages." },
];

const STATS = [
  { value: "3x", label: "More replies vs cold calling" },
  { value: "< 2min", label: "Time to send 1000 messages" },
  { value: "98%", label: "WhatsApp open rate" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: 80, paddingBottom: 80 }}
        className="max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: "#f97316/10", border: "1px solid #fed7aa", backgroundColor: "#fff7ed" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#c2410c" }}>
            🚀 Now with WhatsApp Cloud API
          </span>
        </div>

        <h1 className="animate-fadeUp" style={{
          fontFamily: "'Syne', sans-serif", fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 800, color: "var(--ink)", lineHeight: 1.1, marginBottom: 24,
        }}>
          Close more deals with<br />
          <span style={{
            background: "linear-gradient(135deg, #3730a3 0%, #f97316 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            WhatsApp CRM
          </span>
        </h1>

        <p className="animate-fadeUp animate-delay-100" style={{
          fontSize: 18, color: "var(--muted)", maxWidth: 520, margin: "0 auto 40px",
          lineHeight: 1.7,
        }}>
          Import leads from Excel, send bulk WhatsApp messages, and automate follow-ups.
          Built for Indian B2B sales teams.
        </p>

        <div className="animate-fadeUp animate-delay-200 flex items-center justify-center gap-4 flex-wrap">
          <Link href="http://app.indialeadscrm.com/register"
            style={{
              background: "var(--indigo)", color: "white",
              padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
            className="hover:opacity-90 transition-all hover:-translate-y-0.5">
            Start Free Trial <ArrowRight size={16} />
          </Link>
          <Link href="/demo"
            style={{
              border: "1.5px solid var(--border)", color: "var(--ink)",
              padding: "14px 32px", borderRadius: 10, fontWeight: 600, fontSize: 16,
            }}
            className="hover:border-indigo-300 transition-colors">
            View Demo →
          </Link>
        </div>

        {/* Stats bar */}
        <div className="animate-fadeUp animate-delay-300 grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-12"
          style={{ borderTop: "1px solid var(--border)" }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--indigo)" }}>
                {value}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard screenshot mockup */}
      <section style={{ background: "var(--ink)", padding: "60px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden border border-white/10"
            style={{ background: "hsl(222 47% 4%)" }}>
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-white/20 mx-auto">app.indialeadscrm.com</span>
            </div>
            {/* Fake dashboard layout */}
            <div className="flex h-64">
              {/* Sidebar */}
              <div className="w-40 border-r border-white/5 p-3 space-y-1.5">
                {["Dashboard", "Leads", "Broadcasts", "Inbox", "Analytics"].map((item, i) => (
                  <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded"
                    style={{ background: i === 0 ? "rgba(0,255,136,0.1)" : "transparent" }}>
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: i === 0 ? "#00ff88" : "rgba(255,255,255,0.15)" }} />
                    <span style={{ fontSize: 11, color: i === 0 ? "#00ff88" : "rgba(255,255,255,0.35)" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div className="flex-1 p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total Leads", val: "2,847" },
                    { label: "Sent Today", val: "342" },
                    { label: "Reply Rate", val: "34%" },
                    { label: "Live", val: "891" },
                  ].map(({ label, val }) => (
                    <div key={label} className="rounded-lg p-2.5 border border-white/5"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-white/5 h-28 flex items-end px-3 pb-2 gap-1"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  {[30, 45, 35, 60, 50, 80, 65, 90, 75, 100, 85, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm"
                      style={{ height: `${h}%`, background: `rgba(0,255,136,${0.3 + i * 0.04})` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: "80px 0" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800 }}>
              Everything your sales team needs
            </h2>
            <p style={{ color: "var(--muted)", marginTop: 12, fontSize: 17 }}>
              Stop juggling Excel + WhatsApp manually. Do it all from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-xl p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ border: "1.5px solid var(--border)", background: "white" }}>
                <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                  style={{ background: "#eef2ff" }}>
                  <Icon size={18} style={{ color: "var(--indigo)" }} />
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                  {title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "80px 0", background: "var(--indigo)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800, color: "white", marginBottom: 16,
          }}>
            Ready to 3x your reply rate?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 17, marginBottom: 32 }}>
            Start with 500 free leads. No credit card required.
          </p>
          <Link href="http://app.indialeadscrm.com/register"
            style={{
              background: "var(--saffron)", color: "white",
              padding: "16px 40px", borderRadius: 12, fontWeight: 700, fontSize: 17,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
            className="hover:opacity-90 transition-opacity">
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
