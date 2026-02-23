"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, UsersRound, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Team } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app.store";
import { toast } from "sonner";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface TeamsContentProps {
  initialTeams: Team[];
}

export function TeamsContent({ initialTeams }: TeamsContentProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { organization } = useAppStore();

  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization) return;
    setLoading(true);
    const slug = slugify(name) || "equipe";
    const { data, error } = await supabase
      .from("teams")
      .insert({ name: name.trim(), slug, description: description.trim() || null, organization_id: organization.id })
      .select("id, name, slug, description, organization_id, created_at, updated_at")
      .single();

    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("Já existe uma equipe com esse nome/slug. Use outro nome.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    if (data) {
      setTeams((prev) => [...prev, data as Team]);
      setShowCreate(false);
      setName("");
      setDescription("");
      toast.success("Equipe criada.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Equipes"
        description="Organize pessoas em equipes e defina permissões"
        actions={
          <Button variant="gradient" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Nova equipe
          </Button>
        }
      />

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        {teams.length === 0 && !showCreate ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-4">
                <UsersRound className="h-7 w-7 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Nenhuma equipe ainda</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Crie equipes para organizar sua organização. Uma pessoa pode participar de várias equipes com papéis diferentes.
              </p>
              <Button variant="gradient" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                Criar primeira equipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {teams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="transition-all hover:border-teal-500/30 hover:shadow-glow-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                      <UsersRound className="h-5 w-5 text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{team.name}</p>
                      {team.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {showCreate && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Nova equipe</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Nome da equipe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Comercial, Suporte"
                  required
                />
                <Input
                  label="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição da equipe"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setName("");
                      setDescription("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gradient" disabled={loading}>
                    {loading ? "Criando…" : "Criar equipe"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
