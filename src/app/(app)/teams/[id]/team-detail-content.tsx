"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UsersRound,
  Crown,
  User,
  Eye,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Team, TeamMember, TeamMemberRole, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type TeamMemberWithProfile = TeamMember & {
  profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

const ROLE_LABELS: Record<TeamMemberRole, string> = {
  lead: "Líder",
  member: "Membro",
  viewer: "Visualizador",
};

const ROLE_ICONS: Record<TeamMemberRole, React.ElementType> = {
  lead: Crown,
  member: User,
  viewer: Eye,
};

interface TeamDetailContentProps {
  team: Team;
  members: TeamMemberWithProfile[];
  availableProfiles: Pick<Profile, "id" | "full_name" | "avatar_url">[];
}

export function TeamDetailContent({
  team,
  members: initialMembers,
  availableProfiles,
}: TeamDetailContentProps) {
  const [members, setMembers] = useState<TeamMemberWithProfile[]>(initialMembers);
  const [availableProfilesState, setAvailableProfilesState] = useState(availableProfiles);
  const [adding, setAdding] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("member");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canAddMore = availableProfilesState.length > 0;

  const supabase = createClient();

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        profile_id: selectedProfileId,
        role: selectedRole,
      })
      .select("id, team_id, profile_id, role, created_at")
      .single();

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const profile = availableProfilesState.find((p) => p.id === selectedProfileId);
    setMembers((prev) => [
      ...prev,
      { ...data, profile: profile ?? null } as TeamMemberWithProfile,
    ]);
    setAvailableProfilesState((prev) => prev.filter((p) => p.id !== selectedProfileId));
    setAdding(false);
    setSelectedProfileId("");
    setSelectedRole("member");
    toast.success("Membro adicionado.");
  };

  const handleUpdateRole = async (memberId: string, role: TeamMemberRole) => {
    setUpdatingId(memberId);
    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("id", memberId);
    setUpdatingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
    toast.success("Permissão atualizada.");
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setRemovingId(memberId);
    const { error } = await supabase.from("team_members").delete().eq("id", memberId);
    setRemovingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (member?.profile)
      setAvailableProfilesState((prev) => [...prev, member.profile!]);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Membro removido.");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={team.name}
        description={team.description ?? "Membros e permissões da equipe"}
        actions={
          <Link href="/teams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <UsersRound className="h-6 w-6 text-teal-500" />
              </div>
              <div>
                <CardTitle>{team.name}</CardTitle>
                {team.description && (
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    {team.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Membros</h4>
              {canAddMore && !adding && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdding(true)}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              )}
            </div>

            {adding && (
              <form
                onSubmit={handleAddMember}
                className="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Pessoa
                  </label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selecione</option>
                    {availableProfilesState.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || "Sem nome"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[140px]">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Permissão
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as TeamMemberRole)
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {(Object.keys(ROLE_LABELS) as TeamMemberRole[]).map(
                      (r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdding(false);
                      setSelectedProfileId("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="gradient"
                    disabled={loading || !selectedProfileId}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <ul className="divide-y divide-border">
              {members.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum membro ainda. Adicione pessoas da sua organização.
                </li>
              ) : (
                members.map((m) => {
                  const RoleIcon = ROLE_ICONS[m.role];
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {m.profile
                              ? getInitials(m.profile.full_name || "?")
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {m.profile?.full_name ?? "Sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {ROLE_LABELS[m.role]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleUpdateRole(m.id, e.target.value as TeamMemberRole)
                          }
                          disabled={updatingId === m.id}
                          className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {(Object.keys(ROLE_LABELS) as TeamMemberRole[]).map(
                            (r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </option>
                            )
                          )}
                        </select>
                        {updatingId === m.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          disabled={removingId === m.id}
                          onClick={() => handleRemoveMember(m.id)}
                        >
                          {removingId === m.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Sobre as permissões
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>
              <strong className="text-foreground">Líder:</strong> pode editar a equipe e gerenciar membros (adicionar, remover, alterar permissões).
            </li>
            <li>
              <strong className="text-foreground">Membro:</strong> acesso completo ao que a equipe enxerga.
            </li>
            <li>
              <strong className="text-foreground">Visualizador:</strong> somente leitura no contexto da equipe.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
