export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({error:"STRIPE_SECRET_KEY não configurada na Vercel."});
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const email = body.email;
    const returnUrl = body.return_url;
    const refreshUrl = body.refresh_url;
    if (!email || !returnUrl || !refreshUrl) return res.status(400).json({error:"email, return_url e refresh_url são obrigatórios."});

    const create = await fetch("https://api.stripe.com/v1/accounts", {
      method:"POST",
      headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({
        type:"express",
        email,
        "capabilities[card_payments]":"requested",
        "capabilities[transfers]":"requested"
      })
    });
    const account = await create.json();
    if (!create.ok) return res.status(create.status).json({error:account.error?.message || "Falha ao criar conta Stripe."});

    const link = await fetch("https://api.stripe.com/v1/account_links", {
      method:"POST",
      headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({
        account:account.id,
        refresh_url:refreshUrl,
        return_url:returnUrl,
        type:"account_onboarding"
      })
    });
    const data = await link.json();
    if (!link.ok) return res.status(link.status).json({error:data.error?.message || "Falha ao criar onboarding."});
    return res.status(200).json({account_id:account.id,url:data.url});
  } catch (e) {
    return res.status(500).json({error:e.message});
  }
}
