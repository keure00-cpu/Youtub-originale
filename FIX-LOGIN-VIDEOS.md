# YT2 — correção de login e vídeos

Esta build remove os vídeos demonstrativos da Home e usa somente registros reais da tabela `videos`.

Principais correções:
- não usa `channels(...)` como relação embutida em `videos` (não existe FK dessa relação);
- Home busca canais/perfis separadamente;
- Watch busca o vídeo diretamente e usa `<video>` para arquivos do Storage;
- upload salva vídeo e miniatura no Storage;
- miniatura automática é criada no navegador se o usuário não fornecer uma;
- `duration` foi adicionado à tabela `videos`;
- login/signup usa referências DOM explícitas;
- canal é criado após login e também pelo trigger de novo usuário.

## Supabase
Execute o `supabase-schema.sql` inteiro no SQL Editor. O bucket `videos` e `thumbnails` são criados pelo script.

## Auth
No Supabase Authentication > URL Configuration, use o domínio final da Vercel como Site URL e adicione também a URL `/login.html` em Redirect URLs.
