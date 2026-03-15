"use client";
import { useEffect, useState } from "react";
import { Users, MessageSquare, TrendingUp, Radio, Clock, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { StatCard, PageHeader, TableSkeleton } from "@/components/shared";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDate } from "@/lib/utils";

interface DashboardData {
  leads_by_status: Record<string, number>;
  leads_over_time: { date: string; count: number }[];
  message_stats: {
    sent: number; delivered: number; read: number; failed: number;
    delivery_rate: number; read_rate: number;
  };
  broadcast_stats: { total: number; completed: number; total_messages: number; avg_read_rate: number };
  top_stages: { stage: string; count: number }[];
}

const STATUS_COLORS = ["#00ff88", "#f59e0b", "#ef4444", "#60a5fa"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: DashboardData }>("/api/analytics/dashboard?days=30")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalLeads = data
    ? Object.values(data.leads_by_status).reduce((a, b) => a + b, 0)
    : 0;

  const pieData = data
    ? Object.entries(data.leads_by_status).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div>
      <PageHeader title="Dashboard" description="Your CRM overview for the last 30 days" />

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={totalLeads} icon={Users} accent="green" />
          <StatCard
            label="Messages Sent"
            value={data?.message_stats.sent ?? 0}
            icon={MessageSquare}
            accent="blue"
          />
          <StatCard
            label="Reply Rate"
            value={`${data?.message_stats.read_rate ?? 0}%`}
            icon={TrendingUp}
            accent="amber"
          />
          <StatCard
            label="Broadcasts"
            value={data?.broadcast_stats.total ?? 0}
            icon={Radio}
            accent="green"
          />
        </div>

        {/* Lead status + over time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="lg:col-span-2 glass-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Leads over time
            </p>
            {loading ? (
              <div className="h-48 skeleton rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data?.leads_over_time ?? []}>
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatDate(d, "dd MMM")}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(222 40% 7%)",
                      border: "1px solid hsl(222 30% 14%)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelFormatter={(l) => formatDate(l, "dd MMM yyyy")}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#00ff88"
                    strokeWidth={2}
                    fill="url(#leadGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Lead status pie */}
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              By status
            </p>
            {loading ? (
              <div className="h-48 skeleton rounded" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <PieChart width={140} height={140}>
                  <Pie data={pieData} cx={65} cy={65} innerRadius={45} outerRadius={65}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="w-full space-y-1.5">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full inline-block"
                          style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </span>
                      <span className="font-medium tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery stats + top stages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Message delivery
            </p>
            {loading ? <TableSkeleton rows={3} cols={2} /> : (
              <div className="space-y-3">
                {[
                  { label: "Sent", value: data?.message_stats.sent, color: "bg-blue-500" },
                  { label: "Delivered", value: data?.message_stats.delivered, color: "bg-green-500" },
                  { label: "Read", value: data?.message_stats.read, color: "bg-primary" },
                  { label: "Failed", value: data?.message_stats.failed, color: "bg-red-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{label}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{
                          width: `${Math.min(100, ((value ?? 0) / (data?.message_stats.sent || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-10 text-right">{value ?? 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Top stages
            </p>
            {loading ? <TableSkeleton rows={5} cols={2} /> : (
              <div className="space-y-2">
                {(data?.top_stages ?? []).slice(0, 6).map((s) => (
                  <div key={s.stage} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{s.stage}</span>
                    <span className="font-medium tabular-nums ml-2">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
