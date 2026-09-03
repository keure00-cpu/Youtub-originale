# YT2 usando vídeos do YouTube

O formulário de publicação agora aceita links do YouTube e não envia o arquivo de vídeo para o bucket `videos`.

## Supabase
Execute `supabase-schema.sql` para adicionar `source_type` e `youtube_id`.

## Publicação
Aceita:
- https://www.youtube.com/watch?v=ID
- https://youtu.be/ID
- https://www.youtube.com/shorts/ID
- https://www.youtube.com/embed/ID

O YT2 salva `video_url`, `youtube_id` e a miniatura pública do YouTube.

## Player
`watch.html` detecta vídeos do YouTube e usa o player embed. Vídeos antigos hospedados no Storage continuam funcionando.
