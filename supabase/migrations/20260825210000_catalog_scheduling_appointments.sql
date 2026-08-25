-- MediSlot catalog, scheduling, appointments, and membership cutover.
-- Target schema approved 2026-08-25. Does not implement booking UI.

create extension if not exists btree_gist;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.organization_type as enum ('hospital', 'clinic');
create type public.member_role as enum ('owner', 'admin', 'receptionist', 'doctor');
create type public.exception_type as enum ('holiday', 'leave', 'special_hours', 'unavailable');
create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);
create type public.appointment_source as enum ('public', 'admin');
create type public.notification_channel as enum ('whatsapp', 'sms', 'email');
create type public.notification_type as enum ('confirmation', 'reminder', 'cancellation');
create type public.notification_status as enum ('queued', 'sent', 'failed');

-- ---------------------------------------------------------------------------
-- Shared triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- organizations (alter foundation)
-- ---------------------------------------------------------------------------

alter table public.organizations
  add column type public.organization_type not null default 'clinic',
  add column email text,
  add column city text,
  add column updated_at timestamptz not null default now();

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Drop foundation membership RLS so helpers can be replaced
-- ---------------------------------------------------------------------------

drop policy if exists organizations_select_own on public.organizations;
drop policy if exists organizations_update_admin on public.organizations;
drop policy if exists staff_members_select_own_org on public.staff_members;
drop policy if exists staff_members_insert_admin on public.staff_members;
drop policy if exists staff_members_update_admin on public.staff_members;
drop policy if exists staff_members_delete_admin on public.staff_members;

drop function if exists public.active_staff_organization_ids();
drop function if exists public.is_active_org_admin(uuid);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, 'Staff')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.email, 'Staff')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- organization_members (replaces staff_members)
-- ---------------------------------------------------------------------------

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_user_id_idx
  on public.organization_members (user_id);
create index organization_members_organization_id_role_idx
  on public.organization_members (organization_id, role);

insert into public.organization_members (
  organization_id,
  user_id,
  role,
  is_active,
  created_at
)
select
  sm.organization_id,
  sm.user_id,
  case sm.role::text
    when 'staff' then 'receptionist'::public.member_role
    else 'admin'::public.member_role
  end,
  sm.is_active,
  sm.created_at
from public.staff_members sm;

drop table public.staff_members;
drop type public.staff_role;

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.current_member_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select om.organization_id
  from public.organization_members om
  where om.user_id = (select auth.uid())
    and om.is_active = true;
$$;

create or replace function public.is_org_manager(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.user_id = (select auth.uid())
      and om.organization_id = p_organization_id
      and om.is_active = true
      and om.role in ('owner', 'admin')
  );
$$;

-- owner | admin | receptionist — can use /admin and manage appointments.
create or replace function public.is_org_receptionist(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.user_id = (select auth.uid())
      and om.organization_id = p_organization_id
      and om.is_active = true
      and om.role in ('owner', 'admin', 'receptionist')
  );
$$;

create or replace function public.active_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.organizations where is_active = true;
$$;

revoke all on function public.current_member_org_ids() from public, anon;
revoke all on function public.is_org_manager(uuid) from public, anon;
revoke all on function public.is_org_receptionist(uuid) from public, anon;
revoke all on function public.active_organization_ids() from public;

grant execute on function public.current_member_org_ids() to authenticated;
grant execute on function public.is_org_manager(uuid) to authenticated;
grant execute on function public.is_org_receptionist(uuid) to authenticated;
grant execute on function public.active_organization_ids() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Catalog tables
-- ---------------------------------------------------------------------------

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, name),
  constraint departments_slug_lower check (slug = lower(slug))
);

create unique index departments_organization_id_slug_idx
  on public.departments (organization_id, slug);
create index departments_organization_id_active_idx
  on public.departments (organization_id, is_active);

