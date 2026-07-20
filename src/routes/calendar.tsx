import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { Heatmap } from "@/components/jee/Heatmap";
import { useJeeStore } from "@/lib/jee/store";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendar — JEE OS" }] }),
});

function CalendarPage() {
  const daily = useJeeStore((s) => s.daily);
  const entries = Object.entries(daily).sort(([a],[b]) => b.localeCompare(a)).slice(0, 30);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Timeline</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Calendar</h1>
        </header>

        <div className="rounded-2xl bg-card border border-border/60 p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Study hours · 52 weeks</h2>
          <Heatmap daily={daily} weeks={52} metric="hours"/>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Questions solved · 52 weeks</h2>
          <Heatmap daily={daily} weeks={52} metric="questions"/>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 p-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Recent days</h2>
          {entries.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  <th className="text-left font-mono py-2">Date</th>
                  <th className="text-right font-mono">Hours</th>
                  <th className="text-right font-mono">Qs</th>
                  <th className="text-right font-mono">Tasks</th>
                  <th className="text-right font-mono">Revs</th>
                  <th className="text-right font-mono">Mocks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {entries.map(([d, l]) => (
                  <tr key={d}>
                    <td className="py-2 font-mono text-xs">{d}</td>
                    <td className="text-right font-mono text-xs">{l.hours.toFixed(1)}</td>
                    <td className="text-right font-mono text-xs">{l.questions}</td>
                    <td className="text-right font-mono text-xs">{l.tasks}</td>
                    <td className="text-right font-mono text-xs">{l.revisions}</td>
                    <td className="text-right font-mono text-xs">{l.mockTests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No study logged yet. Complete tasks or use Quick add → Log hours.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}