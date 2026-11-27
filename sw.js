const C='kidhar-chale-v17',X='kc-static-v1';
const CORE=['./','./index.html','./manifest.json','./icon.svg','./icon-192.png','./assets/config.js','./assets/page.css','./assets/photo.js','./404.html'];
const ROOT=new URL('./',self.location).pathname;
const offline=u=>u.pathname===ROOT||u.pathname===ROOT+'index.html'?caches.match('./index.html'):new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline · Kidhar Chale?</title><body style="font:16px/1.5 system-ui,sans-serif;background:#EEE8DB;color:#1F1B16;margin:0;padding:40px 20px"><div style="max-width:460px;margin:auto"><h1 style="margin:0 0 8px">You are offline</h1><p>This page is not saved on your phone yet. Your trip planner, saved plans and tools still work without internet.</p><p><a href="'+ROOT+'" style="color:#B5431C;font-weight:700">Open the planner</a></p></div>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
const STATIC=['fonts.googleapis.com','fonts.gstatic.com','cdnjs.cloudflare.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==X).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  /* fonts and the map code never change at a given address: keep them, so the site looks right offline */
  if(STATIC.includes(u.hostname)){e.respondWith(caches.open(X).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))));return}
  if(u.origin!==location.origin)return;
  /* our own pages: newest from the network, but don't wait more than 4 s on a weak signal */
  const key=r.mode==='navigate'?new Request(u.origin+u.pathname):r;
  e.respondWith(new Promise(done=>{let sent=false;const send=x=>{if(!sent&&x){sent=true;done(x)}};
    const cached=()=>caches.match(key,{ignoreSearch:r.mode==='navigate'});
    const t=setTimeout(()=>cached().then(send),4000);
    fetch(r).then(res=>{clearTimeout(t);if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp))}send(res)})
      .catch(()=>{clearTimeout(t);cached().then(m=>send(m||(r.mode==='navigate'?offline(u):Response.error())))})
      .finally(()=>setTimeout(()=>{if(!sent)cached().then(m=>send(m||Response.error()))},4100))}))});
