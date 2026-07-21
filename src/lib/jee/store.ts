import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  AppSettings,
  ChapterState,
  CurrentMission,
  DailyLog,
  Destination,
  DreamCollege,
  Goal,
  LastActivity,
  Mistake,
  MockTest,
  OrganicState,
  Priority,
  Concept,
  ScheduledRevision,
} from "./types";
import { migrateAllSeedChapters, generateChapterFromSeed } from "./migration";
import {
  getRevisionsForDate,
  getOverdueRevisions,
  scheduleNextRevision,
} from "./revisionScheduler";

const emptyChapter = (id: string, subjectId: string, name: string): ChapterState => ({
  id,
  subjectId,
  chapterName: name,
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface State {
  chapters: Record<string, ChapterState>;
  mistakes: Mistake[];
  daily: Record<string, DailyLog>;
  goals: Goal[];
  mocks: MockTest[];
  settings: AppSettings;
  streak: number;
  lastActiveDate?: string;
  destination: Destination;
  dreamColleges: DreamCollege[];
  currentMission?: CurrentMission;
  hallOfFocus: string[];
  organic: OrganicState;

  // Chapter management
  getChapter: (id: string) => ChapterState;
  createChapter: (
    subjectId: string,
    name: string,
    lectureCount: number,
    sheetCount: number,
    dppCount: number,
    pyqCount: number,
    revisionTarget: number
  ) => string;
  updateChapter: (id: string, updater: (c: ChapterState) => void) => void;
  deleteChapter: (id: string) => void;
  markActivity: (patch: Partial<DailyLog>) => void;

  // Lectures
  addLecture: (chapterId: string, title: string) => void;
  toggleLecture: (chapterId: string, lectureId: string) => void;
  removeLecture: (chapterId: string, lectureId: string) => void;

  // Sheets, DPPs, PYQs
  addSheet: (chapterId: string, title: string) => void;
  toggleSheet: (chapterId: string, itemId: string) => void;
  removeSheet: (chapterId: string, itemId: string) => void;

  addDpp: (chapterId: string, title: string) => void;
  toggleDpp: (chapterId: string, itemId: string) => void;
  removeDpp: (chapterId: string, itemId: string) => void;

  addPyq: (chapterId: string, title: string) => void;
  togglePyq: (chapterId: string, itemId: string) => void;
  removePyq: (chapterId: string, itemId: string) => void;

  // Resources
  addResource: (chapterId: string, name: string) => void;
  addResourceItem: (chapterId: string, resId: string, title: string) => void;
  toggleResourceItem: (chapterId: string, resId: string, itemId: string) => void;
  removeResource: (chapterId: string, resId: string) => void;

  // Revisions with scheduling
  addRevision: (
    chapterId: string,
    r: Omit<ScheduledRevision, "id">
  ) => void;
  completeRevision: (chapterId: string, revisionId: string) => void;
  removeRevision: (chapterId: string, id: string) => void;

  // Notes, formulas
  setFormula: (chapterId: string, key: keyof ChapterState["formula"], v: boolean) => void;
  setNote: (chapterId: string, key: keyof ChapterState["notes"], v: boolean) => void;
  setConfidence: (chapterId: string, v: number) => void;

  // Mistakes
  addMistake: (m: Omit<Mistake, "id" | "createdAt">) => void;
  updateMistake: (id: string, patch: Partial<Mistake>) => void;
  removeMistake: (id: string) => void;

  // Goals
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  // Mocks
  addMock: (m: Omit<MockTest, "id">) => void;
  removeMock: (id: string) => void;

  // Settings
  setSettings: (patch: Partial<AppSettings>) => void;
  reset: () => void;
  importData: (data: unknown) => void;
  exportData: () => string;

  // Destination & colleges
  setDestination: (patch: Partial<Destination>) => void;
  addDreamCollege: (c: Omit<DreamCollege, "id">) => void;
  updateDreamCollege: (id: string, patch: Partial<DreamCollege>) => void;
  removeDreamCollege: (id: string) => void;

  // Mission & focus
  setMission: (chapterIds: string[]) => void;
  completeMission: () => void;
  clearMission: () => void;
  setPriority: (chapterId: string, p: Priority) => void;
  setLastActivity: (chapterId: string, a: LastActivity) => void;
  setHallOfFocus: (ids: string[]) => void;

  // Concepts
  addConcept: (chapterId: string, title: string) => void;
  toggleConcept: (chapterId: string, id: string) => void;
  removeConcept: (chapterId: string, id: string) => void;
  seedConcepts: (chapterId: string, titles: string[]) => void;

  // Organic chemistry
  toggleReaction: (id: string) => void;
  setReactionNote: (id: string, note: string) => void;
  setReagentNote: (id: string, note: string) => void;

  // Queries
  getRevisionsForToday: () => ScheduledRevision[];
  getOverdueRevisions: () => ScheduledRevision[];
  getTodayLog: () => DailyLog | undefined;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

function bumpStreak(state: State): { streak: number; lastActiveDate: string } {
  const today = todayKey();
  if (state.lastActiveDate === today) return { streak: state.streak, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
  return { streak, lastActiveDate: today };
}

function mondayISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

export const useJeeStore = create<State>()(
  persist(
    (set, get) => ({
      chapters: {},
      mistakes: [],
      daily: {},
      goals: [],
      mocks: [],
      settings: { name: "Aspirant", targetYear: new Date().getFullYear() + 1 },
      streak: 0,
      lastActiveDate: undefined,
      destination: {
        college: "IIT Bombay",
        targetRank: 500,
        targetPercentile: 99.9,
        targetMarksJan: 260,
        targetMarksApr: 275,
        examDate: undefined,
        quote: "One chapter closer, every day.",
      },
      dreamColleges: [],
      currentMission: undefined,
      hallOfFocus: [],
      organic: { reactions: {}, reagents: {} },

      // Chapter management
      getChapter: (id) => get().chapters[id] ?? emptyChapter(id, "", "Untitled"),

      createChapter: (
        subjectId,
        name,
        lectureCount,
        sheetCount,
        dppCount,
        pyqCount,
        revisionTarget
      ) => {
        const id = `ch-${nanoid(8)}`;
        const now = new Date().toISOString();
        const chapter: ChapterState = {
          id,
          subjectId,
          chapterName: name,
          lectureCount,
          sheetCount,
          dppCount,
          pyqCount,
          revisionTarget,
          lectures: Array.from({ length: lectureCount }, (_, i) => ({
            id: nanoid(6),
            title: `Lecture ${i + 1}`,
            done: false,
          })),
          sheets: Array.from({ length: sheetCount }, (_, i) => ({
            id: nanoid(6),
            title: `Sheet ${i + 1}`,
            done: false,
          })),
          dpps: Array.from({ length: dppCount }, (_, i) => ({
            id: nanoid(6),
            title: `DPP ${i + 1}`,
            done: false,
          })),
          pyqs: Array.from({ length: pyqCount }, (_, i) => ({
            id: nanoid(6),
            title: `PYQ Set ${i + 1}`,
            done: false,
          })),
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
        set((s) => ({ chapters: { ...s.chapters, [id]: chapter } }));
        return id;
      },

      updateChapter: (id, updater) =>
        set((s) => {
          const current = s.chapters[id] ?? emptyChapter(id, "", "Untitled");
          const clone = structuredClone(current);
          updater(clone);
          clone.updatedAt = new Date().toISOString();
          return { chapters: { ...s.chapters, [id]: clone } };
        }),

      deleteChapter: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.chapters;
          return { chapters: rest };
        }),

      markActivity: (patch) =>
        set((s) => {
          const date = todayKey();
          const prev = s.daily[date] ?? {
            date,
            hours: 0,
            questions: 0,
            tasks: 0,
            revisions: 0,
            mockTests: 0,
          };
          const next: DailyLog = {
            ...prev,
            hours: prev.hours + (patch.hours ?? 0),
            questions: prev.questions + (patch.questions ?? 0),
            tasks: prev.tasks + (patch.tasks ?? 0),
            revisions: prev.revisions + (patch.revisions ?? 0),
            mockTests: prev.mockTests + (patch.mockTests ?? 0),
          };
          const streakInfo = bumpStreak(s);
          return { daily: { ...s.daily, [date]: next }, ...streakInfo };
        }),

      // Lectures
      addLecture: (chapterId, title) => {
        get().updateChapter(chapterId, (c) => {
          c.lectures.push({ id: nanoid(6), title, done: false });
        });
      },

      toggleLecture: (chapterId, lectureId) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const l = c.lectures.find((x) => x.id === lectureId);
          if (l) {
            l.done = !l.done;
            done = l.done;
            if (l.done) l.date = new Date().toISOString();
            c.lastActivity = {
              type: "lecture",
              label: l.title,
              at: new Date().toISOString(),
            };
          }
        });
        if (done) get().markActivity({ tasks: 1 });
      },

      removeLecture: (chapterId, lectureId) => {
        get().updateChapter(chapterId, (c) => {
          c.lectures = c.lectures.filter((l) => l.id !== lectureId);
        });
      },

      // Sheets
      addSheet: (chapterId, title) => {
        get().updateChapter(chapterId, (c) => {
          c.sheets.push({ id: nanoid(6), title, done: false });
        });
      },

      toggleSheet: (chapterId, itemId) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const item = c.sheets.find((x) => x.id === itemId);
          if (item) {
            item.done = !item.done;
            done = item.done;
          }
        });
        if (done) get().markActivity({ tasks: 1 });
      },

      removeSheet: (chapterId, itemId) => {
        get().updateChapter(chapterId, (c) => {
          c.sheets = c.sheets.filter((x) => x.id !== itemId);
        });
      },

      // DPPs
      addDpp: (chapterId, title) => {
        get().updateChapter(chapterId, (c) => {
          c.dpps.push({ id: nanoid(6), title, done: false });
        });
      },

      toggleDpp: (chapterId, itemId) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const item = c.dpps.find((x) => x.id === itemId);
          if (item) {
            item.done = !item.done;
            done = item.done;
          }
        });
        if (done) get().markActivity({ tasks: 1, questions: 1 });
      },

      removeDpp: (chapterId, itemId) => {
        get().updateChapter(chapterId, (c) => {
          c.dpps = c.dpps.filter((x) => x.id !== itemId);
        });
      },

      // PYQs
      addPyq: (chapterId, title) => {
        get().updateChapter(chapterId, (c) => {
          c.pyqs.push({ id: nanoid(6), title, done: false });
        });
      },

      togglePyq: (chapterId, itemId) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const item = c.pyqs.find((x) => x.id === itemId);
          if (item) {
            item.done = !item.done;
            done = item.done;
          }
        });
        if (done) get().markActivity({ tasks: 1, questions: 1 });
      },

      removePyq: (chapterId, itemId) => {
        get().updateChapter(chapterId, (c) => {
          c.pyqs = c.pyqs.filter((x) => x.id !== itemId);
        });
      },

      // Resources
      addResource: (chapterId, name) => {
        get().updateChapter(chapterId, (c) => {
          c.resources.push({ id: nanoid(6), name, items: [] });
        });
      },

      addResourceItem: (chapterId, resId, title) => {
        get().updateChapter(chapterId, (c) => {
          const r = c.resources.find((x) => x.id === resId);
          if (r) r.items.push({ id: nanoid(6), title, done: false });
        });
      },

      toggleResourceItem: (chapterId, resId, itemId) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const r = c.resources.find((x) => x.id === resId);
          const item = r?.items.find((i) => i.id === itemId);
          if (item) {
            item.done = !item.done;
            done = item.done;
          }
        });
        if (done) get().markActivity({ tasks: 1, questions: 1 });
      },

      removeResource: (chapterId, resId) => {
        get().updateChapter(chapterId, (c) => {
          c.resources = c.resources.filter((r) => r.id !== resId);
        });
      },

      // Revisions with scheduling
      addRevision: (chapterId, r) => {
        get().updateChapter(chapterId, (c) => {
          const rev: ScheduledRevision = {
            ...r,
            id: nanoid(6),
          };
          c.revisions.push(rev);
          c.confidence = r.confidence;
        });
        get().markActivity({ revisions: 1, hours: r.timeMin / 60 });
      },

      completeRevision: (chapterId, revisionId) => {
        let nextRevision: ScheduledRevision | null = null;
        get().updateChapter(chapterId, (c) => {
          const revision = c.revisions.find((r) => r.id === revisionId);
          if (revision) {
            revision.completionPct = 100;
            revision.date = new Date().toISOString();
            nextRevision = scheduleNextRevision(revision, new Date().toISOString());
            if (nextRevision) {
              c.revisions.push(nextRevision);
            }
          }
        });
      },

      removeRevision: (chapterId, id) => {
        get().updateChapter(chapterId, (c) => {
          c.revisions = c.revisions.filter((r) => r.id !== id);
        });
      },

      // Notes & Formulas
      setFormula: (chapterId, key, v) => {
        get().updateChapter(chapterId, (c) => {
          c.formula[key] = v;
        });
      },

      setNote: (chapterId, key, v) => {
        get().updateChapter(chapterId, (c) => {
          c.notes[key] = v;
        });
      },

      setConfidence: (chapterId, v) => {
        get().updateChapter(chapterId, (c) => {
          c.confidence = v;
        });
      },

      // Mistakes
      addMistake: (m) =>
        set((s) => ({
          mistakes: [
            {
              ...m,
              id: nanoid(8),
              createdAt: new Date().toISOString(),
              revisionCount: 0,
              importance: 3,
            },
            ...s.mistakes,
          ],
        })),

      updateMistake: (id, patch) =>
        set((s) => ({
          mistakes: s.mistakes.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        })),

      removeMistake: (id) =>
        set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) })),

      // Goals
      addGoal: (g) =>
        set((s) => ({ goals: [{ ...g, id: nanoid(6) }, ...s.goals] })),

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // Mocks
      addMock: (m) => {
        set((s) => ({ mocks: [{ ...m, id: nanoid(6) }, ...s.mocks] }));
        get().markActivity({ mockTests: 1, hours: m.timeMin / 60 });
      },

      removeMock: (id) =>
        set((s) => ({ mocks: s.mocks.filter((m) => m.id !== id) })),

      // Settings
      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      reset: () =>
        set({
          chapters: {},
          mistakes: [],
          daily: {},
          goals: [],
          mocks: [],
          streak: 0,
          lastActiveDate: undefined,
        }),

      exportData: () => JSON.stringify(get(), null, 2),

      importData: (data) => {
        if (data && typeof data === "object") {
          set(data as Partial<State> as State);
        }
      },

      // Destination & colleges
      setDestination: (patch) =>
        set((s) => ({ destination: { ...s.destination, ...patch } })),

      addDreamCollege: (c) =>
        set((s) => ({
          dreamColleges: [{ ...c, id: nanoid(6) }, ...s.dreamColleges],
        })),

      updateDreamCollege: (id, patch) =>
        set((s) => ({
          dreamColleges: s.dreamColleges.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),

      removeDreamCollege: (id) =>
        set((s) => ({
          dreamColleges: s.dreamColleges.filter((c) => c.id !== id),
        })),

      // Mission & focus
      setMission: (chapterIds) =>
        set(() => ({
          currentMission: { weekStart: mondayISO(), chapterIds, completed: false },
        })),

      completeMission: () =>
        set((s) =>
          s.currentMission
            ? {
                currentMission: { ...s.currentMission, completed: true },
              }
            : {}
        ),

      clearMission: () => set(() => ({ currentMission: undefined })),

      setPriority: (chapterId, p) =>
        get().updateChapter(chapterId, (c) => {
          c.priority = p;
        }),

      addConcept: (chapterId, title) =>
        get().updateChapter(chapterId, (c) => {
          c.concepts = c.concepts ?? [];
          c.concepts.push({ id: nanoid(6), title, done: false });
        }),

      toggleConcept: (chapterId, id) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          c.concepts = c.concepts ?? [];
          const k = c.concepts.find((x) => x.id === id);
          if (k) {
            k.done = !k.done;
            done = k.done;
            if (done)
              c.lastActivity = {
                type: "concept",
                label: k.title,
                at: new Date().toISOString(),
              };
          }
        });
        if (done) get().markActivity({ tasks: 1 });
      },

      removeConcept: (chapterId, id) =>
        get().updateChapter(chapterId, (c) => {
          c.concepts = (c.concepts ?? []).filter((x) => x.id !== id);
        }),

      seedConcepts: (chapterId, titles) =>
        get().updateChapter(chapterId, (c) => {
          if (!c.concepts || c.concepts.length === 0) {
            c.concepts = titles.map((t) => ({
              id: nanoid(6),
              title: t,
              done: false,
            }));
          }
        }),

      setLastActivity: (chapterId, a) =>
        get().updateChapter(chapterId, (c) => {
          c.lastActivity = a;
        }),

      setHallOfFocus: (ids) => set(() => ({ hallOfFocus: ids.slice(0, 3) })),

      // Organic chemistry
      toggleReaction: (id) =>
        set((s) => {
          const cur = s.organic.reactions[id] ?? { done: false };
          return {
            organic: {
              ...s.organic,
              reactions: {
                ...s.organic.reactions,
                [id]: { ...cur, done: !cur.done },
              },
            },
          };
        }),

      setReactionNote: (id, note) =>
        set((s) => {
          const cur = s.organic.reactions[id] ?? { done: false };
          return {
            organic: {
              ...s.organic,
              reactions: {
                ...s.organic.reactions,
                [id]: { ...cur, note },
              },
            },
          };
        }),

      setReagentNote: (id, note) =>
        set((s) => ({
          organic: {
            ...s.organic,
            reagents: { ...s.organic.reagents, [id]: { note } },
          },
        })),

      // Queries
      getRevisionsForToday: () => {
        const today = todayKey();
        const allRevisions = Object.values(get().chapters).flatMap(
          (ch) => ch.revisions
        );
        return getRevisionsForDate(today, allRevisions);
      },

      getOverdueRevisions: () => {
        const today = todayKey();
        const allRevisions = Object.values(get().chapters).flatMap(
          (ch) => ch.revisions
        );
        return getOverdueRevisions(today, allRevisions);
      },

      getTodayLog: () => {
        const today = todayKey();
        return get().daily[today];
      },
    }),
    { name: "jee-os-v2" }
  )
);

// Auto-migration on first load
if (typeof window !== "undefined") {
  const state = useJeeStore.getState();
  if (
    !state.settings.migrationComplete &&
    Object.keys(state.chapters).length === 0
  ) {
    const migratedChapters = migrateAllSeedChapters();
    useJeeStore.setState({
      chapters: migratedChapters,
      settings: { ...state.settings, migrationComplete: true },
    });
  }
}

export { emptyChapter };
