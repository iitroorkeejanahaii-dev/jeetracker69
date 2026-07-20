import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "Goals — JEE OS" }] }),
});

function GoalsPage() {
  const goals = useJeeStore((s) => s.goals);
  const addGoal = useJeeStore((s) => s.addGoal);
  const updateGoal = useJeeStore((s) => s.updateGoal);
  const removeGoal = useJeeStore((s) => s.removeGoal);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("100");
  const [unit, setUnit] = useState("questions");
  const [deadline, setDeadline] = useState("");

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Commitments</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Goals</h1>
        </header>

        <form
          onSubmit={(e)=>{ e.preventDefault(); if(!title.trim()) return; addGoal({ title, target: Number(target)||0, unit, deadline: deadline || undefined, current: 0 }); setTitle(""); }}
          className="rounded-2xl border border-border/60 bg-card p-4 grid grid-cols-1 md:grid-cols-5 gap-2"
        >
          <Input placeholder="Goal (Finish Mechanics)" value={title} onChange={(e)=>setTitle(e.target.value)} className="md:col-span-2"/>
          <Input placeholder="Target" type="number" value={target} onChange={(e)=>setTarget(e.target.value)} />
          <Input placeholder="Unit" value={unit} onChange={(e)=>setUnit(e.target.value)} />
          <Input placeholder="Deadline" type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
          <Button type="submit" className="md:col-span-5">Add goal</Button>
        </form>

        <div className="space-y-3">
          {goals.map((g) => {
            const pct = Math.min(100, (g.current / Math.max(g.target, 1)) * 100);
            return (
              <div key={g.id} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{g.title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {g.current}/{g.target} {g.unit}{g.deadline ? ` · by ${g.deadline}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={g.current} onChange={(e)=>updateGoal(g.id, { current: Number(e.target.value)||0 })} className="h-8 w-20 text-xs" />
                    <button onClick={()=>removeGoal(g.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 className="size-3.5"/></button>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }}/>
                </div>
              </div>
            );
          })}
          {!goals.length && <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">Set your first goal — "Complete GOC before 30 July", "10000 questions".</div>}
        </div>
      </div>
    </AppShell>
  );
}