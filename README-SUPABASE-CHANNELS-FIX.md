# YT2 — Supabase Channels + YouTube

1. Abra o Supabase Dashboard → SQL Editor.
2. Execute `supabase-schema.sql` inteiro.
3. Aguarde alguns segundos e recarregue o site.

Este schema cria `public.channels` antes do restante do backend, habilita RLS, cria as políticas do canal, mantém `public.videos` com suporte a `youtube_id` e usa buckets de Storage de forma idempotente.

Se o PostgREST ainda mostrar `Could not find the table public.channels in the schema cache`, no SQL Editor execute:

```sql
NOTIFY pgrst, 'reload schema';
```
