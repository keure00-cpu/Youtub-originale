import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  const id=req.query?.id;
  if(!id) return res.status(400).json({error:"Missing id"});
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return res.status(500).json({error:"Server not configured"});
  const r=await fetch(`${url}/rest/v1/video_projects?id=eq.${encodeURIComponent(id)}&select=id,status,output_video_url,error_message,updated_at`,{
    headers:{apikey:key,Authorization:`Bearer ${key}`}
  });
  const data=await r.json();
  if(!r.ok) return res.status(500).json({error:"Supabase error"});
  return res.status(200).json(data?.[0]||null);
}
