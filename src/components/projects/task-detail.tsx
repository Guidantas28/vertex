"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X,
  Calendar,
  User,
  Clock,
  Tag,
  MessageSquare,
  CheckSquare,
  Play,
  Pause,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  Flag,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge, PRIORITY_CONFIG } from "./priority-badge";
import { useProjectsStore } from "@/stores/projects.store";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app.store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  TaskWithRelations,
  TaskComment,
  TimeEntry,
  TaskStatus,
} from "@/types/database";

type Profile = { id: string; full_name: string; avatar_url: string | null };

export function TaskDetail() {
  const { selectedTaskId, isTaskDetailOpen, closeTaskDetail, tasks, statuses, updateTaskOptimistic } =
    useProjectsStore();
  const { profile } = useAppStore();

  const task = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const [comments, setComments] = useState<(TaskComment & { user?: Profile })[]>([]);
  const [subtasks, setSubtasks] = useState<TaskWithRelations[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [orgMembers, setOrgMembers] = useState<Profile[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"comments" | "subtasks" | "time" | "activity">("comments");

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadTaskData = useCallback(async () => {
    if (!task) return;
    const supabase = createClient();

    const [commentsRes, subtasksRes, timeRes] = await Promise.all([
      supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("tasks")
        .select("*")
        .eq("parent_task_id", task.id)
        .order("position"),
      supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", task.id)
        .order("started_at", { ascending: false }),
    ]);

    // Fetch comment authors
    if (commentsRes.data?.length) {
      const userIds = [...new Set(commentsRes.data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      setComments(commentsRes.data.map((c) => ({ ...c, user: profileMap[c.user_id] })));
    } else {
      setComments([]);
    }

    setSubtasks((subtasksRes.data ?? []) as TaskWithRelations[]);
    setTimeEntries(timeRes.data ?? []);
  }, [task]);

  useEffect(() => {
    if (task && isTaskDetailOpen) {
      loadTaskData();
    }
  }, [task, isTaskDetailOpen, loadTaskData]);

  // Load org members for assignee dropdown
  useEffect(() => {
    if (!isTaskDetailOpen) return;
    const load = async () => {
      const supabase = createClient();
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .not("organization_id", "is", null);
      setOrgMembers(p ?? []);
    };
    load();
  }, [isTaskDetailOpen]);

  if (!isTaskDetailOpen || !task) return null;

  const handleFieldUpdate = async (field: string, value: unknown) => {
    const supabase = createClient();
    updateTaskOptimistic(task.id, { [field]: value });
    await supabase.from("tasks").update({ [field]: value }).eq("id", task.id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !profile) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("task_comments")
      .insert({ task_id: task.id, user_id: profile.id, content: newComment.trim() })
      .select()
      .single();
    if (!error && data) {
      setComments((prev) => [
        ...prev,
        { ...data, user: { id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url } },
      ]);
      setNewComment("");

      // Log activity
      await supabase.from("task_activities").insert({
        task_id: task.id,
        project_id: task.project_id,
        user_id: profile.id,
        type: "comment_added",
      });
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !profile) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: task.project_id,
        parent_task_id: task.id,
        title: newSubtask.trim(),
        created_by: profile.id,
        position: Date.now(),
      })
      .select()
      .single();
    if (!error && data) {
      setSubtasks((prev) => [...prev, data as TaskWithRelations]);
      setNewSubtask("");
    }
  };

  const handleToggleSubtask = async (subtask: TaskWithRelations) => {
    const supabase = createClient();
    const completedAt = subtask.completed_at ? null : new Date().toISOString();
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtask.id ? { ...s, completed_at: completedAt } : s))
    );
    await supabase.from("tasks").update({ completed_at: completedAt }).eq("id", subtask.id);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setTimerStart(new Date());
    setTimerSeconds(0);
  };

  const handleStopTimer = async () => {
    if (!timerStart || !profile) return;
    setIsTimerRunning(false);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - timerStart.getTime()) / 60000);

    const supabase = createClient();
    const { data } = await supabase
      .from("time_entries")
      .insert({
        task_id: task.id,
        user_id: profile.id,
        started_at: timerStart.toISOString(),
        ended_at: endTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .select()
      .single();

    if (data) {
      setTimeEntries((prev) => [data, ...prev]);
      toast.success(`${durationMinutes} minutos registrados!`);
    }
    setTimerSeconds(0);
    setTimerStart(null);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration_minutes ?? 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const completedSubtasks = subtasks.filter((s) => s.completed_at).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={closeTaskDetail}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleFieldUpdate("completed_at", task.completed_at ? null : new Date().toISOString())}
              className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                task.completed_at
                  ? "bg-green-500 border-green-500"
                  : "border-border hover:border-green-500"
              )}
            >
              {task.completed_at && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Detalhes da Tarefa
            </span>
          </div>
          <button
            onClick={closeTaskDetail}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Title */}
          <div className="px-6 pt-5 pb-4">
            <textarea
              value={task.title}
              onChange={(e) => updateTaskOptimistic(task.id, { title: e.target.value })}
              onBlur={(e) => handleFieldUpdate("title", e.target.value)}
              className={cn(
                "w-full text-lg font-semibold text-foreground bg-transparent resize-none focus:outline-none",
                "border-b border-transparent hover:border-border focus:border-primary transition-colors pb-1",
                task.completed_at && "line-through text-muted-foreground"
              )}
              rows={2}
            />
          </div>

          {/* Meta fields */}
          <div className="px-6 pb-4 grid grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Flag className="h-3 w-3" /> Status
              </label>
              <select
                value={task.status_id ?? ""}
                onChange={(e) => handleFieldUpdate("status_id", e.target.value || null)}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sem status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <ChevronDown className="h-3 w-3" /> Prioridade
              </label>
              <select
                value={task.priority}
                onChange={(e) => handleFieldUpdate("priority", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {(["urgent", "high", "medium", "low"] as const).map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Responsável
              </label>
              <select
                value={task.assignee_id ?? ""}
                onChange={(e) => handleFieldUpdate("assignee_id", e.target.value || null)}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sem responsável</option>
                {orgMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>

            {/* Due date */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Vencimento
              </label>
              <input
                type="date"
                value={task.due_date ?? ""}
                onChange={(e) => handleFieldUpdate("due_date", e.target.value || null)}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Start date */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Início
              </label>
              <input
                type="date"
                value={task.start_date ?? ""}
                onChange={(e) => handleFieldUpdate("start_date", e.target.value || null)}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Estimate */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Estimativa (h)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={task.estimated_hours ?? ""}
                onChange={(e) => updateTaskOptimistic(task.id, { estimated_hours: e.target.value ? parseFloat(e.target.value) : null })}
                onBlur={(e) => handleFieldUpdate("estimated_hours", e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="px-6 pb-5 border-b border-border">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Descrição
            </label>
            <textarea
              value={task.description ?? ""}
              onChange={(e) => updateTaskOptimistic(task.id, { description: e.target.value })}
              onBlur={(e) => handleFieldUpdate("description", e.target.value || null)}
              placeholder="Adicione uma descrição..."
              rows={3}
              className="w-full bg-muted/20 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring border border-transparent hover:border-border focus:border-primary transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex gap-1 border-b border-border mb-4">
              {[
                { id: "comments" as const, label: `Comentários (${comments.length})`, icon: MessageSquare },
                { id: "subtasks" as const, label: `Subtarefas (${completedSubtasks}/${subtasks.length})`, icon: CheckSquare },
                { id: "time" as const, label: `Tempo (${totalHours}h)`, icon: Clock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-px",
                    activeTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Comments tab */}
            {activeTab === "comments" && (
              <div className="space-y-4 pb-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={comment.user?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {comment.user?.full_name?.slice(0, 2).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {comment.user?.full_name ?? "Usuário"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(comment.created_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1 bg-muted/30 rounded-lg px-3 py-2">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}

                {/* New comment */}
                <div className="flex gap-3 pt-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {profile?.full_name?.slice(0, 2).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleAddComment();
                        }
                      }}
                      placeholder="Adicionar comentário... (Cmd+Enter para enviar)"
                      rows={2}
                      className="flex-1 bg-muted/20 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring border border-transparent hover:border-border focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="self-end h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subtasks tab */}
            {activeTab === "subtasks" && (
              <div className="space-y-2 pb-6">
                {subtasks.length > 0 && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${subtasks.length ? (completedSubtasks / subtasks.length) * 100 : 0}%` }}
                    />
                  </div>
                )}

                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors group/sub"
                  >
                    <button
                      onClick={() => handleToggleSubtask(sub)}
                      className={cn(
                        "h-4 w-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                        sub.completed_at ? "bg-green-500 border-green-500" : "border-border"
                      )}
                    >
                      {sub.completed_at && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={cn(
                      "text-sm flex-1",
                      sub.completed_at && "line-through text-muted-foreground"
                    )}>
                      {sub.title}
                    </span>
                  </div>
                ))}

                {/* Add subtask */}
                <div className="flex gap-2 pt-2">
                  <input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                    placeholder="Adicionar subtarefa..."
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="h-9 px-3 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Time tracking tab */}
            {activeTab === "time" && (
              <div className="pb-6 space-y-4">
                {/* Timer */}
                <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Timer
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground tabular-nums">
                      {formatTimer(timerSeconds)}
                    </p>
                  </div>
                  <button
                    onClick={isTimerRunning ? handleStopTimer : handleStartTimer}
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                      isTimerRunning
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                </div>

                {/* Summary */}
                <div className="flex gap-4 text-center">
                  <div className="flex-1 bg-muted/20 rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{totalHours}h</p>
                    <p className="text-[11px] text-muted-foreground">Total registrado</p>
                  </div>
                  <div className="flex-1 bg-muted/20 rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">
                      {task.estimated_hours ? `${task.estimated_hours}h` : "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Estimativa</p>
                  </div>
                  <div className="flex-1 bg-muted/20 rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{timeEntries.length}</p>
                    <p className="text-[11px] text-muted-foreground">Registros</p>
                  </div>
                </div>

                {/* Entries */}
                {timeEntries.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Histórico
                    </p>
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {format(new Date(entry.started_at), "dd MMM, HH:mm", { locale: ptBR })}
                          </p>
                          {entry.description && (
                            <p className="text-[11px] text-muted-foreground">{entry.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {entry.duration_minutes
                            ? `${Math.floor(entry.duration_minutes / 60)}h ${entry.duration_minutes % 60}m`
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Criado em {format(new Date(task.created_at), "dd MMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.from("tasks").delete().eq("id", task.id);
              closeTaskDetail();
              toast.success("Tarefa removida");
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir tarefa
          </button>
        </div>
      </div>
    </>
  );
}
