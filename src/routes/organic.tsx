import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/jee/AppShell";
import { useJeeStore } from "@/lib/jee/store";
import { NAMED_REACTIONS, REAGENTS } from "@/lib/jee/organic";
import { ChevronDown, ChevronRight, FlaskConical, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/organic")({
  component: OrganicHub,
  head: () => ({ meta: [{ title: "Organic Hub — JEE OS" }] }),
});

function OrganicHub() {
  const organic = useJeeStore((s) => s.organic);
  const toggle = useJeeStore((s) => s.toggleReaction);
  const setNote = useJeeStore((s) => s.setReactionNote);
  const setReagentNote = useJeeStore((s) => s.setReagentNote);
  const [openR, setOpenR] = useState<Record<string, boolean>>({});
  const [openRg, setOpenRg] = useState<Record<string, boolean>>({});

  const doneCount = Object.values(organic.reactions).filter((r) => r.done).length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <header className="animate-fade-in">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Chemistry · Organic</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Organic Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Named reactions & the reagent vault — the two things you must not forget in the exam hall.</p>
        </header>

        <section className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="size-4 text-primary"/> Named Reactions</h2>
            <span className="text-[10px] font-mono text-muted-foreground">{doneCount}/{NAMED_REACTIONS.length} mastered</span>
          </div>
          <div className="space-y-2">
            {NAMED_REACTIONS.map((r) => {
              const state = organic.reactions[r.id] ?? { done: false };
              const open = openR[r.id];
              return (
                <div key={r.id} className={cn("rounded-xl border bg-card overflow-hidden transition", state.done ? "border-primary/40 bg-primary/[0.03]" : "border-border/60")}>
                  <button onClick={() => setOpenR({ ...openR, [r.id]: !open })} className="w-full flex items-center gap-3 p-3 text-left">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggle(r.id); }}
                      className="shrink-0"
                      aria-label="Toggle mastered"
                    >
                      {state.done ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground"/>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{r.category} · {r.summary}</div>
                    </div>
                    {open ? <ChevronDown className="size-4 text-muted-foreground"/> : <ChevronRight className="size-4 text-muted-foreground"/>}
                  </button>
                  {open && (
                    <div className="p-3 pt-0 space-y-2">
                      <div className="text-xs text-muted-foreground">Your mechanism notes / mnemonic</div>
                      <Textarea rows={3} value={state.note ?? ""} onChange={(e) => setNote(r.id, e.target.value)} placeholder="Mechanism, trick, PYQ pattern…" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 animate-fade-in">
          <h2 className="text-sm font-semibold flex items-center gap-2"><FlaskConical className="size-4 text-primary"/> Reagent Vault</h2>
          <div className="space-y-2">
            {REAGENTS.map((r) => {
              const open = openRg[r.id];
              const note = organic.reagents[r.id]?.note ?? "";
              return (
                <div key={r.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  <button onClick={() => setOpenRg({ ...openRg, [r.id]: !open })} className="w-full flex items-center gap-3 p-3 text-left">
                    <div className="size-9 rounded-md bg-primary/10 grid place-items-center text-[10px] font-mono text-primary font-semibold shrink-0">{r.name.slice(0,4)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{r.formula}</div>
                    </div>
                    {open ? <ChevronDown className="size-4 text-muted-foreground"/> : <ChevronRight className="size-4 text-muted-foreground"/>}
                  </button>
                  {open && (
                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <VaultBlock title="Uses" items={r.uses} />
                      <VaultBlock title="Exceptions" items={r.exceptions} tone="text-amber-400" />
                      <VaultBlock title="Conversions" items={r.conversions} tone="text-primary" />
                      <div className="md:col-span-3 space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">PYQ / personal notes</div>
                        <Textarea rows={2} value={note} onChange={(e) => setReagentNote(r.id, e.target.value)} placeholder="Any PYQ where this appeared, tricks, exceptions…" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function VaultBlock({ title, items, tone = "text-foreground" }: { title: string; items: string[]; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{title}</div>
      <ul className="space-y-1">
        {items.length === 0 && <li className="text-xs text-muted-foreground italic">—</li>}
        {items.map((it, i) => (
          <li key={i} className={cn("text-xs leading-relaxed", tone)}>• {it}</li>
        ))}
      </ul>
    </div>
  );
}