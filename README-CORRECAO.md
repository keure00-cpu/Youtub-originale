# YT2 — versão corrigida

## 1. Supabase
Abra o Supabase > SQL Editor e execute o arquivo:
`SUPABASE-SETUP-OBRIGATORIO.sql`

Ele cria `public.videos` antes das demais tabelas e não depende de `channels` nem de Storage.

No final do SQL há um teste:
`select id, title, video_url, published from public.videos limit 1;`

Se aparecer uma tabela (mesmo vazia), a API está pronta.

## 2. Vercel
Envie os arquivos desta pasta para um projeto Vercel. `index.html` está na raiz.

## 3. Vídeos
Na página Publicar vídeo, cole um link público do YouTube. O arquivo de vídeo não é enviado ao Storage.
