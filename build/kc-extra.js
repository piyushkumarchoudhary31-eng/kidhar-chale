(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(k,d){try{const v=localStorage.getItem('bg_'+k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem('bg_'+k,JSON.stringify(v))}catch(e){}}
const enc=encodeURIComponent;
const gmap=q=>'https://www.google.com/maps/search/?api=1&query='+enc(q);
const wiki=q=>'https://en.wikipedia.org/w/index.php?title=Special:Search&go=Go&search='+enc(q);
const wvoy=q=>'https://en.wikivoyage.org/w/index.php?title=Special:Search&go=Go&search='+enc(q);
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

/* ---------- coordinates ---------- */
const CO={};
COORDS_RAW.trim().split('\n').forEach(l=>{const[n,a,b]=l.split('|');CO[norm(n)]={n,la:+a,lo:+b}});
for(const k in CITYCO)CO[norm(k)]=CO[norm(k)]||{n:k,la:CITYCO[k][0],lo:CITYCO[k][1]};
SIGHTS.forEach(s=>{const k=norm(s.c);if(!CO[k])CO[k]={n:s.c,la:s.la,lo:s.lo}});
ROADSTOPS.forEach(s=>{const k=norm(s.n);if(!CO[k])CO[k]={n:s.n,la:s.la,lo:s.lo}});
function findCo(q){q=norm(q);if(!q)return null;if(CO[q])return CO[q];
  const alias={gurgaon:'gurugram',bangalore:'bengaluru',bombay:'mumbai',madras:'chennai',calcutta:'kolkata',mysore:'mysuru',aurangabad:'chhatrapati sambhajinagar',trivandrum:'thiruvananthapuram',cochin:'kochi',pondicherry:'puducherry',benares:'varanasi',banaras:'varanasi',kashi:'varanasi',simla:'shimla',baroda:'vadodara',mangalore:'mangaluru','new delhi':'delhi',prayagraj:'prayagraj',allahabad:'prayagraj'};
  if(alias[q]&&CO[alias[q]])return CO[alias[q]];
  const ks=Object.keys(CO);const k=ks.find(x=>x.startsWith(q))||ks.find(x=>x.split(' ')[0]===q.split(' ')[0]&&q.length>3);return k?CO[k]:null}
window.bgCoords=findCo;window.bgSights=SIGHTS;
window.bgCoordsExact=q=>{const k=norm(q);return CO[k]||null};
const R=6371,rad=x=>x*Math.PI/180;
function km(a,b){const dLa=rad(b.la-a.la),dLo=rad(b.lo-a.lo);const h=Math.sin(dLa/2)**2+Math.cos(rad(a.la))*Math.cos(rad(b.la))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))}

/* ---------- time in India + sunrise/sunset (NOAA) ---------- */
function istNow(){const d=new Date();const u=d.getTime()+d.getTimezoneOffset()*60000;return new Date(u+330*60000)}
function sun(la,lo,d){ // returns minutes after IST midnight
  const start=Date.UTC(d.getFullYear(),0,0),doy=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-start)/864e5);
  const g=2*Math.PI/365*(doy-1);
  const eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const ha=Math.acos(Math.cos(rad(90.833))/(Math.cos(rad(la))*Math.cos(dec))-Math.tan(rad(la))*Math.tan(dec))*180/Math.PI;
  const rise=720-4*(lo+ha)-eq+330,set=720-4*(lo-ha)-eq+330;return{rise:Math.round(rise),set:Math.round(set)}}
