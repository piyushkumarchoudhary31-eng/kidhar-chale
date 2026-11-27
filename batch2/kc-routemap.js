/* ===== ROUTE MAP: the plan's route drawn on a map with numbered stops ===== */
(()=>{
  const out=document.querySelector('#p-out');if(!out)return;
  const LCSS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',LJS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  let loading=null;
  const leaflet=()=>window.L?Promise.resolve(window.L):loading||(loading=new Promise((res,rej)=>{
    if(!document.querySelector(`link[href="${LCSS}"]`)){const c=document.createElement('link');c.rel='stylesheet';c.href=LCSS;document.head.appendChild(c)}
    const s=document.createElement('script');s.src=LJS;s.onload=()=>res(window.L);s.onerror=()=>{loading=null;rej()};document.head.appendChild(s)}));
  const stops=p=>{const cs=[];p.days.forEach(d=>String(d.city||'').split(/\s*(?:→|->)\s*/).forEach(c=>{c=c.trim();if(c&&!/^on the (bus|train)$/i.test(c)&&cs[cs.length-1]!==c)cs.push(c)}));return cs};
  let map=null,sig='';
  function draw(){const p=window.bgCurrentPlan&&bgCurrentPlan();if(!p||!p.days)return;
    const card=[...out.querySelectorAll('.card')].find(c=>/route on the map/i.test((c.querySelector('h3')||{}).textContent||''));if(!card||card.querySelector('.kc-rmap'))return;
    const cs=stops(p),pts=cs.map(n=>{const c=window.bgCoords&&bgCoords(n);return c&&isFinite(c.la)?{n,la:c.la,lo:c.lo}:null});
    const ok=pts.filter(Boolean);if(ok.length<2)return;
    const box=document.createElement('div');box.className='kc-rmap';box.setAttribute('role','img');box.setAttribute('aria-label','Map of the route: '+cs.join(' to '));
    box.innerHTML='<p class="kc-skel kc-mapskel" aria-busy="true">Loading the map…</p>';
    card.querySelector('.sub')?card.querySelector('.sub').after(box):card.appendChild(box);
    const go=()=>leaflet().then(L=>{box.innerHTML='';if(map){try{map.remove()}catch(e){}}
      map=L.map(box,{scrollWheelZoom:false,attributionControl:true,zoomControl:true});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:16,attribution:'© OpenStreetMap'}).addTo(map);
      const css=getComputedStyle(document.documentElement),acc=css.getPropertyValue('--accent').trim()||'#B5431C';
      const line=ok.map(x=>[x.la,x.lo]);
      L.polyline(line,{color:acc,weight:4,opacity:.85,dashArray:'8 8'}).addTo(map);
      const seen=new Map();ok.forEach((x,i)=>{const k=x.n.toLowerCase();if(seen.has(k)){seen.get(k).push(i+1);return}seen.set(k,[i+1]);
        L.marker([x.la,x.lo],{icon:L.divIcon({className:'kc-pin',html:`<span>${i+1}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(map).bindPopup(`<b>${x.n.replace(/</g,'&lt;')}</b>`)});
      map.fitBounds(L.latLngBounds(line).pad(.25),{maxZoom:9});
    }).catch(()=>{box.innerHTML='<p class="sub" style="padding:12px">The map couldn’t load. You may be offline.</p>'});
    if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();go()}},{rootMargin:'200px'});io.observe(box)}else go()}
  new MutationObserver(()=>{const p=window.bgCurrentPlan&&bgCurrentPlan();const s=p?JSON.stringify(stops(p)):'';if(s!==sig||!out.querySelector('.kc-rmap')){sig=s;draw()}}).observe(out,{childList:true});
  draw();
})();
