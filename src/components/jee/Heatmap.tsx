import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DailyLog } from "@/lib/jee/types";

interface Props {
  daily: Record<string, DailyLog>;
  weeks?: number;
  metric?: "hours" | "questions" | "tasks";
  className?: string;
}

export function Heatmap({ daily, weeks = 20, metric = "hours", className }: Props) {
  const cells = useMemo(() => {
    const arr: { date: string; v: number }[] = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (weeks * 7 - 1));
    // Shift start back to Sunday
    start.setDate(start.getDate() - start.getDay());
    const totalDays = Math.ceil((today.getTime() - start.getTime()) / 86400_000) + 1;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const log = daily[key];
      arr.push({ date: key, v: log ? (log[metric] as number) : 0 });
    }
    return arr;
  }, [daily, weeks, metric]);

  const max = Math.max(1, ...cells.map((c) => c.v));
  const shade = (v: number) => {
    if (v <= 0) return "bg-white/[0.04]";
    const t = v / max;
    if (t < 0.25) return "bg-primary/25";
    if (t < 0.5) return "bg-primary/50";
    if (t < 0.75) return "bg-primary/75";
    return "bg-primary";
  };

  // group into weeks (columns)
  const columns: { date: string; v: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  return (
    <div className={cn("flex gap-[3px] overflow-x-auto pb-1", className)}>
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {col.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date} · ${cell.v.toFixed(1)}`}
              className={cn("size-[10px] rounded-[2px]", shade(cell.v))}
            />
          ))}
        </div>
      ))}
    </div>
  );
}