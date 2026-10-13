-- TerraMatrix Academy - Supabase Phase 1 Schema
-- Purpose: move Admin-created content + public display data from localStorage to Supabase.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- Utility
-- -------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------------
-- Learning Setup / Taxonomy
-- -------------------------------------------------------------------

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

-- -------------------------------------------------------------------
-- People
-- -------------------------------------------------------------------

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  organisation text,
  email text,
  phone text,
  profile text,
  expertise text[] not null default '{}',
  photo_url text,
  resume_url text,
  status text not null default 'Active' check (status in ('Active', 'Inactive', 'Draft')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------
-- Courses
-- -------------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_title text,
  category_id uuid references public.categories(id) on delete set null,
  theme_id uuid references public.themes(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  duration_hours integer,
  duration_label text,
  mode text,
  fee numeric(12,2),
  fee_label text,
  start_date date,
  certification text,
  short_description text,
  course_overview text,
  learning_outcomes text[] not null default '{}',
  image_url text,
  document_url text,
  online_session_link text,
  status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_instructors (
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  display_order integer not null default 0,
  primary key (course_id, instructor_id)
);

-- -------------------------------------------------------------------
-- Learning Videos
-- -------------------------------------------------------------------

create table if not exists public.learning_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  theme_id uuid references public.themes(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  short_description text,
  video_url text not null,
  thumbnail_url text,
  status text not null default 'Published' check (status in ('Published', 'Draft', 'Archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------
-- Webinars and Workshops
-- -------------------------------------------------------------------

create table if not exists public.webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  theme_id uuid references public.themes(id) on delete set null,
  date date,
  time time,
  mode text,
  fee numeric(12,2),
  fee_label text,
  certification text not null default 'Participation Certificate',
  short_description text,
  image_url text,
  registration_payment_option text,
  recording_link text,
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Completed', 'Draft', 'Archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webinar_instructors (
  webinar_id uuid not null references public.webinars(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  display_order integer not null default 0,
  primary key (webinar_id, instructor_id)
);

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  theme_id uuid references public.themes(id) on delete set null,
  date date,
  time time,
  mode text,
  fee numeric(12,2),
  fee_label text,
  certification text not null default 'Participation Certificate',
  short_description text,
  image_url text,
  registration_payment_option text,
  recording_link text,
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Completed', 'Draft', 'Archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workshop_instructors (
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  display_order integer not null default 0,
  primary key (workshop_id, instructor_id)
);

-- -------------------------------------------------------------------
-- Public Enquiries and Registrations
-- -------------------------------------------------------------------

create table if not exists public.general_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  organisation text,
  topic text not null default 'General enquiry',
  message text,
  status text not null default 'New' check (status in ('New', 'In Review', 'Responded', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('course', 'webinar', 'workshop')),
  item_id uuid not null,
  item_title text,
  name text not null,
  email text,
  phone text,
  organisation text,
  payment_option text,
  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Payment Link Sent', 'Paid', 'Free', 'Cancelled')),
  registration_status text not null default 'Registered' check (registration_status in ('Registered', 'Enrolled', 'Completed', 'Cancelled')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional course-specific enrollment table for later LMS integration.
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  learner_name text not null,
  learner_email text,
  learner_phone text,
  enrollment_status text not null default 'Enrolled' check (enrollment_status in ('Registered', 'Enrolled', 'Ongoing', 'Completed', 'Cancelled')),
  certificate_url text,
  certificate_issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete cascade,
  item_type text check (item_type in ('course', 'webinar', 'workshop')),
  item_id uuid,
  learner_name text,
  learner_email text,
  amount numeric(12,2),
  currency text not null default 'INR',
  payment_link text,
  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Payment Link Sent', 'Paid', 'Failed', 'Refunded', 'Cancelled')),
  payment_reference text,
  payment_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------
-- Updated-at triggers
-- -------------------------------------------------------------------

drop trigger if exists levels_set_updated_at on public.levels;
create trigger levels_set_updated_at before update on public.levels
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists themes_set_updated_at on public.themes;
create trigger themes_set_updated_at before update on public.themes
for each row execute function public.set_updated_at();

drop trigger if exists instructors_set_updated_at on public.instructors;
create trigger instructors_set_updated_at before update on public.instructors
for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists learning_videos_set_updated_at on public.learning_videos;
create trigger learning_videos_set_updated_at before update on public.learning_videos
for each row execute function public.set_updated_at();

drop trigger if exists webinars_set_updated_at on public.webinars;
create trigger webinars_set_updated_at before update on public.webinars
for each row execute function public.set_updated_at();

drop trigger if exists workshops_set_updated_at on public.workshops;
create trigger workshops_set_updated_at before update on public.workshops
for each row execute function public.set_updated_at();

drop trigger if exists general_enquiries_set_updated_at on public.general_enquiries;
create trigger general_enquiries_set_updated_at before update on public.general_enquiries
for each row execute function public.set_updated_at();

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at before update on public.registrations
for each row execute function public.set_updated_at();

drop trigger if exists enrollments_set_updated_at on public.enrollments;
create trigger enrollments_set_updated_at before update on public.enrollments
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------------

create index if not exists idx_themes_category_id on public.themes(category_id);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_category_theme_level on public.courses(category_id, theme_id, level_id);
create index if not exists idx_course_instructors_course on public.course_instructors(course_id);
create index if not exists idx_course_instructors_instructor on public.course_instructors(instructor_id);
create index if not exists idx_learning_videos_status on public.learning_videos(status);
create index if not exists idx_webinars_status on public.webinars(status);
create index if not exists idx_workshops_status on public.workshops(status);
create index if not exists idx_registrations_item on public.registrations(item_type, item_id);
create index if not exists idx_registrations_email on public.registrations(email);
create index if not exists idx_general_enquiries_created on public.general_enquiries(created_at desc);

-- -------------------------------------------------------------------
-- Seed default setup values
-- -------------------------------------------------------------------

insert into public.levels (name, display_order)
values
  ('Foundation', 1),
  ('Intermediate', 2),
  ('Advanced', 3),
  ('Professional', 4),
  ('Open', 5)
on conflict (name) do update set display_order = excluded.display_order, is_active = true;

insert into public.categories (name, display_order)
values
  ('Digital Skills', 1),
  ('Engineering Tools', 2),
  ('Field & Survey Methods', 3),
  ('Research & Data', 4),
  ('Water & Environment', 5),
  ('Professional Practice', 6)
on conflict (name) do update set display_order = excluded.display_order, is_active = true;

insert into public.themes (category_id, name, display_order)
select c.id, x.name, x.display_order
from public.categories c
cross join lateral (
  values
    ('GIS and Mapping', 1),
    ('Remote Sensing', 2),
    ('Digital Learning', 3),
    ('Programming and Automation', 4)
) as x(name, display_order)
where c.name = 'Digital Skills'
on conflict (category_id, name) do update set display_order = excluded.display_order, is_active = true;

insert into public.themes (category_id, name, display_order)
select c.id, x.name, x.display_order
from public.categories c
cross join lateral (
  values
    ('CAD and Drafting', 1),
    ('BIM and Documentation', 2),
    ('Structural Modelling', 3),
    ('Structural Analysis', 4)
) as x(name, display_order)
where c.name = 'Engineering Tools'
on conflict (category_id, name) do update set display_order = excluded.display_order, is_active = true;

insert into public.themes (category_id, name, display_order)
select c.id, x.name, x.display_order
from public.categories c
cross join lateral (
  values
    ('Field Survey', 1),
    ('Drone Survey', 2),
    ('Mobile Data Collection', 3),
    ('Site Reconnaissance', 4)
) as x(name, display_order)
where c.name = 'Field & Survey Methods'
on conflict (category_id, name) do update set display_order = excluded.display_order, is_active = true;

insert into public.themes (category_id, name, display_order)
select c.id, x.name, x.display_order
from public.categories c
cross join lateral (
  values
    ('Statistics and Data Analysis', 1),
    ('Research Methods', 2),
    ('Impact Assessment', 3),
    ('Academic Writing', 4)
) as x(name, display_order)
where c.name = 'Research & Data'
on conflict (category_id, name) do update set display_order = excluded.display_order, is_active = true;

insert into public.themes (category_id, name, display_order)
select c.id, x.name, x.display_order
from public.categories c
cross join lateral (
  values
    ('Hydrologic Modelling', 1),
    ('River Analysis', 2),
    ('Groundwater', 3),
    ('Sustainability and Climate', 4)
) as x(name, display_order)
where c.name = 'Water & Environment'
on conflict (category_id, name) do update set display_order = excluded.display_order, is_active = true;

insert into public.themes (category_id, name, display_order)
select c.id, x.name, x.display_order
from public.categories c
cross join lateral (
  values
    ('Teaching and Assessment', 1),
    ('Project Management', 2),
    ('Consultancy Practice', 3),
    ('Industry Readiness', 4)
) as x(name, display_order)
where c.name = 'Professional Practice'
on conflict (category_id, name) do update set display_order = excluded.display_order, is_active = true;

-- -------------------------------------------------------------------
-- Row Level Security - Phase 1 safe baseline
-- -------------------------------------------------------------------
-- Public pages can read active/published/upcoming/completed content.
-- Public users can insert enquiries and registrations.
-- Admin create/update/delete from frontend needs Supabase Auth policies later.
-- Until admin auth is added, use Supabase Dashboard to edit records online,
-- or ask ChatGPT to add temporary admin-write policies for testing only.

alter table public.levels enable row level security;
alter table public.categories enable row level security;
alter table public.themes enable row level security;
alter table public.instructors enable row level security;
alter table public.courses enable row level security;
alter table public.course_instructors enable row level security;
alter table public.learning_videos enable row level security;
alter table public.webinars enable row level security;
alter table public.webinar_instructors enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_instructors enable row level security;
alter table public.general_enquiries enable row level security;
alter table public.registrations enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Public read active levels" on public.levels;
create policy "Public read active levels" on public.levels
for select using (is_active = true);

drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories" on public.categories
for select using (is_active = true);

drop policy if exists "Public read active themes" on public.themes;
create policy "Public read active themes" on public.themes
for select using (is_active = true);

drop policy if exists "Public read active instructors" on public.instructors;
create policy "Public read active instructors" on public.instructors
for select using (status = 'Active');

drop policy if exists "Public read published courses" on public.courses;
create policy "Public read published courses" on public.courses
for select using (status = 'Published');

drop policy if exists "Public read course instructors" on public.course_instructors;
create policy "Public read course instructors" on public.course_instructors
for select using (true);

drop policy if exists "Public read published learning videos" on public.learning_videos;
create policy "Public read published learning videos" on public.learning_videos
for select using (status = 'Published');

drop policy if exists "Public read visible webinars" on public.webinars;
create policy "Public read visible webinars" on public.webinars
for select using (status in ('Upcoming', 'Completed'));

drop policy if exists "Public read webinar instructors" on public.webinar_instructors;
create policy "Public read webinar instructors" on public.webinar_instructors
for select using (true);

drop policy if exists "Public read visible workshops" on public.workshops;
create policy "Public read visible workshops" on public.workshops
for select using (status in ('Upcoming', 'Completed'));

drop policy if exists "Public read workshop instructors" on public.workshop_instructors;
create policy "Public read workshop instructors" on public.workshop_instructors
for select using (true);

drop policy if exists "Public insert general enquiries" on public.general_enquiries;
create policy "Public insert general enquiries" on public.general_enquiries
for insert with check (true);

drop policy if exists "Public insert registrations" on public.registrations;
create policy "Public insert registrations" on public.registrations
for insert with check (true);

-- -------------------------------------------------------------------
-- Storage buckets for public files
-- -------------------------------------------------------------------
-- Put instructor photos/resumes, course images/documents and logos here later.
-- Public read is enabled for these buckets.
-- Upload/write policies should be added after admin auth is configured.

insert into storage.buckets (id, name, public)
values
  ('terramatrix-logos', 'terramatrix-logos', true),
  ('terramatrix-instructors', 'terramatrix-instructors', true),
  ('terramatrix-courses', 'terramatrix-courses', true),
  ('terramatrix-events', 'terramatrix-events', true),
  ('terramatrix-documents', 'terramatrix-documents', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read TerraMatrix logos" on storage.objects;
create policy "Public read TerraMatrix logos" on storage.objects
for select using (bucket_id = 'terramatrix-logos');

drop policy if exists "Public read TerraMatrix instructors" on storage.objects;
create policy "Public read TerraMatrix instructors" on storage.objects
for select using (bucket_id = 'terramatrix-instructors');

drop policy if exists "Public read TerraMatrix courses" on storage.objects;
create policy "Public read TerraMatrix courses" on storage.objects
for select using (bucket_id = 'terramatrix-courses');

drop policy if exists "Public read TerraMatrix events" on storage.objects;
create policy "Public read TerraMatrix events" on storage.objects
for select using (bucket_id = 'terramatrix-events');

drop policy if exists "Public read TerraMatrix documents" on storage.objects;
create policy "Public read TerraMatrix documents" on storage.objects
for select using (bucket_id = 'terramatrix-documents');
