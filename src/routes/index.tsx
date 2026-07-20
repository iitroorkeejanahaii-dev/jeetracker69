import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressRing } from "@/components/jee/ProgressRing";
import { Heatmap } from "@/components/jee/Heatmap";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS, SUBJECTS } from "@/lib/jee/seed";
import { readinessScore, daysSince, readinessBand } from "@/lib/jee/readiness";
import { ArrowRight, Flame, Clock, Target, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const chapters = useJeeStore((s) => s.chapters);
  const mistakes = useJeeStore((s) => s.mistakes);
  const daily = useJeeStore((s) => s.daily);
  const streak = useJeeStore((s) => s.streak);
  const settings = useJeeStore((s) => s.settings);
  const getChapter = useJeeStore((s) => s.getChapter);

  const today = new Date().toISOString().slice(0, 10);
  const todayLog = daily[today];
  const weekHours = Object.entries(daily)
    .filter(([d]) => Date.now() - new Date(d).getTime() < 7 * 86400_000)
    .reduce((a, [, l]) => a + l.hours, 0);
  const monthHours = Object.entries(daily)
    .filter(([d]) => Date.now() - new Date(d).getTime() < 30 * 86400_000)
    .reduce((a, [, l]) => a + l.hours, 0);
  const totalQuestions = Object.values(daily).reduce((a, l) => a + l.questions, 0);

  const scored = ALL_CHAPTERS.map((c) => {
    const state = getChapter(c.id);
    const chMistakes = mistakes.filter((m) => m.chapterId === c.id);
    const score = readinessScore(state, chMistakes);
    return { c, state, score, chMistakes };
  });

  const subjectPct = (sid: string) => {
    const list = scored.filter((x) => x.c.subjectId === sid);
    return Math.round(list.reduce((a, x) => a + x.score, 0) / Math.max(list.length, 1));
  };
  const overall = Math.round(scored.reduce((a, x) => a + x.score, 0) / scored.length);

  // Today's mission — pick top-priority items
  const mission = scored
    .map((x) => {
      const overdueRev = x.state.revisions.length > 0
        ? daysSince(x.state.revisions[x.state.revisions.length - 1].date) ?? 0
        : daysSince(x.state.lastStudied) ?? 999;
      const priority = (100 - x.score) + (overdueRev > 7 ? 20 : 0);
      return { ...x, priority, overdueRev };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);

  const dueRevision = scored
    .filter((x) => x.state.revisions.length && (daysSince(x.state.revisions[x.state.revisions.length - 1].date) ?? 0) >= 5)
    .slice(0, 4);

  const weak = [...scored].sort((a, b) => a.score - b.score).slice(0, 5);

  const pendingMistakes = mistakes.filter((m) => m.status === "pending").length;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Mission control</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
              Good {greet()}, {settings.name}.
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Target JEE {settings.targetYear}. Ship one chapter closer today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Stat icon={Flame} label="Streak" value={`${streak}d`} tone="text-orange-400" />
            <Stat icon={Clock} label="Today" value={`${(todayLog?.hours ?? 0).toFixed(1)}h`} />
            <Stat icon={Target} label="Week" value={`${weekHours.toFixed(1)}h`} />
          </div>
        </header>

        {/* Top ring grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="md:col-span-1 flex items-center gap-4 py-6">
            <ProgressRing
              value={overall}
              size={104}
              stroke={9}
              label={
                <div className="text-center">
                  <div className="text-2xl font-semibold font-mono">{overall}</div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Readiness</div>
                </div>
              }
            />
            <div>
              <div className="text-xs text-muted-foreground">Overall JEE</div>
              <div className={`text-sm font-medium ${readinessBand(overall).tone}`}>{readinessBand(overall).label}</div>
              <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                {totalQuestions} Qs · {monthHours.toFixed(0)}h/30d
              </div>
            </div>
          </Card>
          {SUBJECTS.map((s) => {
            const pct = subjectPct(s.id);
            return (
              <Link key={s.id} to="/s/$sid" params={{ sid: s.id }}>
                <Card className="flex items-center gap-4 py-6 hover:bg-white/[0.03] transition h-full">
                  <ProgressRing
                    value={pct}
                    size={76}
                    stroke={7}
                    ringClass="stroke-primary"
                    label={
                      <div className="text-center">
                        <div className="text-lg font-semibold font-mono">{pct}</div>
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground">{s.short}</div>
                      </div>
                    }
                  />
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.units.length} units · {s.units.reduce((a, u) => a + u.chapters.length, 0)} chapters
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </section>

        {/* Middle: Today's mission + Right column */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 space-y-4">
            <SectionHead title="Today's mission" hint={`${mission.length} priority chapters`} />
            <ul className="divide-y divide-border/60">
              {mission.map((m) => (
                <li key={m.c.id}>
                  <Link to="/c/$cid" params={{ cid: m.c.id }} className="flex items-center gap-3 py-3 group">
                    <div className="size-8 rounded-md bg-white/[0.04] grid place-items-center text-[10px] font-mono text-muted-foreground group-hover:text-primary">
                      {m.c.subjectId.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.c.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {m.overdueRev > 999 ? "Not started" : `${m.overdueRev}d since last touch`} · {m.state.lectures.filter(l=>l.done).length}/{m.state.lectures.length} lectures
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-mono font-semibold ${readinessBand(m.score).tone}`}>{m.score}</div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">ready</div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-4">
            <Card>
              <SectionHead title="Due for revision" hint={`${dueRevision.length} overdue`} />
              {dueRevision.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">Nothing overdue. Log revisions in a chapter to see them here.</p>
              ) : (
                <ul className="space-y-2 mt-3">
                  {dueRevision.map((x) => (
                    <li key={x.c.id}>
                      <Link to="/c/$cid" params={{ cid: x.c.id }} className="flex justify-between text-sm hover:text-primary">
                        <span className="truncate">{x.c.name}</span>
                        <span className="text-[11px] text-amber-400 font-mono">{daysSince(x.state.revisions[x.state.revisions.length - 1].date)}d</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <SectionHead title="Weak chapters" />
              <ul className="space-y-2 mt-3">
                {weak.map((x) => (
                  <li key={x.c.id}>
                    <Link to="/c/$cid" params={{ cid: x.c.id }} className="flex items-center gap-2 hover:text-primary">
                      <div className={`size-1.5 rounded-full ${x.score < 35 ? "bg-red-500" : "bg-amber-400"}`} />
                      <span className="text-sm truncate flex-1">{x.c.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{x.score}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Bottom: heatmap + mistakes alert */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <SectionHead title="Consistency" hint="Last 20 weeks" />
            <div className="mt-4">
              <Heatmap daily={daily} weeks={20} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mt-3">
              <span>Less</span>
              <div className="flex gap-1 items-center">
                <div className="size-2 rounded-[2px] bg-white/[0.04]" />
                <div className="size-2 rounded-[2px] bg-primary/25" />
                <div className="size-2 rounded-[2px] bg-primary/50" />
                <div className="size-2 rounded-[2px] bg-primary/75" />
                <div className="size-2 rounded-[2px] bg-primary" />
              </div>
              <span>More</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-between">
            <div>
              <SectionHead title="Mistake notebook" hint={`${pendingMistakes} pending`} />
              <p className="text-xs text-muted-foreground mt-3">
                {mistakes.length === 0
                  ? "No mistakes logged yet. Log every one — that's where marks live."
                  : `Total ${mistakes.length} logged · ${mistakes.filter((m) => m.status === "mastered").length} mastered.`}
              </p>
            </div>
            <Link to="/mistakes" className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-medium">
              <AlertTriangle className="size-4" /> Open notebook
            </Link>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border/60 p-4 md:p-5 ${className}`}>{children}</div>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{title}</h2>
      {hint && <span className="text-[10px] font-mono text-muted-foreground">{hint}</span>}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = "text-foreground" }: { icon: React.ElementType; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-card border border-border/60 px-3 py-2 flex items-center gap-2">
      <Icon className={`size-4 ${tone}`} />
      <div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
        <div className={`text-sm font-semibold font-mono ${tone}`}>{value}</div>
      </div>
    </div>
  );
}
