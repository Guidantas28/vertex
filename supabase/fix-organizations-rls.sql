-- Fix: "new row violates row-level security policy for table organizations"
-- Run this entire file in Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- Function runs with elevated privileges, so it can insert into organizations
-- and update profiles regardless of RLS. Only the authenticated user can call it.
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
    name,
    slug,
    business_type,
    primary_goal,
    growth_stage,
    monthly_revenue_range,
    channels_used,
    onboarding_completed
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

-- Allow authenticated users to call this function
grant execute on function public.create_organization_for_user(text, text, text, text, text, text, text[]) to authenticated;
grant execute on function public.create_organization_for_user(text, text, text, text, text, text, text[]) to service_role;
