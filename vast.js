export default async function handler(req, res) {
  const tag = process.env.VAST_AD_TAG_URL;
  if (!tag) return res.status(204).end();
  try {
    const upstream = await fetch(tag, {headers:{"User-Agent":"YouTube2/1.0"}});
    const xml = await upstream.text();
    res.setHeader("Content-Type","application/xml; charset=utf-8");
    res.setHeader("Cache-Control","public, max-age=30");
    return res.status(upstream.status).send(xml);
  } catch (e) {
    return res.status(502).json({error:"Não foi possível obter o VAST."});
  }
}
