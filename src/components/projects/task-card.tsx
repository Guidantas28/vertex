"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Paperclip, CheckSquare, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge } from "./priority-badge";
import { useProjectsStore } from "@/stores/projects.store";
import { cn } from "@/lib/utils";
import type { TaskWithRelations } from "@/types/database";

interface TaskCardProps {
  task: TaskWithRelations;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { openTaskDetail } = useProjectsStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.due_date && !task.completed_at && new Date(task.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card border border-border rounded-xl p-3.5 cursor-pointer",
        "hover:border-primary/30 hover:shadow-card transition-all duration-150",
        (isDragging || isSortableDragging) && "opacity-50 shadow-xl scale-[1.02] rotate-1"
      )}
      onClick={() => openTaskDetail(task.id)}
    >
      {/* Drag handle + Priority */}
      <div className="flex items-start justify-between mb-2.5">
        <PriorityBadge priority={task.priority} showLabel={false} />
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent cursor-grab active:cursor-grabbing transition-all"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <p className={cn(
        "text-sm font-medium text-foreground mb-2.5 line-clamp-2 leading-snug",
        task.completed_at && "line-through text-muted-foreground"
      )}>
        {task.title}
      </p>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageSquare className="h-3 w-3" />
              {task._count?.comments}
            </span>
          )}
          {(task._count?.subtasks ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <CheckSquare className="h-3 w-3" />
              {task._count?.subtasks}
            </span>
          )}
          {task.estimated_hours && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <Paperclip className="h-3 w-3" />
              {task.estimated_hours}h
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={cn(
              "text-[11px] flex items-center gap-0.5",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
            </span>
          )}
          {task.assignee && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.assignee.avatar_url ?? undefined} />
              <AvatarFallback className="text-[9px]">
                {task.assignee.full_name?.slice(0, 2).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
