import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressBar } from "@/components/jee/ProgressBar";
import { useJeeStore } from "@/lib/jee/store";
import { readinessScore } from "@/lib/jee/readiness";
import { getChapterSummary, getCompletionPercentage } from "@/lib/jee/chapterQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2 } from "lucide-react";

export const Route = createFileRoute("/c/$cid")(
  { component: ChapterPage,
    head: (ctx) => ({
      meta: [{ title: `Chapter — JEE OS` }],
    }),
  }
);

function ChapterPage() {
  const { cid } = useParams({ from: "/c/$cid" });
  const chapters = useJeeStore((s) => s.chapters);
  const mistakes = useJeeStore((s) => s.mistakes);
  const updateChapter = useJeeStore((s) => s.updateChapter);
  const toggleLecture = useJeeStore((s) => s.toggleLecture);
  const addLecture = useJeeStore((s) => s.addLecture);
  const removeLecture = useJeeStore((s) => s.removeLecture);
  const toggleSheet = useJeeStore((s) => s.toggleSheet);
  const toggleDpp = useJeeStore((s) => s.toggleDpp);
  const togglePyq = useJeeStore((s) => s.togglePyq);
  const setConfidence = useJeeStore((s) => s.setConfidence);

  const chapter = chapters[cid];
  const [lectureTitle, setLectureTitle] = useState("");

  if (!chapter) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="text-center py-10">
            <h1 className="text-2xl font-semibold">Chapter not found</h1>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">
              Back to dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const summary = getChapterSummary(
    chapter,
    mistakes.filter((m) => m.chapterId === cid)
  );
  const readiness = readinessScore(
    chapter,
    mistakes.filter((m) => m.chapterId === cid)
  );
  const completion = getCompletionPercentage(chapter);

  const handleAddLecture = () => {
    if (lectureTitle.trim()) {
      addLecture(cid, lectureTitle);
      setLectureTitle("");
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <header>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {summary.subjectId}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {chapter.chapterName}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-semibold text-primary">
                {readiness}%
              </div>
              <p className="text-xs text-muted-foreground">readiness</p>
            </div>
          </div>
          <ProgressBar value={readiness} />
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Lectures"
            value={`${summary.lecturesCompleted}/${summary.lecturesTotal}`}
          />
          <StatCard
            label="Sheets"
            value={`${summary.sheetsCompleted}/${summary.sheetsTotal}`}
          />
          <StatCard
            label="DPPs"
            value={`${summary.dppsCompleted}/${summary.dppsTotal}`}
          />
          <StatCard
            label="PYQs"
            value={`${summary.pyqsCompleted}/${summary.pyqsTotal}`}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lectures" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="sheets">Sheets</TabsTrigger>
            <TabsTrigger value="dpps">DPPs</TabsTrigger>
            <TabsTrigger value="pyqs">PYQs</TabsTrigger>
          </TabsList>

          {/* Lectures Tab */}
          <TabsContent value="lectures" className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add new lecture..."
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddLecture()}
              />
              <Button onClick={handleAddLecture} size="sm">
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {chapter.lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <Checkbox
                    checked={lecture.done}
                    onCheckedChange={() => toggleLecture(cid, lecture.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        lecture.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {lecture.title}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLecture(cid, lecture.id)}
                    className="text-muted-foreground/50 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {chapter.lectures.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No lectures added yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sheets Tab */}
          <TabsContent value="sheets" className="space-y-3">
            <div className="space-y-2">
              {chapter.sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <Checkbox
                    checked={sheet.done}
                    onCheckedChange={() => toggleSheet(cid, sheet.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        sheet.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {sheet.title}
                    </div>
                  </div>
                </div>
              ))}
              {chapter.sheets.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No sheets added.
                </div>
              )}
            </div>
          </TabsContent>

          {/* DPPs Tab */}
          <TabsContent value="dpps" className="space-y-3">
            <div className="space-y-2">
              {chapter.dpps.map((dpp) => (
                <div
                  key={dpp.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <Checkbox
                    checked={dpp.done}
                    onCheckedChange={() => toggleDpp(cid, dpp.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        dpp.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {dpp.title}
                    </div>
                  </div>
                </div>
              ))}
              {chapter.dpps.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No DPPs added.
                </div>
              )}
            </div>
          </TabsContent>

          {/* PYQs Tab */}
          <TabsContent value="pyqs" className="space-y-3">
            <div className="space-y-2">
              {chapter.pyqs.map((pyq) => (
                <div
                  key={pyq.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <Checkbox
                    checked={pyq.done}
                    onCheckedChange={() => togglePyq(cid, pyq.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        pyq.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {pyq.title}
                    </div>
                  </div>
                </div>
              ))}
              {chapter.pyqs.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No PYQs added.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-mono font-semibold mt-1 text-foreground">
        {value}
      </div>
    </div>
  );
}
