-- StairStudio AI: user-owned visualization data and private image storage.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  company text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visualization_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled room',
  room_path text not null,
  reference_path text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visualization_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.visualization_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  instruction text not null default '',
  world jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visualization_projects_user_updated_idx on public.visualization_projects(user_id, updated_at desc);
create index if not exists visualization_images_project_created_idx on public.visualization_images(project_id, created_at);

alter table public.profiles enable row level security;
alter table public.visualization_projects enable row level security;
alter table public.visualization_images enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users manage own visualization projects" on public.visualization_projects;
create policy "Users manage own visualization projects" on public.visualization_projects for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage own visualization images" on public.visualization_images;
create policy "Users manage own visualization images" on public.visualization_images for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('visualizations', 'visualizations', false, 20971520, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 20971520, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Users can read own visualization files" on storage.objects;
create policy "Users can read own visualization files" on storage.objects for select to authenticated using (bucket_id = 'visualizations' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can upload own visualization files" on storage.objects;
create policy "Users can upload own visualization files" on storage.objects for insert to authenticated with check (bucket_id = 'visualizations' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can update own visualization files" on storage.objects;
create policy "Users can update own visualization files" on storage.objects for update to authenticated using (bucket_id = 'visualizations' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'visualizations' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can delete own visualization files" on storage.objects;
create policy "Users can delete own visualization files" on storage.objects for delete to authenticated using (bucket_id = 'visualizations' and (storage.foldername(name))[1] = auth.uid()::text);
