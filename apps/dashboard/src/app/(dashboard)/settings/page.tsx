// ── Settings Page ─────────────────────────────────────────────────────────────
"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Button, Input } from "@/components/shared";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, tenant } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/api/tenant/profile", { name });
      toast.success("Profile updated");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleChangePw = async () => {
    if (!currentPw || !newPw) return toast.error("Fill both password fields");
    if (newPw.length < 8) return toast.error("New password must be at least 8 characters");
    try {
      await api.put("/api/auth/change-password", { current_password: currentPw, new_password: newPw });
      toast.success("Password changed");
      setCurrentPw(""); setNewPw("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div className="p-6 space-y-6 max-w-lg">
        <div className="glass-card p-5 space-y-4">
          <p className="text-sm font-semibold">Profile</p>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Email</label>
            <Input value={user?.email ?? ""} disabled className="opacity-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Company</label>
            <Input value={tenant?.name ?? ""} disabled className="opacity-50" />
          </div>
          <Button loading={saving} onClick={handleSaveProfile} size="sm">Save Changes</Button>
        </div>

        <div className="glass-card p-5 space-y-4">
          <p className="text-sm font-semibold">Change Password</p>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Current Password</label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">New Password</label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <Button variant="secondary" size="sm" onClick={handleChangePw}>Update Password</Button>
        </div>

        <div className="glass-card p-5 space-y-3">
          <p className="text-sm font-semibold">Plan & License</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current plan</span>
            <span className="font-medium capitalize">{tenant?.plan?.toLowerCase() ?? "Free"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Demo mode</span>
            <span className={tenant?.is_demo ? "text-amber-400" : "text-muted-foreground"}>
              {tenant?.is_demo ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
