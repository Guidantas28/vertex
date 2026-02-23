"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProjectsStore, useFilteredTasks } from "@/stores/projects.store";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#6366f1",
  low: "#94a3b8",
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarView() {
  const tasks = useFilteredTasks();
  const { openTaskDetail } = useProjectsStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        const key = format(new Date(task.due_date), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  return (
    <div className="flex flex-col h-full px-6 pt-5 pb-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold capitalize text-foreground">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 rounded-lg text-xs font-medium hover:bg-accent transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border-l border-t border-border rounded-xl overflow-hidden">
        {calDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay[key] ?? [];
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={key}
              className={cn(
                "border-r border-b border-border min-h-[100px] p-2 flex flex-col",
                !isCurrentMonth && "bg-muted/20",
                isToday(day) && "bg-primary/5"
              )}
            >
              {/* Day number */}
              <div
                className={cn(
                  "text-xs font-medium mb-1.5 h-6 w-6 flex items-center justify-center rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground",
                  !isCurrentMonth && "text-muted-foreground/50",
                  !isToday(day) && isCurrentMonth && "text-foreground"
                )}
              >
                {format(day, "d")}
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => openTaskDetail(task.id)}
                    className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate transition-all hover:brightness-110"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                      color: PRIORITY_COLORS[task.priority],
                      borderLeft: `2px solid ${PRIORITY_COLORS[task.priority]}`,
                    }}
                    title={task.title}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayTasks.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
