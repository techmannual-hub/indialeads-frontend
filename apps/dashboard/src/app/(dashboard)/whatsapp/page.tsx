"use client";
import { useState } from "react";
import { Phone, Check, ChevronRight, ExternalLink, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Button, Input } from "@/components/shared";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

const WIZARD_STEPS = [
  {
    step: 1, title: "Create Meta Business Account",
    desc: "You need a Meta Business account to use the WhatsApp Business API.",
    action: "Open Meta Business Suite",
    link: "https://business.facebook.com",
  },
  {
    step: 2, title: "Verify Your Business",
    desc: "Meta requires business verification before allowing API access. This may take 1–2 business days.",
    action: "Start Verification",
    link: "https://business.facebook.com/settings/security",
  },
  {
    step: 3, title: "Add WhatsApp Phone Number",
    desc: "Add a phone number in Meta Developer Console under WhatsApp → Getting Started.",
    action: "Open Developer Console",
    link: "https://developers.facebook.com/apps",
  },
  {
    step: 4, title: "Generate Permanent Access Token",
    desc: "Generate a System User token with whatsapp_business_messaging permission. Do NOT use the temporary token.",
    action: "System Users Guide",
    link: "https://developers.facebook.com/docs/whatsapp/business-management-api/get-started",
  },
  {
    step: 5, title: "Paste Credentials Below",
    desc: "Enter your Phone Number ID, Business Account ID, and Access Token in the form below.",
  },
  {
    step: 6, title: "Send Test Message",
    desc: "Send a test message to your own number to verify the connection.",
  },
];

export default function WhatsAppPage() {
  const { tenant, setTenant } = useAuthStore();
  const [activeStep, setActiveStep] = useState(1);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({
    phone_number_id: "",
    wa_business_id: "",
    wa_access_token: "",
    wa_webhook_secret: "",
    test_phone: "",
  });

  const handleSave = async () => {
    if (!form.phone_number_id || !form.wa_business_id || !form.wa_access_token) {
      return toast.error("Phone Number ID, Business Account ID and Access Token are required");
    }
    setSaving(true);
    try {
      const res = await api.put<{ data: typeof tenant }>("/api/tenant/whatsapp-settings", {
        phone_number_id: form.phone_number_id,
        wa_business_id: form.wa_business_id,
        wa_access_token: form.wa_access_token,
        wa_webhook_secret: form.wa_webhook_secret || crypto.randomUUID(),
      });
      if (res.data) setTenant(res.data as Parameters<typeof setTenant>[0]);
      toast.success("WhatsApp settings saved!");
      setActiveStep(6);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  const handleTestMessage = async () => {
    if (!form.test_phone) return toast.error("Enter a phone number to test");
    setTesting(true);
    try {
      await api.post("/api/whatsapp/send/text", {
        phone: form.test_phone,
        text: "🎉 Your IndiaLeads CRM WhatsApp integration is working! This is a test message.",
      });
      toast.success("Test message sent! Check your phone.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Test failed — check your credentials"); }
    finally { setTesting(false); }
  };

  return (
    <div>
      <PageHeader
        title="WhatsApp Setup"
        description="Connect your WhatsApp Business API account"
      />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Connection status */}
        <div className={`glass-card p-4 flex items-center gap-3 border-l-2 ${
          tenant?.wa_configured ? "border-l-green-500" : "border-l-amber-500"
        }`}>
          <Phone size={18} className={tenant?.wa_configured ? "text-green-400" : "text-amber-400"} />
          <div>
            <p className="text-sm font-medium">
              {tenant?.wa_configured ? "WhatsApp Connected" : "WhatsApp Not Configured"}
            </p>
            <p className="text-xs text-muted-foreground">
              {tenant?.wa_configured
                ? `Phone Number ID: ${tenant.phone_number_id}`
                : "Follow the steps below to connect your WhatsApp Business API"}
            </p>
          </div>
          {tenant?.wa_configured && (
            <span className="ml-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Wizard steps */}
        <div className="glass-card p-5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Setup Guide
          </p>

          {WIZARD_STEPS.map(({ step, title, desc, action, link }) => {
            const isDone = step < activeStep;
            const isActive = step === activeStep;

            return (
              <div key={step}>
                <button
                  onClick={() => setActiveStep(step)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                    isActive ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                    isDone ? "bg-primary text-primary-foreground"
                    : isActive ? "bg-primary/20 text-primary border border-primary/50"
                    : "bg-white/5 text-muted-foreground border border-border"
                  }`}>
                    {isDone ? <Check size={12} /> : step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {title}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                </button>

                {/* Step content */}
                {isActive && step !== 5 && step !== 6 && link && (
                  <div className="ml-9 mb-2">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        {action} <ExternalLink size={11} />
                      </Button>
                    </a>
                    <Button variant="ghost" size="sm" onClick={() => setActiveStep(step + 1)} className="ml-2">
                      Done, next step →
                    </Button>
                  </div>
                )}

                {isActive && step === 5 && (
                  <div className="ml-9 mb-2 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Phone Number ID *</label>
                        <Input placeholder="1234567890123456"
                          value={form.phone_number_id}
                          onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Business Account ID *</label>
                        <Input placeholder="9876543210987654"
                          value={form.wa_business_id}
                          onChange={(e) => setForm({ ...form, wa_business_id: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Permanent Access Token *</label>
                      <div className="relative">
                        <Input
                          type={showToken ? "text" : "password"}
                          placeholder="EAABx..."
                          className="pr-9 font-mono text-xs"
                          value={form.wa_access_token}
                          onChange={(e) => setForm({ ...form, wa_access_token: e.target.value })}
                        />
                        <button onClick={() => setShowToken(!showToken)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Webhook Secret (optional)</label>
                      <Input placeholder="Auto-generated if blank"
                        value={form.wa_webhook_secret}
                        onChange={(e) => setForm({ ...form, wa_webhook_secret: e.target.value })} />
                    </div>
                    <Button loading={saving} onClick={handleSave}>Save & Continue</Button>
                  </div>
                )}

                {isActive && step === 6 && (
                  <div className="ml-9 mb-2 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Your WhatsApp Number</label>
                      <div className="flex gap-2">
                        <Input placeholder="+91 98765 43210"
                          value={form.test_phone}
                          onChange={(e) => setForm({ ...form, test_phone: e.target.value })}
                          className="max-w-xs" />
                        <Button loading={testing} onClick={handleTestMessage}>
                          Send Test
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Webhook URL */}
        <div className="glass-card p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Webhook URL</p>
          <p className="text-xs text-muted-foreground">
            Add this URL in your Meta Developer Console → WhatsApp → Configuration → Webhook:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-black/30 border border-border rounded px-3 py-2 font-mono text-primary">
              {process.env.NEXT_PUBLIC_API_URL}/webhooks/whatsapp
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API_URL}/webhooks/whatsapp`);
                toast.success("Copied!");
              }}
              className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1.5">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
