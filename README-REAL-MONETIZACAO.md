# YouTube2 — Monetização real

A versão continua com páginas estáticas, mas agora usa funções serverless somente para operações que precisam de segredo.

Não é necessário `npm install` para o site. As funções em `api/` são executadas pela Vercel.

Configure:
- `STRIPE_SECRET_KEY`
- `VAST_AD_TAG_URL`

Depois execute `supabase-schema.sql`.

O pagamento aos criadores é feito pelo Stripe Connect depois que houver fundos reais e o criador concluir o onboarding. A plataforma deve controlar elegibilidade, receita confirmada, saldo mínimo e regras de saque.
