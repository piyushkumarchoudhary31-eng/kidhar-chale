(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(k,d){try{const v=localStorage.getItem('bg_'+k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem('bg_'+k,JSON.stringify(v))}catch(e){}}
const enc=encodeURIComponent,rad=x=>x*Math.PI/180;
const gmap=q=>'https://www.google.com/maps/search/?api=1&query='+enc(q);
const wiki=q=>'https://en.wikipedia.org/w/index.php?title=Special:Search&go=Go&search='+enc(q);
function km(a,b){const dLa=rad(b.la-a.la),dLo=rad(b.lo-a.lo);const h=Math.sin(dLa/2)**2+Math.cos(rad(a.la))*Math.cos(rad(b.la))*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.sqrt(h))}
const findCo=window.bgCoords;
const MS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH=new Date().getMonth()+1;
const PL=(window.bgPlaces||[]).filter(p=>p.reg[0]!=='X').map(p=>{const c=findCo(p.n);return c&&c.n.toLowerCase()===p.n.toLowerCase()?Object.assign({},p,{la:c.la,lo:c.lo}):null}).filter(Boolean);
const monthText=str=>String(str).split(',').map(r=>{const[a,b]=r.split('-').map(Number);return b&&b!==a?MS[a-1]+'–'+MS[b-1]:MS[a-1]}).join(', ');
const vx=$('#v-explore');
function planThis(from,to){const f=$('#p-from'),t=$('#p-to');if(from)f.value=from;t.value=to;[f,t].forEach(x=>x.dispatchEvent(new Event('change')));const k=$('#m-know');if(k)k.click();window.bgShow('plan');setTimeout(()=>{const d=$('#p-days');if(d){d.scrollIntoView({block:'center'});d.focus()}},120)}

/* ---------- WEEKEND TRIPS FROM MY CITY ---------- */
vx.insertAdjacentHTML('beforeend',`<div id="x-week" class="stack" hidden><div class="card">
 <h2>🚗 Weekend trips from my city</h2>
 <p class="sub">Places you can reach for a 2–3 day trip, nearest first. Good-this-month places are marked.</p>
 <div class="row"><label for="wk-city">My city<input id="wk-city" list="ow-dl" placeholder="e.g. Delhi, Jodhpur, Pune" autocomplete="off"></label><button id="wk-loc" class="ghost" style="flex:0 0 auto;align-self:flex-end">📍 Near me</button></div>
 <div class="quick" id="wk-r" role="group" aria-label="How far"><button data-r="150">Up to 150 km</button><button data-r="300">Up to 300 km</button><button data-r="500">Up to 500 km</button></div>
 <div class="quick"><button id="wk-now" aria-pressed="false">🗓 Good in ${['January','February','March','April','May','June','July','August','September','October','November','December'][MONTH-1]} only</button></div>
 <p class="err" id="wk-err" hidden></p></div><div id="wk-out" class="stack"></div></div>`);
const W=Object.assign({city:'',r:300,now:false},load('week',{}));const MNAME=['January','February','March','April','May','June','July','August','September','October','November','December'];
function nowLabel(){const b=$('#wk-now');if(b)b.textContent='🗓 Good in '+MNAME[(W.m||MONTH)-1]+' only'}
function wkDraw(here){const err=$('#wk-err');err.hidden=true;
  document.querySelectorAll('#wk-r [data-r]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.r===W.r));$('#wk-now').setAttribute('aria-pressed',W.now);
  let A=here;if(!A){if(!W.city){$('#wk-out').innerHTML='';return}A=findCo(W.city);if(!A){err.textContent=`We couldn't find "${W.city}". Try a nearby bigger city.`;err.hidden=false;$('#wk-out').innerHTML='';return}}
  const L=PL.map(p=>({p,d:km(A,p)})).filter(x=>x.d>=25&&x.d<=W.r&&(!W.now||x.p.ms.has(W.m||MONTH))).sort((a,b)=>a.d-b.d).slice(0,40);
  if(!L.length){$('#wk-out').innerHTML=`<div class="card"><p>Nothing in our list within ${W.r} km${W.now?' that is good in '+MNAME[(W.m||MONTH)-1]:''}. Try a bigger distance.</p></div>`;return}
  $('#wk-out').innerHTML=`<p class="eyebrow">${L.length} places from ${esc(here?'where you are':A.n)}</p>`+L.map(({p,d})=>{const road=d*(p.tags.includes('m')?1.5:1.3),hrs=road/45;
   return`<article class="card wk"><div class="dayhead"><h3>${esc(p.n)}</h3><span class="pill">${Math.round(road/10)*10} km</span></div><p class="sub">${esc(p.state)} · about ${hrs<1.5?Math.round(hrs*60)+' min':Math.round(hrs*2)/2+' h'} by road${p.ms.has(MONTH)?' · <span class="goodnow">good now</span>':' · best '+monthText(p.best)}</p><p>${esc(p.why)}</p><p class="sub">🚌 ${esc(p.reach)}</p>
   <div class="row" style="gap:8px"><button class="small primary" data-pt="${esc(p.n)}">Plan this trip</button><a class="btnlink" href="https://www.google.com/maps/dir/?api=1&origin=${here?A.la+','+A.lo:enc(A.n)}&destination=${enc(p.n+', '+p.state)}" target="_blank" rel="noopener">🧭 Route</a><a class="btnlink" href="${wiki(p.n)}" target="_blank" rel="noopener">📖 About</a></div></article>`}).join('');
  $('#wk-out').querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>planThis(here?'':A.n,b.dataset.pt))}
$('#wk-city').value=W.city;
$('#wk-city').addEventListener('change',()=>{W.city=$('#wk-city').value.trim();save('week',W);wkDraw()});
$('#wk-city').addEventListener('keydown',e=>{if(e.key==='Enter'){W.city=$('#wk-city').value.trim();save('week',W);wkDraw()}});
document.querySelectorAll('#wk-r [data-r]').forEach(b=>b.onclick=()=>{W.r=+b.dataset.r;save('week',W);wkDraw(W._here)});
$('#wk-now').onclick=()=>{W.now=!W.now;if(!W.now)W.m=0;save('week',W);nowLabel();wkDraw(W._here)};nowLabel();
window.bgWeekendMonth=m=>{W.now=true;W.m=m;W.r=Math.max(W.r,300);save('week',W);nowLabel();wkDraw(W._here)};
$('#wk-loc').onclick=()=>{const err=$('#wk-err');if(!navigator.geolocation){err.textContent='Location isn’t available here. Type your city.';err.hidden=false;return}
  navigator.geolocation.getCurrentPosition(p=>{W._here={la:p.coords.latitude,lo:p.coords.longitude,n:'you'};wkDraw(W._here)},()=>{err.textContent='Location is blocked. Type your city instead.';err.hidden=false},{timeout:12000,maximumAge:300000})};
document.addEventListener('kc-xmode',e=>{if(e.detail==='wk'&&!$('#wk-out').innerHTML){if(!W.city){const f=($('#p-from')||{}).value;if(f){W.city=f;$('#wk-city').value=f}}wkDraw()}});
window.bgWeekend=wkDraw;

/* ---------- MAP (OpenStreetMap, loaded only when opened) ---------- */
vx.insertAdjacentHTML('beforeend',`<div id="x-map" class="stack" hidden><div class="card"><h2>🗺 Map of all places</h2><p class="sub">${PL.length} places in India. Tap a pin for details. Colours show daily cost: <b style="color:#0B8F57">● cheap</b> <b style="color:#E0A100">● moderate</b> <b style="color:#D8203A">● pricier</b>.</p>
 <div class="quick"><button id="mp-now" aria-pressed="false">🗓 Good this month</button><button id="mp-me">📍 Show me</button></div>
 <div id="mp" class="mapbox" role="region" aria-label="Map of places"><p class="kc-skel kc-mapskel" aria-busy="true">Loading the map…</p></div>
 <p class="sub" style="font-size:12px">Map © OpenStreetMap contributors. Needs internet.</p></div></div>`);
let MAP=null,LAYER=null,mpNow=false,mapLoading=false;
function loadLeaflet(cb){if(window.L)return cb();if(mapLoading)return;mapLoading=true;
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.appendChild(css);
  const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=()=>{mapLoading=false;cb()};
  s.onerror=()=>{mapLoading=false;$('#mp').innerHTML='<p class="sub" style="padding:16px">The map couldn’t load. You may be offline. Everything else still works.</p>'};document.head.appendChild(s)}
const COL=['#0B8F57','#E0A100','#D8203A'];
function drawPins(){if(!MAP)return;if(LAYER)LAYER.remove();LAYER=L.layerGroup().addTo(MAP);
  PL.filter(p=>!mpNow||p.ms.has(MONTH)).forEach(p=>{L.circleMarker([p.la,p.lo],{radius:6,color:'#16121F',weight:1.5,fillColor:COL[(p.cost||2)-1],fillOpacity:.95}).addTo(LAYER)
   .bindPopup(`<b>${esc(p.n)}</b><br><small>${esc(p.state)} · best ${monthText(p.best)}</small><p style="margin:6px 0">${esc(p.why)}</p><a href="${gmap(p.n+', '+p.state)}" target="_blank" rel="noopener">Google Maps</a> · <a href="${wiki(p.n)}" target="_blank" rel="noopener">Wikipedia</a> · <a href="#" data-mpp="${esc(p.n)}">Plan this</a>`)})}
function initMap(){loadLeaflet(()=>{if(MAP){MAP.invalidateSize();return}$('#mp').innerHTML='';
  MAP=L.map('mp',{scrollWheelZoom:false}).setView([22.5,80],4.4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap'}).addTo(MAP);drawPins();
  MAP.on('popupopen',e=>{const a=e.popup.getElement().querySelector('[data-mpp]');if(a)a.onclick=ev=>{ev.preventDefault();planThis('',a.dataset.mpp)}})})}
document.addEventListener('kc-xmode',e=>{if(e.detail==='map')setTimeout(initMap,50)});
$('#mp-now').onclick=()=>{mpNow=!mpNow;$('#mp-now').setAttribute('aria-pressed',mpNow);drawPins()};
$('#mp-me').onclick=()=>{if(!navigator.geolocation||!MAP)return;navigator.geolocation.getCurrentPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];L.circleMarker(ll,{radius:9,color:'#fff',weight:3,fillColor:'#2B6BFF',fillOpacity:1}).addTo(MAP).bindPopup('You are here');MAP.setView(ll,7)},()=>{},{timeout:12000})};

