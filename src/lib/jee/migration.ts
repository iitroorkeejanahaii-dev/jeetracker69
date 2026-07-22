import type { ChapterState } from "./types";
import { ALL_CHAPTERS } from "./seed";

const DEFAULT_LECTURES = 15;
const DEFAULT_SHEETS = 4;
const DEFAULT_DPPS = 10;
const DEFAULT_PYQS = 8;
const DEFAULT_REVISION_TARGET = 3;

function makeList(prefix: string, n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    title: `${prefix} ${i + 1}`,
    done: false,
  }));
}

export function generateChapterFromSeed(
  id: string,
  subjectId: string,
  name: string,
): ChapterState {
  const now = new Date().toISOString();
  return {
    id,
    subjectId,
    chapterName: name,
    lectureCount: DEFAULT_LECTURES,
    sheetCount: DEFAULT_SHEETS,
    dppCount: DEFAULT_DPPS,
    pyqCount: DEFAULT_PYQS,
    revisionTarget: DEFAULT_REVISION_TARGET,
    lectures: Array.from({ length: DEFAULT_LECTURES }, (_, i) => ({
      id: `${id}-lec-${i + 1}`,
      title: `Lecture ${i + 1}`,
      done: false,
    })),
    sheets: makeList(`${id}-sheet`, DEFAULT_SHEETS),
    dpps: makeList(`${id}-dpp`, DEFAULT_DPPS),
    pyqs: makeList(`${id}-pyq`, DEFAULT_PYQS),
    notes: {
      class: false,
      short: false,
      formula: false,
      mindmap: false,
      flashcards: false,
    },
    resources: [],
    revisions: [],
    formula: {
      formulaSheet: false,
      ncert: false,
      shortNotes: false,
      namedReactions: false,
      graphs: false,
      exceptions: false,
    },
    confidence: 0,
    hoursSpent: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateAllSeedChapters(): Record<string, ChapterState> {
  const out: Record<string, ChapterState> = {};
  for (const c of ALL_CHAPTERS) {
    out[c.id] = generateChapterFromSeed(c.id, c.subjectId, c.name);
  }
  return out;
}