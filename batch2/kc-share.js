/* ===== SHARE: trip links that open the full plan, and ?to= prefill from place pages ===== */
(()=>{
  const base=location.origin+location.pathname.replace(/[^/]*$/,'');
  const b64u=u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
  const unb64u=t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
  const pipe=async(u8,Stream,kind)=>new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new Stream(kind))).arrayBuffer());
  const slim=p=>({v:1,title:p.title,summary:p.summary,days:p.days.map(d=>({day:d.day,city:d.city,items:d.items.map(i=>({time:i.time,what:i.what,cost:i.cost,kind:i.kind})),stay:{city:d.stay.city,pick:d.stay.pick,options:(d.stay.options||[]).map(o=>({name:o.name||null,type:o.type,area:o.area,price:o.price,note:o.note}))}})),tips:p.tips||[],verify:p.verify||[],meta:p.meta||{}});
  async function encode(p){const u=new TextEncoder().encode(JSON.stringify(slim(p)));
    if(window.CompressionStream){try{return 'z'+b64u(await pipe(u,CompressionStream,'deflate-raw'))}catch(e){}}return 'j'+b64u(u)}
  async function decode(t){const kind=t[0],u=unb64u(t.slice(1));
    const raw=kind==='z'?await pipe(u,DecompressionStream,'deflate-raw'):u;return JSON.parse(new TextDecoder().decode(raw))}
  window.kcTripLink=async p=>base+'?trip='+(await encode(p))+'#plan';
  const flash=(msg)=>{const e=document.querySelector('#p-copied');if(!e)return;e.textContent=msg;e.hidden=false;clearTimeout(flash.t);flash.t=setTimeout(()=>e.hidden=true,3500)};
  const copy=async txt=>{try{await navigator.clipboard.writeText(txt);return true}catch(e){const ta=document.querySelector('#p-copytxt');if(ta){ta.value=txt;ta.hidden=false;ta.focus();ta.select()}return false}};
  window.kcTripShareHook=p=>{
    const L=document.querySelector('#p-link'),W=document.querySelector('#p-wa');
    if(L)L.onclick=async()=>{const url=await window.kcTripLink(p);
      if(navigator.share&&matchMedia('(pointer:coarse)').matches){try{await navigator.share({title:p.title,text:'My trip plan on Kidhar Chale?',url});return}catch(e){if(e&&e.name==='AbortError')return}}
      flash((await copy(url))?'Link copied. Paste it in any chat.':'Link selected. Tap Copy.');if(window.kcTrack)kcTrack('share',{method:'link'})};
    if(W)W.onclick=async()=>{const url=await window.kcTripLink(p);const txt=`${p.title} (${p.days.length} day${p.days.length>1?'s':''}). Full plan: ${url}`;
      window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener');if(window.kcTrack)kcTrack('share',{method:'whatsapp_link'})}};
  /* opening a shared link */
  const q=new URLSearchParams(location.search),clean=()=>history.replaceState(null,'',location.pathname+(location.hash||'#plan'));
  const t=q.get('trip');
  if(t){decode(t).then(p=>{if(!window.bgRenderPlan||!window.bgRenderPlan(p))throw 0;clean();
      const m=document.querySelector('#m-know');if(m)m.click();if(window.bgShow)bgShow('plan');
      const out=document.querySelector('#p-out');if(out){out.insertAdjacentHTML('afterbegin','<div class="card kc-shared"><p><b>A friend shared this trip with you.</b> It is saved on your phone now. Change the stays, track money or make it your own.</p></div>');setTimeout(()=>out.scrollIntoView({block:'start',behavior:'smooth'}),400)}
    }).catch(()=>{clean();alertBox('This trip link looks broken or cut short. Ask your friend to send it again.')})}
  /* coming from a place page: ?to=Kasol&from=Delhi&days=3 */
  const to=q.get('to');
  if(to&&!t){const m=document.querySelector('#m-know');if(m)m.click();
    const set=(id,v)=>{const e=document.querySelector(id);if(e&&v){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
    set('#p-to',to);set('#p-from',q.get('from'));set('#p-days',q.get('days'));if(window.bgShow)bgShow('plan');clean();
    setTimeout(()=>{const f=document.querySelector(q.get('from')?'#p-go':'#p-from');if(f){f.scrollIntoView({block:'center',behavior:'smooth'});if(!q.get('from'))f.focus({preventScroll:true})}},450)}
  function alertBox(msg){const out=document.querySelector('#p-out');if(out)out.insertAdjacentHTML('afterbegin',`<div class="card kc-shared"><p>${msg}</p></div>`)}
})();
