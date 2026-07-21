export type TriState = "none" | "progress" | "done";
export type Priority = "normal" | "focus" | "priority" | "critical";

export interface Concept {
  id: string;
  title: string;
  done: boolean;
}

export interface LastActivity {
  type: "lecture" | "exercise" | "pyq" | "revision" | "concept" | "resource";
  label: string;
  at: string;
}

export interface Destination {
  college: string;
  targetRank: number;
  targetPercentile: number;
  targetMarksJan: number;
  targetMarksApr: number;
  examDate?: string;
  quote?: string;
}

export interface DreamCollege {
  id: string;
  name: string;
  targetRank: number;
  requiredMarks: number;
  rating: number;
}

export interface CurrentMission {
  weekStart: string;
  chapterIds: string[];
  completed: boolean;
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

export interface ScheduledRevision {
  id: string;
  date: string;
  timeMin: number;
  confidence: number;
  weakConcepts: string;
  notes: string;
  completionPct: number;
  nextScheduledDate?: string;
  revisionCount: number;
}

export interface ChapterState {
  id: string;
  subjectId: string;
  chapterName: string;
  lectureCount: number;
  sheetCount: number;
  dppCount: number;
  pyqCount: number;
  revisionTarget: number;
  lectures: Lecture[];
  sheets: ListItem[];
  dpps: ListItem[];
  pyqs: ListItem[];
  notes: {
    class: boolean;
    short: boolean;
    formula: boolean;
    mindmap: boolean;
    flashcards: boolean;
  };
  resources: Resource[];
  revisions: ScheduledRevision[];
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
  priority?: Priority;
  concepts?: Concept[];
  lastActivity?: LastActivity;
  createdAt: string;
  updatedAt: string;
}

export interface OrganicState {
  reactions: Record<string, { done: boolean; note?: string; pyqCount?: number }>;
  reagents: Record<string, { note?: string }>;
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
  topic?: string;
  errorType?: string;
  resource: string;
  qNumber: string;
  difficulty: "easy" | "medium" | "hard";
  type: MistakeType;
  concept: string;
  explanation: string;
  correctMethod: string;
  image?: string;
  solutionImage?: string;
  status: MistakeStatus;
  createdAt: string;
  lastRevised?: string;
  nextRevision?: string;
  revisionCount: number;
  importance: number;
  tags?: string[];
  starred?: boolean;
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
  migrationComplete?: boolean;
}

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
