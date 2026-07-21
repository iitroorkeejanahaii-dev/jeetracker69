import { useEffect, useState } from "react";
import { useJeeStore } from "@/lib/jee/store";
import { getConceptSeed } from "@/lib/jee/concepts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

export function MasteryPanel({ chapterId }: { chapterId: string }) {
  const state = useJeeStore((s) => s.chapters[chapterId]);
  const seedConcepts = useJeeStore((s) => s.seedConcepts);
  const addConcept = useJeeStore((s) => s.addConcept);
  const toggleConcept = useJeeStore((s) => s.toggleConcept);
  const removeConcept = useJeeStore((s) => s.removeConcept);
  const [v, setV] = useState("");

  useEffect(() => {
    if (!state?.concepts || state.concepts.length === 0) {
      const seeds = getConceptSeed(chapterId);
      if (seeds.length) seedConcepts(chapterId, seeds);
    }
  }, [chapterId, state?.concepts, seedConcepts]);

  const concepts = state?.concepts ?? [];
  const done = concepts.filter((c) => c.done).length;
  const pct = concepts.length ? (done / concepts.length) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="size-4 text-primary" /> Mastery — concepts
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{done}/{concepts.length}</span>
      </div>
      <ProgressBar value={pct} size="sm" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {concepts.map((k) => (
          <div key={k.id} className={cn("flex items-center gap-2 p-2 rounded-lg border transition", k.done ? "border-primary/40 bg-primary/[0.06]" : "border-border/50 bg-white/[0.02]")}>
            <button
              onClick={() => toggleConcept(chapterId, k.id)}
              className={cn("size-4 rounded border grid place-items-center shrink-0", k.done ? "bg-primary border-primary" : "border-border")}
            >
              {k.done && <div className="size-1.5 rounded-[1px] bg-primary-foreground"/>}
            </button>
            <span className={cn("text-sm flex-1", k.done && "line-through text-muted-foreground")}>{k.title}</span>
            <button onClick={() => removeConcept(chapterId, k.id)} className="text-muted-foreground/40 hover:text-red-400">
              <Trash2 className="size-3.5"/>
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) { addConcept(chapterId, v.trim()); setV(""); } }} className="flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Add concept…" className="h-8 text-sm" />
        <Button type="submit" size="sm" variant="secondary" className="h-8"><Plus className="size-3.5"/></Button>
      </form>
    </div>
  );
}