create trigger departments_set_updated_at
  before update on public.departments
  for each row execute procedure public.set_updated_at();

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  slug text not null,
  photo_url text,
  profession text not null,
  specialization text,
  qualifications text,
  experience_years integer,
  consultation_fee numeric(12, 2),
  bio text,
  buffer_minutes integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint doctors_slug_lower check (slug = lower(slug)),
  constraint doctors_experience_years_check check (
    experience_years is null or experience_years >= 0
  ),
  constraint doctors_consultation_fee_check check (
    consultation_fee is null or consultation_fee >= 0
  ),
  constraint doctors_buffer_minutes_check check (buffer_minutes >= 0)
);

create unique index doctors_organization_id_slug_idx
  on public.doctors (organization_id, slug);
create unique index doctors_organization_id_user_id_idx
  on public.doctors (organization_id, user_id)
  where user_id is not null;
create index doctors_organization_id_active_idx
  on public.doctors (organization_id, is_active);
create index doctors_organization_id_profession_idx
  on public.doctors (organization_id, profession);
create index doctors_organization_id_specialization_idx
  on public.doctors (organization_id, specialization);

create trigger doctors_set_updated_at
  before update on public.doctors
  for each row execute procedure public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  duration_minutes integer not null,
  price numeric(12, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint services_slug_lower check (slug = lower(slug)),
  constraint services_duration_minutes_check check (duration_minutes > 0),
  constraint services_price_check check (price is null or price >= 0)
);

create unique index services_organization_id_slug_idx
  on public.services (organization_id, slug);
create index services_organization_id_active_idx
  on public.services (organization_id, is_active);

create trigger services_set_updated_at
  before update on public.services
  for each row execute procedure public.set_updated_at();

create table public.doctor_departments (
  organization_id uuid not null,
  doctor_id uuid not null,
  department_id uuid not null,
  primary key (doctor_id, department_id),
  foreign key (doctor_id, organization_id)
    references public.doctors (id, organization_id)
    on delete cascade,
  foreign key (department_id, organization_id)
    references public.departments (id, organization_id)
    on delete cascade
);

create index doctor_departments_department_id_idx
  on public.doctor_departments (department_id);
create index doctor_departments_organization_id_idx
  on public.doctor_departments (organization_id);

create table public.doctor_services (
  organization_id uuid not null,
  doctor_id uuid not null,
  service_id uuid not null,
  primary key (doctor_id, service_id),
  foreign key (doctor_id, organization_id)
    references public.doctors (id, organization_id)
    on delete cascade,
  foreign key (service_id, organization_id)
    references public.services (id, organization_id)
    on delete cascade
);

create index doctor_services_service_id_idx
  on public.doctor_services (service_id);
create index doctor_services_organization_id_idx
  on public.doctor_services (organization_id);

-- Weekly working intervals. Lunch = two rows, not break columns.
-- weekday: 0 = Monday … 6 = Sunday, interpreted in organizations.timezone.
create table public.doctor_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  doctor_id uuid not null,
  weekday smallint not null,
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  foreign key (doctor_id, organization_id)
    references public.doctors (id, organization_id)
    on delete cascade,
  constraint doctor_availability_weekday_check check (weekday between 0 and 6),
  constraint doctor_availability_window_check check (start_time < end_time)
);

create index doctor_availability_doctor_id_weekday_idx
  on public.doctor_availability (doctor_id, weekday);

-- doctor_id null = clinic-wide (public holiday).
create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  doctor_id uuid,
  date date not null,
  type public.exception_type not null,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  foreign key (doctor_id, organization_id)
    references public.doctors (id, organization_id)
    on delete cascade,
  constraint availability_exceptions_times_check check (
    (
      type = 'special_hours'
      and start_time is not null
      and end_time is not null
      and start_time < end_time
    )
    or (
      type <> 'special_hours'
      and (
        (start_time is null and end_time is null)
        or (
          start_time is not null
          and end_time is not null
          and start_time < end_time
        )
      )
    )
  )
);

create unique index availability_exceptions_org_wide_date_idx
  on public.availability_exceptions (organization_id, date)
  where doctor_id is null;
