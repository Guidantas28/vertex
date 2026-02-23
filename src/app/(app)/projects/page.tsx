import { createClient } from "@/lib/supabase/server";
import { ProjectsContent } from "./projects-content";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <ProjectsContent projects={[]} />;
  }

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      project_members(*)
    `)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  // Get task counts per project
  const projectIds = (projects ?? []).map((p) => p.id);
  const taskCounts: Record<string, { tasks: number; completed: number }> = {};

  if (projectIds.length > 0) {
    const { data: taskData } = await supabase
      .from("tasks")
      .select("project_id, completed_at")
      .in("project_id", projectIds)
      .is("parent_task_id", null);

    (taskData ?? []).forEach((t) => {
      if (!taskCounts[t.project_id]) {
        taskCounts[t.project_id] = { tasks: 0, completed: 0 };
      }
      taskCounts[t.project_id].tasks++;
      if (t.completed_at) taskCounts[t.project_id].completed++;
    });
  }

  const projectsWithStats = (projects ?? []).map((p) => ({
    ...p,
    _count: taskCounts[p.id] ?? { tasks: 0, completed: 0 },
  }));

  return <ProjectsContent projects={projectsWithStats} />;
}
