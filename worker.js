import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POLL_MS = Number(process.env.POLL_MS || 5000);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json"
};

async function db(url, options={}) {
  const r = await fetch(url, { ...options, headers: {...headers, ...(options.headers||{})} });
  const text = await r.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) throw new Error(`${r.status}: ${JSON.stringify(data)}`);
  return data;
}

function ffmpeg(args, cwd) {
  return new Promise((resolve,reject)=>{
    const p=spawn("ffmpeg", args, {cwd, stdio:["ignore","pipe","pipe"]});
    let stderr="";
    p.stderr.on("data",d=>stderr+=d.toString());
    p.on("close",code=>code===0?resolve():reject(new Error(stderr.slice(-5000)||`ffmpeg exited ${code}`)));
  });
}

async function download(url, dest) {
  const r=await fetch(url);
  if(!r.ok) throw new Error(`Download failed ${r.status}: ${url}`);
  const buf=Buffer.from(await r.arrayBuffer());
  await fs.writeFile(dest,buf);
}

async function claimProject() {
  // Requires the SQL function in supabase-schema.sql below.
  const rows=await db(`${SUPABASE_URL}/rest/v1/rpc/claim_next_video_project`, {
    method:"POST", body:"{}"
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function processProject(project) {
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),"yt2-"));
  try {
    const clips=project.manifest?.clips||[];
    if(!clips.length) throw new Error("Projeto sem clipes.");

    const files=[];
    for(let i=0;i<clips.length;i++){
      const dest=path.join(tmp,`clip-${i}.mp4`);
      await download(clips[i].video_url,dest);
      files.push(dest);
    }

    const normalized=[];
    for(let i=0;i<files.length;i++){
      const out=path.join(tmp,`norm-${i}.mp4`);
      const fade=project.manifest?.transition==="fade";
      const filters=[
        "scale=1920:1080:force_original_aspect_ratio=decrease",
        "pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
        "format=yuv420p"
      ];
      if(fade) filters.push("fade=t=in:st=0:d=0.5");
      await ffmpeg([
        "-y","-i",files[i],
        "-vf",filters.join(","),
        "-r","30","-c:v","libx264","-preset","veryfast","-crf","23",
        "-c:a","aac","-ar","48000","-ac","2","-b:a","128k",
        "-movflags","+faststart",out
      ],tmp);
      normalized.push(out);
    }

    const listFile=path.join(tmp,"concat.txt");
    await fs.writeFile(listFile,normalized.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join("\n"));
    let output=path.join(tmp,"concat.mp4");
    await ffmpeg(["-y","-f","concat","-safe","0","-i",listFile,"-c","copy","-movflags","+faststart",output],tmp);

    // Optional background music. The Builder stores the request; the worker
    // uses MUSIC_URL supplied by the server environment so copyrighted/local
    // browser files are never trusted as arbitrary remote input.
    if(project.manifest?.music && process.env.MUSIC_URL){
      const music=path.join(tmp,"music.m4a");
      await download(process.env.MUSIC_URL,music);
      const mixed=path.join(tmp,"mixed.mp4");
      await ffmpeg([
        "-y","-i",output,"-stream_loop","-1","-i",music,
        "-filter_complex","[0:a]volume=1[a0];[1:a]volume=0.12[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[a]",
        "-map","0:v:0","-map","[a]","-c:v","copy","-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",mixed
      ],tmp);
      output=mixed;
    }

    // Optional captions. A VTT/SRT file can be supplied by a trusted worker
    // environment or generated upstream and referenced in the manifest.
    if(project.manifest?.captions && project.manifest?.captions_url){
      const captions=path.join(tmp,"captions.vtt");
      await download(project.manifest.captions_url,captions);
      const captioned=path.join(tmp,"captioned.mp4");
      await ffmpeg([
        "-y","-i",output,"-vf",`subtitles=${captions.replaceAll(":","\\:")}`,
        "-c:v","libx264","-preset","veryfast","-crf","23",
        "-c:a","copy","-movflags","+faststart",captioned
      ],tmp);
      output=captioned;
    }

    const objectPath=`${project.user_id}/${project.id}.mp4`;
    const data=await fs.readFile(output);
    const upload=await fetch(`${SUPABASE_URL}/storage/v1/object/videos/${objectPath}`,{
      method:"POST",
      headers:{...headers,"Content-Type":"video/mp4","x-upsert":"true"},
      body:data
    });
    if(!upload.ok) throw new Error(`Storage upload failed ${upload.status}: ${await upload.text()}`);

    const publicUrl=`${SUPABASE_URL}/storage/v1/object/public/videos/${objectPath}`;
    const manifest=project.manifest||{};
    const videoPayload={
      user_id:project.user_id,
      title:project.title,
      description:project.description||'',
      category:'Todos',
      video_url:publicUrl,
      thumbnail_url:manifest.clips?.[0]?.thumbnail_url||null,
      duration:null,
      visibility:manifest.visibility||'public',
      source_project_id:project.id
    };
    const vr=await fetch(`${SUPABASE_URL}/rest/v1/videos?on_conflict=source_project_id`,{
      method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(videoPayload)
    });
    if(!vr.ok) throw new Error(`Videos insert failed ${vr.status}: ${await vr.text()}`);
    await db(`${SUPABASE_URL}/rest/v1/video_projects?id=eq.${encodeURIComponent(project.id)}`,{
      method:"PATCH",
      body:JSON.stringify({status:"ready",output_video_url:publicUrl,updated_at:new Date().toISOString()})
    });
    console.log("READY",project.id,publicUrl);
  } catch(e) {
    console.error("FAILED",project.id,e);
    await db(`${SUPABASE_URL}/rest/v1/video_projects?id=eq.${encodeURIComponent(project.id)}`,{
      method:"PATCH",
      body:JSON.stringify({status:"failed",error_message:String(e.message||e),updated_at:new Date().toISOString()})
    }).catch(()=>{});
  } finally {
    await fs.rm(tmp,{recursive:true,force:true});
  }
}

async function loop(){
  for(;;){
    try {
      const p=await claimProject();
      if(p) await processProject(p);
    } catch(e) {
      console.error("worker:",e);
      await new Promise(r=>setTimeout(r,POLL_MS));
    }
    await new Promise(r=>setTimeout(r,POLL_MS));
  }
}
loop();
