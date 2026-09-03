# YouTube2 — Vercel Static

Esta versão foi preparada para hospedagem estática na Vercel.

## Importante
- Não existe `package.json`.
- Não existe comando de build.
- Não precisa instalar Node/npm.
- `index.html` fica na raiz.
- `vercel.json` apenas configura as rotas amigáveis.
- Supabase continua sendo usado no navegador através de `assets/supabase.js`.

## Deploy pela Vercel
Se usar GitHub, o conteúdo desta pasta deve estar na raiz do repositório.

Na Vercel:
- Framework Preset: Other
- Build Command: deixe vazio
- Output Directory: `.`
- Install Command: deixe vazio

Se a Vercel mostrar uma opção para não executar build, mantenha-a sem comando.

Depois de publicar:
- `/` → index.html
- `/shorts` → shorts.html
- `/watch` → watch.html
- `/channel` → channel.html
- `/upload` → upload.html
- `/creator` → creator.html
- `/login` → login.html

## Supabase
Preencha `assets/supabase.js` com a URL e a chave pública do seu projeto.
Nunca coloque `service_role` ou chave secreta no frontend.
