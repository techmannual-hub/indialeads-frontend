"use client";
import { useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ padding: "60px 0 80px" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800 }}>
            Get in touch
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 12 }}>
            Questions about pricing, features, or onboarding? We reply within 4 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@indialeadscrm.com" },
              { icon: Phone, label: "WhatsApp", value: "+91 98765 43210" },
              { icon: MessageSquare, label: "Support", value: "Mon–Sat, 9am–7pm IST" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color: "var(--indigo)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div style={{ background: "#ecfdf5", borderRadius: 16, padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20 }}>Message sent!</p>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>We'll get back to you within 4 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ border: "1.5px solid var(--border)", borderRadius: 16, padding: 32, background: "white" }}
                className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Name", key: "name", placeholder: "Rahul Sharma" },
                    { label: "Email", key: "email", placeholder: "rahul@company.com", type: "email" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key} className="space-y-1.5">
                      <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{label}</label>
                      <input type={type ?? "text"} placeholder={placeholder} required
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        style={{ width: "100%", height: 40, border: "1.5px solid var(--border)", borderRadius: 8, padding: "0 12px", fontSize: 14, background: "var(--cream)", outline: "none" }} />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Company</label>
                  <input type="text" placeholder="Your company name" value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    style={{ width: "100%", height: 40, border: "1.5px solid var(--border)", borderRadius: 8, padding: "0 12px", fontSize: 14, background: "var(--cream)", outline: "none" }} />
                </div>
                <div className="space-y-1.5">
                  <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Message *</label>
                  <textarea required rows={4} placeholder="Tell us what you need…" value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, background: "var(--cream)", outline: "none", resize: "vertical" }} />
                </div>
                <button type="submit" style={{
                  width: "100%", padding: "14px", borderRadius: 10,
                  background: "var(--indigo)", color: "white", fontWeight: 700, fontSize: 16,
                  border: "none", cursor: "pointer",
                }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