const hm=m=>{m=((Math.round(m)%1440)+1440)%1440;let h=Math.floor(m/60),mi=m%60;const ap=h>=12?'pm':'am';h=h%12||12;return h+(mi?':'+String(mi).padStart(2,'0'):'')+' '+ap};
function tok(t,sn){if(t==='24:00')return 1440;let m=t.match(/^(\d\d):(\d\d)$/);if(m)return +m[1]*60+ +m[2];m=t.match(/^(sr|ss)([+-]\d+)?$/);if(m)return (m[1]==='sr'?sn.rise:sn.set)+(+m[2]||0);return 0}
const DAYN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function status(s,now){
  const sn=sun(s.la,s.lo,now),wd=now.getDay(),cur=now.getHours()*60+now.getMinutes();
  const shutToday=(s.x||[]).includes(wd)||(s.only&&!s.only.includes(wd));
  const wins=s.t.map(([a,b])=>{let o=tok(a,sn),c=tok(b,sn);if(c<=o)c+=1440;return[o,c]});
  const hours=s.t.map(([a,b])=>a==='00:00'&&b==='24:00'?'Open 24 hours':hm(tok(a,sn))+' – '+hm(tok(b,sn))).join(', ');
  const closedTxt=(s.x&&s.x.length?'Closed '+s.x.map(i=>DAYN[i]+'s').join(', '):'')+(s.only?'Only on '+s.only.map(i=>DAYN[i]+'s').join(', '):'');
  // after-midnight part of yesterday's overnight window
  if(!shutToday||true){for(const[o,c]of wins){if(c>1440&&cur<c-1440){const yday=(wd+6)%7;if(!((s.x||[]).includes(yday)||(s.only&&!s.only.includes(yday))))return{st:'open',left:c-1440-cur,hours,closedTxt}}}}
  if(shutToday)return{st:'shut',hours,closedTxt};
  for(const[o,c]of wins){if(cur>=o&&cur<c)return{st:c-cur<=60?'soon':'open',left:c-cur,hours,closedTxt,allday:c-o>=1440}}
  const nx=wins.map(w=>w[0]).filter(o=>o>cur).sort((a,b)=>a-b)[0];
  if(nx!=null)return{st:'later',in:nx-cur,at:nx,hours,closedTxt};
  return{st:'done',hours,closedTxt}}
const dur=m=>m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+(m%60)+' min':'');
const KIND={monument:'🏛',temple:'🛕',view:'🌅',food:'🍢',market:'🛍',aarti:'🪔',show:'🎭',museum:'🖼'};
const srcLine=s=>s.s&&SRC[s.s]?`<p class="src">✅ Fee and hours from <a href="${SRC[s.s][1]}" target="_blank" rel="noopener">${esc(SRC[s.s][0])}</a> · checked ${CHK}</p>`:`<p class="src">⚠️ Typical timings. Check before going.</p>`;

