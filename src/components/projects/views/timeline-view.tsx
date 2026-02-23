"use client";

import { useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  MessageSquare,
  Tag,
  User,
  Calendar,
  AlertCircle,
  PlusCircle,
  Clock,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useProjectsStore } from "@/stores/projects.store";
import type { TaskActivity, Profile } from "@/types/database";

type ActivityWithUser = TaskActivity & { user?: Profile | null };

const ACTIVITY_CONFIG = {
  task_created: { icon: PlusCircle, color: "text-green-500", bg: "bg-green-500/10", label: "criou a tarefa" },
  task_updated: { icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", label: "atualizou a tarefa" },
  status_changed: { icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-500/10", label: "mudou o status" },
  priority_changed: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10", label: "mudou a prioridade" },
  assignee_changed: { icon: User, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "alterou o responsável" },
  due_date_changed: { icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", label: "alterou o prazo" },
  comment_added: { icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-500/10", label: "comentou" },
  task_completed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "concluiu a tarefa" },
  subtask_added: { icon: PlusCircle, color: "text-blue-500", bg: "bg-blue-500/10", label: "adicionou subtarefa" },
  label_added: { icon: Tag, color: "text-pink-500", bg: "bg-pink-500/10", label: "adicionou label" },
  label_removed: { icon: Tag, color: "text-red-500", bg: "bg-red-500/10", label: "removeu label" },
  time_logged: { icon: Clock, color: "text-teal-500", bg: "bg-teal-500/10", label: "registrou tempo" },
};

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";
  return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
}

export function TimelineView() {
  const { currentProject } = useProjectsStore();
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) return;

    const load = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("task_activities")
        .select("*")
        .eq("project_id", currentProject.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (data && data.length > 0) {
        // Fetch user profiles
        const userIds = [...new Set(data.map((a) => a.user_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds as string[]);

        const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
        setActivities(
          data.map((a) => ({
            ...a,
            user: a.user_id ? profileMap[a.user_id] ?? null : null,
          }))
        );
      } else {
        setActivities([]);
      }
      setIsLoading(false);
    };

    load();
  }, [currentProject]);

  // Group by date
  const grouped = activities.reduce<Record<string, ActivityWithUser[]>>((acc, activity) => {
    const key = format(new Date(activity.created_at), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(activity);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Carregando atividades...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-3xl">
          📋
        </div>
        <h3 className="font-semibold text-foreground mb-1">Nenhuma atividade ainda</h3>
        <p className="text-sm text-muted-foreground">
          As atividades do projeto aparecerão aqui conforme a equipe trabalha
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 max-w-2xl">
      {Object.entries(grouped).map(([date, dayActivities]) => (
        <div key={date} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {formatGroupDate(date)}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {dayActivities.map((activity) => {
              const config = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.task_updated;
              const Icon = config.icon;

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">
                            {activity.user?.full_name?.slice(0, 2).toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {activity.user?.full_name ?? "Alguém"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {config.label}
                      </span>
                    </div>

                    {(activity.old_value || activity.new_value) && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {activity.old_value && (
                          <span className="px-2 py-0.5 rounded bg-muted line-through">
                            {activity.old_value}
                          </span>
                        )}
                        {activity.old_value && activity.new_value && (
                          <span>→</span>
                        )}
                        {activity.new_value && (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {activity.new_value}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] text-muted-foreground/70 mt-1 block">
                      {format(new Date(activity.created_at), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
