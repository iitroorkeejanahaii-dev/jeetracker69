import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/colleges")({
  component: CollegesPage,
  head: () => ({ meta: [{ title: "Dream Colleges — JEE OS" }] }),
});

function CollegesPage() {
  const list = useJeeStore((s) => s.dreamColleges);
  const add = useJeeStore((s) => s.addDreamCollege);
  const update = useJeeStore((s) => s.updateDreamCollege);
  const remove = useJeeStore((s) => s.removeDreamCollege);
  const mocks = useJeeStore((s) => s.mocks);
  const latestMark = mocks[0]?.marks;

  const [name, setName] = useState("");
  const [rank, setRank] = useState("1000");
  const [marks, setMarks] = useState("250");
  const [rating, setRating] = useState(5);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add({ name: name.trim(), targetRank: Number(rank) || 0, requiredMarks: Number(marks) || 0, rating });
    setName(""); setRank("1000"); setMarks("250"); setRating(5);
  };

  const chipFor = (required: number): { label: string; tone: string } => {
    if (latestMark == null) return { label: "No mock yet", tone: "text-muted-foreground border-border" };
    const gap = latestMark - required;
    if (gap >= 10) return { label: "Safe", tone: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10" };
    if (gap >= -5) return { label: "Reach", tone: "text-amber-400 border-amber-400/40 bg-amber-400/10" };
    if (gap >= -25) return { label: "Dream", tone: "text-primary border-primary/40 bg-primary/10" };
    return { label: "Impossible today", tone: "text-red-400 border-red-400/40 bg-red-400/10" };
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <header className="animate-fade-in">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dreams</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"><GraduationCap className="size-6 text-primary"/> Dream Colleges</h1>
          <p className="text-sm text-muted-foreground mt-1">Every college you're aiming for. Latest mock: {latestMark != null ? `${latestMark} marks` : "not logged yet"}.</p>
        </header>

        <form onSubmit={submit} className="rounded-2xl border border-border/60 bg-card p-4 grid grid-cols-1 md:grid-cols-5 gap-2 animate-fade-in">
          <Input placeholder="College name (e.g. IIT Delhi)" value={name} onChange={(e) => setName(e.target.value)} className="md:col-span-2"/>
          <Input type="number" placeholder="Rank" value={rank} onChange={(e) => setRank(e.target.value)} />
          <Input type="number" placeholder="Marks" value={marks} onChange={(e) => setMarks(e.target.value)} />
          <div className="flex gap-1">
            {[1,2,3,4,5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
                <Star className={cn("size-4", n <= rating ? "text-[color:var(--gold)] fill-[color:var(--gold)]" : "text-muted-foreground/40")}/>
              </button>
            ))}
          </div>
          <div className="md:col-span-5 flex justify-end">
            <Button type="submit"><Plus className="size-3.5 mr-1"/>Add college</Button>
          </div>
        </form>

        <div className="space-y-2">
          {list.length === 0 && <div className="rounded-2xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground text-center">Add your first dream college above.</div>}
          {list.map((c) => {
            const chip = chipFor(c.requiredMarks);
            return (
              <div key={c.id} className="rounded-2xl border border-border/60 bg-card p-4 flex items-center gap-4 animate-fade-in">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: c.rating }).map((_, i) => <Star key={i} className="size-3 text-[color:var(--gold)] fill-[color:var(--gold)]"/>)}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Rank #{c.targetRank.toLocaleString()} · {c.requiredMarks} marks</div>
                </div>
                <span className={cn("px-2.5 py-1 rounded-md text-[10px] uppercase font-mono border", chip.tone)}>{chip.label}</span>
                <div className="flex gap-1">
                  <Input type="number" className="w-20 h-8" value={c.targetRank} onChange={(e) => update(c.id, { targetRank: Number(e.target.value)||0 })}/>
                  <Input type="number" className="w-20 h-8" value={c.requiredMarks} onChange={(e) => update(c.id, { requiredMarks: Number(e.target.value)||0 })}/>
                  <button onClick={() => remove(c.id)} className="text-muted-foreground/50 hover:text-red-400 p-1"><Trash2 className="size-4"/></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}