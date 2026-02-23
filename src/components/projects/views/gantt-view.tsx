"use client";

import { useState, useMemo } from "react";
import {
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  isToday,
  isWeekend,
  differenceInDays,
  isBefore,
  isAfter,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge } from "../priority-badge";
import { useProjectsStore, useFilteredTasks } from "@/stores/projects.store";
import { cn } from "@/lib/utils";

type Scale = "week" | "month";

const PRIORITY_COLORS = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#94a3b8",
};

const ROW_HEIGHT = 44;
const LEFT_WIDTH = 280;
const DAY_WIDTH_WEEK = 40;
const DAY_WIDTH_MONTH = 20;

export function GanttView() {
  const tasks = useFilteredTasks();
  const { openTaskDetail, statuses } = useProjectsStore();
  const [scale, setScale] = useState<Scale>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayWidth = scale === "week" ? DAY_WIDTH_WEEK : DAY_WIDTH_MONTH;

  // Date range
  const rangeStart = useMemo(() => {
    if (scale === "week") return startOfWeek(currentDate, { weekStartsOn: 1 });
    return startOfMonth(addMonths(currentDate, -1));
  }, [currentDate, scale]);

  const rangeEnd = useMemo(() => {
    if (scale === "week") return endOfWeek(addDays(currentDate, 27), { weekStartsOn: 1 });
    return endOfMonth(addMonths(currentDate, 2));
  }, [currentDate, scale]);

  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart, rangeEnd]
  );

  const totalWidth = days.length * dayWidth;

  // Group days by week/month for header
  const headerGroups = useMemo(() => {
    if (scale === "week") {
      return eachWeekOfInterval({ start: rangeStart, end: rangeEnd }, { weekStartsOn: 1 }).map(
        (weekStart) => ({
          label: `Semana de ${format(weekStart, "dd MMM", { locale: ptBR })}`,
          days: eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(weekStart, { weekStartsOn: 1 }),
          }).filter((d) => !isBefore(d, rangeStart) && !isAfter(d, rangeEnd)),
        })
      );
    }
    // month scale: group by month
    const months: { label: string; days: Date[] }[] = [];
    let cur = rangeStart;
    while (!isAfter(cur, rangeEnd)) {
      const monthEnd = endOfMonth(cur);
      months.push({
        label: format(cur, "MMMM yyyy", { locale: ptBR }),
        days: eachDayOfInterval({
          start: cur,
          end: isBefore(monthEnd, rangeEnd) ? monthEnd : rangeEnd,
        }),
      });
      cur = addDays(monthEnd, 1);
    }
    return months;
  }, [rangeStart, rangeEnd, scale]);

  const navigate = (dir: 1 | -1) => {
    setCurrentDate((d) =>
      scale === "week" ? addDays(d, dir * 28) : addMonths(d, dir * 3)
    );
  };

  const getTaskBar = (task: typeof tasks[0]) => {
    if (!task.start_date && !task.due_date) return null;

    const start = task.start_date ? new Date(task.start_date) : new Date(task.due_date!);
    const end = task.due_date ? new Date(task.due_date) : new Date(task.start_date!);

    if (isAfter(start, rangeEnd) || isBefore(end, rangeStart)) return null;

    const clampedStart = isBefore(start, rangeStart) ? rangeStart : start;
    const clampedEnd = isAfter(end, rangeEnd) ? rangeEnd : end;

    const left = differenceInDays(clampedStart, rangeStart) * dayWidth;
    const width = Math.max((differenceInDays(clampedEnd, clampedStart) + 1) * dayWidth, dayWidth);

    return { left, width, color: PRIORITY_COLORS[task.priority] };
  };

  const statusMap = Object.fromEntries(statuses.map((s) => [s.id, s]));
  const todayOffset = differenceInDays(new Date(), rangeStart) * dayWidth;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 rounded-lg text-xs font-medium hover:bg-accent transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => navigate(1)}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setScale("week")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              scale === "week" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <ZoomIn className="h-3.5 w-3.5 inline mr-1" />
            Semana
          </button>
          <button
            onClick={() => setScale("month")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              scale === "month" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <ZoomOut className="h-3.5 w-3.5 inline mr-1" />
            Mês
          </button>
        </div>
      </div>

      {/* Gantt grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex" style={{ minWidth: LEFT_WIDTH + totalWidth }}>
          {/* Fixed left panel */}
          <div className="shrink-0 sticky left-0 z-20 bg-card border-r border-border" style={{ width: LEFT_WIDTH }}>
            {/* Left header */}
            <div className="h-[64px] flex items-end px-4 pb-2 border-b border-border bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tarefa
              </span>
            </div>

            {/* Task labels */}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                style={{ height: ROW_HEIGHT }}
                onClick={() => openTaskDetail(task.id)}
              >
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarImage src={task.assignee?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[9px]">
                    {task.assignee?.full_name?.slice(0, 2).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                  {task.status_id && statusMap[task.status_id] && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: statusMap[task.status_id].color }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {statusMap[task.status_id].name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-auto shrink-0">
                  <PriorityBadge priority={task.priority} showLabel={false} />
                </div>
              </div>
            ))}
          </div>

          {/* Timeline panel */}
          <div className="flex-1 overflow-hidden relative">
            {/* Timeline header - two rows */}
            <div className="sticky top-0 z-10 bg-card border-b border-border">
              {/* Month/Week labels */}
              <div className="flex border-b border-border/50" style={{ height: 32 }}>
                {headerGroups.map((group, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-start pl-3 border-r border-border/30 shrink-0"
                    style={{ width: group.days.length * dayWidth }}
                  >
                    <span className="text-[11px] font-semibold text-muted-foreground capitalize truncate">
                      {group.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Day numbers */}
              <div className="flex" style={{ height: 32 }}>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "flex items-center justify-center shrink-0 border-r border-border/30 text-[11px]",
                      isToday(day) && "bg-primary/10 text-primary font-bold",
                      isWeekend(day) && !isToday(day) && "text-muted-foreground/50 bg-muted/20",
                      !isToday(day) && !isWeekend(day) && "text-muted-foreground"
                    )}
                    style={{ width: dayWidth }}
                  >
                    {scale === "week"
                      ? format(day, "EEE dd", { locale: ptBR })
                      : format(day, "d")}
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            <div className="relative" style={{ width: totalWidth }}>
              {/* Today line */}
              {todayOffset >= 0 && todayOffset <= totalWidth && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary/60 z-10"
                  style={{ left: todayOffset + dayWidth / 2 }}
                />
              )}

              {/* Grid columns */}
              {days.map((day, i) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "absolute top-0 bottom-0 border-r border-border/20",
                    isWeekend(day) && "bg-muted/10"
                  )}
                  style={{ left: i * dayWidth, width: dayWidth }}
                />
              ))}

              {/* Task bars */}
              {tasks.map((task, rowIdx) => {
                const bar = getTaskBar(task);
                return (
                  <div
                    key={task.id}
                    className="absolute flex items-center"
                    style={{
                      top: rowIdx * ROW_HEIGHT,
                      height: ROW_HEIGHT,
                      width: totalWidth,
                    }}
                  >
                    <div className="w-full h-px bg-border/30 absolute" />
                    {bar && (
                      <div
                        className="absolute h-6 rounded-md flex items-center px-2 cursor-pointer hover:brightness-110 transition-all group/bar overflow-hidden"
                        style={{
                          left: bar.left,
                          width: bar.width,
                          backgroundColor: `${bar.color}25`,
                          border: `1px solid ${bar.color}60`,
                        }}
                        onClick={() => openTaskDetail(task.id)}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-l-md opacity-60"
                          style={{
                            width: task.completed_at ? "100%" : "0%",
                            backgroundColor: bar.color,
                          }}
                        />
                        <span
                          className="relative z-10 text-[11px] font-medium truncate"
                          style={{ color: bar.color }}
                        >
                          {task.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty row spacer */}
              <div style={{ height: tasks.length * ROW_HEIGHT }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
