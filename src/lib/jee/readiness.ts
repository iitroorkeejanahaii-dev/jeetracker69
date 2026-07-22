import type { ChapterState, Mistake } from "./types";

export interface Breakdown {
  lectures: number;
  notes: number;
  sheets: number;
  dpps: number;
  resources: number;
  pyq: number;
  revisions: number;
  mistakes: number;
  mastery: number;
}

export function chapterBreakdown(c: ChapterState, mistakes: Mistake[] = []): Breakdown {
  const ratio = (arr: { done: boolean }[]) =>
    arr.length ? arr.filter((x) => x.done).length / arr.length : 0;

  const lectures = ratio(c.lectures);
  const sheets = ratio(c.sheets ?? []);
  const dpps = ratio(c.dpps ?? []);
  const pyq = ratio(c.pyqs ?? []);

  const noteVals = Object.values(c.notes);
  const notes = noteVals.length
    ? noteVals.filter(Boolean).length / noteVals.length
    : 0;

  const totalResItems = c.resources.reduce((a, r) => a + r.items.length, 0);
  const doneResItems = c.resources.reduce(
    (a, r) => a + r.items.filter((i) => i.done).length,
    0,
  );
  const resources = totalResItems ? doneResItems / totalResItems : 0;

  const target = Math.max(1, c.revisionTarget ?? 3);
  const completedRevs = c.revisions.filter((r) => r.completionPct >= 100).length;
  const revisions = Math.min(completedRevs / target, 1);

  const chMistakes = mistakes;
  const cleared = chMistakes.filter((m) => m.status === "mastered").length;
  const mistakesScore = chMistakes.length ? cleared / chMistakes.length : 0;

  const concepts = c.concepts ?? [];
  const mastery = concepts.length ? concepts.filter((k) => k.done).length / concepts.length : 0;

  return {
    lectures,
    notes,
    sheets,
    dpps,
    resources,
    pyq,
    revisions,
    mistakes: mistakesScore,
    mastery,
  };
}

export const WEIGHTS = {
  lectures: 0.2,
  notes: 0.1,
  sheets: 0.15,
  dpps: 0.1,
  resources: 0.1,
  pyq: 0.15,
  revisions: 0.15,
  mastery: 0.1,
  mistakes: 0.05,
};

export function readinessScore(c: ChapterState, mistakes: Mistake[] = []): number {
  const b = chapterBreakdown(c, mistakes);
  const raw =
    b.lectures * WEIGHTS.lectures +
    b.notes * WEIGHTS.notes +
    b.sheets * WEIGHTS.sheets +
    b.dpps * WEIGHTS.dpps +
    b.resources * WEIGHTS.resources +
    b.pyq * WEIGHTS.pyq +
    b.revisions * WEIGHTS.revisions +
    b.mastery * WEIGHTS.mastery +
    b.mistakes * WEIGHTS.mistakes;
  return Math.round(raw * 100);
}

export function readinessBand(score: number): { label: string; tone: string } {
  if (score >= 85) return { label: "Advanced-ready", tone: "text-emerald-400" };
  if (score >= 65) return { label: "Solid — revise once", tone: "text-amber-400" };
  if (score >= 35) return { label: "Needs work", tone: "text-orange-400" };
  return { label: "Cold — start now", tone: "text-red-400" };
}

export function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / 86400_000);
}