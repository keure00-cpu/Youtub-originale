# Webhook Stripe — confirmação automática de pagamentos

Endpoint:

`POST /api/stripe/webhook`

Ele:
- valida a assinatura `Stripe-Signature`;
- rejeita payloads falsificados;
- aceita `payout.paid`, `payout.failed` e `payout.canceled`;
- usa `event.id` para impedir processamento duplicado;
- atualiza `payouts` e `creator_balances` através de uma função SQL;
- usa a Service Role apenas no backend da Vercel.

## Variáveis na Vercel

Configure:

- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

A `SUPABASE_SERVICE_ROLE_KEY` NUNCA deve aparecer no HTML/JS do site.

## Stripe Dashboard

No Stripe:
1. Developers → Webhooks.
2. Adicione endpoint:
   `https://SEU-DOMINIO.vercel.app/api/stripe/webhook`
3. Selecione eventos de payout:
   - `payout.paid`
   - `payout.failed`
   - `payout.canceled`
4. Copie o Signing Secret (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.

## Supabase

Execute novamente o arquivo `supabase-schema.sql` no SQL Editor para criar:
- `stripe_webhook_events`
- `payouts.stripe_payout_id`
- `process_stripe_payout_event(...)`

## Como funciona

Quando o Stripe confirma um payout:

Stripe → `/api/stripe/webhook` → valida assinatura → Supabase RPC → `payouts.status = paid` → saldo `paid` atualizado.

Se o Stripe reportar falha/cancelamento, o valor do payout é devolvido ao saldo disponível somente quando existia um payout pendente/processing, evitando duplicação.

## Teste

Use o botão "Send test webhook" do Stripe Dashboard ou a Stripe CLI em ambiente de desenvolvimento. Não marque um pagamento como pago manualmente no banco para simular produção: o status deve ser confirmado pelo webhook assinado.
