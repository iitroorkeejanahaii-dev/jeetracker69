import type { ScheduledRevision } from "./types";

// Spaced repetition intervals in days (indexed by revisionCount).
const INTERVALS = [1, 3, 7, 14, 30, 60, 120];

function nextIntervalDays(count: number, confidence: number): number {
  const base = INTERVALS[Math.min(count, INTERVALS.length - 1)];
  // Nudge sooner for low confidence, later for high.
  const factor = confidence >= 4 ? 1.3 : confidence <= 2 ? 0.6 : 1;
  return Math.max(1, Math.round(base * factor));
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function scheduleNextRevision(
  previous: ScheduledRevision,
  fromDate: string,
): ScheduledRevision | null {
  const count = (previous.revisionCount ?? 0) + 1;
  if (count > INTERVALS.length) return null;
  const days = nextIntervalDays(count, previous.confidence ?? 3);
  return {
    ...previous,
    id: `${previous.id}-n${count}`,
    date: fromDate,
    scheduledFor: addDays(fromDate, days),
    revisionCount: count,
    completionPct: 0,
  };
}

function dueDate(r: ScheduledRevision): string {
  return r.scheduledFor ?? r.date.slice(0, 10);
}

export function getRevisionsForDate(
  todayIso: string,
  revisions: ScheduledRevision[],
): ScheduledRevision[] {
  return revisions.filter(
    (r) => r.completionPct < 100 && dueDate(r) === todayIso,
  );
}

export function getOverdueRevisions(
  todayIso: string,
  revisions: ScheduledRevision[],
): ScheduledRevision[] {
  return revisions.filter(
    (r) => r.completionPct < 100 && dueDate(r) < todayIso,
  );
}