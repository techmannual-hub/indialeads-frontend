"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Send, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, StatusBadge, Button, EmptyState, TableSkeleton } from "@/components/shared";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface Followup {
  id: string; stage: string; status: string;
  sent_at: string | null; scheduled_at: string | null;
  lead: { name: string; phone: string; status: string };
  template: { name: string } | null;
}

const STAGES = [
  { key: "TEMPLATE1", label: "Followup 1", color: "border-blue-500/30 bg-blue-500/5" },
  { key: "TEMPLATE2", label: "Followup 2", color: "border-amber-500/30 bg-amber-500/5" },
  { key: "TEMPLATE3", label: "Followup 3", color: "border-red-500/30 bg-red-500/5" },
];

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Followup[] }>("/api/followups?status=PENDING&limit=200");
      setFollowups(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFollowups(); }, []);

  const handleSend = async (id: string) => {
    setSending(id);
    try {
      await api.post(`/api/followups/${id}/send`);
      toast.success("Followup sent!");
      fetchFollowups();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally { setSending(null); }
  };

  const byStage = (stage: string) => followups.filter((f) => f.stage === stage);

  return (
    <div>
      <PageHeader
        title="Followups"
        description={`${followups.length} pending followups`}
        actions={
          <Button size="sm"><Plus size={13} /> New Followup</Button>
        }
      />

      <div className="p-6">
        {loading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {STAGES.map(({ key, label, color }) => {
              const items = byStage(key);
              return (
                <div key={key} className={`rounded-lg border p-4 ${color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No followups needed
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {items.map((f) => (
                        <div key={f.id} className="glass-card p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium">{f.lead.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{f.lead.phone}</p>
                            </div>
                            <StatusBadge status={f.lead.status} />
                          </div>

                          {f.template && (
                            <p className="text-xs text-muted-foreground">
                              Template: <span className="text-foreground">{f.template.name}</span>
                            </p>
                          )}

                          {f.sent_at && (
                            <p className="text-xs text-muted-foreground">
                              Last sent: {formatRelativeTime(f.sent_at)}
                            </p>
                          )}

                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            loading={sending === f.id}
                            onClick={() => handleSend(f.id)}
                          >
                            <Send size={11} /> Send {label}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
