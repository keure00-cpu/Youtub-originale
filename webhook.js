import crypto from "node:crypto";

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifyStripeSignature(payload, signature, secret) {
  const parts = String(signature || "").split(",");
  const timestamp = parts.find(x => x.startsWith("t="))?.slice(2);
  const signatures = parts.filter(x => x.startsWith("v1=")).map(x => x.slice(3));
  if (!timestamp || !signatures.length) return false;

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > 300) return false;

  const signed = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  return signatures.some(sig => {
    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: "Configure STRIPE_WEBHOOK_SECRET, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel."
    });
  }

  try {
    const body = await rawBody(req);
    const signature = req.headers["stripe-signature"];
    const payload = body.toString("utf8");

    if (!verifyStripeSignature(payload, signature, webhookSecret)) {
      return res.status(400).json({ error: "Invalid Stripe signature." });
    }

    const event = JSON.parse(payload);

    // Only payout lifecycle events change the creator balance.
    const supported = new Set(["payout.paid", "payout.failed", "payout.canceled"]);
    if (!supported.has(event.type)) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const payout = event.data?.object || {};
    const accountId = event.account || payout.destination?.account || null;

    const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/process_stripe_payout_event`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_event_id: event.id,
        p_event_type: event.type,
        p_account_id: accountId,
        p_payout_id: payout.id || null,
        p_amount: Number(payout.amount || 0) / 100,
        p_currency: String(payout.currency || "brl").toUpperCase()
      })
    });

    const result = await rpc.json();
    if (!rpc.ok) {
      console.error("Supabase RPC error:", result);
      return res.status(500).json({ error: "Falha ao processar evento." });
    }

    return res.status(200).json({ received: true, result });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Webhook inválido." });
  }
}