create index availability_exceptions_organization_id_date_idx
  on public.availability_exceptions (organization_id, date);
create index availability_exceptions_doctor_id_date_idx
  on public.availability_exceptions (doctor_id, date);

-- ---------------------------------------------------------------------------
-- appointments
-- V1 inserts status = confirmed. pending is reserved for a later approval flow.
-- Occupying range is [start_at, occupied_end_at) where occupied_end_at
-- is end_at plus buffer_minutes (set by trigger; cannot be an index expression).
create or replace function public.set_appointment_occupied_end()
returns trigger
language plpgsql
as $$
begin
  new.occupied_end_at := new.end_at + make_interval(mins => new.buffer_minutes);
  return new;
end;
$$;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  doctor_id uuid not null,
  service_id uuid not null,
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  buffer_minutes integer not null default 0,
  occupied_end_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  notes text,
  confirmation_token text not null default encode(extensions.gen_random_bytes(16), 'hex'),
  source public.appointment_source not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (confirmation_token),
  foreign key (doctor_id, organization_id)
    references public.doctors (id, organization_id)
    on delete restrict,
  foreign key (service_id, organization_id)
    references public.services (id, organization_id)
    on delete restrict,
  constraint appointments_range_check check (end_at > start_at),
  constraint appointments_buffer_minutes_check check (buffer_minutes >= 0),
  constraint appointments_occupied_end_check check (occupied_end_at >= end_at),
  constraint appointments_no_overlap exclude using gist (
    doctor_id with =,
    tstzrange(start_at, occupied_end_at, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create trigger appointments_set_occupied_end
  before insert or update of start_at, end_at, buffer_minutes
  on public.appointments
  for each row execute procedure public.set_appointment_occupied_end();

create index appointments_organization_id_start_at_idx
  on public.appointments (organization_id, start_at);
create index appointments_doctor_id_start_at_idx
  on public.appointments (doctor_id, start_at);
create index appointments_organization_id_status_start_at_idx
  on public.appointments (organization_id, status, start_at);
create index appointments_patient_phone_idx
  on public.appointments (patient_phone);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  appointment_id uuid not null,
  channel public.notification_channel not null,
  type public.notification_type not null,
  status public.notification_status not null default 'queued',
  provider_message_id text,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  foreign key (appointment_id, organization_id)
    references public.appointments (id, organization_id)
    on delete cascade
);

create index notification_logs_appointment_id_idx
  on public.notification_logs (appointment_id);
create index notification_logs_organization_id_created_at_idx
  on public.notification_logs (organization_id, created_at);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select on table public.organizations to anon;
grant select, update on table public.organizations to authenticated;

grant select, update on table public.profiles to authenticated;

grant select, insert, update, delete on table public.organization_members to authenticated;

grant select on table public.departments to anon;
grant select, insert, update, delete on table public.departments to authenticated;

grant select on table public.doctors to anon;
grant select, insert, update, delete on table public.doctors to authenticated;

grant select on table public.services to anon;
grant select, insert, update, delete on table public.services to authenticated;

grant select on table public.doctor_departments to anon;
grant select, insert, update, delete on table public.doctor_departments to authenticated;

grant select on table public.doctor_services to anon;
grant select, insert, update, delete on table public.doctor_services to authenticated;

grant select on table public.doctor_availability to anon;
grant select, insert, update, delete on table public.doctor_availability to authenticated;

grant select on table public.availability_exceptions to anon;
grant select, insert, update, delete on table public.availability_exceptions to authenticated;

-- No INSERT for appointments: booking RPC will be added with the booking phase.
grant select, update on table public.appointments to authenticated;

grant select on table public.notification_logs to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.departments enable row level security;
alter table public.doctors enable row level security;
alter table public.services enable row level security;
alter table public.doctor_departments enable row level security;
alter table public.doctor_services enable row level security;
alter table public.doctor_availability enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointments enable row level security;
alter table public.notification_logs enable row level security;

-- organizations
create policy organizations_select_member
  on public.organizations
  for select
  to authenticated
  using (id in (select public.current_member_org_ids()));

create policy organizations_select_public
  on public.organizations
  for select
  to anon
  using (is_active = true);

create policy organizations_update_manager
  on public.organizations
  for update
  to authenticated
  using (public.is_org_manager(id))
  with check (public.is_org_manager(id));

-- profiles
create policy profiles_select_self_or_org_peer
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or id in (
      select om.user_id
      from public.organization_members om
      where om.organization_id in (select public.current_member_org_ids())
    )
  );

