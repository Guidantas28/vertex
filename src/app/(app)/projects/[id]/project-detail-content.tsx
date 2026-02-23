"use client";

import { useEffect, useState } from "react";
import { ProjectHeader } from "@/components/projects/project-header";
import { BoardView } from "@/components/projects/views/board-view";
import { ListView } from "@/components/projects/views/list-view";
import { GanttView } from "@/components/projects/views/gantt-view";
import { CalendarView } from "@/components/projects/views/calendar-view";
import { TimelineView } from "@/components/projects/views/timeline-view";
import { TaskDetail } from "@/components/projects/task-detail";
import { TaskForm } from "@/components/projects/task-form";
import { useProjectsStore } from "@/stores/projects.store";
import type {
  Project,
  TaskStatus,
  TaskWithRelations,
  TaskLabel,
  ProjectMember,
} from "@/types/database";

interface ProjectDetailContentProps {
  project: Project;
  statuses: TaskStatus[];
  initialTasks: TaskWithRelations[];
  labels: TaskLabel[];
  members: ProjectMember[];
}

export function ProjectDetailContent({
  project,
  statuses,
  initialTasks,
  labels,
  members,
}: ProjectDetailContentProps) {
  const {
    currentView,
    setCurrentProject,
    setStatuses,
    setTasks,
    setLabels,
  } = useProjectsStore();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [defaultStatusId, setDefaultStatusId] = useState<string | undefined>();

  useEffect(() => {
    setCurrentProject(project);
    setStatuses(statuses);
    setTasks(initialTasks);
    setLabels(labels);
  }, [project, statuses, initialTasks, labels, setCurrentProject, setStatuses, setTasks, setLabels]);

  const handleAddTask = (statusId?: string) => {
    setDefaultStatusId(statusId);
    setShowTaskForm(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProjectHeader
        projectName={project.name}
        projectColor={project.color}
        projectIcon={project.icon}
        members={members}
        labels={labels}
        onAddTask={() => handleAddTask()}
      />

      <div className="flex-1 overflow-hidden">
        {currentView === "board" && <BoardView onAddTask={handleAddTask} />}
        {currentView === "list" && <ListView onAddTask={handleAddTask} />}
        {currentView === "gantt" && <GanttView />}
        {currentView === "calendar" && <CalendarView />}
        {currentView === "timeline" && <TimelineView />}
      </div>

      <TaskDetail />

      {showTaskForm && (
        <TaskForm
          projectId={project.id}
          defaultStatusId={defaultStatusId}
          statuses={statuses}
          onClose={() => {
            setShowTaskForm(false);
            setDefaultStatusId(undefined);
          }}
        />
      )}
    </div>
  );
}
