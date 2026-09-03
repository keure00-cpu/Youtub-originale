# YT2 — pronto para Vercel

Este pacote está com os arquivos na raiz do projeto (sem uma pasta externa).

## Deploy
1. No Vercel, importe este ZIP/projeto.
2. Framework Preset: Other.
3. Build Command: deixe vazio.
4. Output Directory: deixe vazio.
5. Root Directory: `.`.
6. Faça o deploy.

O `vercel.json` já direciona `/` para `index.html` e mantém as rotas principais.


## Correção channels opcional
O frontend não depende mais da tabela `public.channels`. Se ela não existir, a Home, login, publicação e página de vídeo continuam funcionando e usam `profiles` como fallback quando disponível.
