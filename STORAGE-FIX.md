# Corrigindo "Storage: Bucket not found"

O erro da tela significa que o projeto Supabase ainda não tem o bucket `videos`.

1. Abra o Supabase do projeto.
2. Vá em SQL Editor.
3. Execute o arquivo `supabase-schema.sql` inteiro desta build.
4. Confirme em Storage que existem os buckets públicos `videos` e `thumbnails`.
5. Faça novo deploy da Vercel se você alterou arquivos do frontend.

O schema agora cria automaticamente os dois buckets e as políticas para que cada usuário só possa enviar/alterar/apagar arquivos dentro da própria pasta (`USER_ID/...`), enquanto a reprodução pública pode ler os arquivos.

Não coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend.
