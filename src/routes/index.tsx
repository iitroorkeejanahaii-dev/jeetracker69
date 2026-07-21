import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressBar } from "@/components/jee/ProgressBar";
import { DestinationCard } from "@/components/jee/DestinationCard";
import { CurrentMissionCard } from "@/components/jee/CurrentMissionCard";
import { HallOfFocus } from "@/components/jee/HallOfFocus";
import { Heatmap } from "@/components/jee/Heatmap";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS, SUBJECTS } from "@/lib/jee/seed";
import { readinessScore, daysSince } from "@/lib/jee/readiness";
import { ArrowRight, Clock, RotateCcw, BookOpen, Zap } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const mistakes = useJeeStore((s) => s.mistakes);
  const daily = useJeeStore((s) => s.daily);
  const getChapter = useJeeStore((s) => s.getChapter);
  const chapters = useJeeStore((s) => s.chapters);

  const today = new Date().toISOString().slice(0, 10);
  const todayLog = daily[today];

  const scored = ALL_CHAPTERS.map((c) => {
    const state = getChapter(c.id);
    const chMistakes = mistakes.filter((m) => m.chapterId === c.id);
    const score = readinessScore(state, chMistakes);
    return { c, state, score, chMistakes };
  });

  const overall = Math.round(scored.reduce((a, x) => a + x.score, 0) / scored.length);
  const subjectPct = (sid: string) => {
    const list = scored.filter((x) => x.c.subjectId === sid);
    return Math.round(list.reduce((a, x) => a + x.score, 0) / Math.max(list.length, 1));
  };

  const dueRev = scored.filter((x) => x.state.revisions.length && (daysSince(x.state.revisions[x.state.revisions.length - 1].date) ?? 0) >= 5).length;

  // Quick continue: chapter with most recent lastActivity/lastStudied
  const recent = Object.entries(chapters)
    .map(([id, st]) => ({ id, at: st.lastActivity?.at ?? st.lastStudied ?? "", label: st.lastActivity?.label }))
    .filter((x) => x.at)
    .sort((a, b) => (a.at < b.at ? 1 : -1))[0];
  const recentChapter = recent ? ALL_CHAPTERS.find((c) => c.id === recent.id) : null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <DestinationCard overall={overall} />

        <CurrentMissionCard />

        <HallOfFocus />

        {/* Today strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          <TileStat icon={BookOpen} label="Questions today" value={String(todayLog?.questions ?? 0)} />
          <TileStat icon={RotateCcw} label="Revisions due" value={String(dueRev)} tone={dueRev > 0 ? "text-amber-400" : undefined} />
          <TileStat icon={Clock} label="Hours today" value={`${(todayLog?.hours ?? 0).toFixed(1)}h`} />
          {recentChapter ? (
            <Link to="/c/$cid" params={{ cid: recentChapter.id }} className="rounded-2xl border border-primary/40 bg-primary/10 p-4 hover:bg-primary/15 transition group">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="size-4" />
                <span className="text-[10px] uppercase tracking-widest font-mono">Quick continue</span>
              </div>
              <div className="text-sm font-semibold mt-1 truncate">{recentChapter.name}</div>
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">{recent?.label ?? "Resume where you left off"} <ArrowRight className="size-3 inline ml-1 group-hover:ml-2 transition-all"/></div>
            </Link>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="size-4" />
                <span className="text-[10px] uppercase tracking-widest font-mono">Quick continue</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Open any chapter to start.</div>
            </div>
          )}
        </section>

        {/* Subjects strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
          {SUBJECTS.map((s) => {
            const pct = subjectPct(s.id);
            return (
              <Link key={s.id} to="/s/$sid" params={{ sid: s.id }} className="rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 transition group">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.short}</div>
                    <div className="text-sm font-semibold">{s.name}</div>
                  </div>
                  <span className="text-lg font-mono font-semibold text-primary">{pct}%</span>
                </div>
                <ProgressBar value={pct} size="sm" />
              </Link>
            );
          })}
        </section>

        {/* Consistency */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Consistency · 20 weeks</h2>
            <div className="flex gap-1 items-center text-[10px] font-mono text-muted-foreground">
              <span>Less</span>
              <div className="size-2 rounded-[2px] bg-white/[0.04]" />
              <div className="size-2 rounded-[2px] bg-primary/25" />
              <div className="size-2 rounded-[2px] bg-primary/50" />
              <div className="size-2 rounded-[2px] bg-primary/75" />
              <div className="size-2 rounded-[2px] bg-primary" />
              <span>More</span>
            </div>
          </div>
          <div className="mt-4"><Heatmap daily={daily} weeks={20} /></div>
        </section>
      </div>
    </AppShell>
  );
}

function TileStat({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-[10px] uppercase tracking-widest font-mono">{label}</span>
      </div>
      <div className={`text-2xl font-mono font-semibold mt-1 ${tone ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}
