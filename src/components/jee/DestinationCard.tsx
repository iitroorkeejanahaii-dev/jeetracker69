import { useJeeStore } from "@/lib/jee/store";
import { ProgressBar } from "./ProgressBar";
import { Sparkles, Trophy, Target, Calendar } from "lucide-react";

export function DestinationCard({ overall }: { overall: number }) {
  const d = useJeeStore((s) => s.destination);
  const settings = useJeeStore((s) => s.settings);
  const days = daysUntil(d.examDate);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/[0.04] p-5 md:p-7 animate-fade-in">
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary/80">Destination</div>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight mt-1 truncate">{d.college}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
            <Metric icon={Trophy} label="Target rank" value={`#${d.targetRank.toLocaleString()}`} />
            <Metric icon={Target} label="Percentile" value={`${d.targetPercentile}%`} />
            <Metric icon={Sparkles} label="Marks · Jan / Apr" value={`${d.targetMarksJan} · ${d.targetMarksApr}`} />
            <Metric icon={Calendar} label={days != null ? "Days remaining" : "Target year"} value={days != null ? `${days}d` : `${settings.targetYear}`} />
          </div>
          {d.quote && <p className="text-xs italic text-muted-foreground mt-4 max-w-lg">"{d.quote}"</p>}
        </div>
        <div className="md:w-64 shrink-0">
          <ProgressBar
            value={overall}
            size="lg"
            barClass="bg-gradient-to-r from-primary to-primary/60"
            label="Overall readiness"
            showValue
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-primary/80" />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
        <div className="text-sm font-semibold font-mono">{value}</div>
      </div>
    </div>
  );
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400_000));
}