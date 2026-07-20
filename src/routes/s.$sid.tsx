import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressRing } from "@/components/jee/ProgressRing";
import { getSubject } from "@/lib/jee/seed";
import { useJeeStore } from "@/lib/jee/store";
import { readinessScore, readinessBand } from "@/lib/jee/readiness";

export const Route = createFileRoute("/s/$sid")({
  component: SubjectPage,
  loader: ({ params }) => {
    if (!getSubject(params.sid)) throw notFound();
    return { sid: params.sid };
  },
  notFoundComponent: () => <div className="p-8">Subject not found.</div>,
});

function SubjectPage() {
  const { sid } = Route.useLoaderData();
  const subject = getSubject(sid)!;
  const chapters = useJeeStore((s) => s.chapters);
  const mistakes = useJeeStore((s) => s.mistakes);
  const getCh = useJeeStore((s) => s.getChapter);

  const scores = subject.units.flatMap((u) =>
    u.chapters.map((c) => {
      const state = getCh(c.id);
      const chMist = mistakes.filter((m) => m.chapterId === c.id);
      return { ch: c, unit: u, score: readinessScore(state, chMist), state };
    }),
  );
  const overall = Math.round(scores.reduce((a, x) => a + x.score, 0) / scores.length);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <header className="flex items-center gap-6">
          <ProgressRing
            value={overall}
            size={88}
            label={<div className="text-center"><div className="text-xl font-mono font-semibold">{overall}</div><div className="text-[9px] uppercase tracking-widest text-muted-foreground">Ready</div></div>}
          />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Subject</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{subject.name}</h1>
            <p className={`text-sm ${readinessBand(overall).tone}`}>{readinessBand(overall).label}</p>
          </div>
        </header>

        <div className="space-y-8">
          {subject.units.map((u) => (
            <section key={u.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">{u.name}</h2>
                <span className="text-[10px] font-mono text-muted-foreground">{u.chapters.length} chapters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {u.chapters.map((c) => {
                  const state = getCh(c.id);
                  const chMist = mistakes.filter((m) => m.chapterId === c.id);
                  const score = readinessScore(state, chMist);
                  const band = readinessBand(score);
                  return (
                    <Link
                      key={c.id}
                      to="/c/$cid"
                      params={{ cid: c.id }}
                      className="group rounded-xl bg-card border border-border/60 p-4 hover:border-primary/40 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className={`text-[11px] mt-0.5 ${band.tone}`}>{band.label}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-mono font-semibold text-primary">{score}</div>
                          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">ready</div>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${score}%` }} />
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                        <span>{state.lectures.filter((l) => l.done).length}/{state.lectures.length} lec</span>
                        <span>·</span>
                        <span>{state.revisions.length} rev</span>
                        <span>·</span>
                        <span>{chMist.length} mist</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}