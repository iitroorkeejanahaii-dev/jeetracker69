export type TriState = "none" | "progress" | "done";

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  unitId: string;
}
export interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}
export interface Subject {
  id: string;
  name: string;
  short: string;
  colorVar: string;
  units: Unit[];
}

export interface Lecture {
  id: string;
  title: string;
  done: boolean;
  date?: string;
  timeMin?: number;
  notes?: string;
}
export interface ListItem {
  id: string;
  title: string;
  done: boolean;
  starred?: boolean;
}
export interface Resource {
  id: string;
  name: string;
  items: ListItem[];
}
export interface Revision {
  id: string;
  date: string;
  timeMin: number;
  confidence: number;
  weakConcepts: string;
  notes: string;
  completionPct: number;
}

export interface ChapterState {
  lectures: Lecture[];
  notes: {
    class: boolean;
    short: boolean;
    formula: boolean;
    mindmap: boolean;
    flashcards: boolean;
  };
  allen: Record<string, TriState>;
  iitSheets: ListItem[];
  allenAssignments: ListItem[];
  resources: Resource[];
  pyqMain: Record<string, boolean>;
  pyqAdv: Record<string, boolean>;
  revisions: Revision[];
  formula: {
    formulaSheet: boolean;
    ncert: boolean;
    shortNotes: boolean;
    namedReactions: boolean;
    graphs: boolean;
    exceptions: boolean;
  };
  confidence: number;
  hoursSpent: number;
  lastStudied?: string;
}

export type MistakeType =
  | "concept"
  | "calculation"
  | "silly"
  | "guess"
  | "formula"
  | "time";
export type MistakeStatus = "pending" | "revised" | "mastered";
export interface Mistake {
  id: string;
  subjectId: string;
  chapterId: string;
  resource: string;
  qNumber: string;
  difficulty: "easy" | "medium" | "hard";
  type: MistakeType;
  concept: string;
  explanation: string;
  correctMethod: string;
  image?: string;
  status: MistakeStatus;
  createdAt: string;
}

export interface DailyLog {
  date: string;
  hours: number;
  questions: number;
  tasks: number;
  revisions: number;
  mockTests: number;
}

export interface Goal {
  id: string;
  title: string;
  deadline?: string;
  target: number;
  current: number;
  unit: string;
}

export interface MockTest {
  id: string;
  date: string;
  name: string;
  marks: number;
  maxMarks: number;
  rank?: number;
  timeMin: number;
  mistakes: number;
  lessons: string;
}

export interface AppSettings {
  name: string;
  targetYear: number;
}