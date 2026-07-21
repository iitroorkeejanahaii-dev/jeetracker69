import { Link } from "@tanstack/react-router";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS } from "@/lib/jee/seed";
import { readinessScore, daysSince } from "@/lib/jee/readiness";
import { ProgressBar } from "./ProgressBar";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_ORDER = { critical: 4, priority: 3, focus: 2, normal: 1 } as const;

export function HallOfFocus() {
  const hall = useJeeStore((s) => s.hallOfFocus);
  const getCh = useJeeStore((s) => s.getChapter);
  const mistakes = useJeeStore((s) => s.mistakes);

  // Auto-derive if user hasn't pinned
  const auto = ALL_CHAPTERS
    .map((c) => {
      const state = getCh(c.id);
      const chMist = mistakes.filter((m) => m.chapterId === c.id);
      const score = readinessScore(state, chMist);
      const p = PRIORITY_ORDER[state.priority ?? "normal"];
      return { c, state, score, p };
    })
    .sort((a, b) => b.p - a.p || a.score - b.score)
    .slice(0, 3);

  const rows = hall.length
    ? hall.map((id) => auto.find((x) => x.c.id === id) ?? {
        c: ALL_CHAPTERS.find((c) => c.id === id)!,
        state: getCh(id),
        score: readinessScore(getCh(id), mistakes.filter((m) => m.chapterId === id)),
        p: 1,
      })
    : auto;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Star className="size-3.5 text-[color:var(--gold)]" /> Hall of Focus
        </h2>
        <span className="text-[10px] font-mono text-muted-foreground">Top 3 only</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.filter(Boolean).map(({ c, state, score }) => {
          const p = state.priority ?? "normal";
          const isGold = p === "priority" || p === "critical";
          return (
            <Link
              key={c.id}
              to="/c/$cid"
              params={{ cid: c.id }}
              className={cn(
                "group rounded-2xl border p-4 bg-card transition hover:border-primary/40",
                isGold ? "glow-priority border-[color:var(--gold)]/30" : "border-border/60",
                p === "critical" && "glow-gold",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{c.subjectId.toUpperCase()}</div>
                  <div className="text-sm font-semibold truncate mt-0.5">{c.name}</div>
                </div>
                {isGold && <Star className="size-3.5 text-[color:var(--gold)] fill-[color:var(--gold)]" />}
              </div>
              <ProgressBar value={score} size="sm" showValue />
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{state.lastStudied ? `${daysSince(state.lastStudied)}d ago` : "Never"}</span>
                <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">Continue <ArrowRight className="size-3.5" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}