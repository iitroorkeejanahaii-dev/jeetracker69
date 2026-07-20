import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { ALL_CHAPTERS, SUBJECTS } from "@/lib/jee/seed";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search } from "lucide-react";
import type { MistakeStatus, MistakeType } from "@/lib/jee/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mistakes")({
  component: MistakesPage,
  head: () => ({ meta: [{ title: "Mistake Notebook — JEE OS" }] }),
});

const TYPES: { k: MistakeType; label: string }[] = [
  { k: "concept", label: "Concept" },
  { k: "calculation", label: "Calculation" },
  { k: "silly", label: "Silly" },
  { k: "guess", label: "Guess" },
  { k: "formula", label: "Forgot formula" },
  { k: "time", label: "Time pressure" },
];

function MistakesPage() {
  const mistakes = useJeeStore((s) => s.mistakes);
  const addMistake = useJeeStore((s) => s.addMistake);
  const updateMistake = useJeeStore((s) => s.updateMistake);
  const removeMistake = useJeeStore((s) => s.removeMistake);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | MistakeStatus>("all");

  const [chapterId, setChapterId] = useState(ALL_CHAPTERS[0].id);
  const [resource, setResource] = useState("");
  const [qNum, setQNum] = useState("");
  const [type, setType] = useState<MistakeType>("concept");
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard">("medium");
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [method, setMethod] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return mistakes.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (!query) return true;
      return (m.concept + m.explanation + m.correctMethod + m.resource + m.qNumber).toLowerCase().includes(query);
    });
  }, [mistakes, q, filter]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    const ch = ALL_CHAPTERS.find((c) => c.id === chapterId)!;
    addMistake({
      subjectId: ch.subjectId,
      chapterId,
      resource: resource || "—",
      qNumber: qNum || "—",
      difficulty,
      type,
      concept,
      explanation,
      correctMethod: method,
      image,
      status: "pending",
    });
    setResource(""); setQNum(""); setConcept(""); setExplanation(""); setMethod(""); setImage(undefined);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Log</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Mistake Notebook</h1>
          <p className="text-sm text-muted-foreground mt-1">Every mistake logged is a mark saved. Master → forget → repeat until zero.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <form onSubmit={submit} className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">New mistake</h2>
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger><SelectValue placeholder="Chapter"/></SelectTrigger>
              <SelectContent className="max-h-80">
                {SUBJECTS.map((s) => (
                  <div key={s.id}>
                    <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.name}</div>
                    {s.units.flatMap((u) => u.chapters).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Resource" value={resource} onChange={(e)=>setResource(e.target.value)} />
              <Input placeholder="Q #" value={qNum} onChange={(e)=>setQNum(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={type} onValueChange={(v)=>setType(v as MistakeType)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{TYPES.map(t=>(<SelectItem key={t.k} value={t.k}>{t.label}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={(v)=>setDifficulty(v as any)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Concept" value={concept} onChange={(e)=>setConcept(e.target.value)} />
            <Textarea placeholder="Where I went wrong" value={explanation} onChange={(e)=>setExplanation(e.target.value)} rows={2}/>
            <Textarea placeholder="Correct method" value={method} onChange={(e)=>setMethod(e.target.value)} rows={2}/>
            <div>
              <label className="text-xs text-muted-foreground">Screenshot (optional)</label>
              <input type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0])} className="block w-full text-xs mt-1 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:px-3 file:py-1"/>
              {image && <img src={image} alt="preview" className="mt-2 rounded-md max-h-32 border border-border" />}
            </div>
            <Button type="submit" className="w-full">Log mistake</Button>
          </form>

          <div className="lg:col-span-3 space-y-3">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search mistakes…" className="pl-9"/>
              </div>
              <div className="flex gap-1 rounded-md border border-border p-0.5">
                {(["all","pending","revised","mastered"] as const).map(s=>(
                  <button key={s} onClick={()=>setFilter(s)} className={cn("px-2.5 py-1 rounded-sm text-[11px] font-medium capitalize", filter===s? "bg-primary text-primary-foreground":"text-muted-foreground")}>{s}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filtered.map((m) => {
                const ch = ALL_CHAPTERS.find((c) => c.id === m.chapterId);
                return (
                  <div key={m.id} className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-start gap-3">
                      {m.image && <img src={m.image} alt="" className="size-16 rounded-md object-cover border border-border"/>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{ch?.subjectId}</span>
                          <span className="text-sm font-medium">{m.concept}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 font-mono flex gap-2 flex-wrap">
                          <Link to="/c/$cid" params={{cid: m.chapterId}} className="hover:text-primary">{ch?.name}</Link>
                          <span>· {m.resource} · Q{m.qNumber}</span>
                          <span>· {m.difficulty}</span>
                          <span>· {m.type}</span>
                        </div>
                        {m.explanation && <p className="text-xs text-muted-foreground mt-2">Wrong: {m.explanation}</p>}
                        {m.correctMethod && <p className="text-xs text-emerald-300 mt-1">Correct: {m.correctMethod}</p>}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Select value={m.status} onValueChange={(v)=>updateMistake(m.id, { status: v as MistakeStatus })}>
                          <SelectTrigger className="h-7 text-[11px] w-28"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="revised">Revised</SelectItem>
                            <SelectItem value="mastered">Mastered</SelectItem>
                          </SelectContent>
                        </Select>
                        <button onClick={()=>removeMistake(m.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 className="size-3.5"/></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!filtered.length && (
                <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
                  No mistakes {q || filter !== "all" ? "match" : "yet"}. Add one from the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}