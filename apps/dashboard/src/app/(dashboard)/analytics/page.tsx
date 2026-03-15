"use client";
import { useEffect, useState } from "react";
import {
  Users, MessageSquare, TrendingUp, Clock, Skull, BarChart2,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, StatCard, Select } from "@/components/shared";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface DashData {
  leads_by_status: Record<string, number>;
  leads_over_time: { date: string; count: number }[];
  message_stats: { sent: number; delivered: number; read: number; failed: number; delivery_rate: number; read_rate: number };
  broadcast_stats: { total: number; completed: number; total_messages: number; avg_read_rate: number };
  top_stages: { stage: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", LIVE: "#00ff88", DEAD: "#ef4444", COOLING: "#60a5fa",
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(222 40% 7%)", border: "1px solid hsl(222 30% 14%)",
    borderRadius: 6, fontSize: 12,
  },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ data: DashData }>(`/api/analytics/dashboard?days=${days}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [days]);

  const totalLeads = data ? Object.values(data.leads_by_status).reduce((a, b) => a + b, 0) : 0;
  const pieData = data
    ? Object.entries(data.leads_by_status).map(([name, value]) => ({ name, value }))
    : [];
  const followupsPending = 0; // TODO: wire to followups API

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Performance metrics and trends"
        actions={
          <Select value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Leads" value={totalLeads} icon={Users} accent="green" />
          <StatCard label="Messages Sent" value={data?.message_stats.sent ?? 0} icon={MessageSquare} accent="blue" />
          <StatCard
            label="Reply Rate"
            value={`${data?.message_stats.read_rate ?? 0}%`}
            icon={TrendingUp}
            accent="amber"
          />
          <StatCard label="Followups Pending" value={followupsPending} icon={Clock} accent="amber" />
          <StatCard label="Dead Leads" value={data?.leads_by_status.DEAD ?? 0} icon={Skull} accent="red" />
        </div>

        {/* Leads over time */}
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Leads per day
          </p>
          {loading ? (
            <div className="h-52 skeleton rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.leads_over_time ?? []}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, "dd MMM")}
                  tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} labelFormatter={(l) => formatDate(l, "dd MMM yyyy")} />
                <Area type="monotone" dataKey="count" name="Leads"
                  stroke="#00ff88" strokeWidth={2} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Two charts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Product-wise (top stages as proxy) */}
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Leads by stage
            </p>
            {loading ? <div className="h-48 skeleton rounded" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={(data?.top_stages ?? []).slice(0, 8)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" width={90}
                    tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Leads" fill="#00ff88" fillOpacity={0.8}
                    radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Lead status distribution */}
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Lead status distribution
            </p>
            {loading ? <div className="h-48 skeleton rounded" /> : (
              <div className="flex items-center justify-center gap-6">
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={72}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#6b7280"} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="space-y-2.5">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: STATUS_COLORS[entry.name] ?? "#6b7280" }} />
                      <span className="text-muted-foreground w-16">{entry.name}</span>
                      <span className="font-semibold tabular-nums">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message funnel */}
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-muted-foreground mb-5 uppercase tracking-wide">
            Message funnel
          </p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Sent", value: data?.message_stats.sent ?? 0, color: "bg-blue-500" },
              { label: "Delivered", value: data?.message_stats.delivered ?? 0, color: "bg-teal-500" },
              { label: "Read", value: data?.message_stats.read ?? 0, color: "bg-primary" },
              { label: "Failed", value: data?.message_stats.failed ?? 0, color: "bg-red-500" },
            ].map(({ label, value, color }, i) => {
              const sent = data?.message_stats.sent || 1;
              const pct = Math.round((value / sent) * 100);
              return (
                <div key={label} className="text-center space-y-2">
                  <div className="relative h-24 bg-white/5 rounded-lg overflow-hidden flex items-end">
                    <div className={`w-full ${color} opacity-80 transition-all duration-700 rounded-b-lg`}
                      style={{ height: `${Math.max(4, pct)}%` }} />
                  </div>
                  <p className="text-lg font-bold tabular-nums">{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {i > 0 && <p className="text-xs text-primary">{pct}%</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
