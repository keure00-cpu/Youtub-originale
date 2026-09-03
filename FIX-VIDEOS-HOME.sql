-- Execute no Supabase SQL Editor se a Home mostrar erro de public.videos.
create extension if not exists pgcrypto;
create table if not exists public.videos (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 description text default '',
 category text default 'Todos',
 video_url text,
 thumbnail_url text,
 views bigint not null default 0,
 duration text,
 is_short boolean not null default false,
 published boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.videos add column if not exists video_url text;
alter table public.videos add column if not exists thumbnail_url text;
alter table public.videos add column if not exists duration text;
alter table public.videos add column if not exists is_short boolean not null default false;
alter table public.videos add column if not exists published boolean not null default true;
alter table public.videos add column if not exists updated_at timestamptz not null default now();
alter table public.videos enable row level security;
drop policy if exists "videos public published read" on public.videos;
create policy "videos public published read" on public.videos for select using (published = true or auth.uid() = user_id);
notify pgrst, 'reload schema';
