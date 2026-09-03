-- YT2: correção direta do Storage
-- Execute este arquivo no Supabase > SQL Editor > Run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  1073741824,
  array['video/mp4','video/webm','video/quicktime','video/x-m4v']::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = 1073741824,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'thumbnails',
  'thumbnails',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

-- Remove políticas anteriores do YT2, se existirem.
drop policy if exists "YT2 public read videos" on storage.objects;
drop policy if exists "YT2 users upload videos" on storage.objects;
drop policy if exists "YT2 users update own videos" on storage.objects;
drop policy if exists "YT2 users delete own videos" on storage.objects;
drop policy if exists "YT2 public read thumbnails" on storage.objects;
drop policy if exists "YT2 users upload thumbnails" on storage.objects;
drop policy if exists "YT2 users update own thumbnails" on storage.objects;
drop policy if exists "YT2 users delete own thumbnails" on storage.objects;

create policy "YT2 public read videos"
on storage.objects for select
using (bucket_id = 'videos');

create policy "YT2 users upload videos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "YT2 users update own videos"
on storage.objects for update to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "YT2 users delete own videos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "YT2 public read thumbnails"
on storage.objects for select
using (bucket_id = 'thumbnails');

create policy "YT2 users upload thumbnails"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "YT2 users update own thumbnails"
on storage.objects for update to authenticated
using (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "YT2 users delete own thumbnails"
on storage.objects for delete to authenticated
using (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
);

notify pgrst, 'reload schema';
