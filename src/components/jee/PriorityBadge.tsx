import { useJeeStore } from "@/lib/jee/store";
import type { Priority } from "@/lib/jee/types";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const OPTIONS: { v: Priority; label: string; tone: string }[] = [
  { v: "normal", label: "Normal", tone: "border-border text-muted-foreground" },
  { v: "focus", label: "Focus", tone: "border-primary/40 text-primary bg-primary/10" },
  { v: "priority", label: "Priority", tone: "border-[color:var(--gold)]/50 text-[color:var(--gold)] bg-[color:var(--gold)]/10" },
  { v: "critical", label: "Critical", tone: "border-[color:var(--gold)] text-[color:var(--gold)] bg-[color:var(--gold)]/20 glow-priority" },
];

export function PriorityPicker({ chapterId, current }: { chapterId: string; current?: Priority }) {
  const setPriority = useJeeStore((s) => s.setPriority);
  const cur = current ?? "normal";
  return (
    <div className="flex flex-wrap gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.v}
          onClick={() => setPriority(chapterId, o.v)}
          className={cn(
            "px-2.5 py-1 rounded-md text-[10px] uppercase font-mono tracking-widest border transition",
            cur === o.v ? o.tone : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {(o.v === "priority" || o.v === "critical") && cur === o.v && <Star className="size-3 inline mr-1 fill-current"/>}
          {o.label}
        </button>
      ))}
    </div>
  );
}