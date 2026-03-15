"use client";
import { useEffect, useState } from "react";
import { ScrollText, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Button, EmptyState, TableSkeleton } from "@/components/shared";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Log {
  id: string; status: string; lead_id?: string; created_at: string;
  result?: string[]; error?: string;
  automation: { name: string; trigger: string };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch latest automation logs via each automation
      const autoRes = await api.get<{ data: { id: string; logs: Log[] }[] }>("/api/automations?limit=20");
      const allLogs = autoRes.data.flatMap((a) =>
        (a.logs ?? []).map((l: Log) => ({ ...l, automation: a as unknown as Log["automation"] }))
      );
      allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setLogs(allLogs.slice(0, 100));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const statusColor = {
    SUCCESS: "text-green-400 bg-green-500/10 border-green-500/20",
    FAILED: "text-red-400 bg-red-500/10 border-red-500/20",
    SKIPPED: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Automation run history"
        actions={
          <Button variant="secondary" size="sm" onClick={fetchLogs}>
            <RefreshCw size={13} /> Refresh
          </Button>
        }
      />

      <div className="p-6">
        <div className="glass-card overflow-hidden">
          {loading ? <TableSkeleton rows={8} cols={5} /> : logs.length === 0 ? (
            <EmptyState icon={ScrollText} title="No logs yet"
              description="Automation activity will appear here." />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Automation", "Trigger", "Status", "Result", "Time"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 table-row-hover">
                    <td className="px-4 py-2.5 font-medium">{log.automation?.name ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">{log.automation?.trigger ?? "—"}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                        statusColor[log.status as keyof typeof statusColor] ?? "text-muted-foreground bg-white/5 border-white/10"
                      )}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {log.error ?? (Array.isArray(log.result) ? log.result.join(" → ") : "—")}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
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
