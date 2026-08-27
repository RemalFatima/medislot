-- Case-insensitive unique names for catalog rows.
-- Duplicate names that already exist are disambiguated so the indexes can be created.

with ranked_services as (
  select
    id,
    row_number() over (
      partition by organization_id, lower(btrim(name))
      order by created_at asc, id asc
    ) as rn
  from public.services
)
update public.services s
set name = btrim(s.name) || ' (' || ranked_services.rn || ')'
from ranked_services
where s.id = ranked_services.id
  and ranked_services.rn > 1;

with ranked_departments as (
  select
    id,
    row_number() over (
      partition by organization_id, lower(btrim(name))
      order by created_at asc, id asc
    ) as rn
  from public.departments
)
update public.departments d
set name = btrim(d.name) || ' (' || ranked_departments.rn || ')'
from ranked_departments
where d.id = ranked_departments.id
  and ranked_departments.rn > 1;

with ranked_doctors as (
  select
    id,
    row_number() over (
      partition by
        organization_id,
        lower(btrim(full_name)),
        lower(btrim(profession)),
        lower(btrim(coalesce(specialization, '')))
      order by created_at asc, id asc
    ) as rn
  from public.doctors
)
update public.doctors d
set full_name = btrim(d.full_name) || ' (' || ranked_doctors.rn || ')'
from ranked_doctors
where d.id = ranked_doctors.id
  and ranked_doctors.rn > 1;

create unique index if not exists services_organization_id_name_lower_idx
  on public.services (organization_id, lower(btrim(name)));

create unique index if not exists departments_organization_id_name_lower_idx
  on public.departments (organization_id, lower(btrim(name)));

create unique index if not exists doctors_organization_id_identity_idx
  on public.doctors (
    organization_id,
    lower(btrim(full_name)),
    lower(btrim(profession)),
    lower(btrim(coalesce(specialization, '')))
  );
