-- ============================================
-- Growth OS - Supabase Database Schema
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================
-- ORGANIZATIONS
-- ============================================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  logo_url text,
  business_type text check (business_type in ('clinic','service_provider','local_business','freelancer','agency','ecommerce','other')),
  primary_goal text check (primary_goal in ('more_leads','more_sales','better_retention','automate_processes','understand_data')),
  growth_stage text check (growth_stage in ('starting','growing','scaling','established')),
  monthly_revenue_range text,
  channels_used text[] not null default '{}',
  onboarding_completed boolean not null default false,
  plan text not null default 'free' check (plan in ('free','starter','growth','scale')),
  settings jsonb not null default '{}'
);

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null default '',
  avatar_url text,
  phone text,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  organization_id uuid references public.organizations(id) on delete set null,
  onboarding_step integer not null default 0,
  preferences jsonb not null default '{}'
);

-- ============================================
-- LEADS
-- ============================================
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'new' check (status in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  source text,
  tags text[] not null default '{}',
  notes text,
  estimated_value numeric(12,2),
  assigned_to uuid references public.profiles(id) on delete set null,
  last_contact_at timestamptz,
  custom_fields jsonb not null default '{}'
);

create index leads_organization_id_idx on public.leads(organization_id);
create index leads_status_idx on public.leads(status);
create index leads_created_at_idx on public.leads(created_at desc);
create index leads_full_name_trgm_idx on public.leads using gin(full_name gin_trgm_ops);

-- ============================================
-- CONVERSATIONS
-- ============================================
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  channel text not null check (channel in ('whatsapp','instagram','email','phone')),
  contact_name text not null,
  contact_identifier text not null,
  last_message text,
  last_message_at timestamptz,
  unread_count integer not null default 0,
  status text not null default 'open' check (status in ('open','closed','pending')),
  assigned_to uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'
);

create index conversations_organization_id_idx on public.conversations(organization_id);
create index conversations_last_message_at_idx on public.conversations(last_message_at desc);

-- ============================================
-- MESSAGES
-- ============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  content text not null,
  type text not null default 'text' check (type in ('text','image','audio','document','template')),
  direction text not null check (direction in ('inbound','outbound')),
  status text not null default 'sent' check (status in ('sent','delivered','read','failed')),
  sender_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'
);

create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_created_at_idx on public.messages(created_at);

-- ============================================
-- CAMPAIGNS
-- ============================================
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  type text not null check (type in ('whatsapp','email','sms')),
  status text not null default 'draft' check (status in ('draft','scheduled','running','paused','completed')),
  message_template text,
  target_count integer not null default 0,
  sent_count integer not null default 0,
  delivered_count integer not null default 0,
  read_count integer not null default 0,
  reply_count integer not null default 0,
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  metadata jsonb not null default '{}'
);

create index campaigns_organization_id_idx on public.campaigns(organization_id);

-- ============================================
-- TRANSACTIONS
-- ============================================
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('income','expense')),
  status text not null default 'pending' check (status in ('pending','paid','overdue','cancelled')),
  due_date date,
  paid_at timestamptz,
  payment_method text,
  category text,
  notes text,
  metadata jsonb not null default '{}'
);

create index transactions_organization_id_idx on public.transactions(organization_id);
create index transactions_due_date_idx on public.transactions(due_date);
create index transactions_status_idx on public.transactions(status);

-- ============================================
-- METRICS (aggregated daily snapshots)
-- ============================================
create table public.metrics (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period date not null,
  leads_new integer not null default 0,
  leads_converted integer not null default 0,
  revenue numeric(12,2) not null default 0,
  messages_sent integer not null default 0,
  campaigns_sent integer not null default 0,
  conversion_rate numeric(5,2) not null default 0,
  avg_deal_value numeric(12,2) not null default 0,
  metadata jsonb not null default '{}',
  unique(organization_id, period)
);

create index metrics_organization_id_period_idx on public.metrics(organization_id, period desc);

-- ============================================
-- TRIGGERS - auto update updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger leads_updated_at before update on public.leads
  for each row execute function public.handle_updated_at();

create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.handle_updated_at();

create trigger campaigns_updated_at before update on public.campaigns
  for each row execute function public.handle_updated_at();

create trigger transactions_updated_at before update on public.transactions
  for each row execute function public.handle_updated_at();

-- ============================================
-- TRIGGER - auto create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.campaigns enable row level security;
alter table public.transactions enable row level security;
alter table public.metrics enable row level security;

-- Helper function to get user's organization
create or replace function public.get_user_org_id()
returns uuid language sql security definer stable as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- Onboarding: create org + link profile (bypasses RLS with SECURITY DEFINER)
create or replace function public.create_organization_for_user(
  p_name text,
  p_slug text,
  p_business_type text default null,
  p_primary_goal text default null,
  p_growth_stage text default null,
  p_monthly_revenue_range text default null,
  p_channels_used text[] default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_user_id uuid := auth.uid();
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  insert into public.organizations (
    name, slug, business_type, primary_goal, growth_stage,
    monthly_revenue_range, channels_used, onboarding_completed
  ) values (
    coalesce(nullif(trim(p_name), ''), 'Meu Negócio'),
    p_slug,
    p_business_type,
    p_primary_goal,
    p_growth_stage,
    p_monthly_revenue_range,
    coalesce(p_channels_used, '{}'),
    true
  )
  returning id into v_org_id;
  update public.profiles
  set organization_id = v_org_id, onboarding_step = 5, updated_at = now()
  where id = v_user_id;
  select jsonb_build_object('id', v_org_id) into v_result;
  return v_result;
end;
$$;
grant execute on function public.create_organization_for_user(text, text, text, text, text, text, text[]) to authenticated;
grant execute on function public.create_organization_for_user(text, text, text, text, text, text, text[]) to service_role;

-- Profiles: users can read/update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Profiles: org members can read each other's profiles
create policy "profiles_select_org" on public.profiles
  for select using (organization_id = public.get_user_org_id());

-- Organizations: members can read their own org
create policy "organizations_select_member" on public.organizations
  for select using (id = public.get_user_org_id());

create policy "organizations_update_owner" on public.organizations
  for update using (
    id = public.get_user_org_id() and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner','admin')
    )
  );

-- Allow any authenticated user to create an organization (onboarding)
drop policy if exists "organizations_insert_owner" on public.organizations;
create policy "organizations_insert_authenticated" on public.organizations
  for insert
  to authenticated
  with check (true);

-- Leads: org-scoped access
create policy "leads_org_access" on public.leads
  for all using (organization_id = public.get_user_org_id());

-- Conversations: org-scoped access
create policy "conversations_org_access" on public.conversations
  for all using (organization_id = public.get_user_org_id());

-- Messages: via conversation ownership
create policy "messages_org_access" on public.messages
  for all using (
    conversation_id in (
      select id from public.conversations
      where organization_id = public.get_user_org_id()
    )
  );

-- Campaigns: org-scoped access
create policy "campaigns_org_access" on public.campaigns
  for all using (organization_id = public.get_user_org_id());

-- Transactions: org-scoped access
create policy "transactions_org_access" on public.transactions
  for all using (organization_id = public.get_user_org_id());

-- Metrics: org-scoped access (read only for members)
create policy "metrics_org_read" on public.metrics
  for select using (organization_id = public.get_user_org_id());
