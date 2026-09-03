# Home do YT2 — vídeos aleatórios

A Home consulta `public.videos`, considera somente vídeos publicados com `video_url`, busca até 100 registros e aplica Fisher-Yates no navegador para variar a ordem a cada carregamento.

O botão **🔀 Atualizar vídeos** executa uma nova consulta e novo embaralhamento.

Se o Supabase informar `Could not find the table public.videos in the schema cache`, execute `FIX-VIDEOS-HOME.sql` no SQL Editor do mesmo projeto Supabase configurado em `assets/supabase.js`.
