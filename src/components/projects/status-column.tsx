"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreHorizontal } from "lucide-react";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskWithRelations } from "@/types/database";

interface StatusColumnProps {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  onAddTask: (statusId: string) => void;
}

export function StatusColumn({ status, tasks, onAddTask }: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  const STATUS_TYPE_STYLES = {
    todo: "border-slate-300/50 dark:border-slate-600/50",
    in_progress: "border-blue-300/50 dark:border-blue-500/30",
    review: "border-amber-300/50 dark:border-amber-500/30",
    done: "border-green-300/50 dark:border-green-500/30",
    cancelled: "border-red-300/50 dark:border-red-500/30",
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="font-semibold text-sm text-foreground">
            {status.name}
          </span>
          <span className="text-xs text-muted-foreground bg-muted/70 rounded-full px-2 py-0.5 font-medium">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(status.id)}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl border-2 border-dashed p-2 min-h-[200px] transition-all duration-150 space-y-2",
          STATUS_TYPE_STYLES[status.type],
          isOver && "bg-primary/5 border-primary/40 scale-[1.01]"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/50 text-xs">
            <Plus className="h-5 w-5 mb-1 opacity-40" />
            Solte aqui
          </div>
        )}
      </div>

      {/* Add task button */}
      <button
        onClick={() => onAddTask(status.id)}
        className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar tarefa
      </button>
    </div>
  );
}
