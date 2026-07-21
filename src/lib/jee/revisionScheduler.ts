import type { ScheduledRevision } from "./types";
import { nanoid } from "nanoid";

const REVISION_INTERVALS = {
  "1st": 1,
  "2nd": 3,
  "3rd": 7,
  "4th": 14,
};

export function scheduleNextRevision(
  currentRevision: ScheduledRevision,
  completedAt: string
): ScheduledRevision | null {
  const revisionCount = currentRevision.revisionCount;

  if (revisionCount >= 3) {
    return null;
  }

  const intervals = Object.values(REVISION_INTERVALS);
  const nextInterval = intervals[revisionCount] || 30;
  const nextDate = new Date(completedAt);
  nextDate.setDate(nextDate.getDate() + nextInterval);

  return {
    ...currentRevision,
    id: nanoid(6),
    date: completedAt,
    nextScheduledDate: nextDate.toISOString().slice(0, 10),
    revisionCount: revisionCount + 1,
    confidence: 0,
    weakConcepts: "",
    notes: "",
    completionPct: 0,
  };
}

export function getRevisionsForDate(
  date: string,
  revisions: ScheduledRevision[]
): ScheduledRevision[] {
  return revisions.filter(
    (r) =>
      r.nextScheduledDate === date ||
      (r.nextScheduledDate === undefined && r.date === date)
  );
}

export function getOverdueRevisions(
  today: string,
  revisions: ScheduledRevision[]
): ScheduledRevision[] {
  return revisions.filter(
    (r) =>
      (r.nextScheduledDate && r.nextScheduledDate < today) ||
      (r.nextScheduledDate === undefined && r.date < today && r.completionPct === 0)
  );
}

export function getUpcomingRevisions(
  fromDate: string,
  days: number,
  revisions: ScheduledRevision[]
): ScheduledRevision[] {
  const from = new Date(fromDate).getTime();
  const to = from + days * 86400000;

  return revisions.filter((r) => {
    const target = r.nextScheduledDate || r.date;
    const targetTime = new Date(target).getTime();
    return targetTime >= from && targetTime <= to && targetTime > from;
  });
}
