"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Insight {
  id: string;
  title: string;
  description: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

interface AIInsightCardProps {
  insights: Insight[];
  loading?: boolean;
}

const PRIORITY_COLORS = {
  high: "border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20",
  medium: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
  low: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
};

export function AIInsightCard({ insights, loading = false }: AIInsightCardProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer-bg h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {insights.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium">Coletando dados...</p>
            <p className="text-xs text-muted-foreground">
              Insights aparecerão conforme você usa a plataforma.
            </p>
          </div>
        </div>
      ) : (
        insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`rounded-lg border-l-2 p-3.5 ${PRIORITY_COLORS[insight.priority]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {insight.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {insight.description}
                </p>
              </div>
              {insight.action && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 h-6 w-6"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </motion.div>
        ))
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs text-muted-foreground hover:text-primary"
        asChild
      >
        <a href="/ai-assistant">
          Ver todos os insights
          <ArrowRight className="h-3 w-3 ml-1" />
        </a>
      </Button>
    </div>
  );
}
