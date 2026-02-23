-- ============================================
-- Vertex - Teams (Equipes) & Permissioning
-- ============================================
-- Uma pessoa pode fazer parte de várias equipes.
-- Cada participação tem um papel (lead, member, viewer) para permissionamento.

-- ============================================
-- TEAMS
-- ============================================
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  unique(organization_id, slug)
);

create index teams_organization_id_idx on public.teams(organization_id);
create index teams_slug_idx on public.teams(organization_id, slug);

-- ============================================
-- TEAM MEMBERS (perfil pode estar em várias equipes, com papel por equipe)
-- ============================================
create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('lead','member','viewer')),
  unique(team_id, profile_id)
);

comment on column public.team_members.role is 'lead: gerente da equipe (pode editar equipe e membros); member: acesso completo; viewer: somente leitura';

create index team_members_team_id_idx on public.team_members(team_id);
create index team_members_profile_id_idx on public.team_members(profile_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create trigger teams_updated_at before update on public.teams
  for each row execute function public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Helper: usuário é líder desta equipe?
create or replace function public.is_team_lead(p_team_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and profile_id = p_user_id and role = 'lead'
  );
$$;

-- Helper: usuário pode gerenciar esta equipe? (owner/admin da org ou líder da equipe)
create or replace function public.can_manage_team(p_team_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.teams t
    where t.id = p_team_id
      and (
        (select organization_id from public.profiles where id = p_user_id) = t.organization_id
        and (
          exists (select 1 from public.profiles where id = p_user_id and role in ('owner','admin'))
          or public.is_team_lead(p_team_id, p_user_id)
        )
      )
  );
$$;

-- Teams: membros da org podem ver; criar qualquer membro; editar/apagar owner/admin ou líder da equipe
create policy "teams_select_org" on public.teams
  for select using (organization_id = public.get_user_org_id());

create policy "teams_insert_org" on public.teams
  for insert with check (organization_id = public.get_user_org_id());

create policy "teams_update_manage" on public.teams
  for update using (public.can_manage_team(id));

create policy "teams_delete_manage" on public.teams
  for delete using (public.can_manage_team(id));

-- Team members: ver quem está na equipe (membros da org); gerenciar só quem pode gerenciar a equipe
create policy "team_members_select_org" on public.team_members
  for select using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and t.organization_id = public.get_user_org_id()
    )
  );

create policy "team_members_insert_manage" on public.team_members
  for insert with check (public.can_manage_team(team_id));

create policy "team_members_update_manage" on public.team_members
  for update using (public.can_manage_team(team_id));

create policy "team_members_delete_manage" on public.team_members
  for delete using (public.can_manage_team(team_id));
