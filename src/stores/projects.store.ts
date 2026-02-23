import { create } from "zustand";
import type {
  Project,
  TaskStatus,
  TaskWithRelations,
  TaskLabel,
} from "@/types/database";

export type ProjectView = "board" | "list" | "gantt" | "calendar" | "timeline";

export interface TaskFilters {
  assignee?: string;
  priority?: string[];
  labels?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

interface ProjectsStore {
  // Current project data
  currentProject: Project | null;
  statuses: TaskStatus[];
  tasks: TaskWithRelations[];
  labels: TaskLabel[];

  // View state
  currentView: ProjectView;

  // Selected task for detail panel
  selectedTaskId: string | null;

  // Filters
  filters: TaskFilters;

  // Loading states
  isLoading: boolean;
  isTaskDetailOpen: boolean;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  setStatuses: (statuses: TaskStatus[]) => void;
  setTasks: (tasks: TaskWithRelations[]) => void;
  setLabels: (labels: TaskLabel[]) => void;
  setCurrentView: (view: ProjectView) => void;
  setSelectedTaskId: (id: string | null) => void;
  openTaskDetail: (id: string) => void;
  closeTaskDetail: () => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setIsLoading: (loading: boolean) => void;

  // Optimistic updates
  updateTaskOptimistic: (taskId: string, updates: Partial<TaskWithRelations>) => void;
  moveTaskOptimistic: (taskId: string, newStatusId: string, newPosition: number) => void;
  addTaskOptimistic: (task: TaskWithRelations) => void;
  removeTaskOptimistic: (taskId: string) => void;
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  currentProject: null,
  statuses: [],
  tasks: [],
  labels: [],
  currentView: "board",
  selectedTaskId: null,
  filters: {},
  isLoading: false,
  isTaskDetailOpen: false,

  setCurrentProject: (project) => set({ currentProject: project }),
  setStatuses: (statuses) => set({ statuses }),
  setTasks: (tasks) => set({ tasks }),
  setLabels: (labels) => set({ labels }),
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  openTaskDetail: (id) =>
    set({ selectedTaskId: id, isTaskDetailOpen: true }),

  closeTaskDetail: () =>
    set({ selectedTaskId: null, isTaskDetailOpen: false }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  updateTaskOptimistic: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),

  moveTaskOptimistic: (taskId, newStatusId, newPosition) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status_id: newStatusId, position: newPosition }
          : t
      ),
    })),

  addTaskOptimistic: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  removeTaskOptimistic: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
}));

// Selector: get filtered tasks
export const useFilteredTasks = () => {
  const { tasks, filters } = useProjectsStore();

  return tasks.filter((task) => {
    if (task.parent_task_id) return false; // exclude subtasks from main views

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q)) return false;
    }

    if (filters.assignee && task.assignee_id !== filters.assignee) return false;

    if (filters.priority?.length && !filters.priority.includes(task.priority))
      return false;

    if (filters.labels?.length) {
      const taskLabelIds = task.labels?.map((l) => l.id) ?? [];
      if (!filters.labels.some((lId) => taskLabelIds.includes(lId)))
        return false;
    }

    return true;
  });
};

// Selector: get tasks grouped by status
export const useTasksByStatus = () => {
  const { statuses } = useProjectsStore();
  const tasks = useFilteredTasks();

  return statuses
    .sort((a, b) => a.position - b.position)
    .map((status) => ({
      status,
      tasks: tasks
        .filter((t) => t.status_id === status.id)
        .sort((a, b) => a.position - b.position),
    }));
};
