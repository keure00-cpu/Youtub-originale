# YouTube2 Pro — Supabase + Vercel

Versão com backend real usando Supabase: autenticação, Storage de vídeos/miniaturas, canais, inscrições, curtidas, comentários, histórico, playlists, notificações e Studio do criador.

## 1. Supabase
1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute `supabase-schema.sql`.
3. Em **Settings > API**, copie a URL do projeto e a Publishable/anon key.
4. Edite `assets/supabase.js` e substitua os dois placeholders.
5. Em **Database > Publications/Realtime**, confirme que `comments` e `notifications` estão habilitadas para Realtime se o seu projeto não as tiver adicionado automaticamente.

O projeto usa `@supabase/supabase-js` v2 via CDN. Não coloque `service_role`/secret key no navegador.

## 2. Upload real
O `upload.html` envia o vídeo para o bucket `videos`, gera uma miniatura JPEG no navegador e envia a miniatura para `thumbnails`. Depois registra o vídeo em `public.videos`.

## 3. Recursos
- Home + busca + categorias
- Shorts
- Reprodução de vídeos
- View counter via RPC
- Curtidas
- Comentários
- Inscrições
- Playlists / assistir mais tarde
- Histórico
- Notificações por novo vídeo para inscritos
- Canais
- Studio do criador (`/creator.html`)
- Upload de vídeo + thumbnail
- Layout profissional e responsivo

## 4. Vercel
Suba o conteúdo desta pasta para um repositório e importe no Vercel. Não é necessário build complexo; o `package.json` declara Node 22+ e o projeto é servido como estático.

### Segurança
Use somente a Publishable/anon key no frontend. RLS e funções SQL controlam acesso. Nunca publique `service_role`/secret keys.
