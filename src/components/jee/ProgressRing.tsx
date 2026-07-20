import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
  trackClass?: string;
  ringClass?: string;
  label?: React.ReactNode;
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  className,
  trackClass = "stroke-white/8",
  ringClass = "stroke-primary",
  label,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(ringClass, "transition-[stroke-dashoffset] duration-700 ease-out")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{label}</div>
    </div>
  );
}