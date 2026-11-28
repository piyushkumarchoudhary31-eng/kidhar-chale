/* ===== TRIP ROUTE: start city → train/bus → cities → places A B C, drawn on a real India map, at the top of every plan ===== */
(()=>{
  const out=document.querySelector('#p-out');if(!out)return;
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const N=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const co=n=>{const c=window.bgCoords&&bgCoords(n);return c&&isFinite(c.la)&&isFinite(c.lo)?c:null};
  const coX=n=>{const c=window.bgCoordsExact&&bgCoordsExact(n);return c&&isFinite(c.la)?c:null};
  const kmBetween=(a,b)=>{const r=Math.PI/180,h=Math.sin((b.la-a.la)*r/2)**2+Math.cos(a.la*r)*Math.cos(b.la*r)*Math.sin((b.lo-a.lo)*r/2)**2;return 12742*Math.asin(Math.sqrt(h))};
  const tone=n=>{try{const t=window.kcTheme&&kcTheme(n);const c=t&&t.c||'';if(!/^#[0-9a-f]{6}$/i.test(c))return'';const v=parseInt(c.slice(1),16),L=(.2126*(v>>16&255)+.7152*(v>>8&255)+.0722*(v&255))/255;return L>.72?'':c}catch(e){return''}};
  const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the official India map (Survey of India boundaries via DataMeet, CC BY 4.0) ---------- */
  let MAPP=null;
  const getMap=()=>MAPP||(MAPP=fetch('assets/india-map.json').then(r=>{if(!r.ok)throw new Error('map');return r.json()}).then(J=>{
    const P=J.proj,r=Math.PI/180,q=x=>Math.tan(Math.PI/4+x/2),p1=P.p1*r,p2=P.p2*r;
    const n=Math.log(Math.cos(p1)/Math.cos(p2))/Math.log(q(p2)/q(p1)),F=Math.cos(p1)*q(p1)**n/n,R0=F/q(P.p0*r)**n;
    J.xy=(la,lo)=>{const rr=F/q(la*r)**n,t=n*(lo*r-P.l0*r);return[(rr*Math.sin(t)+P.tx)*P.s,(P.ty-(R0-rr*Math.cos(t)))*P.s]};
    J.kmPerU=6371/P.s;
    J.states.forEach(s=>{const rings=[];let cur=null,x=0,y=0;const tk=s.d.match(/[MlhvzZ]|-?\d*\.?\d+(?:e-?\d+)?/g)||[];let i=0,cmd='';
      while(i<tk.length){const t=tk[i];if(/[MlhvzZ]/.test(t)){cmd=t;i++;if(cmd==='z'||cmd==='Z'){cur=null}continue}
        if(cmd==='M'){x=+tk[i];y=+tk[i+1];i+=2;cur=[[x,y]];rings.push(cur);cmd='l'}
        else if(cmd==='l'){x+=+tk[i];y+=+tk[i+1];i+=2;cur&&cur.push([x,y])}
        else if(cmd==='h'){x+=+tk[i];i++;cur&&cur.push([x,y])}
        else if(cmd==='v'){y+=+tk[i];i++;cur&&cur.push([x,y])}else i++}
      s.rings=rings;let a=1e9,b=1e9,c=-1e9,d=-1e9,big=null,bigA=0;
      rings.forEach(R=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;R.forEach(([X,Y])=>{x0=Math.min(x0,X);y0=Math.min(y0,Y);x1=Math.max(x1,X);y1=Math.max(y1,Y)});
        a=Math.min(a,x0);b=Math.min(b,y0);c=Math.max(c,x1);d=Math.max(d,y1);const A=(x1-x0)*(y1-y0);if(A>bigA){bigA=A;big=[x0,y0,x1,y1]}});
      s.box=[a,b,c,d];s.big=big});
    J.stateAt=(X,Y)=>J.states.find(s=>X>=s.box[0]&&X<=s.box[2]&&Y>=s.box[1]&&Y<=s.box[3]&&s.rings.some(R=>{let inn=false;for(let i=0,j=R.length-1;i<R.length;j=i++){const[xi,yi]=R[i],[xj,yj]=R[j];if((yi>Y)!==(yj>Y)&&X<(xj-xi)*(Y-yi)/(yj-yi)+xi)inn=!inn}return inn}))||null;
    return J}).catch(e=>{MAPP=null;throw e}));

  /* ---------- places: our sights list first, then the places data, then Wikipedia ---------- */
  const SG=(typeof SIGHTS!=='undefined'?SIGHTS:[]).map(s=>{const base=s.n.replace(/\s*\(.*?\)\s*/g,' ').replace(/,\s*[A-Z][a-z]+$/,'').trim();const k=N(base),short=k.replace(/\s+(food lanes|night food|ganga aarti|evening aarti|aarti|illumination|sunrise point|sunrise|sunset|border ceremony|dance show|shikara|sand dunes sunset|western group|living fort)$/,'');return{s,k:short.length>5?short:k,full:N(s.n)}}).filter(x=>x.k.length>3);
  const GEN=/^(trip|done|breakfast|lunch|dinner|chai|local|check|arrive|rest|slow day|free time|shopping|markets?|cafes?|street food|endless street food|food|the|old market|main viewpoint|day hike|beach day|forts|palaces|temples|ghats|safari|viewpoint|walk|sunset|sunrise|evening|morning|night|home|hostel|hotel|bus|train|flight|snow day|dunes|island hopping|swim|nature walk)\b/i;
  const GKEY='bg_geo';let GEO={};try{GEO=JSON.parse(localStorage.getItem(GKEY)||'{}')||{}}catch(e){GEO={}}
  const saveGeo=()=>{try{const k=Object.keys(GEO);if(k.length>400)k.slice(0,k.length-400).forEach(x=>delete GEO[x]);localStorage.setItem(GKEY,JSON.stringify(GEO))}catch(e){}};
  const pending=new Map();
  function wiki(name,city,near){const key=N(name)+'|'+N(city);if(key in GEO)return Promise.resolve(GEO[key]);if(pending.has(key))return pending.get(key);
    const ctl=window.AbortController?new AbortController():null;const tm=setTimeout(()=>ctl&&ctl.abort(),7000);
    const u='https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=search&gsrlimit=4&prop=coordinates&colimit=8&gsrsearch='+encodeURIComponent(name+' '+city);
    const pr=fetch(u,ctl?{signal:ctl.signal}:{}).then(r=>r.json()).then(j=>{const pg=Object.values((j.query||{}).pages||{}).sort((a,b)=>a.index-b.index);
      const words=N(name).split(' ').filter(w=>w.length>3);
      for(const p of pg){const c=(p.coordinates||[])[0];if(!c)continue;const t=N(p.title),titled=!words.length||words.some(w=>t.includes(w));
        const pt={la:+c.lat,lo:+c.lon},far=near?kmBetween(near,pt):0;if(far>70)continue;if(!titled&&(p!==pg[0]||far>25))continue;return GEO[key]=[+pt.la.toFixed(4),+pt.lo.toFixed(4)]}
      return GEO[key]=0}).catch(()=>null).finally(()=>{clearTimeout(tm);pending.delete(key);saveGeo()});
    pending.set(key,pr);return pr}

  /* ---------- read the plan: cities, legs, places ---------- */
  const MODES=[[/flight|fly|plane|airport|indigo|air ?india/i,'flight','✈️','Flight'],[/train|rail|express|rajdhani|shatabdi|vande|duronto|garib/i,'train','🚆','Train'],[/ferry|boat|cruise|ship|launch/i,'ferry','⛴️','Ferry'],[/jeep|taxi|cab|car|scooty|bike|tempo/i,'cab','🚕','Taxi / jeep'],[/bus|volvo|rtc|roadways|sleeper coach/i,'bus','🚌','Bus']];
  function legInfo(txt){for(const m of MODES)if(m[0].test(txt))return{mode:m[1],ico:m[2],name:m[3]};return{mode:'road',ico:'🛣️',name:'By road'}}
  function read(p){
    const seq=[],dayOf=[];
    p.days.forEach((d,di)=>{const parts=String(d.city||'').split(/\s*(?:→|->)\s*/).map(s=>s.trim()).filter(s=>s&&!/^on the (bus|train)$/i.test(s));
      parts.forEach(c=>{if(N(seq[seq.length-1]||'')!==N(c)){seq.push(c);dayOf.push(di)}})});
    if(seq.length<1)return null;
    const home=seq[0],round=seq.length>1&&N(seq[seq.length-1])===N(home);
    const cities=[],idx=new Map();
    seq.forEach(n=>{const k=N(n);if(!idx.has(k)){const c=co(n);idx.set(k,cities.length);cities.push({n,k,la:c?c.la:null,lo:c?c.lo:null,col:tone(n),days:new Set()})}});
    /* which days each city is "yours" */
    p.days.forEach((d,di)=>{const parts=String(d.city||'').split(/\s*(?:→|->)\s*/).map(s=>s.trim()).filter(Boolean);
      if(parts.length===1){const i=idx.get(N(parts[0]));if(i!=null)cities[i].days.add(di+1);return}
      parts.forEach((c,k)=>{const i=idx.get(N(c));if(i==null)return;
        if(k<parts.length-1){cities[i].days.add(di+1);return}
        const its=d.items||[];let lt=-1;its.forEach((it,j)=>{if(it.kind==='travel'&&/→|->|\bto\b/.test(it.what||''))lt=j});
        if(its.slice(lt+1).some(it=>it.kind!=='travel'))cities[i].days.add(di+1)})});
    /* the legs between cities, with how you go */
    const legs=[];
    for(let i=0;i<seq.length-1;i++){const a=seq[i],b=seq[i+1];let txt='',hrs=null,day=dayOf[i+1]+1;
      const all=[];p.days.forEach((d,di)=>(d.items||[]).forEach(it=>{if(it.kind==='travel')all.push({it,di})}));
      const hit=all.find(x=>{if(x.used)return false;const w=N(x.it.what),ia=w.indexOf(N(a)),ib=w.indexOf(N(b));return ia>=0&&ib>ia})||all.find(x=>!x.used&&x.di===dayOf[i+1]&&/→|->/.test(x.it.what||''))||all.find(x=>x.di===dayOf[i+1]&&/→|->/.test(x.it.what||''));
      if(hit){hit.used=1;txt=hit.it.what;day=hit.di+1;const h=String(txt).match(/~?\s*(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours)\b/i);if(h)hrs=+h[1]}
      const L=legInfo(txt||'');const night=/overnight|night/i.test(txt||'');
      const nm=String(txt||'').replace(/\s*\(.*?\)\s*/g,' ').replace(new RegExp('\\s*'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*(→|->|to)\\s*'+b.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*','i'),' ').replace(/\s+/g,' ').trim();
      legs.push({a:idx.get(N(a)),b:idx.get(N(b)),an:a,bn:b,mode:L.mode,ico:L.ico,name:nm&&nm.length<48?nm:L.name,hrs,night,day})}
    /* places to see, in the order you see them */
    const places=[],seen=new Set();
    const add=(n,c,di,ci,how)=>{const k=N(n);if(!k||seen.has(k))return;if(c&&places.some(p=>p.la!=null&&kmBetween(p,c)<.3))return;seen.add(k);places.push({n,la:c?c.la:null,lo:c?c.lo:null,day:di+1,ci,how})};
    p.days.forEach((d,di)=>{const parts=String(d.city||'').split(/\s*(?:→|->)\s*/).map(s=>s.trim()).filter(Boolean);
      const its=d.items||[];let lt=-1;its.forEach((it,j)=>{if(it.kind==='travel'&&/→|->/.test(it.what||''))lt=j});
      its.forEach((it,j)=>{if(it.kind==='travel')return;const raw=String(it.what||'');const w=N(raw);
        let cityN=parts.find(c=>w.includes(N(c)))||(j>lt&&lt>=0?parts[parts.length-1]:parts[0]);
        const ci=idx.get(N(cityN));const cc=ci!=null?cities[ci]:null;
        /* 1. our sights list */
        const hits=SG.filter(x=>(w.includes(x.k)||w.includes(x.full))&&(!cc||cc.la==null||kmBetween(cc,{la:x.s.la,lo:x.s.lo})<90)).sort((x,y)=>w.indexOf(x.k)-w.indexOf(y.k));
        const used=hits.map(h=>h.k);hits.forEach(h=>add(h.s.n.replace(/\s*\((.*?)\)/,'').replace(/,\s*[A-Z][a-z]+$/,'').trim(),{la:h.s.la,lo:h.s.lo},di,ci,'list'));
        if(it.kind==='food')return;
        /* 2. "Day trip idea: Palolem." and other places we know */
        const dt=raw.match(/day trip(?: idea)?:?\s*([^.]+)\./i);
        if(dt){const n=dt[1].trim(),c=coX(n)||co(n);if(c){add(n,c,di,idx.get(N(n))!=null?idx.get(N(n)):ci,'list');return}}
        /* 3. proper names in the text, looked up on Wikipedia */
        let body=raw.replace(/\s*\(.*?\)\s*/g,' ');const col=body.indexOf(':');if(col>=0&&col<40)body=body.slice(col+1);
        body.split(/,|;|\s+and\s+|\s*&\s*|\s+then\s+|\s+or\s+|\.\s/).map(s=>s.replace(/^(see|visit|explore|walk around|walk to|go to|evening at|morning at|sunset at|sunrise at|aarti at|boat ride (?:at|on)|stroll (?:at|through)|the)\s+/i,'').replace(/[.!]+$/,'').replace(/\s+(walk|tour|visit|ride|stroll|darshan|trip)$/i,'').trim())
          .forEach(s=>{if(!s||s.length<4||s.length>42)return;if(!/^[A-Z][A-Za-z\s'’.\-]+$/.test(s)||GEN.test(s))return;const wc=s.split(/\s+/).length;if(wc>5)return;
            if(used.some(k=>N(s).includes(k)||k.includes(N(s))))return;if(cc&&N(s)===cc.k)return;
            if(parts.some(c=>N(c)===N(s)))return;
            const kn=coX(s);if(kn&&cc&&cc.la!=null&&kmBetween(cc,kn)<120){add(s,kn,di,ci,'list');return}
            add(s,null,di,ci,'wiki')})})});
    return{cities,legs,places,home,round,days:p.days.length,seq}}

  /* ---------- drawing ---------- */
  let uid=0;
  function svgMap(J,R,boxW){
    const id='kt'+(++uid),W=J.w,H=J.h,phone=boxW<600,AR=phone?1.02:1.5;
    const C=R.cities.filter(c=>c.X!=null),PL=R.places.filter(p=>p.X!=null);
    /* loupe candidates: cities with 2+ places close together */
    const byC=new Map();PL.forEach(p=>{if(p.ci==null)return;(byC.get(p.ci)||byC.set(p.ci,[]).get(p.ci)).push(p)});
    let pts=C.map(c=>[c.X,c.Y]);
    let x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));
    PL.forEach(p=>{if(!(byC.get(p.ci)||[]).length){x0=Math.min(x0,p.X);x1=Math.max(x1,p.X);y0=Math.min(y0,p.Y);y1=Math.max(y1,p.Y)}});
    let w=x1-x0,h=y1-y0;const pad=Math.max(55,.22*Math.max(w,h));w+=2*pad;h+=2*pad;
    w=Math.max(w,phone?230:300);if(w/h<AR)w=h*AR;else h=w/AR;
    if(w>W*1.02){w=W*1.02;h=w/AR;if(h<H*.6){h=H*1.02;w=h*AR}}
    let cx=(x0+x1)/2,cy=(y0+y1)/2;
    const mk=()=>({vx:cx-w/2,vy:cy-h/2,vw:w,vh:h});let V=mk();
    const u=()=>V.vw/boxW;/* one screen pixel in map units */
    /* corners for the zoom circles and the small India */
    const loupes=[];
    const cand=[...byC.entries()].filter(([ci,ps])=>ps.length>=2).sort((a,b)=>b[1].length-a[1].length).slice(0,2);
    const used=[];
    const arcs=[];R.legs.forEach(L=>{const A=R.cities[L.a],B=R.cities[L.b];if(!A||!B||A.X==null||B.X==null)return;const dx=B.X-A.X,dy=B.Y-A.Y,bd=L.mode==='flight'?.26:.16,kx=(A.X+B.X)/2-dy*bd,ky=(A.Y+B.Y)/2+dx*bd;
      for(let t=.1;t<.95;t+=.1)arcs.push([(1-t)*(1-t)*A.X+2*(1-t)*t*kx+t*t*B.X,(1-t)*(1-t)*A.Y+2*(1-t)*t*ky+t*t*B.Y])});
    const occupied=(x,y,r)=>C.some(c=>Math.hypot(c.X-x,c.Y-y)<r+22*u())||arcs.some(a=>Math.hypot(a[0]-x,a[1]-y)<r+6*u())||used.some(o=>Math.hypot(o.x-x,o.y-y)<r+o.r+6*u())||PL.some(p=>!byC.has(p.ci)&&Math.hypot(p.X-x,p.Y-y)<r+12*u());
    const corners=r=>{const m=r+10*u();return[[V.vx+m,V.vy+m],[V.vx+V.vw-m,V.vy+m],[V.vx+m,V.vy+V.vh-m],[V.vx+V.vw-m,V.vy+V.vh-m]]};
    for(const [ci,ps] of cand){
      const c=R.cities[ci];let bx0=Math.min(...ps.map(p=>p.X)),bx1=Math.max(...ps.map(p=>p.X)),by0=Math.min(...ps.map(p=>p.Y)),by1=Math.max(...ps.map(p=>p.Y));
      const span=Math.max(bx1-bx0,by1-by0,.6);
      if(span*1>34*u()&&span>V.vw*.12){/* spread out enough to show on the big map */byC.delete(ci);continue}
      let placed=null;
      for(let tries=0;tries<4&&!placed;tries++){
        const r=Math.min(V.vw,V.vh)*(phone?.22:.24)*(ps.length<=3?.8:1);
        const cs=corners(r).map(([x,y])=>({x,y,d:Math.hypot(x-c.X,y-c.Y)})).filter(o=>!occupied(o.x,o.y,r)).sort((a,b)=>a.d-b.d);
        if(cs.length){placed={x:cs[0].x,y:cs[0].y,r}}
        else if(!loupes.length){w*=1.16;h*=1.16;V=mk()}else break}
      if(!placed){byC.delete(ci);continue}
      const z=Math.min((placed.r*2*.6)/span,(placed.r*2*.6)/(.6));
      used.push(placed);loupes.push({ci,ps,x:placed.x,y:placed.y,r:placed.r,z,cx:(bx0+bx1)/2,cy:(by0+by1)/2})}
    const U=u();
    /* little India in a free corner when we are zoomed in */
    let loc=null;if(V.vw<W*.62){const lw=Math.min(V.vw,V.vh)*(phone?.26:.22),lh=lw*H/W;const m=10*U;
      const cs=[[V.vx+m,V.vy+m],[V.vx+V.vw-m-lw,V.vy+m],[V.vx+m,V.vy+V.vh-m-lh],[V.vx+V.vw-m-lw,V.vy+V.vh-m-lh]];
      for(const [x,y] of cs){const cxx=x+lw/2,cyy=y+lh/2,rr=Math.hypot(lw,lh)/2;if(!occupied(cxx,cyy,rr*.92)){loc={x,y,w:lw,h:lh};used.push({x:cxx,y:cyy,r:rr});break}}}
    /* paths */
    const statesD=J.states.map((s,i)=>`<path d="${s.d}" data-i="${i}"/>`).join('');
    const visited=new Set(C.map(c=>c.st).filter(Boolean));
    const visD=J.states.filter(s=>visited.has(s.n)).map(s=>`<path d="${s.d}"/>`).join('');
    /* graticule */
    let grid='';for(let la=10;la<=35;la+=5){let d='';for(let lo=64;lo<=100;lo+=2){const[x,y]=J.xy(la,lo);d+=(d?'L':'M')+x.toFixed(0)+' '+y.toFixed(0)}grid+=`<path d="${d}"/>`}
    for(let lo=70;lo<=95;lo+=5){let d='';for(let la=4;la<=38;la+=2){const[x,y]=J.xy(la,lo);d+=(d?'L':'M')+x.toFixed(0)+' '+y.toFixed(0)}grid+=`<path d="${d}"/>`}
    /* legs as gentle arcs */
    let legsS='',masks='',badges='';
    R.legs.forEach((L,i)=>{const A=R.cities[L.a],B=R.cities[L.b];if(!A||!B||A.X==null||B.X==null)return;
      const dx=B.X-A.X,dy=B.Y-A.Y;const bend=L.mode==='flight'?.26:.16;
      let kx=(A.X+B.X)/2-dy*bend,ky=(A.Y+B.Y)/2+dx*bend;
      /* a straight back-and-forth trip gets two separate arcs, one each way */
      const d=`M${A.X.toFixed(1)} ${A.Y.toFixed(1)}Q${kx.toFixed(1)} ${ky.toFixed(1)} ${B.X.toFixed(1)} ${B.Y.toFixed(1)}`;
      const mx=(A.X+2*kx+B.X)/4,my=(A.Y+2*ky+B.Y)/4;
      const sw=L.mode==='flight'?2.4:3.2;
      const line=L.mode==='train'?`<path class="kt-rail" d="${d}" stroke-width="${(sw+1.6)*U}"/><path class="kt-tie" d="${d}" stroke-width="${(sw-1)*U}" stroke-dasharray="${5*U} ${5*U}"/>`
        :L.mode==='flight'?`<path class="kt-fly" d="${d}" stroke-width="${sw*U}" stroke-dasharray="${.1*U} ${6*U}"/>`
        :L.mode==='ferry'?`<path class="kt-sea" d="${d}" stroke-width="${sw*U}" stroke-dasharray="${7*U} ${5*U}"/>`
        :`<path class="kt-road" d="${d}" stroke-width="${sw*U}" stroke-dasharray="${8*U} ${4.5*U}"/>`;
      masks+=`<mask id="${id}m${i}" maskUnits="userSpaceOnUse" x="${V.vx}" y="${V.vy}" width="${V.vw}" height="${V.vh}"><path class="kt-rev" style="--i:${i}" d="${d}" pathLength="1" stroke="#fff" stroke-width="${16*U}" fill="none"/></mask>`;
      legsS+=`<g mask="url(#${id}m${i})">${line}</g>`;
      if(Math.hypot(dx,dy)<64*U)return;
      const lab=L.hrs?(L.hrs>=1?String(L.hrs).replace(/\.0$/,'')+'h':'')+'':'';
      const bw=(lab?28+lab.length*7.2:26)*U,bh=22*U;
      badges+=`<g class="kt-badge" data-mx="${mx.toFixed(1)}" data-my="${my.toFixed(1)}" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})" style="--i:${i}"><title>${E(L.name)}${L.hrs?' · ~'+L.hrs+' h':''}</title><rect x="${-bw/2}" y="${-bh/2}" width="${bw}" height="${bh}" rx="${bh/2}"/><text x="${lab?-bw/2+12*U:0}" y="${.5*U}" font-size="${12.5*U}" text-anchor="middle" dominant-baseline="central">${L.ico}</text>${lab?`<text class="kt-h" x="${bw/2-7*U}" y="${.5*U}" font-size="${11*U}" text-anchor="end" dominant-baseline="central">${lab}</text>`:''}<animateMotion begin="indefinite" dur="1.1s" fill="freeze" calcMode="linear" keyPoints="0;0.5" keyTimes="0;1" path="${d}"/></g>`});
    /* labels that try not to sit on each other */
    const boxes=[];const hit=(b)=>boxes.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1])||used.some(o=>{const nx=Math.max(b[0],Math.min(o.x,b[2])),ny=Math.max(b[1],Math.min(o.y,b[3]));return Math.hypot(nx-o.x,ny-o.y)<o.r});
    C.forEach(c=>boxes.push([c.X-12*U,c.Y-12*U,c.X+12*U,c.Y+12*U]));
    /* badges count as taken space for labels */
    R.legs.forEach(L=>{const A=R.cities[L.a],B=R.cities[L.b];if(!A||!B||A.X==null||B.X==null)return;const dx=B.X-A.X,dy=B.Y-A.Y,bd=L.mode==='flight'?.26:.16,kx=(A.X+B.X)/2-dy*bd,ky=(A.Y+B.Y)/2+dx*bd,mx=(A.X+2*kx+B.X)/4,my=(A.Y+2*ky+B.Y)/4;boxes.push([mx-30*U,my-12*U,mx+30*U,my+12*U])});
    const label=(x,y,t1,t2,r)=>{const fs=13.5*U,fs2=10.5*U,cw=fs*.56;const tw=Math.max(t1.length*cw,(t2||'').length*fs2*.56);const th=fs+(t2?fs2+2*U:0);
      const opts=[['s',x+r+5*U,y-th/2+fs*.8,'start'],['e',x-r-5*U,y-th/2+fs*.8,'end'],['n',x,y-r-6*U-th+fs*.8,'middle'],['u',x,y+r+5*U+fs*.8,'middle'],['ne',x+r*.7+3*U,y-r*.7-th+fs*.6,'start'],['nw',x-r*.7-3*U,y-r*.7-th+fs*.6,'end'],['se',x+r*.7+3*U,y+r*.7+fs*.9,'start'],['sw',x-r*.7-3*U,y+r*.7+fs*.9,'end']];
      let pick=opts[0],pb=null,best=1e18,bestO=null,bestB=null;
      const cost=b=>{let c=0;boxes.forEach(o=>{const ix=Math.min(b[2],o[2])-Math.max(b[0],o[0]),iy=Math.min(b[3],o[3])-Math.max(b[1],o[1]);if(ix>0&&iy>0)c+=ix*iy});
        used.forEach(o=>{const nx=Math.max(b[0],Math.min(o.x,b[2])),ny=Math.max(b[1],Math.min(o.y,b[3]));const d=o.r-Math.hypot(nx-o.x,ny-o.y);if(d>0)c+=d*(b[2]-b[0])});
        const ox=Math.max(0,V.vx-b[0])+Math.max(0,b[2]-V.vx-V.vw),oy=Math.max(0,V.vy-b[1])+Math.max(0,b[3]-V.vy-V.vh);return c+(ox+oy)*th*4};
      for(const o of opts){const bx=o[3]==='start'?o[1]:o[3]==='end'?o[1]-tw:o[1]-tw/2;const b=[bx-2*U,o[2]-fs*.85,bx+tw+2*U,o[2]-fs*.85+th+2*U];
        const c=cost(b);if(c===0){pick=o;pb=b;break}if(c<best){best=c;bestO=o;bestB=b}}
      if(!pb){pick=bestO||opts[0];pb=bestB||[0,0,0,0]}boxes.push(pb);
      return`<text class="kt-lab" x="${pick[1].toFixed(1)}" y="${pick[2].toFixed(1)}" text-anchor="${pick[3]}" font-size="${fs}" stroke-width="${4*U}">${E(t1)}${t2?`<tspan class="kt-sub" x="${pick[1].toFixed(1)}" dy="${fs2+3*U}" font-size="${fs2}">${E(t2)}</tspan>`:''}</text>`};
    const dayTxt=c=>{const d=[...c.days].sort((a,b)=>a-b);if(!d.length)return'';return d.length===1?'Day '+d[0]:(d[d.length-1]-d[0]===d.length-1?'Day '+d[0]+'–'+d[d.length-1]:'Days '+d.join(', '))};
    let pins='',labs='';
    C.forEach((c,i)=>{const isHome=i===0,r=(isHome?12:10.5)*U,col=c.col||'var(--accent)';
      pins+=`<g class="kt-city${isHome?' home':''}" transform="translate(${c.X.toFixed(1)} ${c.Y.toFixed(1)})"><title>${E(c.n)}</title><circle r="${r+2.4*U}" class="kt-ring"/><circle r="${r}" style="fill:${col}"/>${isHome?`<text font-size="${12*U}" text-anchor="middle" dominant-baseline="central" y="${.6*U}">🏠</text>`:`<text class="kt-num" font-size="${11.5*U}" text-anchor="middle" dominant-baseline="central" y="${.5*U}">${c.num}</text>`}</g>`});
    C.forEach((c,i)=>{labs+=label(c.X,c.Y,c.n,i===0?(R.round?'Start & finish':'Start'):dayTxt(c),(i===0?14:12.5)*U)});
    /* places right on the map (when they are spread out) */
    const mainPL=PL.filter(p=>!(byC.has(p.ci)&&loupes.some(l=>l.ci===p.ci)));
    const near=p=>{const c=R.cities[p.ci];return c&&c.X!=null&&Math.hypot(c.X-p.X,c.Y-p.Y)<30*U};
    mainPL.filter(near).forEach(p=>{const c=R.cities[p.ci];if(Math.hypot(c.X-p.X,c.Y-p.Y)<15*U)return;pins=`<circle class="kt-pdot" cx="${p.X.toFixed(1)}" cy="${p.Y.toFixed(1)}" r="${3.2*U}" stroke-width="${1.2*U}"><title>${E(p.L+' · '+p.n)}</title></circle>`+pins;return;pins+=`<circle class="kt-pdot" cx="${p.X.toFixed(1)}" cy="${p.Y.toFixed(1)}" r="${3.2*U}" stroke-width="${1.2*U}"><title>${E(p.L+' · '+p.n)}</title></circle>`});
    mainPL.filter(p=>!near(p)).forEach(p=>{const r=8.5*U;
      pins+=`<g class="kt-pl" transform="translate(${p.X.toFixed(1)} ${p.Y.toFixed(1)})"><title>${E(p.L+' · '+p.n)}</title><circle r="${r+1.6*U}" class="kt-ring"/><circle r="${r}"/><text font-size="${10*U}" text-anchor="middle" dominant-baseline="central" y="${.5*U}">${p.L}</text></g>`;
      if(mainPL.length<=6)labs+=label(p.X,p.Y,p.n.length>22?p.n.slice(0,21)+'…':p.n,'',r)});
    /* zoom circles */
    let lp='';loupes.forEach((l,k)=>{const c=R.cities[l.ci];const tr=`translate(${l.x} ${l.y-l.r*.1}) scale(${l.z}) translate(${-l.cx} ${-l.cy})`;const ZU=U/l.z;
      const fr=(l.r*.92)/l.z;/* area shown, in big-map units */
      const ang=Math.atan2(l.y-c.Y,l.x-c.X),ex=l.x-Math.cos(ang)*l.r,ey=l.y-Math.sin(ang)*l.r,sx=c.X+Math.cos(ang)*(fr+3*U),sy=c.Y+Math.sin(ang)*(fr+3*U);
      let route='';const seq=l.ps;
      /* keep pins from sitting on top of each other inside the circle */
      seq.forEach(p=>{p.lx=p.X;p.ly=p.Y});for(let it=0;it<30;it++){let moved=false;for(let a=0;a<seq.length;a++)for(let b=a+1;b<seq.length;b++){const A=seq[a],B=seq[b];let dx=B.lx-A.lx,dy=B.ly-A.ly,d=Math.hypot(dx,dy);const need=20*ZU;if(d<need){if(d<1e-6){dx=1;dy=0;d=1}const m=(need-d)/2;A.lx-=dx/d*m;A.ly-=dy/d*m;B.lx+=dx/d*m;B.ly+=dy/d*m;moved=true}}if(!moved)break}
      const byDay=new Map();seq.forEach(p=>(byDay.get(p.day)||byDay.set(p.day,[]).get(p.day)).push(p));
      byDay.forEach(g=>{if(g.length>1)route+=`<path class="kt-walk" d="M${g.map(p=>p.lx.toFixed(2)+' '+p.ly.toFixed(2)).join('L')}" stroke-width="${2.2*ZU}" stroke-dasharray="${5*ZU} ${4*ZU}"/>`});
      const inner=seq.map(p=>{const r=9*ZU;return`<g class="kt-pl" transform="translate(${p.lx.toFixed(2)} ${p.ly.toFixed(2)})"><title>${E(p.L+' · '+p.n)}</title><circle r="${r+1.8*ZU}" class="kt-ring"/><circle r="${r}"/><text font-size="${10.5*ZU}" text-anchor="middle" dominant-baseline="central" y="${.5*ZU}">${p.L}</text></g>`}).join('');
      const cityDot=`<circle cx="${c.X}" cy="${c.Y}" r="${4.5*ZU}" style="fill:${c.col||'var(--accent)'}" class="kt-cdot"/>`;
      lp+=`<circle class="kt-lens" cx="${c.X}" cy="${c.Y}" r="${fr}" stroke-width="${1.4*U}"/><line class="kt-lead" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke-width="${1.4*U}"/>
       <clipPath id="${id}c${k}"><circle cx="${l.x}" cy="${l.y}" r="${l.r}"/></clipPath>
       <g class="kt-loupe"><circle cx="${l.x}" cy="${l.y}" r="${l.r+3*U}" class="kt-lshadow"/><g clip-path="url(#${id}c${k})"><rect x="${l.x-l.r}" y="${l.y-l.r}" width="${2*l.r}" height="${2*l.r}" class="kt-seabg"/><g transform="${tr}"><use href="#${id}s" class="kt-land2" stroke-width="${1.1*ZU}"/>${cityDot}${route}${inner}</g></g>
       <circle cx="${l.x}" cy="${l.y}" r="${l.r}" class="kt-lring" stroke-width="${2*U}"/>
       <text class="kt-ltag" x="${l.x}" y="${l.y+l.r-9*U}" text-anchor="middle" font-size="${10.5*U}" stroke-width="${3.5*U}">${E(c.n.toUpperCase())}</text></g>`});
    /* small India */
    let li='';if(loc){const s=loc.w/W;li=`<g class="kt-loc"><rect x="${loc.x}" y="${loc.y}" width="${loc.w}" height="${loc.h}" rx="${4*U}" class="kt-locbg" stroke-width="${1.2*U}"/><g transform="translate(${loc.x} ${loc.y}) scale(${s})"><use href="#${id}s" class="kt-locland"/><rect x="${V.vx}" y="${V.vy}" width="${V.vw}" height="${V.vh}" class="kt-locbox" stroke-width="${2/s*U}"/></g></g>`}
    /* state names for the states you pass through */
    let sn='';J.states.forEach(s=>{if(!visited.has(s.n)||!s.big)return;const bx=(s.big[0]+s.big[2])/2,by=(s.big[1]+s.big[3])/2;const fs=Math.min(11*U,(s.big[2]-s.big[0])/(s.n.length*.9));if(fs<6.5*U)return;
      const b=[bx-s.n.length*fs*.45,by-fs,bx+s.n.length*fs*.45,by+fs*.4];if(hit(b))return;sn+=`<text class="kt-state" x="${bx}" y="${by}" text-anchor="middle" font-size="${fs}" letter-spacing="${fs*.28}">${E(s.n.toUpperCase())}</text>`});
    return`<svg class="kt-svg" viewBox="${V.vx.toFixed(1)} ${V.vy.toFixed(1)} ${V.vw.toFixed(1)} ${V.vh.toFixed(1)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <defs><g id="${id}s">${statesD}</g>${masks}</defs>
      <rect class="kt-seabg" x="${V.vx-5}" y="${V.vy-5}" width="${V.vw+10}" height="${V.vh+10}"/>
      <g class="kt-grid" stroke-width="${.9*U}">${grid}</g>
      <use href="#${id}s" class="kt-shore" stroke-width="${3.2*U}"/>
      <use href="#${id}s" class="kt-land" stroke-width="${.9*U}"/>
      <g class="kt-visit" stroke-width="${1.1*U}">${visD}</g>
      ${sn}${legsS}${lp}${badges}${pins}${labs}${li}</svg>`}

  /* ---------- the card ---------- */
  let J0=null,lastSig='',map=null,ro=null,lastW=0;
  function letters(i){let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}
  function build(){
    const p=window.bgCurrentPlan&&bgCurrentPlan();if(!p||!p.days||!p.days.length)return;
    const first=out.querySelector(':scope > .card');if(!first)return;
    const R=read(p);if(!R||!R.cities.length)return;
    R.places.forEach((x,i)=>x.L=letters(i));
    let num=0;R.cities.forEach((c,i)=>{c.num=i===0?0:++num});
    const card=document.createElement('div');card.className='card kc-troute';card.id='kc-troute';
    const title=R.seq.join(' → ');
    const plN=R.places.length;
    card.innerHTML=`<div class="kt-head"><div style="min-width:0"><p class="eyebrow">🗺 Your trip route</p><h3>${E(title)}</h3></div><span class="pill">${R.days} day${R.days>1?'s':''}${plN?' · '+plN+' place'+(plN>1?'s':''):''}</span></div>
      <div class="kt-map" role="img" aria-label="${E('Map of India showing the route '+title+(plN?', with places '+R.places.map(x=>x.L+' '+x.n).join(', '):''))}"><p class="kc-skel kt-skel" aria-busy="true">Drawing your map…</p></div>
      <div class="kt-key" aria-hidden="true"></div>
      <ol class="kt-list"></ol>
      <div class="row kt-acts"><button type="button" class="small" id="kt-street" aria-expanded="false">🧭 Street map</button>${R.cities.length>1?`<a class="btnlink small" target="_blank" rel="noopener" id="kt-gm">📍 Intercity route in Google Maps ↗</a>`:''}</div>
      <div class="kc-rmap kt-street" hidden></div>
      <p class="kt-src">India map: Survey of India boundaries via <a href="https://github.com/datameet/maps" target="_blank" rel="noopener">DataMeet</a> (CC BY 4.0). Places are approximate.</p>`;
    first.after(card);
    const st=card.querySelector('#kt-street'),sm=card.querySelector('.kt-street'),list=card.querySelector('.kt-list'),mapBox=card.querySelector('.kt-map'),key=card.querySelector('.kt-key');
    if(card.querySelector('#kt-gm')){const cs=R.seq,o=cs[0],de=cs[cs.length-1],wp=[...new Set(cs.slice(1,-1).filter(x=>x!==o&&x!==de))].slice(0,8);
      card.querySelector('#kt-gm').href=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(de)}${wp.length?'&waypoints='+encodeURIComponent(wp.join('|')):''}`}
    const dayTxt=c=>{const d=[...c.days].sort((a,b)=>a-b);if(!d.length)return'';return d.length===1?'Day '+d[0]:(d[d.length-1]-d[0]===d.length-1?'Days '+d[0]+'–'+d[d.length-1]:'Days '+d.join(', '))};
    /* the stop list */
    const drawList=()=>{let h='';
      R.seq.forEach((n,si)=>{const ci=R.cities.findIndex(c=>c.k===N(n)),c=R.cities[ci];const isStart=si===0,isEnd=si===R.seq.length-1&&R.round;
        const firstAt=R.seq.findIndex(x=>N(x)===c.k)===si;const pls=isEnd||!firstAt?[]:R.places.filter(x=>x.ci===ci);
        const mark=isStart?'🏠':isEnd?'🏁':c.num;
        const sub=isStart?(R.round?'Start':'Start')+' · Day 1':isEnd?'Back home · Day '+R.days:dayTxt(c);
        const ok=pls.filter(x=>x.la!=null||x.how==='wiki');
        h+=`<li class="kt-stop${isStart?' start':''}${isEnd?' end':''}" style="--c:${c.col||'var(--accent)'}"><span class="kt-dot" aria-hidden="true">${mark}</span><div class="kt-sbody"><p class="kt-sname"><b>${E(n)}</b><small>${E(sub)}</small></p>${ok.length?`<ul class="kt-places">${ok.map(x=>`<li${x.la==null?' class="kt-nomap"':''}><span class="kt-L" aria-hidden="true">${x.L}</span><span class="kt-pn">${E(x.n)}</span><small>Day ${x.day}</small></li>`).join('')}</ul>`:''}</div></li>`;
        const L=R.legs[si];if(L&&si<R.seq.length-1)h+=`<li class="kt-leg kt-m-${L.mode}"><span class="kt-ico" aria-hidden="true">${L.ico}</span><span><b>${E(L.name)}</b>${L.hrs?` · ~${E(String(L.hrs))} h`:''}${L.night?' · overnight':''} <small>Day ${L.day}</small></span></li>`});
      list.innerHTML=h};
    drawList();
    /* "Directions for this day" on every day card that has places */
    const dayNav=()=>{out.querySelectorAll('.kt-nav').forEach(x=>x.remove());const cards=[...out.querySelectorAll('.card.day')];
      const byDay=new Map();R.places.forEach(x=>{if(x.la==null)return;(byDay.get(x.day)||byDay.set(x.day,[]).get(x.day)).push(x)});
      byDay.forEach((ps,d)=>{const card=cards[d-1];if(!card)return;const c=ps[0].ci!=null?R.cities[ps[0].ci]:null,cn=c?', '+c.n:'';const q=x=>encodeURIComponent(x.n+cn);
        const url=ps.length===1?`https://www.google.com/maps/dir/?api=1&destination=${q(ps[0])}`:`https://www.google.com/maps/dir/?api=1&origin=${q(ps[0])}&destination=${q(ps[ps.length-1])}${ps.length>2?'&waypoints='+ps.slice(1,-1).slice(0,8).map(q).join('%7C'):''}`;
        const a=document.createElement('a');a.className='btnlink small kt-nav';a.target='_blank';a.rel='noopener';a.href=url;a.textContent=`🧭 Directions for day ${d}: ${ps.map(x=>x.L).join(' → ')} ↗`;
        const row=card.querySelector('.row');row?row.before(a):(card.querySelector('.stayblk')?card.querySelector('.stayblk').before(a):card.appendChild(a))})};
    dayNav();
    const modes=[...new Set(R.legs.map(l=>l.mode))];
    const KEY={train:'<i class="k-rail"></i>Train',bus:'<i class="k-road"></i>Bus',road:'<i class="k-road"></i>Road',cab:'<i class="k-road"></i>Taxi / jeep',flight:'<i class="k-fly"></i>Flight',ferry:'<i class="k-sea"></i>Ferry'};
    /* place lookups that need Wikipedia */
    const wk=R.places.filter(x=>x.how==='wiki'&&x.la==null);
    const draw=()=>{if(!J0)return;const bw=Math.round(mapBox.getBoundingClientRect().width)||340;lastW=bw;
      R.cities.forEach(c=>{if(c.la!=null){[c.X,c.Y]=J0.xy(c.la,c.lo);const s=J0.stateAt(c.X,c.Y);c.st=s&&s.n}else c.X=null});
      R.places.forEach(x=>{if(x.la!=null){[x.X,x.Y]=J0.xy(x.la,x.lo)}else x.X=null});
      const inIndia=R.cities.filter(c=>c.X!=null);
      if(!inIndia.length||inIndia.some(c=>!c.st)){mapBox.classList.add('kt-none');mapBox.innerHTML='';key.innerHTML='';if(!sm.dataset.on)openStreet();return}
      mapBox.classList.remove('kt-none');
      mapBox.innerHTML=svgMap(J0,R,bw);
      const km=J0.kmPerU*(mapBox.querySelector('svg').viewBox.baseVal.width/bw);
      const nice=[25,50,100,200,250,500,1000].find(k=>k/km>=70)||1000;
      key.innerHTML=modes.map(m=>`<span>${KEY[m]||KEY.road}</span>`).join('')+`<span class="kt-scale"><i style="width:${Math.round(nice/km)}px"></i>${nice} km</span>`;
      animate()};
    let seenOnce=false;
    const animate=()=>{const svg=mapBox.querySelector('svg');if(!svg)return;
      if(reduce()||seenOnce||!('IntersectionObserver' in window)||!svg.querySelector('animateMotion')||typeof svg.querySelector('animateMotion').beginElement!=='function'){svg.classList.add('still');return}
      const io=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;io.disconnect();seenOnce=true;svg.classList.add('go');
        svg.querySelectorAll('.kt-badge').forEach((b,i)=>{b.style.opacity='0';setTimeout(()=>{if(!b.isConnected)return;b.removeAttribute('transform');b.style.opacity='';const a=b.querySelector('animateMotion');try{a.beginElement()}catch(e){b.setAttribute('transform',`translate(${b.dataset.mx} ${b.dataset.my})`)}},i*750+150)})},{threshold:.25});io.observe(svg)};
    getMap().then(J=>{J0=J;if(!card.isConnected)return;draw();
      if(window.ResizeObserver){ro&&ro.disconnect();ro=new ResizeObserver(()=>{const w=Math.round(mapBox.getBoundingClientRect().width);if(w&&Math.abs(w-lastW)>40){clearTimeout(ro.t);ro.t=setTimeout(()=>{seenOnce=true;draw()},180)}});ro.observe(mapBox)}
    }).catch(()=>{mapBox.classList.add('kt-none');mapBox.innerHTML='';openStreet()});
    if(wk.length){Promise.all(wk.map(x=>{const c=x.ci!=null?R.cities[x.ci]:null;return wiki(x.n,c?c.n:'India',c&&c.la!=null?c:null).then(g=>{if(g&&g.length){x.la=g[0];x.lo=g[1];x.how='wiki-ok'}else x.how='none'})}))
      .then(()=>{if(!card.isConnected)return;R.places=R.places.filter(x=>x.la!=null);R.places.forEach((x,i)=>x.L=letters(i));
        /* re-letter in order and redraw */
        const pl=R.places.length;card.querySelector('.kt-head .pill').textContent=`${R.days} day${R.days>1?'s':''}${pl?' · '+pl+' place'+(pl>1?'s':''):''}`;
        drawList();dayNav();seenOnce=true;draw();if(sm.dataset.on)openStreet(true)})}
    /* street map with Leaflet, on demand */
    const LCSS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',LJS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    const leaflet=()=>window.L&&window.L.map?Promise.resolve(window.L):window.__kcLeaf||(window.__kcLeaf=new Promise((res,rej)=>{
      if(!document.querySelector(`link[href="${LCSS}"]`)){const c=document.createElement('link');c.rel='stylesheet';c.href=LCSS;document.head.appendChild(c)}
      const s=document.createElement('script');s.src=LJS;s.onload=()=>res(window.L);s.onerror=()=>{window.__kcLeaf=null;rej()};document.head.appendChild(s)}));
    function openStreet(again){sm.hidden=false;sm.dataset.on='1';st.setAttribute('aria-expanded','true');st.textContent='🧭 Hide street map';
      sm.innerHTML='<p class="kc-skel kc-mapskel" aria-busy="true">Loading the street map…</p>';
      leaflet().then(L=>{if(!sm.isConnected)return;sm.innerHTML='';if(map){try{map.remove()}catch(e){}}
        map=L.map(sm,{scrollWheelZoom:false});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap'}).addTo(map);
        const acc=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#B5431C';const all=[];
        const line=R.seq.map(n=>R.cities.find(c=>c.k===N(n))).filter(c=>c&&c.la!=null).map(c=>[c.la,c.lo]);
        if(line.length>1)L.polyline(line,{color:acc,weight:4,opacity:.85,dashArray:'8 8'}).addTo(map);
        R.cities.forEach((c,i)=>{if(c.la==null)return;all.push([c.la,c.lo]);
          L.marker([c.la,c.lo],{icon:L.divIcon({className:'kc-pin kt-lpin',html:`<span style="background:${c.col||acc}">${i===0?'🏠':c.num}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(map).bindPopup(`<b>${E(c.n)}</b>`)});
        R.places.forEach(x=>{if(x.la==null)return;all.push([x.la,x.lo]);
          L.marker([x.la,x.lo],{icon:L.divIcon({className:'kc-pin kt-lpl',html:`<span>${x.L}</span>`,iconSize:[24,24],iconAnchor:[12,12]})}).addTo(map).bindPopup(`<b>${x.L} · ${E(x.n)}</b><br>Day ${x.day}`)});
        if(!all.length){sm.innerHTML='<p class="sub" style="padding:12px">We couldn’t place this trip on a map.</p>';map=null;return}
        if(all.length===1)map.setView(all[0],12);else map.fitBounds(L.latLngBounds(all).pad(.15),{maxZoom:13});
      }).catch(()=>{sm.innerHTML='<p class="sub" style="padding:12px">The street map couldn’t load. You may be offline.</p>'})}
    st.onclick=()=>{if(sm.dataset.on){sm.hidden=true;delete sm.dataset.on;st.setAttribute('aria-expanded','false');st.textContent='🧭 Street map';if(map){try{map.remove()}catch(e){}map=null}return}openStreet()};
  }
  const sigOf=()=>{const p=window.bgCurrentPlan&&bgCurrentPlan();return p&&p.days?JSON.stringify(p.days.map(d=>[d.city,(d.items||[]).map(i=>i.what)])):''};
  new MutationObserver(()=>{if(out.querySelector('#kc-troute'))return;const s=sigOf();if(!s)return;lastSig=s;build()}).observe(out,{childList:true});
  if(!out.querySelector('#kc-troute'))build();
  window.kcRouteMap={read:p=>read(p),map:getMap};
})();
