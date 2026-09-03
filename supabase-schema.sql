-- ============================================================
-- YT2 / YouTube2 - SUPABASE
-- INSTALAÇÃO MÍNIMA E ROBUSTA
-- Vídeos são links do YouTube. Não depende de channels nem Storage.
-- Execute este arquivo INTEIRO no Supabase SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "yt2_profiles_read" on public.profiles;
create policy "yt2_profiles_read" on public.profiles
for select using (true);

drop policy if exists "yt2_profiles_insert" on public.profiles;
create policy "yt2_profiles_insert" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "yt2_profiles_update" on public.profiles;
create policy "yt2_profiles_update" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ============================================================
-- 2. VIDEOS - CRIADA PRIMEIRO
-- ============================================================
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'Todos',
  video_url text,
  thumbnail_url text,
  duration text not null default '',
  source_type text not null default 'youtube',
  youtube_id text,
  views bigint not null default 0,
  likes_count bigint not null default 0,
  is_short boolean not null default false,
  published boolean not null default true,
  visibility text not null default 'public',
  source_project_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Se a tabela já existia em uma versão antiga, completar as colunas.
alter table public.videos add column if not exists user_id uuid;
alter table public.videos add column if not exists title text;
alter table public.videos add column if not exists description text default '';
alter table public.videos add column if not exists category text default 'Todos';
alter table public.videos add column if not exists video_url text;
alter table public.videos add column if not exists thumbnail_url text;
alter table public.videos add column if not exists duration text default '';
alter table public.videos add column if not exists source_type text default 'youtube';
alter table public.videos add column if not exists youtube_id text;
alter table public.videos add column if not exists views bigint default 0;
alter table public.videos add column if not exists likes_count bigint default 0;
alter table public.videos add column if not exists is_short boolean default false;
alter table public.videos add column if not exists published boolean default true;
alter table public.videos add column if not exists visibility text default 'public';
alter table public.videos add column if not exists source_project_id uuid;
alter table public.videos add column if not exists created_at timestamptz default now();
alter table public.videos add column if not exists updated_at timestamptz default now();

-- Garantir defaults em instalações antigas.
alter table public.videos alter column description set default '';
alter table public.videos alter column category set default 'Todos';
alter table public.videos alter column duration set default '';
alter table public.videos alter column source_type set default 'youtube';
alter table public.videos alter column views set default 0;
alter table public.videos alter column likes_count set default 0;
alter table public.videos alter column is_short set default false;
alter table public.videos alter column published set default true;
alter table public.videos alter column visibility set default 'public';
alter table public.videos alter column created_at set default now();
alter table public.videos alter column updated_at set default now();

alter table public.videos enable row level security;

drop policy if exists "yt2_videos_read" on public.videos;
create policy "yt2_videos_read" on public.videos
for select
using (published = true or auth.uid() = user_id);

drop policy if exists "yt2_videos_insert" on public.videos;
create policy "yt2_videos_insert" on public.videos
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "yt2_videos_update" on public.videos;
create policy "yt2_videos_update" on public.videos
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "yt2_videos_delete" on public.videos;
create policy "yt2_videos_delete" on public.videos
for delete to authenticated
using (auth.uid() = user_id);

create index if not exists yt2_videos_created_at_idx on public.videos(created_at desc);
create index if not exists yt2_videos_published_idx on public.videos(published);
create index if not exists yt2_videos_user_idx on public.videos(user_id);
create index if not exists yt2_videos_youtube_idx on public.videos(youtube_id);

-- ============================================================
-- 3. LIKES
-- ============================================================
create table if not exists public.likes (
  user_id uuid references auth.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
alter table public.likes enable row level security;
drop policy if exists "yt2_likes_read" on public.likes;
create policy "yt2_likes_read" on public.likes for select using (true);
drop policy if exists "yt2_likes_insert" on public.likes;
create policy "yt2_likes_insert" on public.likes for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "yt2_likes_delete" on public.likes;
create policy "yt2_likes_delete" on public.likes for delete to authenticated using (auth.uid()=user_id);

-- ============================================================
-- 4. SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  subscriber_id uuid references auth.users(id) on delete cascade,
  channel_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (subscriber_id, channel_user_id)
);
alter table public.subscriptions enable row level security;
drop policy if exists "yt2_subscriptions_read" on public.subscriptions;
create policy "yt2_subscriptions_read" on public.subscriptions for select using (true);
drop policy if exists "yt2_subscriptions_insert" on public.subscriptions;
create policy "yt2_subscriptions_insert" on public.subscriptions for insert to authenticated with check (auth.uid()=subscriber_id);
drop policy if exists "yt2_subscriptions_delete" on public.subscriptions;
create policy "yt2_subscriptions_delete" on public.subscriptions for delete to authenticated using (auth.uid()=subscriber_id);

