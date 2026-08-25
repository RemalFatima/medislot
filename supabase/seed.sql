-- Demo tenant for local development.
-- Staff users are NOT created here (passwords must not live in source control).
-- After applying this file, run: npm run seed:admin

insert into public.organizations (
  id,
  name,
  slug,
  timezone,
  locale,
  is_active
)
values (
  'a0000000-0000-4000-8000-000000000001',
  'Demo Clinic',
  'demo-clinic',
  'Asia/Karachi',
  'en',
  true
)
on conflict (id) do nothing;