/* ---------- RIGHT NOW ---------- */
const nowCities=[...new Set(SIGHTS.map(s=>s.c))].sort();
const vc=$('#v-city');
vc.insertAdjacentHTML('afterbegin',`<div class="card" id="now-card">
  <h2>⏰ Right now</h2>
  <p class="sub">What's open near you this minute, what's closing soon, and what to do this evening. Timings follow India time.</p>
  <div class="row"><button class="primary" id="now-loc">📍 Use my location</button>
  <label for="now-city">Or pick a city<select id="now-city"><option value="">Choose…</option>${nowCities.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div>
  <p class="err" id="now-err" hidden></p>
  <div id="now-out" aria-live="polite"></div>
</div>
<div class="card" id="help-card">
  <h3>🆘 Find help near me</h3>
  <p class="sub">Opens Google Maps searching around where you are.</p>
  <div class="helpgrid">${[['🏧','ATM'],['🏥','Hospital'],['💊','Pharmacy'],['👮','Police station'],['🚻','Public toilet'],['⛽','Petrol pump'],['🔧','Puncture repair'],['🛏','Budget hotel']].map(([e,q])=>`<a href="${gmap(q+' near me')}" target="_blank" rel="noopener"><span aria-hidden="true">${e}</span>${q}</a>`).join('')}</div>
</div>`);
const navCity=document.querySelector('nav.tabs [data-v="city"]');
if(navCity)navCity.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>Now';
function renderNow(ctx){
  const now=istNow();let list;
  if(ctx.here){list=SIGHTS.map(s=>({s,d:km(ctx.here,s)})).filter(x=>x.d<=60).sort((a,b)=>a.d-b.d);
    if(!list.length){const near=SIGHTS.map(s=>({s,d:km(ctx.here,s)})).sort((a,b)=>a.d-b.d)[0];
      $('#now-out').innerHTML=`<div class="answer"><p>We don't have timings for places within 60 km of you yet. The nearest city we cover is <b>${esc(near.s.c)}</b>, about ${Math.round(near.d)} km away.</p><div class="links"><a href="${gmap('tourist attractions near me')}" target="_blank" rel="noopener"><b>Google Maps ↗</b><span>Sights near you, with live opening hours</span></a><a href="${gmap('restaurants open now near me')}" target="_blank" rel="noopener"><b>Food open now ↗</b><span>On Google Maps</span></a></div></div>`;return}}
  else list=SIGHTS.filter(s=>s.c===ctx.city).map(s=>({s,d:null}));
  const ref=ctx.here||list[0].s;const sn=sun(ref.la,ref.lo,now);const cur=now.getHours()*60+now.getMinutes();
  const rows=list.map(x=>Object.assign(x,{k:status(x.s,now)}));
  const ord={soon:0,open:1,later:2,done:3,shut:4};
  rows.sort((a,b)=>ord[a.k.st]-ord[b.k.st]||(a.k.st==='later'?a.k.in-b.k.in:0)||(a.d??0)-(b.d??0));
  const pill=k=>k.st==='open'?(k.allday?'<span class="st open">Open now</span>':`<span class="st open">Open · ${dur(k.left)} left</span>`):k.st==='soon'?`<span class="st soon">Closing in ${dur(k.left)}</span>`:k.st==='later'?`<span class="st later">Opens at ${hm(k.at)}</span>`:k.st==='shut'?'<span class="st shut">Closed today</span>':'<span class="st shut">Closed for today</span>';
  const evening=cur<sn.set+90;
  let h=`<div class="nowhead"><span>🕐 <b>${hm(cur)}</b> ${DAYN[now.getDay()]}</span><span>🌅 Sunrise ${hm(sn.rise)}</span><span>🌇 Sunset ${hm(sn.set)}</span></div>`;
  if(cur>sn.set-120&&evening)h+=`<p class="note">Sunset is ${cur<sn.set?'in '+dur(sn.set-cur):'happening now'}. Evening aartis, viewpoints and night markets are marked 🪔 🌅 🍢 below.</p>`;
  h+=rows.map(({s,d,k})=>`<details class="sight ${k.st}"><summary><span class="sk" aria-hidden="true">${KIND[s.k]||'📍'}</span><span class="sn"><b>${esc(s.n)}</b><small>${ctx.here?esc(s.c)+' · '+(d<1?'under 1 km':Math.round(d)+' km'):esc(s.c)}</small></span>${pill(k)}</summary>
   <dl class="facts"><div><dt>Hours today</dt><dd>${k.st==='shut'?'Closed today. ':''}${esc(k.hours)}${k.closedTxt?' · '+esc(k.closedTxt):''}${/monument|museum/.test(s.k)?'<br><small class="sub">Last entry is usually 30–45 minutes before closing.</small>':''}</dd></div><div><dt>Entry</dt><dd>${esc(s.fee)}</dd></div>${s.pay&&s.pay.length?`<div><dt>Ways to pay less</dt><dd><ul class="clean">${s.pay.map(p=>'<li>'+esc(p)+'</li>').join('')}</ul></dd></div>`:''}</dl>
   ${srcLine(s)}
   <div class="row" style="gap:8px"><a class="btnlink" href="https://www.google.com/maps/dir/?api=1&destination=${s.la},${s.lo}" target="_blank" rel="noopener">🧭 Directions</a><a class="btnlink" href="${wiki(s.n)}" target="_blank" rel="noopener">📖 Wikipedia</a></div></details>`).join('');
  h+=`<p class="sub" style="font-size:12.5px;margin-top:10px">Holidays, festivals and VIP visits can change timings without notice. Sunrise and sunset are worked out for the exact spot.</p>`;
  $('#now-out').innerHTML=h;
}
$('#now-city').onchange=()=>{const c=$('#now-city').value;$('#now-err').hidden=true;if(c){save('nowcity',c);renderNow({city:c})}};
$('#now-loc').onclick=()=>{const err=$('#now-err');err.hidden=true;
  const fail=m=>{err.textContent=m;err.hidden=false};
  if(!navigator.geolocation)return fail('Location isn’t available here. Pick your city instead.');
  $('#now-loc').textContent='📍 Finding you…';
  navigator.geolocation.getCurrentPosition(p=>{$('#now-loc').textContent='📍 Use my location';renderNow({here:{la:p.coords.latitude,lo:p.coords.longitude}})},
   e=>{$('#now-loc').textContent='📍 Use my location';fail(e&&e.code===1?'Location is blocked. Pick your city from the list instead.':'Couldn’t find your location. Pick your city from the list instead.')},{timeout:12000,maximumAge:300000})};
(function(){const c=load('nowcity','');if(c&&nowCities.includes(c)){$('#now-city').value=c;renderNow({city:c})}})();
window.bgNow={renderNow,status,sun,istNow};

