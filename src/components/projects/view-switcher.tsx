"use client";

import { LayoutGrid, List, GanttChart, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/stores/projects.store";

const VIEWS: { id: ProjectView; label: string; icon: React.ElementType }[] = [
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "list", label: "Lista", icon: List },
  { id: "gantt", label: "Gantt", icon: GanttChart },
  { id: "calendar", label: "Calendário", icon: Calendar },
  { id: "timeline", label: "Timeline", icon: Activity },
];

interface ViewSwitcherProps {
  current: ProjectView;
  onChange: (view: ProjectView) => void;
}

export function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-1">
      {VIEWS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            current === id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