-- ============================================================
-- 5. COMMENTS
-- ============================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
drop policy if exists "yt2_comments_read" on public.comments;
create policy "yt2_comments_read" on public.comments for select using (true);
drop policy if exists "yt2_comments_insert" on public.comments;
create policy "yt2_comments_insert" on public.comments for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "yt2_comments_update" on public.comments;
create policy "yt2_comments_update" on public.comments for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "yt2_comments_delete" on public.comments;
create policy "yt2_comments_delete" on public.comments for delete to authenticated using (auth.uid()=user_id);

-- ============================================================
-- 6. PLAYLISTS / ITEMS
-- ============================================================
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.playlists enable row level security;
drop policy if exists "yt2_playlists_read" on public.playlists;
create policy "yt2_playlists_read" on public.playlists for select to authenticated using (auth.uid()=user_id);
drop policy if exists "yt2_playlists_insert" on public.playlists;
create policy "yt2_playlists_insert" on public.playlists for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "yt2_playlists_update" on public.playlists;
create policy "yt2_playlists_update" on public.playlists for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "yt2_playlists_delete" on public.playlists;
create policy "yt2_playlists_delete" on public.playlists for delete to authenticated using (auth.uid()=user_id);

create table if not exists public.playlist_items (
  playlist_id uuid references public.playlists(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (playlist_id, video_id)
);
alter table public.playlist_items enable row level security;
drop policy if exists "yt2_playlist_items_read" on public.playlist_items;
create policy "yt2_playlist_items_read" on public.playlist_items for select to authenticated
using (exists(select 1 from public.playlists p where p.id=playlist_id and p.user_id=auth.uid()));
drop policy if exists "yt2_playlist_items_insert" on public.playlist_items;
create policy "yt2_playlist_items_insert" on public.playlist_items for insert to authenticated
with check (exists(select 1 from public.playlists p where p.id=playlist_id and p.user_id=auth.uid()));
drop policy if exists "yt2_playlist_items_delete" on public.playlist_items;
create policy "yt2_playlist_items_delete" on public.playlist_items for delete to authenticated
using (exists(select 1 from public.playlists p where p.id=playlist_id and p.user_id=auth.uid()));

-- ============================================================
-- 7. WATCH HISTORY
-- ============================================================
create table if not exists public.watch_history (
  user_id uuid references auth.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
alter table public.watch_history enable row level security;
drop policy if exists "yt2_history_read" on public.watch_history;
create policy "yt2_history_read" on public.watch_history for select to authenticated using (auth.uid()=user_id);
drop policy if exists "yt2_history_insert" on public.watch_history;
create policy "yt2_history_insert" on public.watch_history for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "yt2_history_update" on public.watch_history;
create policy "yt2_history_update" on public.watch_history for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "yt2_history_delete" on public.watch_history;
create policy "yt2_history_delete" on public.watch_history for delete to authenticated using (auth.uid()=user_id);

-- ============================================================
-- 8. VIEW COUNTER
-- ============================================================
create or replace function public.increment_video_views(p_video_id uuid)
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.videos
  set views = coalesce(views,0) + 1, updated_at = now()
  where id = p_video_id
  returning views;
$$;
grant execute on function public.increment_video_views(uuid) to anon, authenticated;

-- ============================================================
-- 9. NOTIFICAÇÕES (opcional para o restante do projeto)
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists "yt2_notifications_read" on public.notifications;
create policy "yt2_notifications_read" on public.notifications for select to authenticated using (auth.uid()=user_id);
drop policy if exists "yt2_notifications_update" on public.notifications;
create policy "yt2_notifications_update" on public.notifications for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- ============================================================
-- 10. CACHE DO POSTGREST
-- ============================================================
notify pgrst, 'reload schema';

-- TESTE: se retornar uma linha (mesmo 0 linhas), a tabela existe.
select id, title, video_url, published
from public.videos
limit 1;
