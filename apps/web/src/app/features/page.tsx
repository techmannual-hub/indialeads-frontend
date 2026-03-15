// ── features/page.tsx ────────────────────────────────────────────────────────
import { Upload, Send, MessageSquare, BarChart2, Zap, ShoppingBag, Bot, FileText } from "lucide-react";

const FEATURE_SECTIONS = [
  {
    icon: Upload, title: "Smart Lead Import",
    bullets: [
      "Upload Excel files with name, phone, product columns",
      "Auto-deduplication: ignores repeated leads within 30 days",
      "Same phone + new product → merges products automatically",
      "Import progress shown live in the dashboard",
    ],
  },
  {
    icon: Send, title: "Broadcast Messaging",
    bullets: [
      "Select WhatsApp number, template, and lead filter",
      "Intelligent 20–40s random delay between messages",
      "1,000 messages/day daily cap to stay within Meta limits",
      "Pause, resume broadcasts at any time",
      "Warning shown before sending to 300+ leads",
    ],
  },
  {
    icon: FileText, title: "Template Builder",
    bullets: [
      "Create templates with {{name}}, {{product}} variables",
      "One-click submission for WhatsApp approval",
      "Live preview of how the message will look on WhatsApp",
      "Support for header, body, footer, and quick reply buttons",
    ],
  },
  {
    icon: MessageSquare, title: "Real-Time Inbox",
    bullets: [
      "Every inbound reply appears instantly via Socket.io",
      "Full conversation history per lead",
      "Send text, images, and PDFs from the inbox",
      "Mark conversations as resolved",
      "Lead auto-marked LIVE when they reply",
    ],
  },
  {
    icon: Zap, title: "Automation Rules",
    bullets: [
      "Trigger on: lead created, status changed, message received, broadcast read",
      "Actions: update status, add tag, update stage, send message",
      "Full run history and log for every automation",
    ],
  },
  {
    icon: BarChart2, title: "Analytics",
    bullets: [
      "Total leads, messages sent, reply rate, followups pending, dead leads",
      "Leads-per-day area chart (7/30/90 day periods)",
      "Lead status distribution pie chart",
      "Message delivery funnel: Sent → Delivered → Read",
      "Top stages bar chart",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ padding: "60px 0 80px" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800 }}>
            Every feature you need
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 12 }}>
            Purpose-built for Indian B2B sales workflows, not adapted from generic CRMs.
          </p>
        </div>

        <div className="space-y-8">
          {FEATURE_SECTIONS.map(({ icon: Icon, title, bullets }) => (
            <div key={title} style={{ border: "1.5px solid var(--border)", borderRadius: 16, padding: 32, background: "white" }}>
              <div className="flex items-start gap-5">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} style={{ color: "var(--indigo)" }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{title}</h3>
                  <ul className="space-y-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--saffron)", flexShrink: 0, marginTop: 7 }} />
                        <span style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
