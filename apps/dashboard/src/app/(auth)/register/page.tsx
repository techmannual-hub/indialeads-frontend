"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, tokenStore } from "@/lib/api";
import { Button, Input } from "@/components/shared";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { loadMe } = useAuthStore();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    company_slug: "",
  });

  const handleSlugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCompanyChange = (value: string) => {
    setForm((f) => ({
      ...f,
      company_name: value,
      company_slug: handleSlugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{
        data: { access_token: string; refresh_token: string };
      }>("/api/auth/register", form);

      tokenStore.set(res.data.access_token);
      tokenStore.setRefresh(res.data.refresh_token);
      await loadMe();

      toast.success("Account created! Welcome to IndiaLeads.");
      router.push("/onboarding");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">IndiaLeads</span>
        </div>

        <div className="glass-card p-6">
          <h1 className="text-lg font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Start with 500 free leads. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Your Name</label>
              <Input
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Work Email</label>
              <Input
                type="email"
                placeholder="rahul@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company Name</label>
              <Input
                placeholder="Acme Solar Pvt Ltd"
                value={form.company_name}
                onChange={(e) => handleCompanyChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Company Slug
                <span className="ml-1 text-muted-foreground/50 font-normal">(used in your URL)</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">app.indialeadscrm.com/</span>
                <Input
                  placeholder="acme-solar"
                  value={form.company_slug}
                  onChange={(e) =>
                    setForm({ ...form, company_slug: handleSlugify(e.target.value) })
                  }
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-3 leading-relaxed">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
