/* ---------- plan rules every itinerary must follow (AI or built-in) ----------
   1. at least 60 min (flights 120) to reach the named boarding point before any intercity departure
   2. a priced last-mile ride after every intercity arrival
   3. local rides (autos, shared jeeps, taxis to trailheads) are never ₹0
   4. a 3-point "Know before you go" block                                       */
const KC_LOCAL=/\b(local bus|city bus|shared auto|auto|autos|e-?rick\w*|rickshaw|tuk-?tuk|tempo|vikram|metro|cab|taxi|jeep|ola|uber|rapido|walk|walking|on foot|cycle|scooty|ropeway|boat)\b/i;
const KC_LONG=/\b(bus|volvo|rtc|roadways|train|express|rail|flight|fly|ferry|ship|sleeper)\b/i;
const kcMin=t=>{const m=String(t||'').match(/^(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const kcHM=m=>{m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const kcHrs=w=>{const h=String(w).match(/~?\s*(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours)\b/i);if(h)return +h[1];const m=String(w).match(/~?\s*(\d+)\s*min/i);return m?+m[1]/60:null};
function kcInIndia(n){const c=window.bgCoords&&window.bgCoords(n);return!c||(c.la>6&&c.la<37.5&&c.lo>68&&c.lo<97.6)}
/* bus stands that are outside or below the town: name them */
const KC_LAST={shimla:'ISBT Tutikandi, about 5 km below the Mall: local bus or taxi up to the Mall',nainital:'Tallital bus stand at the south end of the lake',kasol:'Bhuntar bus stand first, then the local bus up the Parvati valley',darjeeling:'shared jeeps from Siliguri/NJP stop at the Chowk Bazaar motor stand',rishikesh:'Rishikesh ISBT: shared auto or e-rickshaw on to Laxman Jhula or Tapovan','mcleod ganj':'McLeod Ganj bus stand at the main square (Delhi Volvos and Dharamshala buses stop here); most hostels are a 5–15 min walk',mcleodganj:'McLeod Ganj bus stand at the main square (Delhi Volvos and Dharamshala buses stop here); most hostels are a 5–15 min walk',mussoorie:'buses from Dehradun stop at Library Chowk or Picture Palace'};
function kcIsLong(it){if(it.kind!=='travel')return false;const w=String(it.what||'');
  if(/^(local|reach|get to|head to|go to|ride to|auto|shared auto|e-?rick|walk|from .* (bus stand|station|isbt|airport)|arrive|drop point|change at)/i.test(w))return false;
  if(/\b(local bus|city bus|metro|ropeway)\b/i.test(w)&&!/→|->/.test(w))return false;
  const hrs=kcHrs(w);return(/→|->/.test(w)||/\bto\b/i.test(w))&&(KC_LONG.test(w)||(hrs!=null&&hrs>=1.5))}
function kcEnds(w,dayCity){const m=String(w).replace(/\s*\(.*?\)/g,'').match(/([A-Z][\w .'-]*?)\s*(?:→|->)\s*([A-Z][\w .'-]*)/);
  if(m)return[m[1].replace(/^.*\b(?:from|bus|train|express|flight|volvo|ferry)\s+/i,'').trim(),m[2].trim()];
  const t=String(w).match(/\bto\s+([A-Z][\w .'-]*)/);const parts=String(dayCity||'').split(/\s*(?:→|->)\s*/);return[parts[0]||'',t?t[1].trim():(parts[1]||'')]}
function kcPoint(w,city,end,other){const mode=/flight|fly|airport/i.test(w)?'air':/train|express|rail/i.test(w)?'train':/ferry|ship|boat/i.test(w)?'sea':'bus';
  if(!end){const f=String(w).match(/\bfrom\s+([A-Z][^,(→]+?)(?=\s+to\b|\s*\(|,|\s*→|$)/);if(f&&!/^[A-Z][a-z]+$/.test(f[1].trim())||f&&/isbt|stand|station|junction|airport|jetty|depot|chowk|gate/i.test(f[1]))return f[1].trim()}
  const k=String(city).trim().toLowerCase();
  if(mode==='bus'&&/^(new )?delhi$/.test(k))return kcDelhiISBT(other);
  if(mode==='train'&&KC_STN[k])return KC_STN[k];
  if(mode==='bus'&&KC_BUS[k])return KC_BUS[k];
  return city+(mode==='air'?' airport':mode==='train'?' railway station (check the station on your ticket)':mode==='sea'?' jetty':' bus stand')}
const KC_STN={mumbai:'your Mumbai station: CSMT, Dadar, LTT, Mumbai Central or Bandra Terminus (check your ticket)',goa:'your Goa station: Madgaon (Margao) for South Goa, Thivim for North Goa, Karmali for Panaji and Old Goa (check your ticket)',delhi:'your Delhi station: New Delhi, Old Delhi, Hazrat Nizamuddin, Anand Vihar or Delhi Sarai Rohilla (check your ticket)','new delhi':'your Delhi station: New Delhi, Old Delhi, Hazrat Nizamuddin, Anand Vihar or Delhi Sarai Rohilla (check your ticket)',bengaluru:'your Bengaluru station: KSR Bengaluru, Yesvantpur or SMVT Bengaluru (check your ticket)',bangalore:'your Bengaluru station: KSR Bengaluru, Yesvantpur or SMVT Bengaluru (check your ticket)',chennai:'Chennai Central or Chennai Egmore (check your ticket)',kolkata:'Howrah, Sealdah or Kolkata station (check your ticket)',hyderabad:'Secunderabad, Hyderabad (Nampally) or Kacheguda (check your ticket)',agra:'Agra Cantt or Agra Fort station (check your ticket)',varanasi:'Varanasi Junction or Banaras station (check your ticket)',lucknow:'Lucknow Charbagh or Lucknow Junction (check your ticket)',ahmedabad:'Ahmedabad Junction (Kalupur) or Sabarmati (check your ticket)',jodhpur:'Jodhpur Junction (or Bhagat ki Kothi for some trains; check your ticket)',jaipur:'Jaipur Junction',udaipur:'Udaipur City station',pune:'Pune Junction',amritsar:'Amritsar Junction'};
const KC_BUS={mumbai:'your Mumbai bus point: MSRTC from Mumbai Central; private buses from Dadar, Sion or Borivali (check your ticket)',shimla:'ISBT Tutikandi (long-distance buses; about 5 km below the Mall, so take a local bus or taxi down)',manali:'Manali bus stand near the Mall (HRTC); some private Volvos board nearby, so check your ticket',jaipur:'Sindhi Camp bus stand',jodhpur:'Raika Bagh (Paota) bus stand',chandigarh:'ISBT Sector 43 or Sector 17 (check your ticket)',dehradun:'Dehradun ISBT',rishikesh:'Rishikesh ISBT',bengaluru:'Majestic (Kempegowda) bus station; private buses from Anand Rao Circle or Madiwala (check your ticket)',bangalore:'Majestic (Kempegowda) bus station; private buses from Anand Rao Circle or Madiwala (check your ticket)',goa:'Panaji Kadamba bus stand (or Margao and Mapusa stands; check your ticket)',pune:'Swargate or Shivajinagar bus stand (check your ticket)',hyderabad:'MGBS (Imlibun) or JBS (check your ticket)',chennai:'CMBT Koyambedu or Kilambakkam (KCBT) (check your ticket)',udaipur:'Udaiapole bus stand',amritsar:'Amritsar ISBT',dharamshala:'Dharamshala bus stand (lower Dharamshala)'};
function kcDelhiISBT(other){const o=String(other||'').toLowerCase();const P=(window.bgPlaces||[]).find(x=>x.n.toLowerCase()===o);const st=(P&&P.state)||'';
  if(/nainital|almora|ranikhet|kausani|haldwani|mukteshwar|pithoragarh|bhimtal|kathgodam|jim corbett|ramnagar/.test(o)||/Uttar Pradesh/.test(st))return 'Anand Vihar ISBT';
  if(/Himachal|Punjab|Jammu|Kashmir|Ladakh|Chandigarh|Haryana|Uttarakhand/.test(st)||/shimla|manali|dharamshala|mcleod|amritsar|chandigarh|dehradun|rishikesh|haridwar|mussoorie|jammu|katra|srinagar/.test(o))return 'Kashmere Gate ISBT';
  if(/Rajasthan/.test(st)||/jaipur|jodhpur|udaipur|ajmer|pushkar|bikaner|jaisalmer/.test(o))return 'Sarai Kale Khan ISBT (or Bikaner House for RSRTC Volvos)';
  return 'your Delhi ISBT: Kashmere Gate, Anand Vihar or Sarai Kale Khan (check your ticket)'}
const KC_RV=4;
const kcN=s=>String(s||'').toLowerCase().replace(/[^a-z]/g,'');
const kcN2=s=>' '+String(s||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim()+' ';
function kcFee(f){f=String(f||'');if(/^(free|street food|snacks|fixed official)/i.test(f))return 0;
  const on=f.match(/Indian ₹([\d,]+)\s*\(₹([\d,]+) online\)/);if(on)return +on[2].replace(/,/g,'');
  const m=f.match(/(?:Indian|Adults)\s*₹([\d,]+)/);if(m)return +m[1].replace(/,/g,'');
  if(/small (asi )?(fee|entry)|asi (fee|ticket)|small entry fee/i.test(f))return 40;if(/entry fee charged|small ticket/i.test(f))return 100;return 0}
function kcEnforce(p){let lastArr=null;
  if(!p||!Array.isArray(p.days))return p;
  const home=String((p.days[0]||{}).city||'').split(/\s*(?:→|->)\s*/)[0];const india=kcInIndia(home);
  const ride=india?{w:'auto or shared auto',c:80}:{w:'metro, bus or taxi',c:350};
  /* hill towns have no autos on the Mall roads; Goa's stations are far from the beaches */
  const rideAt=c=>{const n=String(c||'').trim().toLowerCase();if(!india)return ride;if(n==='goa')return{w:'local bus, or a taxi if you have bags',c:200};
    const P=(window.bgPlaces||[]).find(x=>x.n.toLowerCase()===n);if(/^(shimla|mussoorie|nainital|darjeeling|mcleod ?ganj|manali|gangtok|kasauli|dalhousie|ooty|munnar|kodaikanal|shillong|mount abu)$/.test(n)||(P&&(P.tags||[]).includes('m')))return{w:'local bus or taxi',c:100};return ride};
  p.days.forEach((d,di)=>{const its=d.items=(Array.isArray(d.items)?d.items:[]);
    for(let i=0;i<its.length;i++){const it=its[i];
      /* 3. no free rides */
      if(it.kind==='travel'&&!(+it.cost)&&KC_LOCAL.test(it.what)&&!/\b(walk|walking|on foot)\b/i.test(it.what)){it.cost=/taxi|cab|jeep/i.test(it.what)?(india?150:500):/local bus|city bus/i.test(it.what)?(india?30:150):ride.c}
      if(it.kind==='sight'&&/\b(trailhead|trail head|trek start|base camp|base village|start of the trek)\b/i.test(it.what)&&!(i>0&&its[i-1].kind==='travel')){
        const t=kcMin(it.time);const at=String(it.what).match(/(?:from|at|to)\s+([A-Z][\w ]+?)\s+(?:temple\s+)?(?:trailhead|trail head|base)/);
        its.splice(i,0,{time:t!=null?kcHM(t-30):it.time,what:`Shared taxi or auto to ${at?at[1].trim()+' ':'the '}trailhead (not a walk; split the fare)`,cost:india?150:500,kind:'travel'});i++;continue}
      if(!kcIsLong(it))continue;
      const t=kcMin(it.time);if(t==null)continue;
      const lead=/flight|fly|airport/i.test(it.what)?120:60;
      const [A,B]=kcEnds(it.what,d.city);const board=kcPoint(it.what,A||'the',false,B);const air=lead===120;
      const dep=di*1440+t;const tr=lastArr&&kcN(lastArr.city)===kcN(A)&&dep-lastArr.abs>=0&&dep-lastArr.abs<=240?dep-lastArr.abs:null;
      const hrs0=kcHrs(it.what);lastArr=B&&hrs0!=null?{city:B,abs:dep+hrs0*60}:null;
      /* 1. buffer before departure */
      let has=-1;for(let j=i-1;j>=0;j--){const w=String(its[j].what||'');if(its[j].kind==='travel'&&!/^(arrive|change at|drop point)/i.test(w)&&/\b(reach|get to|head to|go to|ride to|auto to|cab to|taxi to|be at)\b/i.test(w)){has=j;break}if(/^change at/i.test(w)){has=j;break}if(kcIsLong(its[j]))break}
      if(has>=0&&/^change at/i.test(its[has].what)){}
      else if(has>=0){const tj=kcMin(its[has].time);if(tj!=null&&tj>t-lead)its[has].time=kcHM(t-lead);if(!(+its[has].cost)&&!/\bwalk/i.test(its[has].what))its[has].cost=ride.c}
      else{
        /* an evening show right before you must leave is dropped (it would run into the buffer) */
        for(let j=i-1;j>=0;j--){const tj=kcMin(its[j].time);if(tj!=null&&its[j].kind==='sight'&&/^Evening:/.test(its[j].what)&&tj>t-lead-75&&tj<=t){its.splice(j,1);i--}}
        if(tr==null)for(let j=0;j<i;j++){const tj=kcMin(its[j].time);if(tj!=null&&tj>t-lead-30&&tj<=t&&its[j].kind!=='travel')its[j].time=kcHM(Math.max(0,t-lead-45))}
        if(tr!=null)its.splice(i,0,{time:kcHM(Math.max(0,t-Math.min(lead,tr))),what:tr<lead?`Change at ${board}: only ${Math.round(tr)} min after you arrive, so if you are late take the next ${air?'flight':'one'} (ask at the counter)`:`Change at ${board}: find your ${air?'flight check-in':'bus or platform'} (you have ${Math.round(tr/60*10)/10} h)`,cost:0,kind:'travel'});
        else its.splice(i,0,{time:kcHM(Math.max(0,t-lead)),what:`Reach ${board}. Go by ${air?'cab or airport bus':rideAt(A).w} and be there at least ${air?'2 hours':'1 hour'} before departure`,cost:air?(india?300:600):rideAt(A).c,kind:'travel'});i++}
      /* 2. last mile after arrival */
      const hrs=kcHrs(it.what);if(!B)continue;
      /* a change of bus/train in the same town soon after: no ride into town */
      {const arrA=hrs!=null?dep+hrs*60:null;let nl=null,ndi=di,nii=i+1;for(let dd=di;dd<p.days.length&&!nl;dd++){const L=(p.days[dd]||{}).items||[];for(let q=dd===di?i+1:0;q<L.length;q++)if(kcIsLong(L[q])){nl=L[q];ndi=dd;break}}
       if(nl&&arrA!=null){const nt=kcMin(nl.time),[nA]=kcEnds(nl.what,p.days[ndi].city);if(nt!=null){const gap=ndi*1440+nt-arrA;if(gap>=0&&gap<=240&&(!nA||kcN(nA)===kcN(B)))continue}}}
      const arr=hrs!=null?t+hrs*60:null;const nextDay=arr!=null?arr>=1440:i===its.length-1;
      const list=nextDay?((p.days[di+1]||{}).items):its;const k=nextDay?0:i+1;if(!Array.isArray(list))continue;
      const nx=list[k];const nxw=String(nx&&nx.what||'');
      if(nx&&nx.kind==='travel'&&(KC_LOCAL.test(nxw)||/\b(reach|to your stay|into town)\b/i.test(nxw)))continue;
      if(nx&&kcIsLong(nx))continue;
      const homeBack=kcN(B)===kcN(home);
      const tip=homeBack?null:KC_LAST[String(B).toLowerCase().trim()];
      const rideB=rideAt(B);
      const pt=kcPoint(it.what,B,true,A);
      let at=arr!=null?kcHM(arr):(nx?nx.time:it.time);if(nx&&kcMin(nx.time)!=null&&arr!=null&&kcMin(nx.time)<arr%1440)at=nx.time;
      /* goes after an "Arrive …" line, a few minutes later */
      let kk=k;if(nx&&/^arrive\b/i.test(nxw)){kk=k+1;const tn=kcMin(nx.time);at=kcHM((tn!=null?tn:kcMin(at)||0)+15)}
      const nx2=list[kk];if(nx2&&nx2.kind==='travel'&&KC_LOCAL.test(String(nx2.what||'')))continue;
      list.splice(kk,0,{time:at,what:homeBack?`Drop point: ${pt}. Then ${rideB.w} home`:tip?`Drop point: ${tip}`:`Drop point: ${pt}. Then ${rideB.w} to your stay or the town centre`,cost:tip&&/min walk/i.test(tip)?0:tip&&/local bus/i.test(tip)?(india?40:150):rideB.c,kind:'travel'});
      if(!nextDay)i++}});
  /* entry fees from our sights list when a named sight is left at ₹0 */
  if(india)p.days.forEach(d=>(d.items||[]).forEach(it=>{if(it.kind!=='sight'&&it.kind!=='other')return;const w=kcN2(it.what);if(/\bfree\b/i.test(it.what)&&!/free langar/i.test(it.what))return;
    let sum=0;const seen=[];(window.bgSights||[]).forEach(x=>{const k=kcN2(x.n.replace(/\s*\(.*?\)/g,'').replace(/,\s*[A-Z][a-z]+$/,''));if(k.length>3&&w.includes(k)&&!seen.includes(k)){seen.push(k);sum+=kcFee(x.fee)}});
    if(sum>0&&(+it.cost||0)<sum){it.cost=sum;if(!/entry/i.test(it.what))it.what+=` · entry ~₹${sum} (Indian adults)`}}));
  p.know=kcKnow(p,Array.isArray(p.know)?p.know:[]);p.rv=KC_RV;
  return p}
function kcKnow(p,given){
  const out=(given||[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,3);
  const txt=p.days.map(d=>d.city+' '+(d.items||[]).map(i=>i.what).join(' ')).join(' ');const ttx=p.days.map(d=>(d.items||[]).filter(i=>i.kind==='travel').map(i=>i.what).join(' ')).join(' ');
  const cities=[...new Set(p.days.flatMap(d=>String(d.city||'').split(/\s*(?:→|->)\s*/)).map(s=>s.trim()).filter(Boolean))];
  const abroad=cities.some(c=>!kcInIndia(c))||/\bvisa|passport\b/i.test(txt);
  const PL=window.bgPlaces||[];const nn=x=>String(x||'').toLowerCase().replace(/[^a-z]/g,'');const info=cities.map(c=>PL.find(x=>nn(x.n)===nn(c))).filter(Boolean);
  const states=new Set(info.map(x=>x.state));const hills=info.some(x=>(x.tags||[]).some(t=>'mts'.includes(t)))||/\b(trek\w*|trail\w*|pass|valley|hills?|snow|ghat road)\b/i.test(txt);
  const train=/\b(train|express|rail|irctc)\b/i.test(ttx),fly=/\b(flight|fly)\b/i.test(ttx),bus=/\b(bus|volvo|rtc|roadways)\b/i.test(ttx);
  const has=re=>out.some(x=>re.test(x));
  if(!has(/\b(id|aadhaar|passport|permit|ilp|licence|license)\b/i)){
    const ilp=['Arunachal Pradesh','Nagaland','Mizoram','Manipur'].filter(s=>states.has(s));
    out.push(abroad?'Carry your passport (valid 6+ months) and a printed copy of your visa or e-visa; hostels scan it at check-in.'
      :'Carry an original photo ID (Aadhaar, PAN, voter ID, passport or licence)'+(train?': ticket checkers on reserved trains can ask for it, and every hotel and hostel needs it at check-in.':fly?': airports and every hotel or hostel check it.':': every hotel and hostel needs it at check-in, and hill checkposts sometimes ask.')+(ilp.length?` ${ilp.join(', ')} also need an Inner Line Permit (ILP); apply online a few days before.`:'')+(states.has('Sikkim')&&/north sikkim|lachung|lachen|gurudongmar|nathu ?la|tsomgo/i.test(txt)?' North Sikkim and Nathu La need permits through a registered agent.':''))}
  if(!has(/\b(upi|cash|atm|card)\b/i)){
    out.push(abroad?'Indian UPI works in only a few countries, so check your bank app first; carry some local cash and a card with low forex fees.'
      :hills?'UPI works in towns, but the network drops in the hills: carry ₹1,500–2,000 in small notes for shared jeeps, dhabas and village shops.'
      :'UPI works almost everywhere here; keep ₹500 in small notes for autos and tea stalls when the network is slow.')}
  if(!has(/\b(book|ahead|in advance|days before|tatkal|opens?)\b/i)){
    out.push(train?'Train seats open 60 days ahead on IRCTC (8:00 am); Tatkal opens the day before at 10:00 (AC) and 11:00 (sleeper) and needs an Aadhaar-linked IRCTC account and an OTP.'
      :fly?'Book flights 3–6 weeks ahead for the lowest fares, and the first night’s bed 1–2 weeks ahead in peak months.'
      :bus?'Book overnight and Volvo buses 3–7 days ahead for weekends and festivals (government buses sell seats online too), and the first night’s bed 1–2 weeks ahead in peak months.'
      :'Book the first night’s bed 1–2 weeks ahead in peak months, and transport a few days ahead on weekends.')}
  return out.slice(0,3)}
window.kcEnforce=kcEnforce;window.kcKnow=kcKnow;
