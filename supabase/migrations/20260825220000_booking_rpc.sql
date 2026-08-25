-- Public booking RPCs.
-- Anon cannot INSERT appointments; guests book only through book_appointment.
-- Occupied ranges are exposed without leaking other appointment fields.

create or replace function public.list_occupied_ranges(
  p_doctor_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  start_at timestamptz,
  occupied_end_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.start_at, a.occupied_end_at
  from public.appointments a
  inner join public.doctors d
    on d.id = a.doctor_id
   and d.organization_id = a.organization_id
  inner join public.organizations o
    on o.id = a.organization_id
  where a.doctor_id = p_doctor_id
    and d.is_active = true
    and o.is_active = true
    and a.status in ('pending', 'confirmed')
    and a.start_at < p_to
    and a.occupied_end_at > p_from;
$$;

create or replace function public.get_booking_by_token(p_token text)
returns table (
  confirmation_token text,
  status public.appointment_status,
  start_at timestamptz,
  end_at timestamptz,
  patient_name text,
  doctor_name text,
  service_name text,
  organization_name text,
  timezone text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.confirmation_token,
    a.status,
    a.start_at,
    a.end_at,
    a.patient_name,
    d.full_name,
    s.name,
    o.name,
    o.timezone
  from public.appointments a
  inner join public.doctors d
    on d.id = a.doctor_id
   and d.organization_id = a.organization_id
  inner join public.services s
    on s.id = a.service_id
   and s.organization_id = a.organization_id
  inner join public.organizations o
    on o.id = a.organization_id
  where a.confirmation_token = p_token
    and char_length(p_token) >= 16
  limit 1;
$$;

create or replace function public.book_appointment(
  p_doctor_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_patient_name text,
  p_patient_phone text,
  p_patient_email text
)
returns table (
  id uuid,
  confirmation_token text,
  start_at timestamptz,
  end_at timestamptz,
  status public.appointment_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doctor public.doctors%rowtype;
  v_service public.services%rowtype;
  v_name text;
  v_phone text;
  v_email text;
  v_end_at timestamptz;
  v_occupied_end timestamptz;
begin
  v_name := trim(both from coalesce(p_patient_name, ''));
  v_phone := trim(both from coalesce(p_patient_phone, ''));
  v_email := nullif(trim(both from coalesce(p_patient_email, '')), '');

  if char_length(v_name) < 2 or char_length(v_name) > 160 then
    raise exception 'INVALID_GUEST' using errcode = 'P0001';
  end if;

  if char_length(v_phone) < 7 or char_length(v_phone) > 20 then
    raise exception 'INVALID_GUEST' using errcode = 'P0001';
  end if;

  if v_email is not null and v_email !~ '^[^@]+@[^@]+$' then
    raise exception 'INVALID_GUEST' using errcode = 'P0001';
  end if;

  select d.*
    into v_doctor
  from public.doctors d
  inner join public.organizations o on o.id = d.organization_id
  where d.id = p_doctor_id
    and d.is_active = true
    and o.is_active = true
  for update of d;

  if not found then
    raise exception 'DOCTOR_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select s.*
    into v_service
  from public.services s
  where s.id = p_service_id
    and s.organization_id = v_doctor.organization_id
    and s.is_active = true;

  if not found then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.doctor_services ds
    where ds.organization_id = v_doctor.organization_id
      and ds.doctor_id = p_doctor_id
      and ds.service_id = p_service_id
  ) then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if p_start_at <= now() or p_start_at > now() + interval '16 days' then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0002';
  end if;

  v_end_at := p_start_at + make_interval(mins => v_service.duration_minutes);
  v_occupied_end := v_end_at + make_interval(mins => v_doctor.buffer_minutes);

  if exists (
    select 1
    from public.appointments a
    where a.doctor_id = p_doctor_id
      and a.status in ('pending', 'confirmed')
      and tstzrange(a.start_at, a.occupied_end_at, '[)')
        && tstzrange(p_start_at, v_occupied_end, '[)')
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0002';
  end if;

  return query
  insert into public.appointments (
    organization_id,
    doctor_id,
    service_id,
    patient_name,
    patient_phone,
    patient_email,
    start_at,
    end_at,
    buffer_minutes,
    occupied_end_at,
    status,
    source
  )
  values (
    v_doctor.organization_id,
    p_doctor_id,
    p_service_id,
    v_name,
    v_phone,
    v_email,
    p_start_at,
    v_end_at,
    v_doctor.buffer_minutes,
    v_occupied_end,
    'confirmed',
    'public'
  )
  returning
    id,
    confirmation_token,
    start_at,
    end_at,
    status;
exception
  when exclusion_violation then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0002';
end;
$$;

revoke all on function public.list_occupied_ranges(uuid, timestamptz, timestamptz) from public;
revoke all on function public.get_booking_by_token(text) from public;
revoke all on function public.book_appointment(uuid, uuid, timestamptz, text, text, text) from public;

grant execute on function public.list_occupied_ranges(uuid, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.get_booking_by_token(text) to anon, authenticated;
grant execute on function public.book_appointment(uuid, uuid, timestamptz, text, text, text) to anon, authenticated;
