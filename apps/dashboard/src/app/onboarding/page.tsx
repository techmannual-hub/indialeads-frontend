"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload, FileText, Radio, MessageSquare, BarChart2, ChevronRight, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/shared";
import toast from "react-hot-toast";

const STEPS = [
  {
    id: 1,
    icon: Upload,
    title: "Upload your first leads",
    desc: "Import leads from an Excel file. We need at least: name, phone, product columns.",
    hint: "You can also add leads manually after onboarding.",
    action: "Upload Excel",
    href: "/leads",
  },
  {
    id: 2,
    icon: FileText,
    title: "Create a message template",
    desc: "Build your first WhatsApp template using {{name}} and {{product}} variables. Submit it to Meta for approval.",
    hint: "Approval usually takes 5–15 minutes for standard templates.",
    action: "Create Template",
    href: "/templates",
  },
  {
    id: 3,
    icon: Radio,
    title: "Send your first broadcast",
    desc: "Select a template and audience, then send a bulk WhatsApp message to your leads.",
    hint: "Start with a small batch of 10–20 leads to test delivery.",
    action: "Start Broadcast",
    href: "/broadcasts",
  },
  {
    id: 4,
    icon: MessageSquare,
    title: "Check your replies",
    desc: "View all incoming WhatsApp replies in the Inbox. Leads are automatically marked LIVE when they respond.",
    hint: "Replies arrive in real time — no refresh needed.",
    action: "Open Inbox",
    href: "/inbox",
  },
  {
    id: 5,
    icon: BarChart2,
    title: "View your analytics",
    desc: "Track delivery rate, reply rate, and lead pipeline progress from your analytics dashboard.",
    hint: "Data updates in real time as messages are sent and delivered.",
    action: "View Analytics",
    href: "/analytics",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { tenant, setTenant } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [completing, setCompleting] = useState(false);

  const handleStepDone = async (stepId: number) => {
    try {
      const res = await api.post<{ data: typeof tenant }>("/api/tenant/onboarding", {
        step: stepId,
      });
      if (res.data) setTenant(res.data as Parameters<typeof setTenant>[0]);
    } catch {
      // non-fatal
    }

    if (stepId < STEPS.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleGoToStep = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (!step) return;
    handleStepDone(stepId - 1);
    router.push(step.href);
  };

  const handleFinish = async () => {
    setCompleting(true);
    try {
      await api.post("/api/tenant/onboarding", { step: 5 });
      toast.success("Setup complete! Welcome to IndiaLeads CRM. 🎉");
      router.push("/");
    } finally {
      setCompleting(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap size={18} className="text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Welcome to IndiaLeads! 👋</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Let&apos;s set you up in 5 quick steps. Takes about 10 minutes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: step.id <= currentStep ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            const isLocked = step.id > currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="glass-card transition-all duration-200"
                style={{
                  borderColor: isActive ? "hsl(var(--primary) / 0.4)" : undefined,
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer"
                  onClick={() => !isLocked && setCurrentStep(step.id)}
                >
                  {/* Step indicator */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: isDone
                        ? "hsl(var(--primary))"
                        : isActive
                        ? "hsl(var(--primary) / 0.15)"
                        : "hsl(var(--muted))",
                      border: isActive ? "1.5px solid hsl(var(--primary) / 0.5)" : undefined,
                    }}
                  >
                    {isDone ? (
                      <Check size={16} className="text-primary-foreground" />
                    ) : (
                      <Icon
                        size={16}
                        style={{
                          color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: isDone ? "hsl(var(--muted-foreground))" : undefined }}
                      >
                        {step.id}. {step.title}
                        {isDone && (
                          <span className="ml-2 text-[10px] text-primary font-normal">✓ done</span>
                        )}
                      </p>
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground shrink-0"
                        style={{
                          transform: isActive ? "rotate(90deg)" : undefined,
                          transition: "transform 0.2s",
                        }}
                      />
                    </div>

                    {isActive && (
                      <div className="mt-2 space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.desc}
                        </p>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground/70 bg-white/5 rounded-lg p-2">
                          <span className="text-primary shrink-0 mt-0.5">💡</span>
                          <span>{step.hint}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoToStep(step.id);
                            }}
                          >
                            {step.action} →
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStepDone(step.id);
                            }}
                          >
                            Mark done, skip
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip setup, go to dashboard
          </Button>
          {currentStep > STEPS.length ? (
            <Button loading={completing} onClick={handleFinish}>
              Finish Setup 🎉
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
