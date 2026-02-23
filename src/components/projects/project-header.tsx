"use client";

import Link from "next/link";
import { ChevronRight, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ViewSwitcher } from "./view-switcher";
import { TaskFilters } from "./task-filters";
import { useProjectsStore } from "@/stores/projects.store";
import type { ProjectView } from "@/stores/projects.store";
import type { TaskLabel, ProjectMember } from "@/types/database";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  projectName: string;
  projectColor: string;
  projectIcon: string;
  members: ProjectMember[];
  labels: TaskLabel[];
  onAddTask: () => void;
}

export function ProjectHeader({
  projectName,
  projectColor,
  projectIcon,
  members,
  labels,
  onAddTask,
}: ProjectHeaderProps) {
  const { currentView, setCurrentView } = useProjectsStore();

  return (
    <div className="border-b border-border bg-card/50 px-6 py-3 space-y-3">
      {/* Breadcrumb + Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Projetos
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: `${projectColor}25` }}
            >
              <span>{projectIcon === "folder" ? "📁" : projectIcon}</span>
            </div>
            <h1 className="font-semibold text-foreground truncate text-base">
              {projectName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Member avatars */}
          <div className="flex items-center">
            {members.slice(0, 5).map((m, i) => (
              <Avatar
                key={m.id}
                className="h-7 w-7 border-2 border-card"
                style={{ marginLeft: i > 0 ? -10 : 0 }}
              >
                <AvatarFallback className="text-[10px]">
                  {m.profile_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            <button className={cn(
              "h-7 w-7 rounded-full border-2 border-dashed border-border text-muted-foreground",
              "flex items-center justify-center hover:border-primary hover:text-primary transition-colors",
              members.length > 0 && "ml-[-10px]"
            )}>
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5">
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          <Button variant="gradient" size="sm" onClick={onAddTask}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* View switcher + Filters */}
      <div className="flex items-center gap-3 relative">
        <ViewSwitcher
          current={currentView}
          onChange={(v: ProjectView) => setCurrentView(v)}
        />
        <div className="flex-1" />
        <TaskFilters labels={labels} />
      </div>
    </div>
  );
}
