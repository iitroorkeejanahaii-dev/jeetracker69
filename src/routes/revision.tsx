import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/revision")({
  component: RevisionPage,
  head: () => ({ meta: [{ title: "Revisions — JEE OS" }] }),
});

function RevisionPage() {
  const chapters = useJeeStore((s) => s.chapters);
  const getRevisionsForToday = useJeeStore((s) => s.getRevisionsForToday);
  const getOverdueRevisions = useJeeStore((s) => s.getOverdueRevisions);
  const completeRevision = useJeeStore((s) => s.completeRevision);
  const removeRevision = useJeeStore((s) => s.removeRevision);
  const [view, setView] = useState<"today" | "overdue" | "upcoming">("today");

  const revisionsToday = getRevisionsForToday();
  const overdueRevisions = getOverdueRevisions();

  const getChapterName = (chapterId: string) => {
    return chapters[chapterId]?.chapterName || "Unknown chapter";
  };

  const renderRevisions = (revisions: typeof revisionsToday) => {
    if (revisions.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          No revisions {view === "today" ? "due today" : "to show"}.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {revisions.map((rev) => (
          <div
            key={rev.id}
            className="rounded-lg border border-border/60 bg-card p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {getChapterName(Object.entries(chapters).find(([id, ch]) => ch.revisions.includes(rev))?.[0] || "")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Revision #{rev.revisionCount} · {rev.timeMin}m · Confidence: {rev.confidence}/5
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const chId = Object.entries(chapters).find(
                    ([id, ch]) => ch.revisions.includes(rev)
                  )?.[0];
                  if (chId) completeRevision(chId, rev.id);
                }}
              >
                Done
              </Button>
              <button
                onClick={() => {
                  const chId = Object.entries(chapters).find(
                    ([id, ch]) => ch.revisions.includes(rev)
                  )?.[0];
                  if (chId) removeRevision(chId, rev.id);
                }}
                className="text-muted-foreground/50 hover:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Schedule
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Revision Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automatic scheduling keeps concepts fresh in memory.
          </p>
        </header>

        <div className="flex gap-2">
          <Button
            variant={view === "today" ? "default" : "ghost"}
            onClick={() => setView("today")}
            className="flex-1 md:flex-none"
          >
            Today ({revisionsToday.length})
          </Button>
          <Button
            variant={view === "overdue" ? "default" : "ghost"}
            onClick={() => setView("overdue")}
            className="flex-1 md:flex-none"
          >
            Overdue ({overdueRevisions.length})
          </Button>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          {view === "today" && renderRevisions(revisionsToday)}
          {view === "overdue" && renderRevisions(overdueRevisions)}
        </div>
      </div>
    </AppShell>
  );
}
