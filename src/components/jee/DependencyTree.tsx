import { Link } from "@tanstack/react-router";
import { getPrereqs, getNext } from "@/lib/jee/dependencies";
import { getChapter } from "@/lib/jee/seed";
import { ArrowDown, GitBranch } from "lucide-react";

export function DependencyTree({ chapterId }: { chapterId: string }) {
  const prereqs = getPrereqs(chapterId).map(getChapter).filter(Boolean);
  const nexts = getNext(chapterId).map(getChapter).filter(Boolean);
  const current = getChapter(chapterId);

  if (!prereqs.length && !nexts.length) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <GitBranch className="size-4 text-primary" /> Topic flow
      </div>
      <div className="flex flex-col items-center gap-2">
        {prereqs.map((p) => (
          <div key={p!.id} className="w-full flex flex-col items-center gap-2">
            <Link to="/c/$cid" params={{ cid: p!.id }} className="text-xs text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg border border-border/50 bg-white/[0.02]">
              {p!.name}
            </Link>
            <ArrowDown className="size-3.5 text-muted-foreground/60"/>
          </div>
        ))}
        <div className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-sm font-semibold text-primary">
          {current?.name}
        </div>
        {nexts.map((n) => (
          <div key={n!.id} className="w-full flex flex-col items-center gap-2">
            <ArrowDown className="size-3.5 text-muted-foreground/60"/>
            <Link to="/c/$cid" params={{ cid: n!.id }} className="text-xs text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg border border-border/50 bg-white/[0.02]">
              {n!.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}