create policy profiles_update_self
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- organization_members
create policy organization_members_select_own_org
  on public.organization_members
  for select
  to authenticated
  using (organization_id in (select public.current_member_org_ids()));

create policy organization_members_insert_manager
  on public.organization_members
  for insert
  to authenticated
  with check (public.is_org_manager(organization_id));

create policy organization_members_update_manager
  on public.organization_members
  for update
  to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy organization_members_delete_manager
  on public.organization_members
  for delete
  to authenticated
  using (public.is_org_manager(organization_id));

-- Catalog: public read of active rows; managers write; members read all in org.
create policy departments_select_public
  on public.departments for select to anon
  using (
    is_active = true
    and organization_id in (select public.active_organization_ids())
  );
create policy departments_select_member
  on public.departments for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy departments_write_manager
  on public.departments for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy doctors_select_public
  on public.doctors for select to anon
  using (
    is_active = true
    and organization_id in (select public.active_organization_ids())
  );
create policy doctors_select_member
  on public.doctors for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy doctors_write_manager
  on public.doctors for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy services_select_public
  on public.services for select to anon
  using (
    is_active = true
    and organization_id in (select public.active_organization_ids())
  );
create policy services_select_member
  on public.services for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy services_write_manager
  on public.services for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy doctor_departments_select_public
  on public.doctor_departments for select to anon
  using (
    organization_id in (select public.active_organization_ids())
    and exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.is_active = true
    )
    and exists (
      select 1 from public.departments dep
      where dep.id = department_id and dep.is_active = true
    )
  );
create policy doctor_departments_select_member
  on public.doctor_departments for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy doctor_departments_write_manager
  on public.doctor_departments for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy doctor_services_select_public
  on public.doctor_services for select to anon
  using (
    organization_id in (select public.active_organization_ids())
    and exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.is_active = true
    )
    and exists (
      select 1 from public.services s
      where s.id = service_id and s.is_active = true
    )
  );
create policy doctor_services_select_member
  on public.doctor_services for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy doctor_services_write_manager
  on public.doctor_services for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy doctor_availability_select_public
  on public.doctor_availability for select to anon
  using (
    is_active = true
    and organization_id in (select public.active_organization_ids())
    and exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.is_active = true
    )
  );
create policy doctor_availability_select_member
  on public.doctor_availability for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy doctor_availability_write_manager
  on public.doctor_availability for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

create policy availability_exceptions_select_public
  on public.availability_exceptions for select to anon
  using (
    organization_id in (select public.active_organization_ids())
    and (
      doctor_id is null
      or exists (
        select 1 from public.doctors d
        where d.id = doctor_id and d.is_active = true
      )
    )
  );
create policy availability_exceptions_select_member
  on public.availability_exceptions for select to authenticated
  using (organization_id in (select public.current_member_org_ids()));
create policy availability_exceptions_write_manager
  on public.availability_exceptions for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

-- appointments: no anon access; receptionist+ can read/update. Inserts via RPC later.
create policy appointments_select_receptionist
  on public.appointments
  for select
  to authenticated
  using (public.is_org_receptionist(organization_id));

create policy appointments_update_receptionist
  on public.appointments
  for update
  to authenticated
  using (public.is_org_receptionist(organization_id))
  with check (public.is_org_receptionist(organization_id));

create policy notification_logs_select_receptionist
  on public.notification_logs
  for select
  to authenticated
  using (public.is_org_receptionist(organization_id));
