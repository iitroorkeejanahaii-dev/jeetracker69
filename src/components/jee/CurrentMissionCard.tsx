import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS, SUBJECTS } from "@/lib/jee/seed";
import { readinessScore } from "@/lib/jee/readiness";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2, Flame, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CurrentMissionCard() {
  const mission = useJeeStore((s) => s.currentMission);
  const setMission = useJeeStore((s) => s.setMission);
  const completeMission = useJeeStore((s) => s.completeMission);
  const clearMission = useJeeStore((s) => s.clearMission);
  const getCh = useJeeStore((s) => s.getChapter);
  const mistakes = useJeeStore((s) => s.mistakes);
  const [open, setOpen] = useState(false);

  if (!mission || mission.chapterIds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="size-4 text-primary" /> This week's mission
          </div>
          <p className="text-xs text-muted-foreground mt-1">Pick 3–6 chapters to attack this week. Everything else waits.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="size-4 mr-1" /> Pick this week's chapters
        </Button>
        <MissionPicker open={open} onOpenChange={setOpen} initial={[]} onSave={(ids) => setMission(ids)} />
      </div>
    );
  }

  const rows = mission.chapterIds
    .map((id) => ALL_CHAPTERS.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => {
      const state = getCh(c!.id);
      const chMist = mistakes.filter((m) => m.chapterId === c!.id);
      return { c: c!, state, score: readinessScore(state, chMist) };
    });
  const avg = Math.round(rows.reduce((a, x) => a + x.score, 0) / Math.max(rows.length, 1));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="size-4 text-primary" /> Current mission
            {mission.completed && <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 ml-2">Complete</span>}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Week of {new Date(mission.weekStart).toLocaleDateString()} · {rows.length} chapters · {avg}% avg</div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Edit</Button>
          {!mission.completed && <Button size="sm" onClick={completeMission}><CheckCircle2 className="size-3.5 mr-1" /> Finish</Button>}
          {mission.completed && <Button size="sm" variant="secondary" onClick={clearMission}>Start new</Button>}
        </div>
      </div>

      <div className="space-y-3">
        {rows.map(({ c, state, score }) => (
          <div key={c.id} className="rounded-xl bg-white/[0.02] border border-border/50 p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-7 rounded-md bg-white/[0.04] grid place-items-center text-[10px] font-mono text-muted-foreground">
                {c.subjectId.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {state.lectures.filter((l) => l.done).length}/{state.lectures.length} lec · {state.revisions.length} rev · {(state.concepts ?? []).filter((k) => k.done).length}/{(state.concepts ?? []).length} concepts
                </div>
              </div>
              <Link to="/c/$cid" params={{ cid: c.id }} className="text-xs font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Continue <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <ProgressBar value={score} size="sm" />
          </div>
        ))}
      </div>
      <MissionPicker open={open} onOpenChange={setOpen} initial={mission.chapterIds} onSave={(ids) => setMission(ids)} />
    </div>
  );
}

function MissionPicker({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; initial: string[]; onSave: (ids: string[]) => void }) {
  const [sel, setSel] = useState<string[]>(initial);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>Pick this week's chapters</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-2">
          {SUBJECTS.map((s) => (
            <div key={s.id}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{s.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {s.units.flatMap((u) => u.chapters).map((c) => {
                  const on = sel.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(c.id)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg border text-xs transition",
                        on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c.name}
                      {on && <X className="size-3 inline ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <span className="text-xs text-muted-foreground mr-auto">{sel.length} selected</span>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(sel); onOpenChange(false); }}>Save mission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}