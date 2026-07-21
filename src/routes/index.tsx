import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressBar } from "@/components/jee/ProgressBar";
import { Heatmap } from "@/components/jee/Heatmap";
import { useJeeStore } from "@/lib/jee/store";
import { SUBJECTS } from "@/lib/jee/seed";
import { readinessScore } from "@/lib/jee/readiness";
import { daysSince } from "@/lib/jee/readiness";
import { getChapterSummary, getChaptersForSubject } from "@/lib/jee/chapterQueries";
import { CreateChapterDialog } from "@/components/jee/CreateChapterDialog";
import { ArrowRight, Clock, RotateCcw, BookOpen, Zap, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — JEE OS" }],
  }),
});

function Dashboard() {
  const mistakes = useJeeStore((s) => s.mistakes);
  const daily = useJeeStore((s) => s.daily);
  const chapters = useJeeStore((s) => s.chapters);
  const streak = useJeeStore((s) => s.streak);
  const settings = useJeeStore((s) => s.settings);
  const getRevisionsForToday = useJeeStore((s) => s.getRevisionsForToday);
  const getOverdueRevisions = useJeeStore((s) => s.getOverdueRevisions);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const todayLog = daily[today];
  const revisionsToday = getRevisionsForToday();
  const overdueRevisions = getOverdueRevisions();
  const pendingMistakes = mistakes.filter((m) => m.status === "pending");

  const chapterSummaries = useMemo(() => {
    return Object.values(chapters).map((ch) => ({
      ...getChapterSummary(
        ch,
        mistakes.filter((m) => m.chapterId === ch.id)
      ),
      chapter: ch,
    }));
  }, [chapters, mistakes]);

  const overallReadiness = useMemo(() => {
    if (chapterSummaries.length === 0) return 0;
    const sum = chapterSummaries.reduce((a, x) => a + x.readiness, 0);
    return Math.round(sum / chapterSummaries.length);
  }, [chapterSummaries]);

  const subjectReadiness = (subjectId: string) => {
    const subjectChapters = chapterSummaries.filter(
      (x) => x.subjectId === subjectId
    );
    if (subjectChapters.length === 0) return 0;
    const sum = subjectChapters.reduce((a, x) => a + x.readiness, 0);
    return Math.round(sum / subjectChapters.length);
  };

  const recentChapter = useMemo(() => {
    return Object.values(chapters)
      .filter((ch) => ch.lastStudied)
      .sort(
        (a, b) =>
          new Date(b.lastStudied || 0).getTime() -
          new Date(a.lastStudied || 0).getTime()
      )[0];
  }, [chapters]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header with user name */}
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome, {settings.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {overallReadiness}% overall readiness — {streak} day streak
          </p>
        </header>

        {/* Primary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Today's Mission */}
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <BookOpen className="size-4" />
              <span className="text-[10px] uppercase tracking-widest font-mono">
                Today's mission
              </span>
            </div>
            <div className="text-sm font-semibold mb-2">
              {todayLog?.questions ?? 0} questions
            </div>
            <p className="text-[11px] text-muted-foreground">
              {todayLog?.hours.toFixed(1) ?? "0"}h studied
            </p>
          </div>

          {/* Revisions Due */}
          <div
            className={`rounded-2xl border p-5 ${
              revisionsToday.length > 0
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-border/60 bg-card"
            }`}
          >
            <div
              className={`flex items-center gap-2 mb-2 ${
                revisionsToday.length > 0 ? "text-amber-400" : "text-muted-foreground"
              }`}
            >
              <RotateCcw className="size-4" />
              <span className="text-[10px] uppercase tracking-widest font-mono">
                Revisions due
              </span>
            </div>
            <div
              className={`text-2xl font-mono font-semibold ${
                revisionsToday.length > 0 ? "text-amber-400" : "text-foreground"
              }`}
            >
              {revisionsToday.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              +{overdueRevisions.length} overdue
            </p>
          </div>

          {/* Pending Mistakes */}
          <div
            className={`rounded-2xl border p-5 ${
              pendingMistakes.length > 0
                ? "border-red-500/40 bg-red-500/10"
                : "border-border/60 bg-card"
            }`}
          >
            <div
              className={`flex items-center gap-2 mb-2 ${
                pendingMistakes.length > 0 ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              <Clock className="size-4" />
              <span className="text-[10px] uppercase tracking-widest font-mono">
                Pending mistakes
              </span>
            </div>
            <div
              className={`text-2xl font-mono font-semibold ${
                pendingMistakes.length > 0 ? "text-red-400" : "text-foreground"
              }`}
            >
              {pendingMistakes.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Awaiting revision
            </p>
          </div>

          {/* Streak */}
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Zap className="size-4" />
              <span className="text-[10px] uppercase tracking-widest font-mono">
                Streak
              </span>
            </div>
            <div className="text-2xl font-mono font-semibold text-primary">
              {streak}d
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Keep going!
            </p>
          </div>
        </div>

        {/* Subject Progress */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SUBJECTS.map((s) => {
            const pct = subjectReadiness(s.id);
            return (
              <Link
                key={s.id}
                to={`/s/${s.id}`}
                className="rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {s.short}
                    </div>
                    <div className="text-sm font-semibold">{s.name}</div>
                  </div>
                  <span className="text-lg font-mono font-semibold text-primary">
                    {pct}%
                  </span>
                </div>
                <ProgressBar value={pct} size="sm" />
              </Link>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {recentChapter && (
              <Link
                to={`/c/${recentChapter.id}`}
                className="rounded-lg border border-border/60 bg-background/50 p-3 hover:bg-background transition text-center"
              >
                <div className="text-xs text-muted-foreground">Resume</div>
                <div className="text-xs font-semibold truncate">
                  {recentChapter.chapterName}
                </div>
              </Link>
            )}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 hover:bg-primary/10 transition text-center flex flex-col items-center justify-center gap-1"
            >
              <Plus className="size-4 text-primary" />
              <div className="text-xs font-semibold text-primary">New chapter</div>
            </button>
            <Link
              to="/mistakes"
              className="rounded-lg border border-border/60 bg-background/50 p-3 hover:bg-background transition text-center"
            >
              <div className="text-xs text-muted-foreground">Mistakes</div>
              <div className="text-xs font-semibold">{mistakes.length}</div>
            </Link>
            <Link
              to="/revision"
              className="rounded-lg border border-border/60 bg-background/50 p-3 hover:bg-background transition text-center"
            >
              <div className="text-xs text-muted-foreground">Revisions</div>
              <div className="text-xs font-semibold">
                {revisionsToday.length}d
              </div>
            </Link>
          </div>
        </section>

        {/* Consistency Heatmap */}
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Consistency · 20 weeks
            </h2>
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
          <div className="mt-4">
            <Heatmap daily={daily} weeks={20} />
          </div>
        </section>

        {/* Chapters Grid */}
        {chapterSummaries.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3">All chapters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapterSummaries.map((summary) => (
                <Link
                  key={summary.id}
                  to={`/c/${summary.id}`}
                  className="rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {summary.subjectId}
                      </div>
                      <h3 className="text-sm font-semibold">{summary.name}</h3>
                    </div>
                    <span className="text-lg font-mono font-semibold text-primary">
                      {summary.readiness}%
                    </span>
                  </div>
                  <ProgressBar value={summary.readiness} size="sm" />
                  <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] text-muted-foreground">
                    <div>
                      <div className="font-semibold text-foreground">
                        {summary.lecturesCompleted}/{summary.lecturesTotal}
                      </div>
                      <div>Lectures</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {summary.sheetsCompleted}/{summary.sheetsTotal}
                      </div>
                      <div>Sheets</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {summary.revisionCount}
                      </div>
                      <div>Revisions</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {summary.mistakeCount}
                      </div>
                      <div>Mistakes</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <CreateChapterDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </AppShell>
  );
}
