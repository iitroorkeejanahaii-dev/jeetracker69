import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressBar } from "@/components/jee/ProgressBar";
import { useJeeStore } from "@/lib/jee/store";
import { SUBJECTS } from "@/lib/jee/seed";
import { readinessScore } from "@/lib/jee/readiness";
import { getChapterSummary, getChaptersForSubject } from "@/lib/jee/chapterQueries";

export const Route = createFileRoute("/s/$sid")({
  component: SubjectPage,
  head: () => ({
    meta: [{ title: "Subject — JEE OS" }],
  }),
});

function SubjectPage() {
  const { sid } = Route.useParams();
  const chapters = useJeeStore((s) => s.chapters);
  const mistakes = useJeeStore((s) => s.mistakes);

  const subject = SUBJECTS.find((s) => s.id === sid);
  const subjectChapters = getChaptersForSubject(chapters, sid);

  if (!subject) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="text-center py-10">
            <h1 className="text-2xl font-semibold">Subject not found</h1>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">
              Back to dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const chapterSummaries = subjectChapters.map((ch) =>
    getChapterSummary(
      ch,
      mistakes.filter((m) => m.chapterId === ch.id)
    )
  );

  const overallReadiness =
    chapterSummaries.length > 0
      ? Math.round(
          chapterSummaries.reduce((a, x) => a + x.readiness, 0) /
            chapterSummaries.length
        )
      : 0;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <header>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {subject.name}
            </h1>
            <div className="text-right">
              <div className="text-3xl font-mono font-semibold text-primary">
                {overallReadiness}%
              </div>
              <p className="text-xs text-muted-foreground">overall readiness</p>
            </div>
          </div>
          <ProgressBar value={overallReadiness} />
        </header>

        {/* Chapters */}
        <div className="space-y-3">
          {chapterSummaries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
              No chapters created yet.
            </div>
          ) : (
            chapterSummaries.map((summary) => (
              <Link
                key={summary.id}
                to={`/c/${summary.id}`}
                className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold group-hover:text-primary transition">
                    {summary.name}
                  </h2>
                  <span className="text-2xl font-mono font-semibold text-primary">
                    {summary.readiness}%
                  </span>
                </div>
                <ProgressBar value={summary.readiness} size="sm" />
                <div className="grid grid-cols-5 gap-2 mt-4 text-[11px]">
                  <div>
                    <div className="font-mono font-semibold text-foreground">
                      {summary.lecturesCompleted}/{summary.lecturesTotal}
                    </div>
                    <div className="text-muted-foreground">Lectures</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-foreground">
                      {summary.sheetsCompleted}/{summary.sheetsTotal}
                    </div>
                    <div className="text-muted-foreground">Sheets</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-foreground">
                      {summary.dppsCompleted}/{summary.dppsTotal}
                    </div>
                    <div className="text-muted-foreground">DPPs</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-foreground">
                      {summary.pyqsCompleted}/{summary.pyqsTotal}
                    </div>
                    <div className="text-muted-foreground">PYQs</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-foreground">
                      {summary.revisionCount}
                    </div>
                    <div className="text-muted-foreground">Revisions</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
