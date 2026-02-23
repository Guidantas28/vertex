"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, CheckCircle2, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ProjectWithStats } from "@/types/database";

const STATUS_LABELS = {
  active: "Ativo",
  archived: "Arquivado",
  completed: "Concluído",
} as const;

const STATUS_VARIANTS = {
  active: "success",
  archived: "default",
  completed: "info",
} as const;

interface ProjectCardProps {
  project: ProjectWithStats;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const completedCount = project._count?.completed ?? 0;
  const totalCount = project._count?.tasks ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer border border-border hover:border-primary/30">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
            >
              <span style={{ color: project.color }}>
                {project.icon === "folder" ? "📁" : project.icon}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[200px]">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={STATUS_VARIANTS[project.status] as "success" | "default" | "info"} className="text-[10px]">
              {STATUS_LABELS[project.status]}
            </Badge>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-all"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {completedCount}/{totalCount} tarefas
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {project.members?.slice(0, 4).map((member, i) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-card" style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <AvatarFallback className="text-[9px]">
                  {member.profile_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {(project.members?.length ?? 0) > 4 && (
              <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
                <Users className="h-3 w-3" />
                +{(project.members?.length ?? 0) - 4}
              </span>
            )}
          </div>

          {project.due_date && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              new Date(project.due_date) < new Date()
                ? "text-destructive"
                : "text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(project.due_date), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
