-- ============================================
-- Vertex - Projects & Task Management Schema
-- ============================================

-- ============================================
-- PROJECTS
-- ============================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#6366f1',
  icon text not null default 'folder',
  status text not null default 'active' check (status in ('active','archived','completed')),
  start_date date,
  due_date date,
  owner_id uuid references public.profiles(id) on delete set null
);

create index projects_organization_id_idx on public.projects(organization_id);
create index projects_status_idx on public.projects(status);

-- ============================================
-- PROJECT MEMBERS
-- ============================================
create table public.project_members (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','editor','viewer')),
  unique(project_id, profile_id)
);

create index project_members_project_id_idx on public.project_members(project_id);
create index project_members_profile_id_idx on public.project_members(profile_id);

-- ============================================
-- TASK STATUSES (per-project configurable columns)
-- ============================================
create table public.task_statuses (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  color text not null default '#94a3b8',
  position integer not null default 0,
  type text not null default 'todo' check (type in ('todo','in_progress','review','done','cancelled'))
);

create index task_statuses_project_id_idx on public.task_statuses(project_id);

-- ============================================
-- TASK LABELS
-- ============================================
create table public.task_labels (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  color text not null default '#94a3b8'
);

create index task_labels_project_id_idx on public.task_labels(project_id);

-- ============================================
-- TASKS
-- ============================================
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status_id uuid references public.task_statuses(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('urgent','high','medium','low')),
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  due_date date,
  start_date date,
  position float not null default 0,
  estimated_hours numeric(6,2),
  completed_at timestamptz
);

create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_status_id_idx on public.tasks(status_id);
create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index tasks_parent_task_id_idx on public.tasks(parent_task_id);
create index tasks_due_date_idx on public.tasks(due_date);

-- ============================================
-- TASK LABEL ASSIGNMENTS
-- ============================================
create table public.task_label_assignments (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.task_labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- ============================================
-- TASK COMMENTS
-- ============================================
create table public.task_comments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null
);

create index task_comments_task_id_idx on public.task_comments(task_id);

-- ============================================
-- TASK ACTIVITIES (audit log)
-- ============================================
create table public.task_activities (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in (
    'task_created','task_updated','status_changed','priority_changed',
    'assignee_changed','due_date_changed','comment_added','task_completed',
    'subtask_added','label_added','label_removed','time_logged'
  )),
  old_value text,
  new_value text,
  metadata jsonb not null default '{}'
);

create index task_activities_task_id_idx on public.task_activities(task_id);
create index task_activities_project_id_idx on public.task_activities(project_id);
create index task_activities_created_at_idx on public.task_activities(created_at desc);

-- ============================================
-- TIME ENTRIES
-- ============================================
create table public.time_entries (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  description text
);

create index time_entries_task_id_idx on public.time_entries(task_id);
create index time_entries_user_id_idx on public.time_entries(user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
create trigger projects_updated_at before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger task_comments_updated_at before update on public.task_comments
  for each row execute function public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.task_statuses enable row level security;
alter table public.task_labels enable row level security;
alter table public.tasks enable row level security;
alter table public.task_label_assignments enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_activities enable row level security;
alter table public.time_entries enable row level security;

-- Helper: check if user belongs to the same org as a project
create or replace function public.get_project_org_id(p_project_id uuid)
returns uuid language sql security definer stable as $$
  select organization_id from public.projects where id = p_project_id
$$;

-- Projects: org members can access projects of their org
create policy "projects_org_access" on public.projects
  for all using (organization_id = public.get_user_org_id());

-- Project members: org-scoped via projects
create policy "project_members_org_access" on public.project_members
  for all using (
    public.get_project_org_id(project_id) = public.get_user_org_id()
  );

-- Task statuses: org-scoped via projects
create policy "task_statuses_org_access" on public.task_statuses
  for all using (
    public.get_project_org_id(project_id) = public.get_user_org_id()
  );

-- Task labels: org-scoped via projects
create policy "task_labels_org_access" on public.task_labels
  for all using (
    public.get_project_org_id(project_id) = public.get_user_org_id()
  );

-- Tasks: org-scoped via projects
create policy "tasks_org_access" on public.tasks
  for all using (
    public.get_project_org_id(project_id) = public.get_user_org_id()
  );

-- Task label assignments: org-scoped via tasks
create policy "task_label_assignments_org_access" on public.task_label_assignments
  for all using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and public.get_project_org_id(t.project_id) = public.get_user_org_id()
    )
  );

-- Task comments: org-scoped via tasks
create policy "task_comments_org_access" on public.task_comments
  for all using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and public.get_project_org_id(t.project_id) = public.get_user_org_id()
    )
  );

-- Task activities: org-scoped via project
create policy "task_activities_org_access" on public.task_activities
  for all using (
    public.get_project_org_id(project_id) = public.get_user_org_id()
  );

-- Time entries: org-scoped via tasks
create policy "time_entries_org_access" on public.time_entries
  for all using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and public.get_project_org_id(t.project_id) = public.get_user_org_id()
    )
  );

-- ============================================
-- SEED DEFAULT STATUSES FUNCTION
-- Creates default kanban columns when a project is created
-- ============================================
create or replace function public.create_default_task_statuses()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.task_statuses (project_id, name, color, position, type) values
    (new.id, 'A Fazer',      '#94a3b8', 0, 'todo'),
    (new.id, 'Em Progresso', '#3b82f6', 1, 'in_progress'),
    (new.id, 'Em Revisão',   '#f59e0b', 2, 'review'),
    (new.id, 'Concluído',    '#22c55e', 3, 'done');
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.create_default_task_statuses();
