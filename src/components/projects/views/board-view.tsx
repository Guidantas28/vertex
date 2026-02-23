"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { StatusColumn } from "../status-column";
import { TaskCard } from "../task-card";
import { useProjectsStore, useTasksByStatus } from "@/stores/projects.store";
import { createClient } from "@/lib/supabase/client";
import type { TaskWithRelations } from "@/types/database";

interface BoardViewProps {
  onAddTask: (statusId?: string) => void;
}

export function BoardView({ onAddTask }: BoardViewProps) {
  const { tasks, statuses, moveTaskOptimistic, setTasks } = useProjectsStore();
  const tasksByStatus = useTasksByStatus();
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dragging over a column (status) or another task
    const isOverColumn = statuses.some((s) => s.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    if (isOverColumn && activeTask.status_id !== overId) {
      moveTaskOptimistic(activeId, overId, 999);
    } else if (overTask && overTask.status_id !== activeTask.status_id) {
      moveTaskOptimistic(activeId, overTask.status_id!, overTask.position - 0.5);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine new status
    const isOverColumn = statuses.some((s) => s.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const newStatusId = isOverColumn
      ? overId
      : (overTask?.status_id ?? activeTask.status_id);

    // Reorder tasks in the same column
    const columnTasks = tasks
      .filter((t) => t.status_id === newStatusId && t.id !== activeId)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;
    if (isOverColumn || !overTask) {
      newPosition = (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000;
    } else {
      const overIdx = columnTasks.findIndex((t) => t.id === overId);
      if (overIdx === -1) {
        newPosition = (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000;
      } else {
        const prev = columnTasks[overIdx - 1]?.position ?? 0;
        const next = columnTasks[overIdx]?.position ?? prev + 2000;
        newPosition = (prev + next) / 2;
      }
    }

    moveTaskOptimistic(activeId, newStatusId!, newPosition);

    // Persist to Supabase
    const supabase = createClient();
    await supabase
      .from("tasks")
      .update({ status_id: newStatusId, position: newPosition })
      .eq("id", activeId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 h-full overflow-x-auto pb-6 pt-5 px-6">
        {tasksByStatus.map(({ status, tasks: colTasks }) => (
          <StatusColumn
            key={status.id}
            status={status}
            tasks={colTasks}
            onAddTask={onAddTask}
          />
        ))}

        {/* Add column button */}
        <div className="shrink-0 w-72">
          <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all text-sm">
            <Plus className="h-4 w-4" />
            Adicionar coluna
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
