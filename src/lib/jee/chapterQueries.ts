import type { ChapterState, Mistake } from "./types";
import { readinessScore } from "./readiness";

export interface ChapterSummary {
  id: string;
  subjectId: string;
  name: string;
  readiness: number;
  lecturesCompleted: number;
  lecturesTotal: number;
  sheetsCompleted: number;
  sheetsTotal: number;
  dppsCompleted: number;
  dppsTotal: number;
  pyqsCompleted: number;
  pyqsTotal: number;
  revisionCount: number;
  mistakeCount: number;
  lastStudied?: string;
  hoursSpent: number;
}

export function getChapterSummary(
  chapter: ChapterState,
  mistakes: Mistake[] = []
): ChapterSummary {
  const chapterMistakes = mistakes.filter((m) => m.chapterId === chapter.id);
  const lecturesCompleted = chapter.lectures.filter((l) => l.done).length;
  const sheetsCompleted = chapter.sheets.filter((s) => s.done).length;
  const dppsCompleted = chapter.dpps.filter((d) => d.done).length;
  const pyqsCompleted = chapter.pyqs.filter((p) => p.done).length;

  return {
    id: chapter.id,
    subjectId: chapter.subjectId,
    name: chapter.chapterName,
    readiness: readinessScore(chapter, chapterMistakes),
    lecturesCompleted,
    lecturesTotal: chapter.lectureCount,
    sheetsCompleted,
    sheetsTotal: chapter.sheetCount,
    dppsCompleted,
    dppsTotal: chapter.dppCount,
    pyqsCompleted,
    pyqsTotal: chapter.pyqCount,
    revisionCount: chapter.revisions.filter((r) => r.completionPct > 0).length,
    mistakeCount: chapterMistakes.length,
    lastStudied: chapter.lastStudied,
    hoursSpent: chapter.hoursSpent,
  };
}

export function getCompletionPercentage(chapter: ChapterState): number {
  const total =
    chapter.lectureCount +
    chapter.sheetCount +
    chapter.dppCount +
    chapter.pyqCount;
  if (total === 0) return 0;

  const completed =
    chapter.lectures.filter((l) => l.done).length +
    chapter.sheets.filter((s) => s.done).length +
    chapter.dpps.filter((d) => d.done).length +
    chapter.pyqs.filter((p) => p.done).length;

  return Math.round((completed / total) * 100);
}

export function getChaptersForSubject(
  chapters: Record<string, ChapterState>,
  subjectId: string
): ChapterState[] {
  return Object.values(chapters).filter((ch) => ch.subjectId === subjectId);
}

export function getTopChaptersByReadiness(
  chapters: Record<string, ChapterState>,
  mistakes: Mistake[],
  limit = 5
): ChapterSummary[] {
  return Object.values(chapters)
    .map((ch) => getChapterSummary(ch, mistakes.filter((m) => m.chapterId === ch.id)))
    .sort((a, b) => b.readiness - a.readiness)
    .slice(0, limit);
}

export function getBottomChaptersByReadiness(
  chapters: Record<string, ChapterState>,
  mistakes: Mistake[],
  limit = 5
): ChapterSummary[] {
  return Object.values(chapters)
    .map((ch) => getChapterSummary(ch, mistakes.filter((m) => m.chapterId === ch.id)))
    .sort((a, b) => a.readiness - b.readiness)
    .slice(0, limit);
}
