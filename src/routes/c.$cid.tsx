import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { ProgressRing } from "@/components/jee/ProgressRing";
import { PriorityPicker } from "@/components/jee/PriorityBadge";
import { MasteryPanel } from "@/components/jee/MasteryPanel";
import { DependencyTree } from "@/components/jee/DependencyTree";
import { getChapter, getSubject, ALLEN_SHEETS, PYQ_MAIN_YEARS, PYQ_ADV_YEARS } from "@/lib/jee/seed";
import { useJeeStore } from "@/lib/jee/store";
import { readinessScore, chapterBreakdown, WEIGHTS, readinessBand, daysSince } from "@/lib/jee/readiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Star,
  Trash2,
  BookOpen,
  FileText,
  ClipboardList,
  Layers,
  ScrollText,
  Trophy,
  RotateCcw,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$cid")({
  component: ChapterPage,
  loader: ({ params }) => {
    const ch = getChapter(params.cid);
    if (!ch) throw notFound();
    return { cid: params.cid };
  },
  notFoundComponent: () => <div className="p-8">Chapter not found.</div>,
});

function ChapterPage() {
  const { cid } = Route.useLoaderData();
  const chapter = getChapter(cid)!;
  const subject = getSubject(chapter.subjectId)!;
  const state = useJeeStore((s) => s.chapters[chapter.id]) ?? emptyStateProxy();
  const allMistakes = useJeeStore((s) => s.mistakes);
  const mistakes = useMemo(
    () => allMistakes.filter((m) => m.chapterId === chapter.id),
    [allMistakes, chapter.id],
  );
  const s = useJeeStore.getState();

  const score = readinessScore(state, mistakes);
  const band = readinessBand(score);
  const bd = chapterBreakdown(state, mistakes);
  const last = state.lastStudied ? `${daysSince(state.lastStudied)}d ago` : "Never";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <Link to="/s/$sid" params={{ sid: subject.id }} className="text-xs text-muted-foreground hover:text-primary">
            ← {subject.name}
          </Link>
          <div className="mt-2 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Chapter workspace</div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{chapter.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{subject.name} · Last studied {last}</p>
              <div className="mt-3"><PriorityPicker chapterId={chapter.id} current={state.priority} /></div>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing
                value={score}
                size={96}
                label={
                  <div className="text-center">
                    <div className="text-2xl font-mono font-semibold">{score}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Ready</div>
                  </div>
                }
              />
              <div className="max-w-[200px]">
                <div className={`text-sm font-medium ${band.tone}`}>{band.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1 space-y-0.5">
                  {(Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map((k) => (
                    <div key={k} className="flex justify-between font-mono">
                      <span className="capitalize opacity-70">{k}</span>
                      <span>{Math.round(bd[k] * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><MasteryPanel chapterId={chapter.id} /></div>
          <DependencyTree chapterId={chapter.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lectures */}
          <Section title="Lectures" icon={BookOpen} count={`${state.lectures.filter(l=>l.done).length}/${state.lectures.length}`}>
            <AddInput placeholder="Add lecture…" onAdd={(v) => s.addLecture(chapter.id, v)} />
            <List>
              {state.lectures.map((l) => (
                <Row key={l.id}>
                  <Check checked={l.done} onClick={() => s.toggleLecture(chapter.id, l.id)} />
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm", l.done && "line-through text-muted-foreground")}>{l.title}</div>
                    {l.date && <div className="text-[10px] text-muted-foreground font-mono">{new Date(l.date).toLocaleDateString()}</div>}
                  </div>
                  <button onClick={() => s.removeLecture(chapter.id, l.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 className="size-3.5"/></button>
                </Row>
              ))}
              {!state.lectures.length && <Empty>No lectures yet.</Empty>}
            </List>
          </Section>

          {/* Notes */}
          <Section title="Notes" icon={FileText}>
            <div className="grid grid-cols-1 gap-1.5">
              {(["class", "short", "formula", "mindmap", "flashcards"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <Check checked={state.notes[k]} onClick={() => s.setNote(chapter.id, k, !state.notes[k])} />
                  <span className="text-sm capitalize">{labelFor(k)}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Allen Sheets */}
          <Section title="Allen Sheets" icon={ClipboardList}>
            <div className="grid grid-cols-2 gap-2">
              {ALLEN_SHEETS.map((sh) => {
                const v = state.allen[sh.key] ?? "none";
                return (
                  <button
                    key={sh.key}
                    onClick={() => s.toggleAllen(chapter.id, sh.key)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition",
                      v === "done" && "border-primary/60 bg-primary/15 text-primary",
                      v === "progress" && "border-amber-400/60 bg-amber-400/10 text-amber-300",
                      v === "none" && "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{sh.label}</span>
                    <span className="text-[9px] uppercase font-mono opacity-80">{v}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* IIT School Sheets */}
          <Section title="IIT School Sheets" icon={ScrollText} count={`${state.iitSheets.filter(l=>l.done).length}/${state.iitSheets.length}`}>
            <AddInput placeholder="Add sheet / homework…" onAdd={(v) => s.addListItem(chapter.id, "iitSheets", v)} />
            <List>
              {state.iitSheets.map((i) => (
                <Row key={i.id}>
                  <Check checked={i.done} onClick={() => s.toggleListItem(chapter.id, "iitSheets", i.id)} />
                  <span className={cn("text-sm flex-1", i.done && "line-through text-muted-foreground")}>{i.title}</span>
                  <button onClick={() => s.removeListItem(chapter.id, "iitSheets", i.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 className="size-3.5"/></button>
                </Row>
              ))}
              {!state.iitSheets.length && <Empty>No sheets yet.</Empty>}
            </List>
          </Section>

          {/* Allen Assignments */}
          <Section title="Allen Assignments" icon={Layers} count={`${state.allenAssignments.filter(l=>l.done).length}/${state.allenAssignments.length}`}>
            <AddInput placeholder="Add assignment…" onAdd={(v) => s.addListItem(chapter.id, "allenAssignments", v)} />
            <List>
              {state.allenAssignments.map((i) => (
                <Row key={i.id}>
                  <Check checked={i.done} onClick={() => s.toggleListItem(chapter.id, "allenAssignments", i.id)} />
                  <span className={cn("text-sm flex-1", i.done && "line-through text-muted-foreground")}>{i.title}</span>
                  <button onClick={() => s.toggleStarred(chapter.id, i.id)}>
                    <Star className={cn("size-3.5", i.starred ? "text-amber-400 fill-amber-400" : "text-muted-foreground/50")} />
                  </button>
                  <button onClick={() => s.removeListItem(chapter.id, "allenAssignments", i.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 className="size-3.5"/></button>
                </Row>
              ))}
              {!state.allenAssignments.length && <Empty>No assignments yet.</Empty>}
            </List>
          </Section>

          {/* Formula Revision */}
          <Section title="Formula revision" icon={Zap}>
            <div className="grid grid-cols-2 gap-1.5">
              {(["formulaSheet", "ncert", "shortNotes", "namedReactions", "graphs", "exceptions"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <Check checked={state.formula[k]} onClick={() => s.setFormula(chapter.id, k, !state.formula[k])} />
                  <span className="text-xs capitalize">{labelFor(k)}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Resources */}
          <div className="lg:col-span-2">
            <ResourcesPanel chapterId={chapter.id} />
          </div>

          {/* PYQs */}
          <Section title="PYQs — JEE Main" icon={Trophy}>
            <div className="flex flex-wrap gap-1.5">
              {PYQ_MAIN_YEARS.map((y) => (
                <YearChip key={y} year={y} on={!!state.pyqMain[y]} onClick={() => s.togglePyq(chapter.id, "main", y)} />
              ))}
            </div>
          </Section>
          <Section title="PYQs — JEE Advanced" icon={Trophy}>
            <div className="flex flex-wrap gap-1.5">
              {PYQ_ADV_YEARS.map((y) => (
                <YearChip key={y} year={y} on={!!state.pyqAdv[y]} onClick={() => s.togglePyq(chapter.id, "adv", y)} />
              ))}
            </div>
          </Section>

          {/* Revisions */}
          <div className="lg:col-span-2">
            <RevisionsPanel chapterId={chapter.id} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function emptyStateProxy() {
  return {
    lectures: [],
    notes: { class: false, short: false, formula: false, mindmap: false, flashcards: false },
    allen: {},
    iitSheets: [],
    allenAssignments: [],
    resources: [],
    pyqMain: {},
    pyqAdv: {},
    revisions: [],
    formula: { formulaSheet: false, ncert: false, shortNotes: false, namedReactions: false, graphs: false, exceptions: false },
    confidence: 0,
    hoursSpent: 0,
  };
}

function labelFor(k: string) {
  const map: Record<string, string> = {
    class: "Class notes",
    short: "Short notes",
    formula: "Formula sheet",
    mindmap: "Mind map",
    flashcards: "Flashcards",
    formulaSheet: "Formula sheet",
    ncert: "NCERT reading",
    shortNotes: "Short notes",
    namedReactions: "Named reactions",
    graphs: "Graphs",
    exceptions: "Exceptions",
  };
  return map[k] ?? k;
}

function Section({ title, icon: Icon, count, children }: { title: string; icon: React.ElementType; count?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {count && <span className="text-[10px] font-mono text-muted-foreground">{count}</span>}
      </div>
      {children}
    </div>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-border/50">{children}</ul>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <li className="flex items-center gap-2.5 py-2">{children}</li>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-muted-foreground py-3">{children}</div>;
}

function Check({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "size-4 rounded-[5px] border transition grid place-items-center shrink-0",
        checked ? "border-primary bg-primary" : "border-border hover:border-primary/60",
      )}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <div className="size-1.5 rounded-[1px] bg-primary-foreground" />}
    </button>
  );
}

function AddInput({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) { onAdd(v.trim()); setV(""); }
      }}
      className="flex gap-2"
    >
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
      <Button type="submit" size="sm" variant="secondary" className="h-8"><Plus className="size-3.5"/></Button>
    </form>
  );
}

function YearChip({ year, on, onClick }: { year: number; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border transition",
        on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {year}
    </button>
  );
}

function ResourcesPanel({ chapterId }: { chapterId: string }) {
  const state = useJeeStore((s) => s.chapters[chapterId]) ?? emptyStateProxy();
  const addResource = useJeeStore((s) => s.addResource);
  const addResourceItem = useJeeStore((s) => s.addResourceItem);
  const toggleResourceItem = useJeeStore((s) => s.toggleResourceItem);
  const removeResource = useJeeStore((s) => s.removeResource);
  const [name, setName] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <Section title="Resources" icon={Layers} count={`${state.resources.length} sources`}>
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) { addResource(chapterId, name.trim()); setName(""); } }}
        className="flex gap-2"
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add resource (Cengage, HCV, Sameer Bansal…)" className="h-8 text-sm" />
        <Button type="submit" size="sm" variant="secondary" className="h-8"><Plus className="size-3.5"/></Button>
      </form>

      <div className="space-y-2">
        {state.resources.map((r) => {
          const done = r.items.filter((i) => i.done).length;
          const isOpen = open[r.id] ?? true;
          return (
            <div key={r.id} className="rounded-lg border border-border/60 bg-white/[0.02]">
              <button
                onClick={() => setOpen({ ...open, [r.id]: !isOpen })}
                className="w-full flex items-center gap-2 p-3"
              >
                {isOpen ? <ChevronDown className="size-4 text-muted-foreground"/> : <ChevronRight className="size-4 text-muted-foreground"/>}
                <span className="text-sm font-medium flex-1 text-left">{r.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{done}/{r.items.length}</span>
                <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: r.items.length ? `${(done / r.items.length) * 100}%` : "0%" }} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeResource(chapterId, r.id); }}
                  className="text-muted-foreground/60 hover:text-red-400"
                >
                  <Trash2 className="size-3.5"/>
                </button>
              </button>
              {isOpen && (
                <div className="p-3 pt-0 space-y-2">
                  <AddInput placeholder="Exercise / Level / Illustration…" onAdd={(v) => addResourceItem(chapterId, r.id, v)} />
                  <List>
                    {r.items.map((it) => (
                      <Row key={it.id}>
                        <Check checked={it.done} onClick={() => toggleResourceItem(chapterId, r.id, it.id)} />
                        <span className={cn("text-sm flex-1", it.done && "line-through text-muted-foreground")}>{it.title}</span>
                      </Row>
                    ))}
                    {!r.items.length && <Empty>Add items to this resource.</Empty>}
                  </List>
                </div>
              )}
            </div>
          );
        })}
        {!state.resources.length && <Empty>Add any book, coaching sheet or custom resource.</Empty>}
      </div>
    </Section>
  );
}

function RevisionsPanel({ chapterId }: { chapterId: string }) {
  const state = useJeeStore((s) => s.chapters[chapterId]) ?? emptyStateProxy();
  const addRevision = useJeeStore((s) => s.addRevision);
  const removeRevision = useJeeStore((s) => s.removeRevision);
  const [time, setTime] = useState("30");
  const [conf, setConf] = useState("3");
  const [weak, setWeak] = useState("");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addRevision(chapterId, {
      date: new Date().toISOString(),
      timeMin: Number(time) || 0,
      confidence: Number(conf) || 3,
      weakConcepts: weak,
      notes,
      completionPct: 100,
    });
    setWeak(""); setNotes(""); setTime("30");
  };

  const last = state.revisions[state.revisions.length - 1];
  const daysSinceLast = last ? daysSince(last.date) : null;

  return (
    <Section title="Revisions" icon={RotateCcw} count={`${state.revisions.length} logged`}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input placeholder="Minutes" type="number" value={time} onChange={(e) => setTime(e.target.value)} className="h-8" />
        <Input placeholder="Confidence 1-5" type="number" min={1} max={5} value={conf} onChange={(e) => setConf(e.target.value)} className="h-8" />
        <Input placeholder="Weak concepts" value={weak} onChange={(e) => setWeak(e.target.value)} className="h-8 md:col-span-2" />
        <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="md:col-span-3" />
        <Button type="submit" className="md:col-span-1">Log revision</Button>
      </form>
      {last && (
        <div className="text-[11px] text-muted-foreground font-mono">
          Last: {new Date(last.date).toLocaleDateString()} · {daysSinceLast}d ago · confidence {last.confidence}/5 · next recommended in {Math.max(3, 7 - state.revisions.length)}d
        </div>
      )}
      <ul className="divide-y divide-border/50">
        {[...state.revisions].reverse().map((r) => (
          <li key={r.id} className="py-2 flex items-start gap-3">
            <div className="text-[10px] font-mono text-muted-foreground shrink-0 w-20">{new Date(r.date).toLocaleDateString()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs">{r.timeMin} min · confidence {r.confidence}/5</div>
              {r.weakConcepts && <div className="text-[11px] text-amber-400">Weak: {r.weakConcepts}</div>}
              {r.notes && <div className="text-[11px] text-muted-foreground truncate">{r.notes}</div>}
            </div>
            <button onClick={() => removeRevision(chapterId, r.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 className="size-3.5"/></button>
          </li>
        ))}
      </ul>
    </Section>
  );
}