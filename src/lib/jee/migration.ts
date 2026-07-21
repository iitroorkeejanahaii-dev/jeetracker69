import { nanoid } from "nanoid";
import type { ChapterState } from "./types";
import { SUBJECTS } from "./seed";

export function generateChapterFromSeed(
  subjectId: string,
  chapterName: string
): ChapterState {
  const id = `ch-${nanoid(8)}`;
  const now = new Date().toISOString();

  return {
    id,
    subjectId,
    chapterName,
    lectureCount: 0,
    sheetCount: 0,
    dppCount: 0,
    pyqCount: 0,
    revisionTarget: 3,
    lectures: [],
    sheets: [],
    dpps: [],
    pyqs: [],
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
  const chapters: Record<string, ChapterState> = {};

  SUBJECTS.forEach((subject) => {
    subject.units.forEach((unit) => {
      unit.chapters.forEach((chapter) => {
        const chapterState = generateChapterFromSeed(subject.id, chapter.name);
        chapters[chapter.id] = chapterState;
      });
    });
  });

  return chapters;
}
