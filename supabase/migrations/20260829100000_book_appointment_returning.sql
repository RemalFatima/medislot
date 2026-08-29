-- RETURNS TABLE output columns are in scope, so RETURNING id is ambiguous.
-- Qualify the inserted row so walk-in and public booking can complete.

create or replace function public.book_appointment(
  p_doctor_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_patient_name text,
  p_patient_phone text,
  p_patient_email text,
  p_source public.appointment_source
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
  v_source public.appointment_source;
  v_end_at timestamptz;
  v_occupied_end timestamptz;
begin
  v_name := trim(both from coalesce(p_patient_name, ''));
  v_phone := trim(both from coalesce(p_patient_phone, ''));
  v_email := nullif(trim(both from coalesce(p_patient_email, '')), '');
  v_source := 'public';

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

  if p_source = 'admin' then
    if not public.is_org_receptionist(v_doctor.organization_id) then
      raise exception 'NOT_AUTHORIZED' using errcode = '42501';
    end if;
    v_source := 'admin';
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
    v_source
  )
  returning
    appointments.id,
    appointments.confirmation_token,
    appointments.start_at,
    appointments.end_at,
    appointments.status;
exception
  when exclusion_violation then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0002';
end;
$$;