/* ---------- WAYS TO PAY LESS (Money) ---------- */
const ver=SIGHTS.filter(s=>s.s&&s.k!=='show');
const byCity={};ver.forEach(s=>(byCity[s.c]=byCity[s.c]||[]).push(s));
$('#v-money').insertAdjacentHTML('beforeend',`<div class="card" id="payless">
  <h2>💸 Ways to pay less at sights</h2>
  <p class="sub">Only discounts we could confirm on an official site. If a place isn't listed, we couldn't confirm a discount there, so don't count on one.</p>
  <div class="paygen"><p class="eyebrow">Rules that work in many places</p><ul class="clean">
   <li>Children under 15 get in free at ASI-protected monuments, such as the Taj Mahal, Agra Fort, Red Fort, Qutub Minar and Humayun's Tomb.</li>
   <li>Booking ASI tickets online is cheaper: ₹35 instead of ₹50 for Indians in Delhi, ₹45 instead of ₹50 at the Taj.</li>
   <li>Rajasthan government monuments are free for everyone on 30 March, 18 April, 18 May and 27 September, and Indian students pay about half with ID.</li>
   <li>Carry your student ID, army or police ID, senior-citizen proof or UDID card: some places below give big discounts or free entry for them.</li>
  </ul></div>
  ${Object.keys(byCity).map(c=>`<details class="paycity"><summary><b>${esc(c)}</b><span class="sub">${byCity[c].length} place${byCity[c].length>1?'s':''}</span></summary>${byCity[c].map(s=>`<div class="payrow"><p><b>${esc(s.n)}</b></p><p class="sub">${esc(s.fee)}</p><ul class="clean">${s.pay.map(p=>'<li>'+esc(p)+'</li>').join('')}</ul>${srcLine(s)}</div>`).join('')}</details>`).join('')}
  <p class="sub" style="font-size:12.5px">Some ticket sites still show older prices. Rajasthan revised its fees on 1 January 2026, so check the official portal before you pay.</p>
</div>`);

