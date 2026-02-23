import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectDetailContent } from "./project-detail-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [projectRes, statusesRes, tasksRes, labelsRes, membersRes] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase
        .from("task_statuses")
        .select("*")
        .eq("project_id", id)
        .order("position"),
      supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id)
        .is("parent_task_id", null)
        .order("position"),
      supabase
        .from("task_labels")
        .select("*")
        .eq("project_id", id),
      supabase
        .from("project_members")
        .select("*")
        .eq("project_id", id),
    ]);

  if (projectRes.error || !projectRes.data) {
    notFound();
  }

  // Fetch label assignments to enrich tasks
  const taskIds = (tasksRes.data ?? []).map((t) => t.id);
  let labelAssignments: { task_id: string; label_id: string }[] = [];
  if (taskIds.length > 0) {
    const { data: assignments } = await supabase
      .from("task_label_assignments")
      .select("task_id, label_id")
      .in("task_id", taskIds);
    labelAssignments = assignments ?? [];
  }

  const labelsById = Object.fromEntries(
    (labelsRes.data ?? []).map((l) => [l.id, l])
  );

  // Fetch assignee profiles
  const assigneeIds = [
    ...new Set((tasksRes.data ?? []).map((t) => t.assignee_id).filter(Boolean)),
  ] as string[];
  let profilesMap: Record<string, { id: string; full_name: string; avatar_url: string | null }> = {};
  if (assigneeIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", assigneeIds);
    profilesMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  }

  const tasks = (tasksRes.data ?? []).map((task) => ({
    ...task,
    assignee: task.assignee_id ? (profilesMap[task.assignee_id] ?? null) : null,
    labels: labelAssignments
      .filter((a) => a.task_id === task.id)
      .map((a) => labelsById[a.label_id])
      .filter(Boolean),
  }));

  return (
    <ProjectDetailContent
      project={projectRes.data}
      statuses={statusesRes.data ?? []}
      initialTasks={tasks as unknown as import("@/types/database").TaskWithRelations[]}
      labels={labelsRes.data ?? []}
      members={membersRes.data ?? []}
    />
  );
}
