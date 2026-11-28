function exploreItems(pl,dayN,isArrival,ti,ab,arr){
  const f=k=>Math.round(FOOD[k][ti]*(ab?3:1));const it=[];
  const hh=h=>String(Math.floor(h)).padStart(2,'0')+':'+(h%1?'30':'00');
  if(isArrival&&arr>=15){it.push({time:hh(Math.min(arr+1,21)),what:`Check in and an easy evening walk around ${pl.n}`,cost:0,kind:'sight'});it.push({time:hh(Math.min(Math.max(arr+2,20),22)),what:'Dinner where locals eat',cost:f('d'),kind:'food'});return it}
  const st=isArrival&&arr?Math.max(10.5,arr+0.5):9.5;
  if(!isArrival)it.push({time:'08:30',what:'Breakfast nearby',cost:f('b'),kind:'food'});
  const BASES={goa:'Pick a base: Panaji and Old Goa for churches, North Goa (Anjuna, Baga) for busy beaches, South Goa (Palolem, Colva) for quiet ones. Get around by local bus or a rented scooter',spiti:'Base in Kaza and go out by local bus or shared taxi',kashmir:'Base in Srinagar and do day trips by shared taxi',ladakh:'Base in Leh; acclimatise for a day before going higher',sikkim:'Base in Gangtok and go out by shared jeep',kerala:'Pick a base town and move by KSRTC bus',coorg:'Base in Madikeri and go out by local bus or auto'};
  const base=BASES[String(pl.n).toLowerCase()];
  /* cities whose sights we know: each sight on its own row, with the ride between them */
  const nk=x=>String(x||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const kmAB=(a,b)=>{const r=v=>v*Math.PI/180,h=Math.sin(r(b.la-a.la)/2)**2+Math.cos(r(a.la))*Math.cos(r(b.la))*Math.sin(r(b.lo-a.lo)/2)**2;return 2*6371*Math.asin(Math.sqrt(h))*1.3};
  const eveOf=x=>{const o=String((x.t&&x.t[0]&&x.t[0][0])||'');return /^ss/.test(o)||(/^\d\d:/.test(o)&&+o.slice(0,2)>=16)?o:null};
  const SGall=(window.bgSights||[]).filter(x=>nk(x.c)===nk(pl.n)&&isFinite(x.la));
  let SGd=SGall.filter(x=>!eveOf(x));const SGe=SGall.filter(x=>eveOf(x));
  if(SGd.length>2){const left=SGd.slice(1),ord=[SGd[0]];while(left.length){const last=ord[ord.length-1];left.sort((x,y)=>kmAB(last,x)-kmAB(last,y));ord.push(left.shift())}SGd=ord}
  const slot=dayN-(base?2:1),daySights=slot>=0?SGd.slice(slot*2,slot*2+2):[],eve=slot>=0?SGe[slot]:null;
  const metro=/^(delhi|new delhi|mumbai|kolkata|bengaluru|chennai|hyderabad|jaipur|kochi|lucknow|ahmedabad|pune|nagpur|kanpur|agra|bhopal|indore|patna)$/i.test(pl.n);
  const t=pl.tags||[];let lunchAt=Math.max(13.5,st+2);
  if(eve&&!ab){const o=eveOf(eve);it.push({time:/^ss/.test(o)?'17:30':o,what:'Evening: '+eve.n,cost:0,kind:'sight'})}
  if(dayN===1&&base)it.push({time:hh(st),what:base+(pl.why?` (${String(pl.why).replace(/\.\s*$/,'')})`:''),cost:0,kind:'sight'});
  else if(daySights.length&&!ab){
    const [s1,s2]=daySights;it.push({time:hh(st),what:'See '+s1.n,cost:0,kind:'sight'});
    if(s2){const km=kmAB(s1,s2),short=x=>x.n.replace(/\s*\(.*?\)/g,'').replace(/,\s*[A-Z][a-z]+$/,'');
      const hop=km<1.3?{w:`Walk ${short(s1)} → ${short(s2)}, ~${Math.max(5,Math.round(km/4.5*60/5)*5)} min`,c:0}:metro&&km>5?{w:`Metro or auto ${short(s1)} → ${short(s2)} (~${Math.round(km)} km; metro is cheapest)`,c:50}:{w:`Auto or e-rickshaw ${short(s1)} → ${short(s2)} (~${Math.round(km)} km)`,c:Math.max(40,Math.round(km*15/10)*10)};
      it.push({time:hh(st+2),what:hop.w,cost:hop.c,kind:'travel'});it.push({time:hh(st+2.5),what:'See '+s2.n,cost:0,kind:'sight'});lunchAt=Math.max(13.5,st+4)}
  }else if(dayN===1){
    it.push({time:hh(st),what:pl.why?`Explore ${pl.n} (${String(pl.why).replace(/\.\s*$/,'')})`:`Walk around ${pl.n} and ask your stay what is worth seeing nearby (free)`,cost:0,kind:'sight'});
  }else{
    const ex={t:'Day hike or trek nearby (ask your hostel for the trail and start early)',b:'Beach day: swim, walk the coast, sunset',h:'Forts, palaces or old temples (entry ₹50–600)',p:'Temples, ghats and the evening prayers (free)',f:'Safari or nature walk (book on the official forest site)',l:'Walk or cycle around the lake',w:'Day trip to the nearest waterfall',m:'Viewpoint walk and a village nearby',s:'Snow day: ask for the nearest slope or pass',d:'Dunes at sunset; compare camel-ride prices first',i:'Island hopping or snorkelling by local boat'};
    const k=Object.keys(ex).filter(k=>t.includes(k));const pick=k.length?k[(dayN-2)%k.length]:null;
    const cost={h:300,f:1800,i:800,d:300}[pick]||0;
    const cA=window.bgCoords&&bgCoords(pl.n),kmTo=x=>{const c=window.bgCoords&&bgCoords(x.n);if(!c||!cA)return 999;return Math.round(kmAB(cA,c))};
    const near=(window.bgPlaces||[]).filter(x=>x.state===pl.state&&x.n!==pl.n&&kmTo(x)<=110);const nb=near.length?near[(dayN*7)%near.length]:null;
    if(!pick&&nb){const km=kmTo(nb);it.push({time:hh(st),what:`Local bus or shared taxi ${pl.n} → ${nb.n} and back (~${km} km each way)`,cost:Math.max(60,Math.round(km*2*(ab?6:2.5)/10)*10),kind:'travel'});
      it.push({time:hh(st+Math.max(1,Math.round(km/35*2)/2)),what:`Day trip idea: ${nb.n}. ${nb.why}`,cost:0,kind:'sight'})}
    else it.push({time:hh(st),what:pick?ex[pick]:'Slow day: markets, cafés and a local food walk',cost:Math.round(cost*(ab?2:1)),kind:'sight'});
  }
  it.push({time:hh(lunchAt),what:'Lunch at a local dhaba or canteen',cost:f('l'),kind:'food'});
  it.push({time:hh(Math.max(15,st+3.5)),what:'Local bus, shared auto or walking around town',cost:ab?150:60,kind:'travel'});
  it.push({time:'20:00',what:'Dinner where locals eat',cost:f('d'),kind:'food'});
  return it;
}
function hubOf(st){
  const P=(window.bgPlaces||[]).find(x=>x.n.toLowerCase()===String(st.n).toLowerCase());if(!P||!P.reach)return null;
  const m=String(P.reach).match(/^(?:shared |private |local )?(taxi|cab|jeep|sumo|auto|tempo|e-?rickshaw|boat|trek|walk|scooter|bike|car)\b[^.]*?\bfrom\s+([A-Z][A-Za-z .'’-]+?)(?=\s+via\b|\s*\(|,|;|\.|\s+or\b|\s+and\b|$)/i);
  if(!m)return null;const hub=m[2].trim();if(hub.toLowerCase()===P.n.toLowerCase())return null;
  const a=window.bgCoords&&bgCoords(hub),b=window.bgCoords&&bgCoords(P.n);if(!a||!b)return null;
  const R=6371,r=x=>x*Math.PI/180,h=Math.sin(r(b.la-a.la)/2)**2+Math.cos(r(a.la))*Math.cos(r(b.la))*Math.sin(r(b.lo-a.lo)/2)**2,d=2*R*Math.asin(Math.sqrt(h));
  const said=String(P.reach).match(/(\d+)\s*km/);const km=said?+said[1]:Math.round(d*1.3);if(km>160)return null;
  return{n:P.n,hub:a.n||hub,how:m[1].toLowerCase()==='sumo'?'shared sumo':(/shared/i.test(P.reach)?'shared ':'')+m[1].toLowerCase(),km,why:P.why||'',reach:P.reach}}
function hubDayItems(b,t,dayN,isArrival,ti,ab,arr,ppl){