/* ---------- FESTIVALS THIS MONTH (States view) ---------- */
const MI={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
function festMonths(f){const m=f.match(/\(([^)]*)\)/);if(!m)return null;const t=m[1].toLowerCase();const ms=[...t.matchAll(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/g)].map(x=>MI[x[1]]);if(!ms.length)return null;
  if(/[–-]/.test(t)&&ms.length>=2){const out=[];let a=ms[0];for(let g=0;g<12;g++){out.push(a);if(a===ms[ms.length-1])break;a=a%12+1}return out}return ms}
const FN=[];STATES.forEach(s=>s.fest.forEach(f=>{const m=festMonths(f);if(m&&m.includes(MONTH))FN.push({s:s.n,f})}));
const nextM=MONTH%12+1;const FX=[];STATES.forEach(s=>s.fest.forEach(f=>{const m=festMonths(f);if(m&&m.includes(nextM)&&!m.includes(MONTH))FX.push({s:s.n,f})}));
const xs=$('#x-states');if(xs&&(FN.length||FX.length))xs.insertAdjacentHTML('afterbegin',`<div class="card fest"><h2>🎉 Festivals & fairs</h2>
  ${FN.length?`<p class="eyebrow">Happening around ${MS[MONTH-1]}</p><ul class="clean">${FN.map(x=>`<li><b>${esc(x.f)}</b> <span class="sub">· ${esc(x.s)}</span></li>`).join('')}</ul>`:''}
  ${FX.length?`<p class="eyebrow">Coming up in ${MS[nextM-1]}</p><ul class="clean">${FX.map(x=>`<li><b>${esc(x.f)}</b> <span class="sub">· ${esc(x.s)}</span></li>`).join('')}</ul>`:''}
  <p class="sub" style="font-size:12.5px">Many festivals follow the Hindu lunar calendar, so the exact dates move every year. Check this year's dates before you book.</p></div>`);

