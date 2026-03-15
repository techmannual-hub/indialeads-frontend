"use client";
import { useEffect, useState } from "react";
import { Plus, Zap, Play, Pause, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Button, Select, EmptyState, TableSkeleton } from "@/components/shared";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface Automation {
  id: string; name: string; trigger: string; is_active: boolean;
  run_count: number; created_at: string;
  _count: { logs: number };
}

const TRIGGERS = [
  { value: "LEAD_CREATED", label: "Lead Created" },
  { value: "LEAD_STATUS_CHANGED", label: "Lead Status Changed" },
  { value: "MESSAGE_RECEIVED", label: "Message Received" },
  { value: "BROADCAST_READ", label: "Broadcast Read" },
  { value: "DATE_BASED", label: "Date Based" },
];

const ACTIONS = [
  { value: "SEND_MESSAGE", label: "Send Message" },
  { value: "UPDATE_STATUS", label: "Update Status" },
  { value: "ADD_TAG", label: "Add Tag" },
  { value: "UPDATE_STAGE", label: "Update Stage" },
];

const STATUSES = ["PENDING", "LIVE", "DEAD", "COOLING"];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", trigger: "LEAD_CREATED",
    actionType: "UPDATE_STATUS", actionStatus: "LIVE", stage: "",
  });

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Automation[] }>("/api/automations");
      setAutomations(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAutomations(); }, []);

  const handleCreate = async () => {
    if (!form.name) return toast.error("Name is required");
    try {
      await api.post("/api/automations", {
        name: form.name,
        trigger: form.trigger,
        actions: [
          form.actionType === "UPDATE_STATUS"
            ? { type: "UPDATE_STATUS", status: form.actionStatus }
            : form.actionType === "UPDATE_STAGE"
            ? { type: "UPDATE_STAGE", stage: form.stage }
            : { type: form.actionType },
        ],
      });
      toast.success("Automation created");
      setShowForm(false);
      setForm({ name: "", trigger: "LEAD_CREATED", actionType: "UPDATE_STATUS", actionStatus: "LIVE", stage: "" });
      fetchAutomations();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/api/automations/${id}/toggle`, { is_active: !isActive });
      fetchAutomations();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/automations/${id}`);
      toast.success("Deleted");
      fetchAutomations();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Automation Rules"
        description="Automate lead status changes and follow-up actions"
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={13} /> New Rule
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {showForm && (
          <div className="glass-card p-5 space-y-4">
            <p className="text-sm font-semibold">Create Automation Rule</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trigger */}
              <div className="space-y-3 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">When…</p>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <input className="h-8 w-full rounded-md border border-border bg-input px-3 text-sm"
                    placeholder="Auto-mark live on reply"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Trigger</label>
                  <Select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className="w-full">
                    {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
              </div>

              {/* Action */}
              <div className="space-y-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Then…</p>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Action</label>
                  <Select value={form.actionType} onChange={(e) => setForm({ ...form, actionType: e.target.value })} className="w-full">
                    {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </Select>
                </div>

                {form.actionType === "UPDATE_STATUS" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Set Status To</label>
                    <Select value={form.actionStatus} onChange={(e) => setForm({ ...form, actionStatus: e.target.value })} className="w-full">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                )}

                {form.actionType === "UPDATE_STAGE" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Stage Name</label>
                    <input className="h-8 w-full rounded-md border border-border bg-input px-3 text-sm"
                      placeholder="Qualified" value={form.stage}
                      onChange={(e) => setForm({ ...form, stage: e.target.value })} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Rule</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Automations table */}
        <div className="glass-card overflow-hidden">
          {loading ? <TableSkeleton rows={4} cols={5} /> : automations.length === 0 ? (
            <EmptyState icon={Zap} title="No automations"
              description="Create rules to automatically update leads based on events." />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Name", "Trigger", "Status", "Runs", "Created", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {automations.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 table-row-hover">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {TRIGGERS.find((t) => t.value === a.trigger)?.label ?? a.trigger}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        a.is_active
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-white/5 text-muted-foreground border-white/10"
                      }`}>
                        {a.is_active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{a.run_count}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelativeTime(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggle(a.id, a.is_active)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
                          {a.is_active ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
