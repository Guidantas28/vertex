"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge } from "../priority-badge";
import { useProjectsStore, useTasksByStatus } from "@/stores/projects.store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { TaskWithRelations } from "@/types/database";

interface ListViewProps {
  onAddTask: (statusId?: string) => void;
}

export function ListView({ onAddTask }: ListViewProps) {
  const tasksByStatus = useTasksByStatus();
  const { updateTaskOptimistic } = useProjectsStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (statusId: string) => {
    setCollapsed((prev) => ({ ...prev, [statusId]: !prev[statusId] }));
  };

  const toggleComplete = async (task: TaskWithRelations) => {
    const supabase = createClient();
    const completedAt = task.completed_at ? null : new Date().toISOString();
    updateTaskOptimistic(task.id, { completed_at: completedAt });
    await supabase
      .from("tasks")
      .update({ completed_at: completedAt })
      .eq("id", task.id);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_140px_120px_140px_100px] items-center bg-muted/30 border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground gap-3">
          <span className="w-5" />
          <span>Tarefa</span>
          <span className="flex items-center gap-1"><User className="h-3 w-3" /> Responsável</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Prioridade</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Vencimento</span>
          <span>Estimativa</span>
        </div>

        {/* Groups */}
        {tasksByStatus.map(({ status, tasks }) => (
          <div key={status.id}>
            {/* Group header */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 bg-muted/10 border-b border-border cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => toggleGroup(status.id)}
            >
              {collapsed[status.id] ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-xs font-semibold text-foreground">
                {status.name}
              </span>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {tasks.length}
              </span>
            </div>

            {/* Task rows */}
            {!collapsed[status.id] && (
              <>
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleComplete}
                  />
                ))}
                <button
                  onClick={() => onAddTask(status.id)}
                  className="w-full flex items-center gap-2 px-10 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all border-b border-border/50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar tarefa
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggleComplete,
}: {
  task: TaskWithRelations;
  onToggleComplete: (task: TaskWithRelations) => void;
}) {
  const { openTaskDetail } = useProjectsStore();
  const isOverdue =
    task.due_date && !task.completed_at && new Date(task.due_date) < new Date();

  return (
    <div
      className="grid grid-cols-[auto_1fr_140px_120px_140px_100px] items-center border-b border-border/50 px-4 py-2.5 hover:bg-accent/30 transition-colors cursor-pointer gap-3 group"
      onClick={() => openTaskDetail(task.id)}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        {task.completed_at ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      {/* Title */}
      <span className={cn(
        "text-sm font-medium text-foreground truncate",
        task.completed_at && "line-through text-muted-foreground"
      )}>
        {task.title}
      </span>

      {/* Assignee */}
      <div className="flex items-center gap-2">
        {task.assignee ? (
          <>
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.assignee.avatar_url ?? undefined} />
              <AvatarFallback className="text-[9px]">
                {task.assignee.full_name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {task.assignee.full_name}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Priority */}
      <PriorityBadge priority={task.priority} />

      {/* Due date */}
      <span className={cn(
        "text-xs",
        isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
      )}>
        {task.due_date
          ? format(new Date(task.due_date), "dd MMM yyyy", { locale: ptBR })
          : "—"}
      </span>

      {/* Estimate */}
      <span className="text-xs text-muted-foreground">
        {task.estimated_hours ? `${task.estimated_hours}h` : "—"}
      </span>
    </div>
  );
}
