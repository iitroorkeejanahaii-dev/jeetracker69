import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  className?: string;
  barClass?: string;
  trackClass?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: React.ReactNode;
  hint?: React.ReactNode;
}

export function ProgressBar({
  value,
  className,
  barClass = "bg-primary",
  trackClass = "bg-white/[0.06]",
  size = "md",
  showValue,
  label,
  hint,
}: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const h = size === "sm" ? "h-1" : size === "lg" ? "h-2.5" : "h-1.5";
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue || hint) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {hint}
            {hint && showValue ? " · " : ""}
            {showValue ? `${Math.round(pct)}%` : ""}
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", h, trackClass)}>
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}