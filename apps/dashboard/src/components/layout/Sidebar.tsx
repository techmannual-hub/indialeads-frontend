"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Radio, MessageSquare, FileText,
  ShoppingBag, Zap, Inbox, BarChart2, Phone, Settings,
  ScrollText, LogOut, ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

const NAV = [
  { label: "Dashboard",   href: "/",             icon: LayoutDashboard },
  { label: "Leads",       href: "/leads",         icon: Users },
  { label: "Broadcasts",  href: "/broadcasts",    icon: Radio },
  { label: "Followups",   href: "/followups",     icon: MessageSquare },
  { label: "Templates",   href: "/templates",     icon: FileText },
  { label: "Catalog",     href: "/catalog",       icon: ShoppingBag },
  { label: "Automations", href: "/automations",   icon: Zap },
  { label: "Inbox",       href: "/inbox",         icon: Inbox },
  { label: "Analytics",   href: "/analytics",     icon: BarChart2 },
  { label: "WhatsApp",    href: "/whatsapp",      icon: Phone },
  { label: "Settings",    href: "/settings",      icon: Settings },
  { label: "Logs",        href: "/logs",          icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary-foreground">IL</span>
        </div>
        <span className="font-semibold text-sm text-foreground tracking-tight">IndiaLeads</span>
        {tenant?.is_demo && (
          <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">
            DEMO
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "nav-item group",
                isActive && "active"
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={12} className="opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(user?.name ?? "U")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{tenant?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