/* ---------- ON THE WAY (Go) ---------- */
const PLX=(window.bgPlaces||[]).map(p=>{const c=CO[norm(p.n)];return c&&p.reg[0]!=='X'?{n:p.n,la:c.la,lo:c.lo,k:'place',tip:p.why}:null}).filter(Boolean);
$('#v-go').insertAdjacentHTML('beforeend',`<div class="card" id="otw">
  <h2>🛣 On the way</h2>
  <p class="sub">Driving or riding? See what's worth a stop between two places: temples, forts, famous food, and where to take your breaks.</p>
  <div class="row"><label for="ow-from">From<input id="ow-from" placeholder="e.g. Jodhpur" list="ow-dl" autocomplete="off"></label><label for="ow-to">To<input id="ow-to" placeholder="e.g. Jaipur" list="ow-dl" autocomplete="off"></label></div>
  <datalist id="ow-dl">${[...new Set(Object.values(CO).map(c=>c.n))].sort().map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
  <div class="quick" id="ow-veh" role="group" aria-label="Vehicle"><button data-v="bike" aria-pressed="true">🏍 Bike</button><button data-v="car" aria-pressed="false">🚗 Car</button></div>
  <button class="primary" id="ow-go">Show stops on the way</button>
  <p class="err" id="ow-err" hidden></p>
  <div id="ow-out"></div>
</div>`);
let VEH=load('veh','bike');
document.querySelectorAll('#ow-veh [data-v]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.v===VEH);b.onclick=()=>{VEH=b.dataset.v;save('veh',VEH);document.querySelectorAll('#ow-veh [data-v]').forEach(x=>x.setAttribute('aria-pressed',x===b))}});
function onTheWay(fromQ,toQ,veh){
  const A=findCo(fromQ),B=findCo(toQ);
  if(!A)return{error:`We couldn't find "${fromQ}". Try a nearby bigger town.`};
  if(!B)return{error:`We couldn't find "${toQ}". Try a nearby bigger town.`};
  const D=km(A,B);if(D<15)return{error:'These two places are too close for stops on the way.'};
  const mla=(A.la+B.la)/2,mlo=(A.lo+B.lo)/2,hills=(mla>30.3&&mlo>73&&mlo<81)||(mla>26.6&&mlo>88)||Math.max(A.la,B.la)>32;
  const road=D*(hills?1.6:1.3),spd=(veh==='bike'?42:52)*(hills?0.65:1),mins=road/spd*60;
  // project onto the straight line using local flat coordinates
  const kx=111.32*Math.cos(rad((A.la+B.la)/2)),ky=110.57;
  const bx=(B.lo-A.lo)*kx,by=(B.la-A.la)*ky,L2=bx*bx+by*by;
  const width=Math.max(12,Math.min(35,D*0.07));
  const seen=new Set([norm(A.n),norm(B.n)]);
  const cand=[...ROADSTOPS.map(s=>Object.assign({src:'road'},s)),...PLX,...SIGHTS.filter(s=>norm(s.c)!==norm(A.n)&&norm(s.c)!==norm(B.n)&&km(s,A)>20&&km(s,B)>20).map(s=>({n:s.n+', '+s.c,la:s.la,lo:s.lo,k:'sight',tip:s.fee}))];
  const stops=[];
  cand.forEach(s=>{const key=norm(s.n);if(seen.has(key))return;
    const px=(s.lo-A.lo)*kx,py=(s.la-A.la)*ky,t=(px*bx+py*by)/L2;if(t<0.04||t>0.96)return;
    const off=Math.abs(px*by-py*bx)/Math.sqrt(L2);if(off>(s.src==='road'?Math.min(70,width*2.5):s.k==='place'?width*0.7:width))return;
    seen.add(key);stops.push(Object.assign({},s,{t,off,at:Math.round(t*road)}))});
  stops.sort((a,b)=>a.t-b.t);
  const every=veh==='bike'?75:135;const breaks=[];
  for(let m=every;m<mins-20;m+=every)breaks.push(Math.round(m/mins*road));
  return{A,B,D,road,mins,stops,breaks,veh,hills};
}
window.bgOnTheWay=onTheWay;
const KS={food:'🍢',sight:'🏛',rest:'☕',fuel:'⛽',place:'📍'};
$('#ow-go').onclick=()=>{const err=$('#ow-err');err.hidden=true;
  const f=$('#ow-from').value.trim(),t=$('#ow-to').value.trim();
  if(!f||!t){err.textContent='Add both From and To.';err.hidden=false;return}
  const r=onTheWay(f,t,VEH);if(r.error){err.textContent=r.error;err.hidden=false;$('#ow-out').innerHTML='';return}
  save('otw',{f,t});
  const way=r.stops.filter(s=>s.k!=='place').slice(0,3).map(s=>s.la+','+s.lo).join('|');
  const mapU=`https://www.google.com/maps/dir/?api=1&origin=${enc(r.A.n)}&destination=${enc(r.B.n)}${way?'&waypoints='+enc(way):''}&travelmode=${r.veh==='bike'?'two-wheeler':'driving'}`;
  let h=`<div class="answer"><dl class="facts"><div><dt>Rough distance by road</dt><dd>About ${Math.round(r.road/10)*10} km · ${dur(Math.round(r.mins/15)*15)} on a ${r.veh} without stops</dd></div><div><dt>Breaks</dt><dd>${r.breaks.length?`Take a ${r.veh==='bike'?'10–15':'15–20'} minute break every ${r.veh==='bike'?'75 minutes':'2 hours or so'}: around ${r.breaks.map(b=>'km '+b).join(', ')}.`:'Short enough to do in one go.'}</dd></div></dl>`;
  const warn=[];
  if(r.veh==='bike'&&r.road>380)warn.push('That’s a long day on a bike. Think about splitting it over two days.');
  if(r.mins>540)warn.push('Start at sunrise so you don’t ride the last part in the dark: highways at night have trucks and unlit cattle.');
  if(r.hills)warn.push('Mountain roads are slow, and landslides or snow can close them. Check road status locally before you set off, and keep a spare day.');
  if(r.stops.some(s=>s.k==='fuel'))warn.push('Fuel stations are far apart on this route. Fill up at the ⛽ stop and carry spare fuel.');
  if(warn.length)h+=`<ul class="clean warnl">${warn.map(w=>'<li>⚠️ '+esc(w)+'</li>').join('')}</ul>`;
  h+=`<p class="eyebrow" style="margin-top:12px">Stops on the way · ${r.stops.length?r.stops.length:'none we know of yet'}</p>`;
  let bi=0;
  r.stops.forEach(s=>{while(bi<r.breaks.length&&r.breaks[bi]<=s.at){h+=`<div class="brk">☕ Break time, around km ${r.breaks[bi]}</div>`;bi++}
    h+=`<div class="stop"><span class="sk" aria-hidden="true">${KS[s.k]||'📍'}</span><div style="min-width:0"><p><b>${esc(s.n)}</b> <span class="sub">· km ${s.at}${s.off>8?' · '+Math.round(s.off)+' km off the road':''}</span></p><p class="sub">${esc(s.tip||'')}${s.by?' <i>('+esc(s.by)+')</i>':''}</p><p class="sub"><a href="${gmap(s.n)}" target="_blank" rel="noopener">Map ↗</a> · <a href="${wiki(s.n.split(',')[0])}" target="_blank" rel="noopener">Wikipedia ↗</a></p></div></div>`});
  while(bi<r.breaks.length){h+=`<div class="brk">☕ Break time, around km ${r.breaks[bi]}</div>`;bi++}
  h+=`<a class="btnlink primary" href="${mapU}" target="_blank" rel="noopener" style="margin-top:12px">🗺 Open this route in Google Maps</a>
  <p class="sub" style="font-size:12.5px;margin-top:8px">Distances are estimates along a straight line, so a stop can sometimes be a short detour off your actual road. Google Maps shows the real route and live traffic.</p></div>`;
  $('#ow-out').innerHTML=h};
(function(){const o=load('otw',null);if(o){$('#ow-from').value=o.f;$('#ow-to').value=o.t}})();

/* ---------- TRAVEL BY STATE (Explore) ---------- */
const vx=$('#v-explore');
vx.insertAdjacentHTML('afterbegin',`<div class="seg seg4" role="tablist" aria-label="Explore by"><button role="tab" data-m="pl" aria-selected="true">📍 Places</button><button role="tab" data-m="wk" aria-selected="false">🚗 Weekend</button><button role="tab" data-m="map" aria-selected="false">🗺 Map</button><button role="tab" data-m="st" aria-selected="false">🏛 States</button></div>`);
vx.insertAdjacentHTML('beforeend',`<div id="x-states" class="stack" hidden><div class="card"><h2>Travel by state</h2><p class="sub">Every state and union territory: what to eat, what to bring home, festivals and the must-dos. Tap one.</p><div class="chips" id="st-chips">${STATES.map((s,i)=>`<button class="chip" data-st="${i}" aria-pressed="false">${esc(s.n)}</button>`).join('')}</div></div><div id="st-out"></div></div>`);
const ST=window.bgST||{};
function stateCard(i){const s=STATES[i];const sname=(ST[s.k]&&ST[s.k][0])||s.n;
  const pl=(window.bgPlaces||[]).filter(p=>p.state===sname||p.state===s.n);
  const li=a=>`<ul class="clean">${a.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul>`;
  return`<article class="card stcard"><div class="dayhead"><h2>${esc(s.n)}</h2><span class="pill">Best: ${esc(s.best)}</span></div><p>${esc(s.intro)}</p><p class="sub">Capital: ${esc(s.cap)}</p>
  <div class="stgrid"><section><h3>🍛 Must-eat</h3>${li(s.food)}</section><section><h3>🛍 Bring home</h3>${li(s.buy)}<p class="sub" style="font-size:12.5px">GI = Geographical Indication: the real thing is made only in that region. Buy from government emporiums or co-ops to be sure.</p></section>
  <section><h3>✅ Must-do</h3>${li(s.must)}</section><section><h3>🎉 Festivals</h3>${li(s.fest)}</section></div>
  ${s.cafes?`<p><b>☕ Cafés:</b> ${esc(s.cafes)}</p>`:''}
  ${pl.length?`<p class="eyebrow" style="margin-top:10px">${pl.length} place${pl.length>1?'s':''} in our list</p><div class="chips">${pl.map(p=>`<button class="chip" data-goto="${esc(p.n)}">${esc(p.n)}</button>`).join('')}</div>`:''}
  <div class="links" style="margin-top:10px"><a href="${wvoy(s.n)}" target="_blank" rel="noopener"><b>Wikivoyage ↗</b><span>Free travel guide</span></a><a href="${wiki(s.n)}" target="_blank" rel="noopener"><b>Wikipedia ↗</b><span>History and culture</span></a></div></article>`}
function showState(i){document.querySelectorAll('#st-chips [data-st]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.st===i));save('state',i);
  $('#st-out').innerHTML=stateCard(i);
  $('#st-out').querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{setMode('pl');const q=$('#x-q');q.value=b.dataset.goto;q.dispatchEvent(new Event('input'));const g=document.querySelector('#x-genres [data-g="all"]');if(g)g.click();setTimeout(()=>{const c=document.querySelector('#x-list .place');if(c)c.scrollIntoView({block:'center'})},200)})}
document.querySelectorAll('#st-chips [data-st]').forEach(b=>b.onclick=()=>{showState(+b.dataset.st);$('#st-out').scrollIntoView({block:'start',behavior:'smooth'})});
const PANES={st:'x-states',wk:'x-week',map:'x-map'};
function setMode(m){if(m!=='pl'&&!PANES[m])m='pl';vx.querySelectorAll('.seg [data-m]').forEach(b=>b.setAttribute('aria-selected',b.dataset.m===m));
  const ids=Object.values(PANES);
  [...vx.children].forEach(el=>{if(el.classList.contains('seg'))return;if(ids.includes(el.id)){el.hidden=el.id!==PANES[m];return}
    if(m!=='pl'){if(el.dataset.wh==null)el.dataset.wh=el.hidden?1:0;el.hidden=true}else if(el.dataset.wh!=null){el.hidden=el.dataset.wh==='1';delete el.dataset.wh}});save('xmode',m);
  if(m==='st'&&!$('#st-out').innerHTML){const i=load('state',0);showState(STATES[i]?i:0)}
  document.dispatchEvent(new CustomEvent('kc-xmode',{detail:m}))}
vx.querySelectorAll('.seg [data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
window.bgStates={showState,setMode};
setTimeout(()=>{const m=load('xmode','pl');if(m!=='pl')setMode(m)},0);


/* ---------- links on Explore cards and city info ---------- */
function addLinks(root){root.querySelectorAll('article.place:not([data-lk])').forEach(a=>{a.dataset.lk=1;const n=a.querySelector('h3').textContent,st=(a.querySelector('.dayhead .sub')||{}).textContent||'';
  a.insertAdjacentHTML('beforeend',`<p class="xlinks"><a href="${wiki(n)}" target="_blank" rel="noopener">📖 Wikipedia</a><a href="${wvoy(n)}" target="_blank" rel="noopener">🧭 Wikivoyage</a><a href="${gmap(n+', '+st)}" target="_blank" rel="noopener">🗺 Map</a><a href="https://www.google.com/search?tbm=isch&q=${enc(n+' '+st)}" target="_blank" rel="noopener">📷 Photos</a></p>`)})}
const xl=$('#x-list');if(xl){addLinks(xl);new MutationObserver(()=>addLinks(xl)).observe(xl,{childList:true})}
const ca=$('#c-ans');if(ca)new MutationObserver(()=>{const l=ca.querySelector('.links:not([data-lk])');if(!l)return;l.dataset.lk=1;const n=ca.querySelector('h3').childNodes[0].textContent.trim();
  l.insertAdjacentHTML('beforeend',`<a href="${wiki(n)}" target="_blank" rel="noopener"><b>Wikipedia ↗</b><span>History, temples and stories</span></a><a href="https://lens.google/" target="_blank" rel="noopener"><b>Google Lens ↗</b><span>Point your camera at a sign or menu to translate it</span></a>`)}).observe(ca,{childList:true});

/* ---------- KIT: emergency card, stolen phone, show the driver ---------- */
const EM=load('emcard',{});
const SCRIPTS=[['Hindi','कृपया मुझे इस पते पर ले चलिए'],['Marathi','कृपया मला या पत्त्यावर घेऊन चला'],['Bengali','অনুগ্রহ করে আমাকে এই ঠিকানায় নিয়ে চলুন'],['Tamil','தயவுசெய்து என்னை இந்த முகவரிக்கு அழைத்துச் செல்லுங்கள்'],['Telugu','దయచేసి నన్ను ఈ చిరునామాకు తీసుకెళ్లండి'],['Kannada','ದಯವಿಟ್ಟು ನನ್ನನ್ನು ಈ ವಿಳಾಸಕ್ಕೆ ಕರೆದುಕೊಂಡು ಹೋಗಿ'],['Malayalam','ദയവായി എന്നെ ഈ വിലാസത്തിലേക്ക് കൊണ്ടുപോകൂ'],['Gujarati','કૃપા કરીને મને આ સરનામે લઈ જાઓ'],['Punjabi','ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੂੰ ਇਸ ਪਤੇ ’ਤੇ ਲੈ ਚੱਲੋ']];
$('#v-fun').insertAdjacentHTML('beforeend',`<div class="card" id="f-em">
  <h3>🆘 My emergency card</h3>
  <p class="sub">Fill it once. It stays only on this phone. If something happens, open this and show it to whoever is helping you.</p>
  <div class="row"><label for="em-name">Your name<input id="em-name" autocomplete="name"></label><label for="em-blood">Blood group<input id="em-blood" placeholder="e.g. B+"></label></div>
  <div class="row"><label for="em-who">Emergency contact name<input id="em-who"></label><label for="em-ph">Their phone<input id="em-ph" type="tel" inputmode="tel"></label></div>
  <label for="em-note">Allergies, medicines or anything a doctor should know<input id="em-note"></label>
  <button id="em-show">Show my emergency card</button>
  <div id="em-big" class="emcard" hidden></div>
</div>
<div class="card" id="f-lost">
  <h3>📵 Phone stolen or lost? Do this</h3>
  <ol class="steps">
   <li><b>Block your SIM.</b> Call your network from a friend's phone and ask them to block the SIM, so nobody can get your OTPs.</li>
   <li><b>Block the phone on CEIR.</b> Report it on the government's Sanchar Saathi site (sancharsaathi.gov.in → Block your lost or stolen mobile). It blocks the phone on every network in India and helps trace it. You need a police complaint number, which you can get by filing online.</li>
   <li><b>Money stolen through UPI or a bank app?</b> Call the cyber crime helpline <b class="num">1930</b> right away, or report at cybercrime.gov.in. The sooner you call, the better the chance of freezing the money.</li>
   <li><b>Lock or erase it.</b> Use Find My (iPhone) or Find My Device (Android) from any browser.</li>
   <li><b>Change your passwords.</b> Email first, then UPI and bank apps. Call your bank to block cards saved on the phone.</li>
  </ol>
  <p class="sub" style="font-size:12.5px">Write your network's customer-care number and one family number on paper and keep it in your wallet.</p>
</div>
<div class="card" id="f-drv">
  <h3>🛺 Show this to the driver</h3>
  <p class="sub">Type where you're going. We show it big, with "Please take me to this address" in the local language.</p>
  <label for="dv-addr">Address or place<input id="dv-addr" placeholder="e.g. Zostel, Old Manali"></label>
  <label for="dv-lang">Language<select id="dv-lang">${SCRIPTS.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('')}</select></label>
  <button id="dv-show">Show it big</button>
  <div id="dv-big" class="drvcard" hidden></div>
  <p class="sub" style="font-size:12.5px">Tip: ask your hotel to write their address in the local script for you, and snap a photo of it.</p>
</div>`);
['em-name','em-blood','em-who','em-ph','em-note'].forEach(id=>{const el=$('#'+id);el.value=EM[id]||'';el.oninput=()=>{EM[id]=el.value;save('emcard',EM)}});
$('#em-show').onclick=()=>{const b=$('#em-big');if(!b.hidden){b.hidden=true;$('#em-show').textContent='Show my emergency card';return}
  b.innerHTML=`<p class="eyebrow">Emergency · आपातकाल</p><p class="big">${esc(EM['em-name']||'-')}</p><dl class="facts"><div><dt>Blood group</dt><dd class="num">${esc(EM['em-blood']||'-')}</dd></div><div><dt>Call</dt><dd>${esc(EM['em-who']||'-')} · <b class="num">${esc(EM['em-ph']||'-')}</b></dd></div>${EM['em-note']?`<div><dt>Medical notes</dt><dd>${esc(EM['em-note'])}</dd></div>`:''}<div><dt>India emergency</dt><dd class="num">112 · Ambulance 108</dd></div></dl>`;b.hidden=false;$('#em-show').textContent='Hide card'};
$('#dv-lang').value=load('dvlang',0);$('#dv-lang').onchange=()=>save('dvlang',+$('#dv-lang').value);
$('#dv-show').onclick=()=>{const a=$('#dv-addr').value.trim();const b=$('#dv-big');if(!a){b.innerHTML='<p>Type the address first.</p>';b.hidden=false;return}const s=SCRIPTS[+$('#dv-lang').value]||SCRIPTS[0];
  b.innerHTML=`<p class="dvl">${esc(s[1])}</p><p class="dva">${esc(a)}</p><p class="sub">Please take me to this address</p>`;b.hidden=false;b.scrollIntoView({block:'center'})};
})();