/* ---------- NOW: weather + golden hour ---------- */
const WMO={0:'☀️ Clear',1:'🌤 Mostly clear',2:'⛅ Partly cloudy',3:'☁️ Cloudy',45:'🌫 Fog',48:'🌫 Fog',51:'🌦 Drizzle',53:'🌦 Drizzle',55:'🌦 Drizzle',61:'🌧 Rain',63:'🌧 Rain',65:'🌧 Heavy rain',71:'🌨 Snow',73:'🌨 Snow',75:'❄️ Heavy snow',80:'🌦 Showers',81:'🌧 Showers',82:'⛈ Heavy showers',95:'⛈ Thunderstorm',96:'⛈ Thunderstorm, hail',99:'⛈ Thunderstorm, hail'};
const wxCache={};
async function weather(la,lo){const k=la.toFixed(2)+','+lo.toFixed(2);if(wxCache[k])return wxCache[k];
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la.toFixed(3)}&longitude=${lo.toFixed(3)}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=3`);
  if(!r.ok)throw new Error('wx');const j=await r.json();wxCache[k]=j;return j}
window.bgWeather=weather;
const nowOut=$('#now-out');
if(nowOut)new MutationObserver(()=>{const head=nowOut.querySelector('.nowhead:not([data-x])');if(!head)return;head.dataset.x=1;
  const N=window.bgNow;const city=$('#now-city').value;let ref=null;
  const first=nowOut.querySelector('details.sight');
  const S=(window.bgSightsRef&&window.bgSightsRef())||null;
  ref=S||null;
  const pos=window.__kcHere||null;
  const sp=pos||(city&&(window.bgCoords(city)))||null;if(!sp)return;
  const sn=N.sun(sp.la,sp.lo,N.istNow());
  head.insertAdjacentHTML('beforeend',`<span>📸 Golden hour ${fmt(sn.rise)}–${fmt(sn.rise+50)} & ${fmt(sn.set-50)}–${fmt(sn.set)}</span><span id="wx-now" class="wx kc-skel" aria-busy="true">🌡 Weather…</span>`);
  weather(sp.la,sp.lo).then(j=>{const c=j.current,d=j.daily;const el=$('#wx-now');if(!el)return;el.classList.remove('kc-skel');el.removeAttribute('aria-busy');
    el.innerHTML=`🌡 ${Math.round(c.temperature_2m)}° ${WMO[c.weather_code]||''} · today ${Math.round(d.temperature_2m_min[0])}–${Math.round(d.temperature_2m_max[0])}°${d.precipitation_probability_max[0]!=null?' · rain '+d.precipitation_probability_max[0]+'%':''}`;
    const tm=d.precipitation_probability_max[1];if(tm>=60){head.insertAdjacentHTML('afterend','<p class="note">🌧 Rain is likely tomorrow ('+tm+'%). Plan indoor sights or carry a rain cover.</p>')}
  }).catch(()=>{const el=$('#wx-now');if(el)el.remove()})}).observe(nowOut,{childList:true});
function fmt(m){m=((Math.round(m)%1440)+1440)%1440;let h=Math.floor(m/60),mi=m%60;const ap=h>=12?'pm':'am';h=h%12||12;return h+(mi?':'+String(mi).padStart(2,'0'):'')+ap}
/* remember the GPS spot the Now tab used */
const ogeo=navigator.geolocation&&navigator.geolocation.getCurrentPosition&&navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
if(ogeo){try{navigator.geolocation.getCurrentPosition=function(ok,bad,o){return ogeo(p=>{window.__kcHere={la:p.coords.latitude,lo:p.coords.longitude};ok(p)},bad,o)}}catch(e){}}
$('#now-city')&&$('#now-city').addEventListener('change',()=>{window.__kcHere=null});

/* ---------- PLAN: share image + save as PDF + weather for the trip ---------- */
const pOut=$('#p-out');
function planCities(p){const cs=[];p.days.forEach(d=>String(d.city||'').split(/\s*(?:→|->)\s*/).forEach(c=>{c=c.trim();if(c&&cs[cs.length-1]!==c)cs.push(c)}));return cs}
function planSum(p){let s=0;p.days.forEach(d=>{d.items.forEach(i=>s+=i.cost||0);const o=d.stay&&d.stay.options&&d.stay.options[d.stay.pick];if(o)s+=+o.price||0});return s}
function shareImage(p){const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.fillStyle='#EEE8DB';g.fillRect(0,0,W,H);
  const card=(x,y,w,h,f)=>{g.fillStyle=f;g.fillRect(x,y,w,h);g.lineWidth=3;g.strokeStyle='#2B261F';g.strokeRect(x,y,w,h)};
  card(70,70,940,300,'#B5431C');
  g.fillStyle='#FAF7F0';g.font='800 84px "Big Shoulders", "Arial Narrow", sans-serif';g.fillText('KIDHAR CHALE?',110,175);
  g.font='600 34px "Instrument Sans", Arial, sans-serif';g.fillText('Travel more, spend less',110,225);
  const cs=planCities(p),sum=planSum(p);
  g.font='800 46px "Instrument Sans", Arial, sans-serif';g.fillText(`${p.days.length} day${p.days.length>1?'s':''} · ₹${sum.toLocaleString('en-IN')} per person`,110,320);
  const rows=Math.min(cs.length,9),ch=Math.max(360,140+rows*60+40);card(70,430,940,ch,'#FAF7F0');g.fillStyle='#1F1B16';g.font='800 44px "Big Shoulders", "Arial Narrow", sans-serif';g.fillText('MY ROUTE',120,510);
  g.font='700 46px "Instrument Sans", Arial, sans-serif';let y=590;cs.slice(0,9).forEach((x,i)=>{g.fillStyle='#E3A23B';g.beginPath();g.arc(140,y-15,16,0,7);g.fill();g.strokeStyle='#2B261F';g.lineWidth=4;g.stroke();
    if(i<Math.min(cs.length,9)-1){g.beginPath();g.moveTo(140,y+5);g.lineTo(140,y+45);g.stroke()}g.fillStyle='#1F1B16';g.fillText(x.length>30?x.slice(0,29)+'…':x,185,y);y+=60});
  g.fillStyle='#1F1B16';g.font='600 30px "Instrument Sans", Arial, sans-serif';const fy=430+ch+90;const tips=(p.tips||[])[0];if(tips&&fy<1150){g.font='italic 600 30px "Instrument Sans", Arial, sans-serif';const words=tips.split(' ');let line='',ly=fy;g.fillText('💡',110,ly);words.forEach(w=>{if(g.measureText(line+w).width>820){g.fillText(line,160,ly);line='';ly+=42}line+=w+' '});g.fillText(line,160,ly)}
  g.font='600 30px "Instrument Sans", Arial, sans-serif';g.fillText('Plan yours free · no ads · no sign-up',110,1280);
  return new Promise(r=>c.toBlob(r,'image/png'))}
async function shareIt(p){const b=await shareImage(p);const f=new File([b],'my-trip-kidhar-chale.png',{type:'image/png'});
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'My trip',text:'Planned free on Kidhar Chale?'});return}}catch(e){if(e&&e.name==='AbortError')return}
  const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='my-trip-kidhar-chale.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
  const im=$('#p-img');if(im){im.src=u;im.hidden=false}}
window.bgShareImage=shareImage;
if(pOut)new MutationObserver(()=>{if(pOut.querySelector('#p-xtra'))return;const p=window.bgCurrentPlan&&window.bgCurrentPlan();if(!p||!p.days)return;
  const cp=pOut.querySelector('#p-copy');if(!cp)return;
  /* one Save & share card: picture and PDF join the share buttons */
  cp.closest('.card').insertAdjacentHTML('beforeend',`<div id="p-xtra"><div class="row" style="gap:8px"><button class="small" id="p-shimg">🖼 Make a share picture</button><button class="small" id="p-pdf">🖨 Save as PDF</button></div><img id="p-img" alt="Your trip picture" hidden style="margin-top:10px;border:2px solid var(--edge);border-radius:12px;max-width:260px"><div id="p-wx"></div></div>`);
  {const h=cp.closest('.card').querySelector('h3');if(h&&/Share this trip/.test(h.textContent))h.textContent='📤 Save & share this trip'}
  $('#p-shimg').onclick=()=>shareIt(p);$('#p-pdf').onclick=()=>window.print();
  const start=$('#p-start')&&$('#p-start').value;const days=start?Math.round((new Date(start+'T00:00')-new Date(new Date().toDateString()))/864e5):99;
  if(days>=0&&days<=2){const cs=[...new Set(planCities(p))].slice(0,4);Promise.all(cs.map(n=>{const c=window.bgCoords(n);return c?weather(c.la,c.lo).then(j=>({n,j})).catch(()=>null):null})).then(r=>{r=r.filter(Boolean);if(!r.length)return;const el=$('#p-wx');if(!el)return;
    el.innerHTML='<p class="eyebrow" style="margin-top:10px">Weather for your trip</p>'+r.map(({n,j})=>`<p class="sub">${esc(n)}: ${WMO[j.daily.weather_code[days]]||''} ${Math.round(j.daily.temperature_2m_min[days])}–${Math.round(j.daily.temperature_2m_max[days])}°${days===0?' today':days===1?' tomorrow':' on your start day'}</p>`).join('')})}
}).observe(pOut,{childList:true});

/* ---------- KIT: altitude sickness ---------- */
$('#v-fun').insertAdjacentHTML('beforeend',`<div class="card" id="f-alt">
 <h3>🏔 Going high? Altitude sickness basics</h3>
 <p class="sub">For Leh-Ladakh, Spiti, Sikkim, Tawang and treks above about 2,500 m.</p>
 <ul class="clean">
  <li><b>Flying into Leh?</b> Rest completely for the first 24–48 hours. Most people who get sick skipped this.</li>
  <li><b>Go up slowly.</b> By road, Manali → Leh is gentler than flying straight in. Above 3,000 m, try not to sleep more than about 500 m higher than the night before.</li>
  <li><b>Drink plenty of water. No alcohol or smoking</b> for the first days.</li>
  <li><b>Early signs:</b> headache, nausea, tiredness, poor sleep, dizziness. Rest and don't go higher until they're gone.</li>
  <li><b>Danger signs:</b> confusion, stumbling, breathless while resting, a wet cough. <b>Go down at once</b> and get medical help. Call 112.</li>
  <li><b>Medicine:</b> some people take a preventive tablet. Ask a doctor before the trip; don't take it on a friend's advice.</li>
 </ul></div>`);
})();
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* Long weekends 2027, from the central government's gazetted holiday list (DoPT O.M. dated 16 Jul 2026, Delhi offices) */
const LW=[['2027-01-23','2027-01-26',4,'Mon 25 Jan','Republic Day (Tue)'],
['2027-03-06','2027-03-10',5,'Mon 8 & Tue 9 Mar','Id-ul-Fitr (Wed)*'],
['2027-03-20','2027-03-28',9,'Mon 22, Wed 24 & Thu 25 Mar','Holi (Tue 23) + Good Friday (26)'],
['2027-04-15','2027-04-19',5,'Fri 16 Apr','Ram Navami (Thu) + Mahavir Jayanti (Mon)'],
['2027-05-15','2027-05-17',3,'','Bakrid (Mon)*'],
['2027-05-20','2027-05-23',4,'Fri 21 May','Buddha Purnima (Thu)'],
['2027-06-12','2027-06-16',5,'Mon 14 & Tue 15 Jun','Muharram (Wed)*'],
['2027-08-21','2027-08-25',5,'Mon 23 & Tue 24 Aug','Janmashtami (Wed)'],
['2027-10-29','2027-10-31',3,'','Diwali (Fri)']];
const today=new Date().toISOString().slice(0,10);
const fmt=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',weekday:'short'});
const up=LW.filter(x=>x[1]>=today);
const box=$('#x-week');if(!box||!up.length)return;
$('#wk-out').insertAdjacentHTML('beforebegin',`<details class="card" id="lw"><summary><h2 style="display:inline">📅 Long weekends in 2027</h2> <span class="pill">${up.length}</span></summary>
 <p class="sub">Take a day or two off around a holiday and get a proper trip. Based on the central government's 2027 holiday list for Delhi offices; your state or company may differ.</p>
 ${up.map((x,i)=>`<div class="lwrow"><div class="lwn"><b class="num">${x[2]}</b><small>days</small></div><div style="min-width:0;flex:1"><p><b>${fmt(x[0])} – ${fmt(x[1])}</b></p><p class="sub">${esc(x[4])}</p><p class="sub">${x[3]?'🏖 Take leave: '+esc(x[3]):'✨ No leave needed'}</p></div><button class="small" data-lwm="${+x[0].slice(5,7)}">Ideas</button></div>`).join('')}
 <p class="sub" style="font-size:12px">* Id, Bakrid and Muharram depend on the moon and can shift by a day. Source: DoPT holiday list for 2027 (O.M. dated 16 July 2026).</p></details>`);
box.querySelectorAll('[data-lwm]').forEach(b=>b.onclick=()=>{const m=+b.dataset.lwm;try{const W=JSON.parse(localStorage.getItem('bg_week')||'{}');W.now=true;W.m=m;W.r=Math.max(W.r||0,300);localStorage.setItem('bg_week',JSON.stringify(W))}catch(e){}
  if(window.bgWeekendMonth)window.bgWeekendMonth(m);const c=$('#wk-city');if(c&&!c.value){c.scrollIntoView({block:'center'});c.focus()}else{const o=$('#wk-out');if(o)o.scrollIntoView({block:'start',behavior:'smooth'})}});
})();
(function(){
const $=s=>document.querySelector(s);
const wiki=q=>'https://en.wikipedia.org/w/index.php?title=Special:Search&go=Go&search='+encodeURIComponent(q);
/* ---------- GO: train helpers + scenic journeys ---------- */
$('#v-go').insertAdjacentHTML('beforeend',`<div class="card" id="trainhelp"><h3>🚆 Train helpers</h3>
 <div class="links">
  <a href="https://enquiry.indianrail.gov.in/mntes/" target="_blank" rel="noopener"><b>Where's my train? ↗</b><span>Live running status (NTES, Indian Railways)</span></a>
  <a href="https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html" target="_blank" rel="noopener"><b>PNR status ↗</b><span>Check if your waitlist got confirmed</span></a>
  <a href="https://railmadad.indianrailways.gov.in/" target="_blank" rel="noopener"><b>Rail Madad ↗</b><span>Complaint or help on a train (or call 139)</span></a>
  <a href="https://www.irctc.co.in/" target="_blank" rel="noopener"><b>IRCTC ↗</b><span>Book or cancel tickets</span></a>
 </div></div>
