"use client";
import { useEffect, useState } from "react";
import { Radio, Play, Pause, Plus, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, StatusBadge, Button, Select, EmptyState, TableSkeleton } from "@/components/shared";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSocket } from "@/lib/socket";

interface Broadcast {
  id: string; name: string; status: string;
  total_count: number; sent_count: number; delivered_count: number;
  read_count: number; failed_count: number;
  started_at: string | null; completed_at: string | null;
  template: { name: string };
}
interface Template { id: string; name: string; status: string; }

export default function BroadcastsPage() {
  const socket = useSocket();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", template_id: "", status_filter: "" });
  const [showWarn, setShowWarn] = useState(false);
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        api.get<{ data: Broadcast[] }>("/api/broadcasts"),
        api.get<{ data: Template[] }>("/api/templates?status=APPROVED"),
      ]);
      setBroadcasts(bRes.data);
      setTemplates(tRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("broadcast:progress", (data: { broadcastId: string; queued: number; total: number }) => {
      setBroadcasts((prev) =>
        prev.map((b) => b.id === data.broadcastId
          ? { ...b, sent_count: data.queued }
          : b)
      );
    });
    socket.on("broadcast:complete", ({ broadcastId }: { broadcastId: string }) => {
      setBroadcasts((prev) =>
        prev.map((b) => b.id === broadcastId ? { ...b, status: "COMPLETED" } : b)
      );
      toast.success("Broadcast completed!");
    });
    return () => { socket.off("broadcast:progress"); socket.off("broadcast:complete"); };
  }, [socket]);

  const handleCreate = async () => {
    if (!form.name || !form.template_id) return toast.error("Fill in name and template");
    setCreating(true);
    try {
      await api.post("/api/broadcasts", {
        name: form.name,
        template_id: form.template_id,
        filters: form.status_filter ? { status: form.status_filter } : undefined,
      });
      toast.success("Broadcast created");
      setForm({ name: "", template_id: "", status_filter: "" });
      fetchBroadcasts();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setCreating(false); }
  };

  const handleStartConfirm = async () => {
    if (!pendingStart) return;
    setShowWarn(false);
    try {
      const res = await api.post<{ data: { recipient_count: number } }>(
        `/api/broadcasts/${pendingStart}/start`
      );
      toast.success(`Broadcast started for ${res.data.recipient_count} leads`);
      fetchBroadcasts();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to start"); }
    setPendingStart(null);
  };

  const handleStart = async (id: string, count: number) => {
    setPendingStart(id);
    if (count > 300) { setShowWarn(true); return; }
    await handleStartConfirm();
  };

  const handlePause = async (id: string) => {
    try {
      await api.post(`/api/broadcasts/${id}/pause`);
      toast.success("Broadcast paused");
      fetchBroadcasts();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div>
      <PageHeader title="Broadcasts" description="Send bulk WhatsApp messages" />

      {/* Warning modal */}
      {showWarn && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} className="text-amber-400" />
              <h3 className="font-semibold">Large Broadcast Warning</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              You are about to send to more than 300 leads. This may take a while.
              Make sure your WhatsApp daily limit allows this.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1"
                onClick={() => { setShowWarn(false); setPendingStart(null); }}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={handleStartConfirm}>
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Create form */}
        <div className="glass-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            New Broadcast
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              className="h-8 rounded-md border border-border bg-input px-3 text-sm col-span-1"
              placeholder="Broadcast name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              value={form.template_id}
              onChange={(e) => setForm({ ...form, template_id: e.target.value })}
            >
              <option value="">Select template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <Select
              value={form.status_filter}
              onChange={(e) => setForm({ ...form, status_filter: e.target.value })}
            >
              <option value="">All leads</option>
              <option value="PENDING">Pending only</option>
              <option value="LIVE">Live only</option>
            </Select>
            <Button loading={creating} onClick={handleCreate}>
              <Plus size={13} /> Create
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? <TableSkeleton rows={5} cols={7} /> : broadcasts.length === 0 ? (
            <EmptyState icon={Radio} title="No broadcasts yet"
              description="Create your first broadcast above." />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Name", "Template", "Status", "Sent", "Delivered", "Read", "Started", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((b) => {
                  const pct = b.total_count > 0 ? Math.round((b.sent_count / b.total_count) * 100) : 0;
                  return (
                    <tr key={b.id} className="border-b border-border/50 table-row-hover">
                      <td className="px-4 py-3 font-medium">{b.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{b.template?.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        {b.status === "RUNNING" ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs tabular-nums">{pct}%</span>
                          </div>
                        ) : (
                          <span className="tabular-nums">{b.sent_count}/{b.total_count}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-xs">{b.delivered_count}</td>
                      <td className="px-4 py-3 tabular-nums text-xs">{b.read_count}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatRelativeTime(b.started_at)}
                      </td>
                      <td className="px-4 py-3">
                        {b.status === "DRAFT" && (
                          <Button size="sm" onClick={() => handleStart(b.id, b.total_count)}>
                            <Play size={11} /> Start
                          </Button>
                        )}
                        {b.status === "RUNNING" && (
                          <Button variant="secondary" size="sm" onClick={() => handlePause(b.id)}>
                            <Pause size={11} /> Pause
                          </Button>
                        )}
                        {b.status === "PAUSED" && (
                          <Button size="sm" onClick={() => handleStart(b.id, b.total_count)}>
                            <Play size={11} /> Resume
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
