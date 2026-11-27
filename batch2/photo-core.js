/* ===== PHOTOS: free Wikimedia Commons photos for places, with credit ===== */
window.kcPhoto=(()=>{
  const KEY='bg_ph3';let cache={};try{cache=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  let dirty=0;const persist=()=>{clearTimeout(dirty);dirty=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}},800)};
  const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const strip=h=>{const d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||'').replace(/\s+/g,' ').trim()};
  let active=0;const queue=[];const run=()=>{while(active<3&&queue.length){active++;const [fn,res]=queue.shift();fn().then(res,()=>res(null)).finally(()=>{active--;run()})}};
  const limit=fn=>new Promise(res=>{queue.push([fn,res]);run()});
  async function find(name,where){
    const words=norm(name).split(' ').filter(w=>w.length>2&&!['the','and','lake','fort','valley','national','park','island','falls','hills','temple','beach'].includes(w));
    const key=words[0]||norm(name).split(' ')[0];
    const u='https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=search&gsrlimit=4&gsrsearch='+encodeURIComponent(name+' '+where)+'&prop=pageimages|pageprops&piprop=thumbnail|name&pithumbsize=720&ppprop=disambiguation';
    const j=await (await fetch(u)).json();const pages=Object.values((j.query&&j.query.pages)||{}).sort((a,b)=>a.index-b.index);
    const pg=pages.find(p=>p.thumbnail&&p.pageimage&&!(p.pageprops&&'disambiguation' in p.pageprops)&&norm(p.title).includes(key)&&!/\.svg$/i.test(p.pageimage)&&!/map|flag|logo|locator|emblem|seal/i.test(p.pageimage));
    if(!pg)return null;
    const c='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&titles='+encodeURIComponent('File:'+pg.pageimage)+'&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName';
    const k=await (await fetch(c)).json();const f=Object.values((k.query&&k.query.pages)||{})[0];
    if(!f||'missing' in f||!f.imageinfo)return null; /* not on Commons, so not free to reuse: skip */
    const md=f.imageinfo[0].extmetadata||{};const artist=strip(md.Artist&&md.Artist.value).slice(0,60)||'Wikimedia Commons';const lic=strip(md.LicenseShortName&&md.LicenseShortName.value)||'';
    return{src:pg.thumbnail.source,w:pg.thumbnail.width,h:pg.thumbnail.height,by:artist,lic,file:'https://commons.wikimedia.org/wiki/'+encodeURIComponent('File:'+pg.pageimage).replace(/%3A/,':'),page:'https://en.wikipedia.org/wiki/'+encodeURIComponent(pg.title.replace(/ /g,'_'))}}
  function get(name,where){const id=name+'|'+where;if(id in cache)return Promise.resolve(cache[id]);
    return limit(()=>find(name,where)).then(r=>{if(r!==undefined){cache[id]=r;persist()}return r})}
  function figure(r,name){return `<figure class="kc-ph"><img src="${r.src}" alt="${String(name).replace(/"/g,'&quot;')}" loading="lazy" decoding="async" width="${r.w}" height="${r.h}"><figcaption><a href="${r.file}" target="_blank" rel="noopener">Photo: ${r.by.replace(/</g,'&lt;')}${r.lic?' · '+r.lic:''}</a></figcaption></figure>`}
  /* fill any element marked data-ph="Name|State" when it scrolls near */
  const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);fill(e.target)}),{rootMargin:'300px'}):null;
  function fill(el){const [n,w]=(el.dataset.ph||'').split('|');if(!n)return;
    get(n,w||'').then(r=>{if(!r){el.remove();return}el.outerHTML=figure(r,n)}).catch(()=>el.remove())}
  function watch(root){(root||document).querySelectorAll('[data-ph]:not([data-ph-on])').forEach(el=>{el.setAttribute('data-ph-on','1');io?io.observe(el):fill(el)})}
  return{get,watch,figure};
})();
