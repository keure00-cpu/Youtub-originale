import { supabase } from './supabase.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const state={videos:[],filter:'Todos'};

async function getVideos(){
  const {data,error}=await supabase.from('videos')
    .select('id,user_id,title,description,category,video_url,thumbnail_url,views,duration,published,created_at')
    .eq('published',true)
    .not('video_url','is',null)
    .order('created_at',{ascending:false})
    .limit(100);
  if(error) throw error;

  const list=data||[];
  const ids=[...new Set(list.map(v=>v.user_id).filter(Boolean))];
  const names={};
  if(ids.length){
    // channels é opcional: se a tabela ainda não existir, o site continua usando profiles.
    const {data:channels,error:channelError}=await supabase
      .from('channels')
      .select('user_id,name,handle')
      .in('user_id',ids);
    if(!channelError) (channels||[]).forEach(c=>names[c.user_id]=c);

    const missing=ids.filter(id=>!names[id]);
    if(missing.length){
      const {data:profiles}=await supabase
        .from('profiles')
        .select('id,display_name,username')
        .in('id',missing);
      (profiles||[]).forEach(p=>names[p.id]={
        name:p.display_name,
        handle:p.username
      });
    }
  }

  // Embaralhamento Fisher-Yates: cada carregamento da Home
  // apresenta uma ordem diferente dos vídeos publicados.
  for(let i=list.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [list[i],list[j]]=[list[j],list[i]];
  }

  return list.map(v=>({
    ...v,
    channel:names[v.user_id]?.name||'Canal YouTube2',
    handle:names[v.user_id]?.handle||''
  }));
}

function card(v){
  const playable=!!v.video_url;
  return `<article class="card" onclick="${playable?`location.href='/watch.html?id=${encodeURIComponent(v.id)}'`:'void(0)'}">
    <div class="thumb">${v.thumbnail_url?`<img src="${esc(v.thumbnail_url)}" loading="lazy">`:`<div class="thumb-empty">Sem miniatura</div>`}
      <div class="play">▶</div>${v.duration?`<span class="duration">${esc(v.duration)}</span>`:''}
    </div>
    <div class="card-body"><div class="channel-mini">${esc((v.channel||'C')[0].toUpperCase())}</div>
      <div><h3>${esc(v.title)}</h3><p>${esc(v.channel)}</p><p>${Number(v.views||0).toLocaleString('pt-BR')} visualizações</p></div>
    </div>
  </article>`;
}

async function home(){
  const grid=document.querySelector('#videoGrid'); if(!grid)return;
  grid.innerHTML='<div class="empty">Carregando vídeos...</div>';
  try{
    state.videos=await getVideos();
    const q=new URLSearchParams(location.search).get('q')?.toLowerCase()||'';
    const arr=state.videos.filter(v=>(state.filter==='Todos'||v.category===state.filter)&&
      (!q||v.title.toLowerCase().includes(q)||v.channel.toLowerCase().includes(q)));
    document.querySelector('#count')?.replaceChildren(document.createTextNode(`${arr.length} vídeo${arr.length===1?'':'s'}`));
    grid.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty">Nenhum vídeo publicado ainda. Seja o primeiro a publicar.</div>';
    const sr=document.querySelector('#shortsRow');
    if(sr) sr.innerHTML=arr.slice(0,6).map(v=>`<article class="short" onclick="location.href='/watch.html?id=${encodeURIComponent(v.id)}'"><div class="short-thumb">${v.thumbnail_url?`<img src="${esc(v.thumbnail_url)}">`:'<div class="thumb-empty">Sem miniatura</div>'}</div><h3>${esc(v.title)}</h3></article>`).join('')||'<div class="empty">Nenhum vídeo disponível.</div>';
  }catch(e){
    console.error(e);
    grid.innerHTML=`<div class="empty">Não foi possível carregar os vídeos.<br><small>${esc(e.message||e)}</small></div>`;
  }
}

document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.c||'Todos';home()});
const menu=document.querySelector('#menuBtn'); if(menu)menu.onclick=()=>document.querySelector('#sidebar')?.classList.toggle('hidden');
const search=document.querySelector('#searchForm'); if(search)search.onsubmit=e=>{e.preventDefault();location.href='/?q='+encodeURIComponent(document.querySelector('#searchInput').value)};
home();
