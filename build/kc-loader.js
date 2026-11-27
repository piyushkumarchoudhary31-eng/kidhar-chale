/* city colours: each place gets the colour it's known for, and its own landscape */
window.kcTheme=function(place){
  const T=[
   /* from Piyush's city colour list */
   [/jodhpur/,'#1E88E5',"Blue City",'fort'],
   [/jaipur/,'#E91E63',"Pink City",'fort'],
   [/udaipur/,'#F5F5F5',"White City",'fort'],
   [/sam\s?dunes|jaisalmer|khuri/,'#D4AF37',"Golden City / Yellow City",'dunes'],
   [/amritsar/,'#FFB300',"Golden City",'fort'],
   [/nagpur/,'#FB8C00',"Orange City",'fort'],
   [/cuttack/,'#B0BEC5',"Silver City",'fort'],
   [/thiruvananthapuram|trivandrum/,'#2E7D32',"Evergreen City of India",'waves'],
   [/gandhinagar/,'#43A047',"Green City",'fort'],
   [/mysuru|mysore/,'#388E3C',"Greenest City of India",'fort'],
   [/chandigarh/,'#66BB6A',"Green City (City Beautiful)",'fort'],
   [/asansol/,'#212121',"Land of Black Diamond",'fort'],
   [/chefchaouen/,'#29B6F6',"The Blue Pearl / Blue City",'mountains'],
   [/marrakech/,'#C62828',"The Red City / Ochre City",'fort'],
   [/bologna/,'#D84315',"La Rossa (The Red City)",'fort'],
   [/petra/,'#D88C9A',"The Rose City",'dunes'],
   [/izamal/,'#FBC02D',"The Yellow City",'fort'],
   [/seattle/,'#00897B',"The Emerald City",'fort'],
   [/nairobi/,'#4CAF50',"Green City in the Sun",'fort'],
   [/glasgow/,'#2E7D32',"Dear Green Place",'fort'],
   [/tel\s?aviv/,'#FAFAFA',"The White City",'waves'],
   [/arequipa/,'#ECEFF1',"The White City (La Ciudad Blanca)",'mountains'],
   [/helsinki/,'#FFFFFF',"White City of the North",'waves'],
   [/lisbon/,'#F9F9F9',"The White City",'waves'],
   [/salzburg/,'#F5F5F5',"White City",'mountains'],
   [/santorini|oia/,'#1565C0',"The White & Blue Island",'waves'],
   [/dubai/,'#FFD700',"The City of Gold",'dunes'],
   [/johannesburg/,'#DAA520',"The City of Gold",'fort'],
   [/prague/,'#E6A817',"The Golden City",'fort'],
   [/pretoria/,'#8E24AA',"Jacaranda City / Natural City of Purple",'fort'],
   [/athens/,'#6A1B9A',"City of the Violet Crown",'fort'],
   [/aberdeen/,'#78909C',"The Granite City / Silver City",'fort'],
   [/berlin/,'#607D8B',"The Grey City",'fort'],
   /* our own picks for places not in that list */
   [/jodhpur/,'#2F6FD6','Blue City','fort'],[/jaipur/,'#E2557F','Pink City','fort'],[/udaipur/,'#2E9DB5','City of Lakes','fort'],
   [/jaisalmer|sam dunes|khuri/,'#D99A1E','Golden City','dunes'],[/bikaner|deshnok/,'#C4502E','Red sandstone','dunes'],
   [/pushkar|ajmer/,'#E5782A','Holy lake town','fort'],[/mount abu|guru shikhar/,'#3E9B6A','Green hills','mountains'],
   [/chittor|kumbhalgarh|ranakpur|haldighati/,'#B5563A','Mewar sandstone','fort'],[/bundi/,'#3B7BD1','Blue lanes','fort'],
   [/kota|garadia/,'#1F8FA6','Chambal blue','fort'],[/nagaur|makrana|kuchaman|merta|sambhar/,'#6D7FA6','Marble country','dunes'],
   [/shekhawati|mandawa|churu|sikar|khatu|salasar/,'#C77B2E','Painted havelis','dunes'],
   [/delhi/,'#B83A2E','Red Fort red','fort'],[/agra|taj/,'#5B7DB1','Taj marble','fort'],[/amritsar|wagah/,'#D4A017','Golden Temple gold','fort'],
   [/chandigarh/,'#4E9F5E','Garden city','fort'],[/rishikesh|haridwar|neelkanth|devprayag/,'#F07F1F','Ganga saffron','mountains'],
   [/mcleod|dharamshala|dharamkot|bir|triund/,'#8B3A62','Monk-robe maroon','mountains'],
   [/manali|kasol|kullu|sissu|atal|jibhi|shimla|kasauli|mussoorie|dehradun|kausani|nainital|lansdowne|chopta/,'#2F8F5B','Pine valleys','mountains'],
   [/leh|ladakh|nubra|pangong|spiti|kaza/,'#1E9BD7','Ladakh sky','mountains'],
   [/srinagar|kashmir|gulmarg|sonamarg|pahalgam|katra|vaishno|jammu|patnitop/,'#D04A2A','Chinar red','mountains'],
   [/mathura|vrindavan|barsana/,'#1F7A8C','Peacock blue','fort'],[/varanasi|banaras|kashi|prayagraj|ayodhya/,'#F07F1F','Ghat saffron','fort'],
   [/goa|gokarna|varkala|kovalam|andaman|havelock|diu|puri/,'#12A89D','Sea green','waves'],
   [/mumbai/,'#E0A800','Kaali-peeli yellow','fort'],[/kolkata/,'#E0B400','Yellow taxi','fort'],[/pondicherry|puducherry/,'#E3A23C','French yellow','waves'],
   [/kerala|munnar|alleppey|alappuzha|wayanad|coorg/,'#2E9E4F','Tea and palm green','mountains'],[/darjeeling|gangtok|sikkim/,'#3E8E41','Tea garden green','mountains'],
   [/hampi/,'#C8743A','Boulder orange','dunes'],[/meghalaya|shillong|cherrapunji/,'#3C8D7A','Cloud forest','mountains']];
  const q=String(place||'').toLowerCase();for(const t of T)if(t[0].test(q))return{c:t[1],name:t[2],scene:t[3]};
  const P=window.bgPlaces||[];const x=P.find(p=>q&&p.n.toLowerCase()===q.trim());const tg=x?x.tags||[]:[];
  if(tg.some(t=>'ms'.includes(t)))return{c:'#2F8F5B',name:'Mountain green',scene:'mountains'};
  if(tg.includes('d'))return{c:'#D99A1E',name:'Desert gold',scene:'dunes'};
  if(tg.some(t=>'bi'.includes(t)))return{c:'#12A89D',name:'Sea green',scene:'waves'};
  if(tg.includes('p'))return{c:'#F07F1F',name:'Temple saffron',scene:'fort'};
  if(tg.includes('h'))return{c:'#B5563A',name:'Old-stone red',scene:'fort'};
  return{c:null,name:'',scene:'mountains'};
};
window.kcLoader=function(el,o){
  o=o||{};const steps=o.steps||[];const eta=o.eta||'usually 30–60 s';
  const TIPS=['Carry ₹1,000 in small notes: hill buses and dhabas often don’t take UPI.','Overnight buses and trains save you a whole night’s bed.','Your student ID gets half price at many Rajasthan forts.','Book the first night only. Extend if you love the place.','Eat where the drivers eat. Busy dhaba = fresh food.','Travel in even numbers: a scooty split two ways is half price.','Screenshot your tickets. Network dies exactly when the TTE comes.','Ask “Student discount hai?” at every ticket window.'];
  const th=window.kcTheme(o.place);
  let ui=th.c;if(ui){const h=ui.replace('#',''),n=parseInt(h.length===3?h.replace(/./g,'$&$&'):h,16),r=n>>16&255,g=n>>8&255,bl=n&255,L=(0.2126*r+0.7152*g+0.0722*bl)/255;if(L>0.82)ui='#7A8B99';else if(L<0.18)ui='#8A8F99';}const SH={mountains:'M0 60 L0 38 L40 14 L80 34 L120 6 L170 36 L210 18 L260 40 L300 10 L350 32 L400 20 L400 60Z',
   dunes:'M0 60 L0 42 Q50 16 105 38 Q150 54 200 34 Q255 12 305 36 Q350 52 400 40 L400 60Z',
   waves:'M0 60 L0 40 Q25 30 50 40 T100 40 T150 40 T200 40 T250 40 T300 40 T350 40 T400 40 L400 60Z',
   fort:'M0 60 L0 40 L28 40 L28 26 L36 26 L36 20 L44 20 L44 26 L52 26 L52 40 L84 40 L84 30 Q96 12 108 30 L108 40 L150 40 L150 22 L158 22 L158 14 L166 14 L166 22 L174 22 L174 40 L212 40 L212 32 L232 32 L232 24 Q246 6 260 24 L260 32 L280 32 L280 40 L318 40 L318 26 L326 26 L326 18 L334 18 L334 26 L342 26 L342 40 L372 40 L372 30 Q382 18 392 30 L392 40 L400 40 L400 60Z'};
  const hills=c=>`<svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="${SH[th.scene]||SH.mountains}" fill="${c}" stroke="var(--edge)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  const bus=`<svg viewBox="0 0 96 52" aria-hidden="true"><rect x="3" y="6" width="88" height="34" rx="9" fill="var(--kl,var(--accent))" stroke="var(--edge)" stroke-width="3"/><rect x="11" y="13" width="15" height="12" rx="3" fill="var(--surface)" stroke="var(--edge)" stroke-width="2"/><rect x="31" y="13" width="15" height="12" rx="3" fill="var(--surface)" stroke="var(--edge)" stroke-width="2"/><rect x="51" y="13" width="15" height="12" rx="3" fill="var(--surface)" stroke="var(--edge)" stroke-width="2"/><rect x="71" y="13" width="13" height="18" rx="3" fill="var(--surface)" stroke="var(--edge)" stroke-width="2"/><rect x="3" y="29" width="88" height="4" fill="var(--tag)"/><circle cx="24" cy="42" r="8" fill="var(--edge)"/><circle cx="24" cy="42" r="3" fill="var(--surface2)"/><circle cx="72" cy="42" r="8" fill="var(--edge)"/><circle cx="72" cy="42" r="3" fill="var(--surface2)"/></svg>`;
  el.innerHTML=`<div class="kl" role="status" aria-live="polite"${th.c?` style="--kl:${th.c};--klui:${ui}"`:''}><div class="kl-scene"><div class="kl-sun"></div><div class="kl-hills back">${hills('var(--line)')}${hills('var(--line)')}</div><div class="kl-hills">${hills('color-mix(in srgb,var(--klui,var(--pop)) 35%,var(--surface))')}${hills('color-mix(in srgb,var(--klui,var(--pop)) 35%,var(--surface))')}</div><div class="kl-road"></div><div class="kl-bus">${bus}</div></div>
  <div class="kl-body"><p class="kl-title">${o.title||'Planning your trip'}<span class="dots"></span></p>${th.name?`<p class="kl-city"><span></span>${String(o.place).split(',')[0].trim().replace(/[&<>"]/g,'')} · ${th.name}</p>`:''}
  <ul class="kl-steps">${steps.map(s=>`<li><i></i><span>${s[0]}</span></li>`).join('')}</ul>
  <div class="kl-bar" aria-hidden="true"><b></b></div>
  <div class="kl-meta"><span class="kl-t">0 s</span><span>${eta}</span></div>
  <p class="kl-tip"></p>${o.skip?`<button class="small kl-skip" type="button">${o.skip}</button>`:''}</div></div>`;
  const t0=Date.now(),li=[...el.querySelectorAll('.kl-steps li')],bar=el.querySelector('.kl-bar b'),tt=el.querySelector('.kl-t'),tip=el.querySelector('.kl-tip');
  let ti=Math.floor(Math.random()*TIPS.length);const showTip=()=>{tip.innerHTML='<b>While you wait:</b> '+TIPS[ti++%TIPS.length];tip.style.animation='none';void tip.offsetWidth;tip.style.animation=''};showTip();
  const tick=()=>{const sec=(Date.now()-t0)/1000;tt.textContent=Math.floor(sec)+' s';
    bar.style.width=Math.min(94,4+90*(1-Math.exp(-sec/(o.tau||22))))+'%';
    li.forEach((x,i)=>{const at=steps[i][1],nx=i+1<steps.length?steps[i+1][1]:1e9;x.className=sec>=nx?'ok':sec>=at?'on':'';x.querySelector('i').textContent=sec>=nx?'':''})};
  tick();const iv=setInterval(tick,500),tv=setInterval(showTip,7000);
  const sk=el.querySelector('.kl-skip');if(sk&&o.onSkip)sk.onclick=o.onSkip;
  const stop=()=>{clearInterval(iv);clearInterval(tv)};
  return{stop,done(){stop();bar.style.width='100%';li.forEach(x=>{x.className='ok';x.querySelector('i').textContent=''})}};
};
