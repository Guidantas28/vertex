import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types/database";

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", color: "text-red-500", bg: "bg-red-500/10", dot: "bg-red-500", icon: "🔴" },
  high: { label: "Alta", color: "text-orange-500", bg: "bg-orange-500/10", dot: "bg-orange-500", icon: "🟠" },
  medium: { label: "Média", color: "text-yellow-500", bg: "bg-yellow-500/10", dot: "bg-yellow-500", icon: "🟡" },
  low: { label: "Baixa", color: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-400", icon: "⚪" },
} as const;

interface PriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function PriorityBadge({
  priority,
  showLabel = true,
  size = "sm",
  className,
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium",
        config.bg,
        config.color,
        size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-1",
        className
      )}
    >
      <span className={cn("rounded-full shrink-0", config.dot, size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
      {showLabel && config.label}
    </span>
  );
}

export { PRIORITY_CONFIG };
