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
  Resource,
  TriState,
} from "./types";

const emptyChapter = (): ChapterState => ({
  lectures: [],
  notes: {
    class: false,
    short: false,
    formula: false,
    mindmap: false,
    flashcards: false,
  },
  allen: {},
  iitSheets: [],
  allenAssignments: [],
  resources: [],
  pyqMain: {},
  pyqAdv: {},
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
  priority: "normal",
  concepts: [],
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

  getChapter: (id: string) => ChapterState;
  updateChapter: (id: string, updater: (c: ChapterState) => void) => void;
  markActivity: (patch: Partial<DailyLog>) => void;

  addLecture: (chapterId: string, title: string) => void;
  toggleLecture: (chapterId: string, lectureId: string) => void;
  removeLecture: (chapterId: string, lectureId: string) => void;

  toggleAllen: (chapterId: string, key: string) => void;

  addListItem: (chapterId: string, list: "iitSheets" | "allenAssignments", title: string) => void;
  toggleListItem: (chapterId: string, list: "iitSheets" | "allenAssignments", id: string) => void;
  toggleStarred: (chapterId: string, id: string) => void;
  removeListItem: (chapterId: string, list: "iitSheets" | "allenAssignments", id: string) => void;

  addResource: (chapterId: string, name: string) => void;
  addResourceItem: (chapterId: string, resId: string, title: string) => void;
  toggleResourceItem: (chapterId: string, resId: string, itemId: string) => void;
  removeResource: (chapterId: string, resId: string) => void;

  togglePyq: (chapterId: string, tier: "main" | "adv", year: number) => void;

  addRevision: (chapterId: string, r: Omit<import("./types").Revision, "id">) => void;
  removeRevision: (chapterId: string, id: string) => void;

  setFormula: (chapterId: string, key: keyof ChapterState["formula"], v: boolean) => void;
  setNote: (chapterId: string, key: keyof ChapterState["notes"], v: boolean) => void;
  setConfidence: (chapterId: string, v: number) => void;

  addMistake: (m: Omit<Mistake, "id" | "createdAt">) => void;
  updateMistake: (id: string, patch: Partial<Mistake>) => void;
  removeMistake: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  addMock: (m: Omit<MockTest, "id">) => void;
  removeMock: (id: string) => void;

  setSettings: (patch: Partial<AppSettings>) => void;
  reset: () => void;
  importData: (data: unknown) => void;
  exportData: () => string;

  setDestination: (patch: Partial<Destination>) => void;
  addDreamCollege: (c: Omit<DreamCollege, "id">) => void;
  updateDreamCollege: (id: string, patch: Partial<DreamCollege>) => void;
  removeDreamCollege: (id: string) => void;
  setMission: (chapterIds: string[]) => void;
  completeMission: () => void;
  clearMission: () => void;
  setPriority: (chapterId: string, p: Priority) => void;
  addConcept: (chapterId: string, title: string) => void;
  toggleConcept: (chapterId: string, id: string) => void;
  removeConcept: (chapterId: string, id: string) => void;
  seedConcepts: (chapterId: string, titles: string[]) => void;
  setLastActivity: (chapterId: string, a: LastActivity) => void;
  setHallOfFocus: (ids: string[]) => void;
  toggleReaction: (id: string) => void;
  setReactionNote: (id: string, note: string) => void;
  setReagentNote: (id: string, note: string) => void;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

function bumpStreak(state: State): { streak: number; lastActiveDate: string } {
  const today = todayKey();
  if (state.lastActiveDate === today) return { streak: state.streak, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
  return { streak, lastActiveDate: today };
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

      getChapter: (id) => get().chapters[id] ?? emptyChapter(),

      updateChapter: (id, updater) =>
        set((s) => {
          const current = s.chapters[id] ?? emptyChapter();
          const clone = structuredClone({ ...emptyChapter(), ...current });
          updater(clone);
          clone.lastStudied = new Date().toISOString();
          return { chapters: { ...s.chapters, [id]: clone } };
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

      addLecture: (chapterId, title) => {
        get().updateChapter(chapterId, (c) => {
          c.lectures.push({ id: nanoid(6), title, done: false });
        });
      },
      toggleLecture: (chapterId, lectureId) => {
        let done = false;
        let label = "";
        get().updateChapter(chapterId, (c) => {
          const l = c.lectures.find((x) => x.id === lectureId);
          if (l) {
            l.done = !l.done;
            done = l.done;
            label = l.title;
            if (l.done) l.date = new Date().toISOString();
            c.lastActivity = { type: "lecture", label: l.title, at: new Date().toISOString() };
          }
        });
        if (done) get().markActivity({ tasks: 1 });
      },
      removeLecture: (chapterId, lectureId) => {
        get().updateChapter(chapterId, (c) => {
          c.lectures = c.lectures.filter((l) => l.id !== lectureId);
        });
      },

      toggleAllen: (chapterId, key) => {
        let becameDone = false;
        get().updateChapter(chapterId, (c) => {
          const cur: TriState = c.allen[key] ?? "none";
          const next: TriState = cur === "none" ? "progress" : cur === "progress" ? "done" : "none";
          c.allen[key] = next;
          becameDone = next === "done";
        });
        if (becameDone) get().markActivity({ tasks: 1 });
      },

      addListItem: (chapterId, list, title) => {
        get().updateChapter(chapterId, (c) => {
          c[list].push({ id: nanoid(6), title, done: false });
        });
      },
      toggleListItem: (chapterId, list, id) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const item = c[list].find((x) => x.id === id);
          if (item) {
            item.done = !item.done;
            done = item.done;
          }
        });
        if (done) get().markActivity({ tasks: 1 });
      },
      toggleStarred: (chapterId, id) => {
        get().updateChapter(chapterId, (c) => {
          const item = c.allenAssignments.find((x) => x.id === id);
          if (item) item.starred = !item.starred;
        });
      },
      removeListItem: (chapterId, list, id) => {
        get().updateChapter(chapterId, (c) => {
          c[list] = c[list].filter((x) => x.id !== id);
        });
      },

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

      togglePyq: (chapterId, tier, year) => {
        let done = false;
        get().updateChapter(chapterId, (c) => {
          const bag = tier === "main" ? c.pyqMain : c.pyqAdv;
          bag[year] = !bag[year];
          done = bag[year];
        });
        if (done) get().markActivity({ tasks: 1 });
      },

      addRevision: (chapterId, r) => {
        get().updateChapter(chapterId, (c) => {
          c.revisions.push({ ...r, id: nanoid(6) });
          c.confidence = r.confidence;
        });
        get().markActivity({ revisions: 1, hours: r.timeMin / 60 });
      },
      removeRevision: (chapterId, id) => {
        get().updateChapter(chapterId, (c) => {
          c.revisions = c.revisions.filter((r) => r.id !== id);
        });
      },

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

      addMistake: (m) =>
        set((s) => ({
          mistakes: [
            { ...m, id: nanoid(8), createdAt: new Date().toISOString() },
            ...s.mistakes,
          ],
        })),
      updateMistake: (id, patch) =>
        set((s) => ({
          mistakes: s.mistakes.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMistake: (id) =>
        set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) })),

      addGoal: (g) => set((s) => ({ goals: [{ ...g, id: nanoid(6) }, ...s.goals] })),
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addMock: (m) => {
        set((s) => ({ mocks: [{ ...m, id: nanoid(6) }, ...s.mocks] }));
        get().markActivity({ mockTests: 1, hours: m.timeMin / 60 });
      },
      removeMock: (id) => set((s) => ({ mocks: s.mocks.filter((m) => m.id !== id) })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
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

      setDestination: (patch) => set((s) => ({ destination: { ...s.destination, ...patch } })),
      addDreamCollege: (c) => set((s) => ({ dreamColleges: [{ ...c, id: nanoid(6) }, ...s.dreamColleges] })),
      updateDreamCollege: (id, patch) => set((s) => ({ dreamColleges: s.dreamColleges.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeDreamCollege: (id) => set((s) => ({ dreamColleges: s.dreamColleges.filter((c) => c.id !== id) })),
      setMission: (chapterIds) => set(() => ({ currentMission: { weekStart: mondayISO(), chapterIds, completed: false } })),
      completeMission: () => set((s) => (s.currentMission ? { currentMission: { ...s.currentMission, completed: true } } : {})),
      clearMission: () => set(() => ({ currentMission: undefined })),
      setPriority: (chapterId, p) => get().updateChapter(chapterId, (c) => { c.priority = p; }),
      addConcept: (chapterId, title) => get().updateChapter(chapterId, (c) => { c.concepts = c.concepts ?? []; c.concepts.push({ id: nanoid(6), title, done: false }); }),
      toggleConcept: (chapterId, id) => {
        let done = false;
        let label = "";
        get().updateChapter(chapterId, (c) => {
          c.concepts = c.concepts ?? [];
          const k = c.concepts.find((x) => x.id === id);
          if (k) {
            k.done = !k.done;
            done = k.done;
            label = k.title;
            if (done) c.lastActivity = { type: "concept", label: k.title, at: new Date().toISOString() };
          }
        });
        if (done) get().markActivity({ tasks: 1 });
      },
      removeConcept: (chapterId, id) => get().updateChapter(chapterId, (c) => { c.concepts = (c.concepts ?? []).filter((x) => x.id !== id); }),
      seedConcepts: (chapterId, titles) => get().updateChapter(chapterId, (c) => {
        if (!c.concepts || c.concepts.length === 0) {
          c.concepts = titles.map((t) => ({ id: nanoid(6), title: t, done: false }));
        }
      }),
      setLastActivity: (chapterId, a) => get().updateChapter(chapterId, (c) => { c.lastActivity = a; }),
      setHallOfFocus: (ids) => set(() => ({ hallOfFocus: ids.slice(0, 3) })),
      toggleReaction: (id) => set((s) => {
        const cur = s.organic.reactions[id] ?? { done: false };
        return { organic: { ...s.organic, reactions: { ...s.organic.reactions, [id]: { ...cur, done: !cur.done } } } };
      }),
      setReactionNote: (id, note) => set((s) => {
        const cur = s.organic.reactions[id] ?? { done: false };
        return { organic: { ...s.organic, reactions: { ...s.organic.reactions, [id]: { ...cur, note } } } };
      }),
      setReagentNote: (id, note) => set((s) => ({ organic: { ...s.organic, reagents: { ...s.organic.reagents, [id]: { note } } } })),
    }),
    { name: "jee-os-v1" },
  ),
);

export { emptyChapter };

function mondayISO() {
  const d = new Date();
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}