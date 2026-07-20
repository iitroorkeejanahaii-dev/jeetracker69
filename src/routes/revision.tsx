import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS } from "@/lib/jee/seed";
import { daysSince } from "@/lib/jee/readiness";

export const Route = createFileRoute("/revision")({
  component: RevisionPage,
  head: () => ({ meta: [{ title: "Revision Center — JEE OS" }] }),
});

function RevisionPage() {
  const getCh = useJeeStore((s) => s.getChapter);

  const rows = ALL_CHAPTERS.map((c) => {
    const state = getCh(c.id);
    const last = state.revisions[state.revisions.length - 1];
    const since = last ? daysSince(last.date) ?? 0 : Infinity;
    return { c, state, last, since };
  });

  const due = rows.filter((r) => r.last && r.since >= 5).sort((a, b) => b.since - a.since);
  const scheduled = rows.filter((r) => r.last && r.since < 5).sort((a, b) => a.since - b.since);
  const never = rows.filter((r) => !r.last);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Cycle</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Revision Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Spaced-repetition style overview across every chapter you've touched.</p>
        </header>

        <Bucket title="Due now" tone="text-amber-400" list={due} empty="Nothing overdue. Nice discipline."/>
        <Bucket title="On track" tone="text-emerald-400" list={scheduled} empty="Log a revision from any chapter workspace."/>
        <Bucket title="Never revised" tone="text-red-400" list={never as any} empty="You've revised every chapter at least once. Elite."/>
      </div>
    </AppShell>
  );
}

function Bucket({ title, tone, list, empty }: { title: string; tone: string; list: { c: any; state: any; last?: any; since: number }[]; empty: string }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-mono uppercase tracking-widest ${tone}`}>{title}</h2>
        <span className="text-[10px] font-mono text-muted-foreground">{list.length}</span>
      </div>
      {list.length ? (
        <ul className="divide-y divide-border/50 rounded-2xl border border-border/60 bg-card">
          {list.map(({ c, state, last, since }) => (
            <li key={c.id}>
              <Link to="/c/$cid" params={{ cid: c.id }} className="flex items-center gap-3 p-3 hover:bg-white/[0.03]">
                <div className="size-8 rounded-md bg-white/[0.04] grid place-items-center text-[10px] font-mono text-muted-foreground">{c.subjectId.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {last ? `${state.revisions.length} revisions · last ${new Date(last.date).toLocaleDateString()} · conf ${last.confidence}/5` : "Not revised yet"}
                  </div>
                </div>
                {last && <span className={`text-xs font-mono ${since >= 7 ? "text-amber-400" : "text-emerald-400"}`}>{since}d</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground text-center">{empty}</div>
      )}
    </section>
  );
}