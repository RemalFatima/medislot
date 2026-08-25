-- MediSlot foundation: tenant + staff membership.
-- Apply with the Supabase CLI or the SQL editor. Do not store credentials here.

create extension if not exists "pgcrypto";

create type public.staff_role as enum ('admin', 'staff');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  phone text,
  address text,
  logo_url text,
  branding jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.staff_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index staff_members_user_id_idx on public.staff_members (user_id);
create index staff_members_organization_id_idx on public.staff_members (organization_id);

-- SECURITY DEFINER helpers avoid RLS recursion when policies read staff_members.
create or replace function public.active_staff_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select sm.organization_id
  from public.staff_members sm
  where sm.user_id = (select auth.uid())
    and sm.is_active = true;
$$;

create or replace function public.is_active_org_admin(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members sm
    where sm.user_id = (select auth.uid())
      and sm.organization_id = p_organization_id
      and sm.is_active = true
      and sm.role = 'admin'
  );
$$;

revoke all on function public.active_staff_organization_ids() from public, anon;
revoke all on function public.is_active_org_admin(uuid) from public, anon;
grant execute on function public.active_staff_organization_ids() to authenticated;
grant execute on function public.is_active_org_admin(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.staff_members enable row level security;

revoke all on table public.organizations from public, anon, authenticated;
revoke all on table public.staff_members from public, anon, authenticated;

grant select, update on table public.organizations to authenticated;
grant select, insert, update, delete on table public.staff_members to authenticated;

-- Inactive staff are excluded from active_staff_organization_ids(), so they
-- cannot read or write any tenant rows.

create policy organizations_select_own
  on public.organizations
  for select
  to authenticated
  using (id in (select public.active_staff_organization_ids()));

create policy organizations_update_admin
  on public.organizations
  for update
  to authenticated
  using (public.is_active_org_admin(id))
  with check (public.is_active_org_admin(id));

create policy staff_members_select_own_org
  on public.staff_members
  for select
  to authenticated
  using (organization_id in (select public.active_staff_organization_ids()));

create policy staff_members_insert_admin
  on public.staff_members
  for insert
  to authenticated
  with check (public.is_active_org_admin(organization_id));

create policy staff_members_update_admin
  on public.staff_members
  for update
  to authenticated
  using (public.is_active_org_admin(organization_id))
  with check (public.is_active_org_admin(organization_id));

create policy staff_members_delete_admin
  on public.staff_members
  for delete
  to authenticated
  using (public.is_active_org_admin(organization_id));
