import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TeamDetailContent } from "./team-detail-content";
import type { Team, TeamMember, Profile } from "@/types/database";

type TeamMemberWithProfile = TeamMember & {
  profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("name")
    .eq("id", id)
    .single();
  return {
    title: team ? `${team.name} — Equipes` : "Equipe — Vertex",
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();

  if (teamError || !team) notFound();

  const { data: members } = await supabase
    .from("team_members")
    .select("id, team_id, profile_id, role, created_at")
    .eq("team_id", id);

  const profileIds = (members ?? []).map((m) => m.profile_id);
  const { data: profiles } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", profileIds)
      : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );
  const membersWithProfile: TeamMemberWithProfile[] = (members ?? []).map(
    (m) => ({
      ...m,
      profile: profileMap.get(m.profile_id) ?? null,
    })
  );

  const { data: orgProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("organization_id", team.organization_id);

  const existingMemberIds = new Set(membersWithProfile.map((m) => m.profile_id));
  const availableProfiles = (orgProfiles ?? []).filter(
    (p) => !existingMemberIds.has(p.id)
  );

  return (
    <TeamDetailContent
      team={team as Team}
      members={membersWithProfile}
      availableProfiles={availableProfiles as Pick<Profile, "id" | "full_name" | "avatar_url">[]}
    />
  );
}
