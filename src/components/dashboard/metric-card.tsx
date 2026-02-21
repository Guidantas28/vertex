"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: "violet" | "blue" | "emerald" | "amber" | "rose" | "cyan";
  index?: number;
  loading?: boolean;
}

const COLOR_MAP = {
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    icon: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400",
    positive: "text-violet-600",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
    positive: "text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    positive: "text-emerald-600",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    positive: "text-amber-600",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    icon: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
    positive: "text-rose-600",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    icon: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400",
    positive: "text-cyan-600",
  },
};

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  index = 0,
  loading = false,
}: MetricCardProps) {
  const colors = COLOR_MAP[color];
  const isPositive = (change ?? 0) >= 0;
  const isNeutral = change === undefined || change === 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="shimmer-bg h-4 w-24 rounded" />
        <div className="shimmer-bg h-8 w-32 rounded" />
        <div className="shimmer-bg h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative rounded-xl border border-border bg-card p-5 overflow-hidden cursor-default",
        "shadow-card hover:shadow-card-hover transition-shadow duration-200"
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-30",
          colors.bg
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className={cn("rounded-lg p-2", colors.icon)}>{icon}</div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {value}
          </p>
        </div>

        {!isNeutral && (
          <div className="mt-2 flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {isPositive ? "+" : ""}
              {change?.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
        {isNeutral && (
          <div className="mt-2 flex items-center gap-1">
            <Minus className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {changeLabel || "sem dados anteriores"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
