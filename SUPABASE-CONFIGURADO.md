# Supabase configurado

O projeto foi configurado com:

Project URL:
https://phlborstiriwqtyqqwaz.supabase.co

A chave usada é a publishable key fornecida pelo usuário.

Não foi incluída nenhuma service_role/secret key no frontend.

## Se o login ainda falhar

No Supabase, confira:
1. Authentication → Providers → Email está habilitado.
2. Authentication → URL Configuration → Site URL inclui:
   https://youtube2-vercel-webhook-pagamentos.vercel.app
3. Execute `supabase-schema.sql` no SQL Editor.
4. Faça um novo deploy na Vercel após substituir o projeto.
