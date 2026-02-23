"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useProjectsStore } from "@/stores/projects.store";
import { cn } from "@/lib/utils";
import type { TaskLabel } from "@/types/database";

const PRIORITIES = [
  { value: "urgent", label: "Urgente", color: "text-red-500" },
  { value: "high", label: "Alta", color: "text-orange-500" },
  { value: "medium", label: "Média", color: "text-yellow-500" },
  { value: "low", label: "Baixa", color: "text-slate-400" },
];

interface TaskFiltersProps {
  labels: TaskLabel[];
}

export function TaskFilters({ labels }: TaskFiltersProps) {
  const { filters, setFilters, clearFilters } = useProjectsStore();
  const [showPanel, setShowPanel] = useState(false);

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== "")
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className="pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring w-48"
        />
      </div>

      <button
        onClick={() => setShowPanel(!showPanel)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
          hasFilters
            ? "border-primary bg-primary/10 text-primary"
            : "border-input text-muted-foreground hover:text-foreground hover:border-border"
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtros
        {hasFilters && (
          <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
            !
          </span>
        )}
      </button>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Limpar
        </button>
      )}

      {/* Filter panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 z-30 bg-card border border-border rounded-xl shadow-xl p-4 w-72">
          <h4 className="text-xs font-semibold text-foreground mb-3">Prioridade</h4>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  const cur = filters.priority ?? [];
                  setFilters({
                    priority: cur.includes(p.value)
                      ? cur.filter((x) => x !== p.value)
                      : [...cur, p.value],
                  });
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                  filters.priority?.includes(p.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={p.color}>{p.label}</span>
              </button>
            ))}
          </div>

          {labels.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-foreground mb-3">Labels</h4>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      const cur = filters.labels ?? [];
                      setFilters({
                        labels: cur.includes(l.id)
                          ? cur.filter((x) => x !== l.id)
                          : [...cur, l.id],
                      });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                      filters.labels?.includes(l.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full mr-1.5"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
