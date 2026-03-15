"use client";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "green" | "amber" | "red" | "blue";
}

const accentMap = {
  green: "text-green-400 bg-green-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  red: "text-red-400 bg-red-500/10",
  blue: "text-blue-400 bg-blue-500/10",
};

export function StatCard({ label, value, icon: Icon, trend, accent = "green" }: StatCardProps) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
          {label}
        </span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accentMap[accent])}>
          <Icon size={15} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs mb-0.5",
            trend.value >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-border">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    PENDING: "status-pending",
    LIVE: "status-live",
    DEAD: "status-dead",
    COOLING: "status-cooling",
    APPROVED: "status-live",
    REJECTED: "status-dead",
    DRAFT: "status-pending",
    RUNNING: "status-live",
    COMPLETED: "status-live",
    PAUSED: "status-pending",
    FAILED: "status-dead",
  };
  const labels: Record<string, string> = {
    PENDING: "Pending", LIVE: "Live", DEAD: "Dead", COOLING: "Cooling",
    APPROVED: "Approved", REJECTED: "Rejected", DRAFT: "Draft",
    RUNNING: "Running", COMPLETED: "Done", PAUSED: "Paused", FAILED: "Failed",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
      classes[status] ?? "bg-white/5 text-white/50 border border-white/10"
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {labels[status] ?? status}
    </span>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1 px-6 py-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={cn("skeleton h-4 rounded", j === 0 ? "w-32" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Icon size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const btnVariants = {
  primary:   "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  ghost:     "text-muted-foreground hover:text-foreground hover:bg-accent",
  danger:    "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
};
const btnSizes = {
  sm:  "h-7 px-3 text-xs gap-1.5",
  md:  "h-8 px-4 text-sm gap-2",
  lg:  "h-10 px-5 text-sm gap-2",
};

export function Button({
  variant = "primary", size = "md", loading, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        btnVariants[variant], btnSizes[size], className
      )}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-8 w-full rounded-md border border-border bg-input px-3 py-1 text-sm",
        "placeholder:text-muted-foreground/60",
        "focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-8 rounded-md border border-border bg-input px-2 py-1 text-sm",
        "text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm",
        "placeholder:text-muted-foreground/60 resize-none",
        "focus:outline-none focus:ring-1 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
