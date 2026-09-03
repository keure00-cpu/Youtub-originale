# Monetização real do YouTube2

Esta versão separa três coisas:

1. **Exibição de anúncios:** o player pode buscar um VAST através de `/api/ads/vast`.
2. **Apuração:** eventos de anúncios entram em `ad_events` por backend/webhook.
3. **Pagamento ao criador:** Stripe Connect faz onboarding e repasses.

O navegador nunca deve definir o próprio saldo.

## Vercel Environment Variables

Configure no projeto da Vercel:

- `STRIPE_SECRET_KEY` — chave secreta do Stripe, somente no servidor.
- `VAST_AD_TAG_URL` — URL VAST do seu provedor de anúncios.

Nunca coloque essas variáveis em HTML/JS público.

## Stripe Connect

O endpoint `/api/connect/onboard` cria uma conta conectada e gera um link temporário de onboarding. Depois que o criador conclui o onboarding, você grava o `stripe_account_id` em `creator_payout_accounts`.

O Stripe documenta que payouts de contas conectadas podem ser agendados ou feitos manualmente e que eventos de payout podem ser acompanhados por webhooks.

## Anúncios

O Google IMA suporta VAST-compliant ad servers e pode trabalhar com Ad Manager/Ad Exchange/AdSense for Video. A URL VAST deve vir de uma conta de anúncios aprovada e configurada.

## Importante

Este projeto NÃO inventa receita. Publicar um vídeo não gera dinheiro automaticamente. A receita real só deve ser creditada quando o provedor de anúncios confirmar a receita. Depois, o backend pode reconciliar essa receita com o criador e disponibilizar o saldo para payout.

## Como habilitar

1. Crie/configure sua conta do provedor de anúncios.
2. Obtenha uma URL VAST válida.
3. Configure `VAST_AD_TAG_URL` na Vercel.
4. Crie/configure sua conta Stripe Connect.
5. Configure `STRIPE_SECRET_KEY` na Vercel.
6. Execute o `supabase-schema.sql`.
7. Publique novamente na Vercel.