<div class="card" id="scenic"><h3>🏞 Journeys worth taking just for the view</h3>
 <p class="sub">Cheap tickets, unforgettable windows. Grab a window seat.</p>
 <ul class="clean scen">${[
  ['Konkan Railway (Mumbai → Goa → Mangaluru)','Rivers, tunnels and green hills along the coast, best in the monsoon.','Konkan Railway'],
  ['Kalka–Shimla toy train','UNESCO heritage line: 100+ tunnels and old bridges in about 5 hours.','Kalka–Shimla Railway'],
  ['Darjeeling Himalayan Railway','The famous "toy train"; even the short Darjeeling–Ghum joyride loop is magic.','Darjeeling Himalayan Railway'],
  ['Nilgiri Mountain Railway (Mettupalayam → Ooty)','Rack railway climbing through tea gardens and forest. Book early, seats are few.','Nilgiri Mountain Railway'],
  ['Kangra Valley Railway (Pathankot → Joginder Nagar)','Slow narrow-gauge train under the Dhauladhar snow peaks, among India’s cheapest scenic rides.','Kangra Valley Railway'],
  ['Matheran toy train (Neral → Matheran)','Climb to a car-free hill station near Mumbai.','Matheran Hill Railway'],
  ['Pamban bridge to Rameswaram','Train over the sea to the island; the new Pamban bridge opened in 2025.','Pamban Bridge'],
  ['Dudhsagar Falls on the Goa–Karnataka line','Trains pass right beside the waterfall, most dramatic in the monsoon.','Dudhsagar Falls'],
  ['Manali → Leh by bus','Two days over high passes; the HPTDC/HRTC bus is the cheap way. Only open in summer.','Leh–Manali Highway'],
  ['Jammu → Srinagar via the Chenab rail bridge','The world’s highest railway arch bridge, on the line to Kashmir.','Chenab Rail Bridge']
 ].map(([n,t,w])=>`<li><b>${n}</b><br><span class="sub">${t}</span> <a href="${wiki(w)}" target="_blank" rel="noopener">Read ↗</a></li>`).join('')}</ul></div>`);

/* ---------- KIT: solo & women travellers ---------- */
$('#v-fun').insertAdjacentHTML('beforeend',`<div class="card" id="f-solo"><h3>🧍‍♀️ Travelling solo or as a woman</h3><ul class="clean">
 <li><b>Share your live location</b> with one person for every long journey (WhatsApp or Google Maps location sharing).</li>
 <li><b>Arrive before dark</b> in a new town, especially the first night. Book that first bed in advance.</li>
 <li><b>Trains:</b> there's a ladies' quota when booking, and some trains have ladies' coaches. In buses, ask for a seat next to a woman or a family.</li>
 <li><b>Hostels with women-only dorms</b> are common in backpacker towns. Read recent reviews from women travellers.</li>
 <li><b>Cabs and autos:</b> book through an app when you can so the trip is tracked, and share the ride details.</li>
 <li><b>Helplines:</b> 112 for any emergency, 181 women's helpline, 1091 women's police helpline, 139 on trains.</li>
 <li><b>Trust your gut.</b> It's always okay to change seats, change hostels, or leave.</li>
</ul></div>`);

/* ---------- PASS: countdown ---------- */
function count(){const st=$('#p-start'),el=$('#ps-date');if(!st||!el||!st.value)return;const d=Math.round((new Date(st.value+'T00:00')-new Date(new Date().toDateString()))/864e5);
  const base=new Date(st.value+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}).toUpperCase();el.textContent=d>1?base+' · IN '+d+' DAYS':d===1?base+' · TOMORROW!':d===0?'TODAY! 🎒':base}
['change','input'].forEach(e=>{const st=$('#p-start');if(st)st.addEventListener(e,()=>setTimeout(count,0))});
const pg=$('#p-go');if(pg)pg.addEventListener('click',()=>setTimeout(count,300));setTimeout(count,0);
})();
