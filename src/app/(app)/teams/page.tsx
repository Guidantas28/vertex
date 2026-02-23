import { createClient } from "@/lib/supabase/server";
import { TeamsContent } from "./teams-content";
import type { Team } from "@/types/database";

export const metadata = {
  title: "Equipes — Vertex",
  description: "Gerencie equipes e permissões",
};

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  return <TeamsContent initialTeams={(teams ?? []) as Team[]} />;
}
