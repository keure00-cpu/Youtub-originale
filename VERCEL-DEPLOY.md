# Deploy correto na Vercel

## Opção recomendada
1. Extraia este ZIP.
2. Suba **o conteúdo desta pasta** para um repositório GitHub (index.html deve ficar na raiz).
3. Na Vercel, importe o repositório.
4. Framework Preset: **Other**.
5. Build Command: `npm run build` (ou deixe automático).
6. Output Directory: deixe vazio.
7. Deploy.

## Se aparecer 404
Confirme no repositório que `index.html`, `vercel.json` e `assets/` estão na raiz. Não deixe uma pasta `YouTube2/` contendo esses arquivos dentro de outra pasta.

As rotas amigáveis estão definidas em `vercel.json`.
