import { PYQ_ADV_YEARS, PYQ_MAIN_YEARS, ALLEN_SHEETS } from "./seed";
import type { ChapterState, Mistake } from "./types";

export interface Breakdown {
  lectures: number;
  notes: number;
  allen: number;
  resources: number;
  pyq: number;
  revisions: number;
  mistakes: number;
}

export function chapterBreakdown(c: ChapterState, mistakes: Mistake[] = []): Breakdown {
  const lectDone = c.lectures.filter((l) => l.done).length;
  const lectTotal = Math.max(c.lectures.length, 1);
  const lectures = c.lectures.length ? lectDone / lectTotal : 0;

  const noteVals = Object.values(c.notes);
  const notes = noteVals.filter(Boolean).length / noteVals.length;

  let allenSum = 0;
  ALLEN_SHEETS.forEach((s) => {
    const v = c.allen[s.key];
    if (v === "done") allenSum += 1;
    else if (v === "progress") allenSum += 0.5;
  });
  const allen = allenSum / ALLEN_SHEETS.length;

  const totalResItems = c.resources.reduce((a, r) => a + r.items.length, 0);
  const doneResItems = c.resources.reduce(
    (a, r) => a + r.items.filter((i) => i.done).length,
    0,
  );
  const resources = totalResItems ? doneResItems / totalResItems : 0;

  const pyqMainDone = PYQ_MAIN_YEARS.filter((y) => c.pyqMain[y]).length;
  const pyqAdvDone = PYQ_ADV_YEARS.filter((y) => c.pyqAdv[y]).length;
  const pyq =
    (pyqMainDone + pyqAdvDone) / (PYQ_MAIN_YEARS.length + PYQ_ADV_YEARS.length);

  const revisions = Math.min(c.revisions.length / 3, 1);

  const chMistakes = mistakes;
  const cleared = chMistakes.filter((m) => m.status === "mastered").length;
  const mistakesScore = chMistakes.length ? cleared / chMistakes.length : 1;

  return {
    lectures,
    notes,
    allen,
    resources,
    pyq,
    revisions,
    mistakes: mistakesScore,
  };
}

export const WEIGHTS = {
  lectures: 0.2,
  notes: 0.1,
  allen: 0.2,
  resources: 0.15,
  pyq: 0.15,
  revisions: 0.15,
  mistakes: 0.05,
};

export function readinessScore(c: ChapterState, mistakes: Mistake[] = []): number {
  const b = chapterBreakdown(c, mistakes);
  const raw =
    b.lectures * WEIGHTS.lectures +
    b.notes * WEIGHTS.notes +
    b.allen * WEIGHTS.allen +
    b.resources * WEIGHTS.resources +
    b.pyq * WEIGHTS.pyq +
    b.revisions * WEIGHTS.revisions +
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