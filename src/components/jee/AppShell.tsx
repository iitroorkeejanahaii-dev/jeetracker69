import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Atom,
  FlaskConical,
  Sigma,
  XCircle,
  RotateCcw,
  BarChart3,
  CalendarDays,
  Target,
  Settings as SettingsIcon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJeeStore } from "@/lib/jee/store";
import { QuickAdd } from "./QuickAdd";
import { useState } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/s/phy", label: "Physics", icon: Atom },
  { to: "/s/che", label: "Chemistry", icon: FlaskConical },
  { to: "/s/mat", label: "Mathematics", icon: Sigma },
  { to: "/mistakes", label: "Mistakes", icon: XCircle },
  { to: "/revision", label: "Revision", icon: RotateCcw },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const streak = useJeeStore((s) => s.streak);
  const [quickOpen, setQuickOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/") || pathname.startsWith(to);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/15 ring-1 ring-primary/30 grid place-items-center">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">JEE OS</div>
              <div className="text-sm font-semibold tracking-tight">Mission Control</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", active && "text-primary")} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/60">
          <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Streak</div>
              <div className="text-sm font-semibold text-primary">{streak} days</div>
            </div>
            <button
              onClick={() => setQuickOpen(true)}
              className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center hover:opacity-90 transition"
              aria-label="Quick add"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary/15 ring-1 ring-primary/30 grid place-items-center">
            <div className="size-1.5 rounded-full bg-primary" />
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">JEE OS</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-primary">{streak}d streak</div>
          <button
            onClick={() => setQuickOpen(true)}
            className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center"
            aria-label="Quick add"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-sidebar/90 backdrop-blur-xl border border-border/60 rounded-2xl px-2 py-2 flex justify-between items-center shadow-2xl">
        {[nav[0], nav[1], nav[2], nav[3], nav[4]].map((n) => {
          const active = isActive(n.to, n.exact);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition",
                active ? "bg-white/[0.06] text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="text-[9px] font-medium tracking-wide">{n.label.slice(0, 4)}</span>
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-24 md:pb-0">{children}</main>

      <QuickAdd open={quickOpen} onOpenChange={setQuickOpen} />
    </div>
  );
}