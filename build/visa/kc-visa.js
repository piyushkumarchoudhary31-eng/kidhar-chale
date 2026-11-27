/* ===== VISA GUIDE for Indian passports (ordinary passport, tourism). Checked Nov 2026 from the Henley Passport Index news lists and embassy pages; rules change often. ===== */
(()=>{
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  /* N no visa at all · F visa-free · A on arrival · E apply online first (e-visa / ETA) · V visa from the embassy or VFS */
  const V={
   NP:['N','No visa or passport needed: Voter ID or passport works.'],BT:['N','No visa, but you need an entry permit at the border and pay a daily fee (SDF) of ₹1,200 a night.'],
   LK:['E','Apply for the ETA online before you fly.'],BD:['V','Visa needed from the Bangladesh mission.'],MV:['A','Free 30-day visa on arrival with a hotel booking and return ticket.'],
   TH:['F','For a short stay. Check the current number of days before you go.'],VN:['E','e-Visa online, usually ready in 3–5 working days.'],KH:['A','Visa on arrival or e-Visa online.'],
   LAO:['A','Visa on arrival at main borders, or e-Visa online.'],MY:['F','Stay up to 30 days.'],SG:['V','Visa needed, applied through an authorised agent.'],
   ID:['A','Visa on arrival (e-VOA online too).'],PH:['F','Stay up to 14 days.'],JP:['E','Apply for the eVISA online.'],KR:['V','Visa needed from the Korean embassy.'],
   HK:['E','Free online Pre-arrival Registration before you fly.'],TW:['E','e-Visa online.'],CN:['V','Visa needed from the Chinese visa centre.'],MNG:['A','Visa on arrival or e-Visa online.'],
   AE:['V','Visa needed, usually applied online through an airline or agent. Visa on arrival if you hold a valid US visa or UK/EU residence.'],
   OM:['E','e-Visa online.'],JO:['A','Visa on arrival; the Jordan Pass includes the visa fee.'],TUR:['V','Visa needed. e-Visa only if you hold a valid US, UK or Schengen visa.'],
   GE:['E','e-Visa online. Visa-free if you hold a valid US, UK or Schengen visa.'],AM:['E','e-Visa online.'],AZ:['E','ASAN e-Visa online, ready in about 3 days.'],
   UZ:['E','e-Visa online.'],KG:['E','e-Visa online.'],KZ:['F','Stay up to 14 days.'],TJ:['E','e-Visa online. The Pamir Highway needs an extra GBAO permit (tick it on the form).'],
   SCHENGEN:['V','Schengen visa needed (covers most of Europe). Apply through VFS or BLS 2–3 months ahead.'],
   GB:['V','UK visa needed. Apply online, then give fingerprints at VFS.'],IE:['V','Irish visa needed. A UK visa does not cover Ireland unless you use the British-Irish visa scheme.'],
   BA:['V','Visa needed; entry allowed with a valid multi-entry US, UK or Schengen visa.'],ME:['V','Visa needed; entry allowed with a valid US, UK or Schengen visa.'],AL:['V','Visa needed; entry allowed with a valid multi-entry US, UK or Schengen visa.'],
   EG:['E','e-Visa online, or on arrival if you hold a valid US, UK or Schengen visa.'],MA:['E','e-Visa online.'],KE:['E','Apply for the ETA online before you fly.'],TZ:['A','Visa on arrival or e-Visa online.'],
   UG:['E','e-Visa online. Yellow fever card needed.'],ZA:['V','Visa needed, through VFS.'],NA:['E','Visa on arrival or e-Visa: check before you go.'],ZW:['A','Visa on arrival.'],MG:['A','Visa on arrival or e-Visa online.'],
   MU:['F','For tourist stays; carry a return ticket and hotel booking.'],ET:['E','e-Visa online.'],BW:['E','e-Visa online.'],TUN:['V','Visa needed from the Tunisian embassy.'],
   PE:['V','Visa needed, unless you hold a valid US, UK, Canada or Schengen visa.'],BO:['E','e-Visa online.'],CL:['V','Visa needed from the Chilean consulate.'],ARG:['V','Visa needed. An online AVE is possible if you hold a valid US or Schengen visa.'],
   BRA:['V','Visa needed, through VFS.'],CO:['V','Visa needed, unless you hold a valid US or Schengen visa.'],EC:['V','Check visa rules before booking: they changed recently.'],MX:['V','Visa needed, unless you hold a valid US, UK, Canada or Schengen visa.'],
   GT:['V','Visa needed, unless you hold a valid US, Canada or Schengen visa.'],CU:['E','Tourist card or e-Visa needed before you fly.'],CR:['V','Visa needed, unless you hold a valid US, Canada or Schengen visa.'],
   US:['V','US visa needed. Interview waits can be long: apply months ahead.'],CA:['V','Visa needed, apply online and give fingerprints at VFS.'],AU:['E','Visitor visa (subclass 600) applied online.'],NZ:['E','Visitor visa applied online.'],FJ:['F','For tourist stays; carry a return ticket.']};
  ['PT','ES','FR','IT','GR','SUI','AT','DE','NED','BE','CZ','HU','PL','CRO','SI','BG','RO','IS','NO','FI','EE'].forEach(c=>V[c]=V.SCHENGEN);
  const CAT={N:['🟢','No visa'],F:['🟢','Visa-free'],A:['🟡','Visa on arrival'],E:['🟠','Apply online first'],V:['🔴','Visa needed']};
  const names={};try{Object.entries(window.bgST||{}).forEach(([c,v])=>{if(Array.isArray(v)&&/^X/.test(v[1]||''))names[c]=v[0]})}catch(_){}
  const wv=n=>'https://en.wikivoyage.org/wiki/'+encodeURIComponent(n.replace(/ /g,'_'))+'#Get_in';
  window.kcVisa=name=>{const code=Object.keys(names).find(c=>names[c]===name);return code&&V[code]?{code,cat:V[code][0],note:V[code][1],label:CAT[V[code][0]]}:null};
  /* badge on every place card abroad */
  const xl=$('#x-list');
  const badge=art=>{if(art.querySelector('.kc-visa'))return;const n=((art.querySelector('.dayhead > .sub')||{}).textContent||'').trim();
    const v=n&&kcVisa(n);if(!v)return;const p=document.createElement('p');p.className='kc-visa';p.innerHTML=`${v.label[0]} <b>${esc(v.label[1])}</b> for Indian passports · <a href="${esc(wv(n))}" target="_blank" rel="noopener">entry rules</a>`;
    const fg=art.querySelector('.kc-guide');fg?fg.before(p):art.appendChild(p)};
  if(xl){const run=()=>xl.querySelectorAll('article').forEach(badge);run();new MutationObserver(run).observe(xl,{childList:true})}
  /* the guide itself, as a drawer in Tools */
  const fun=$('#v-fun');if(!fun)return;
  const card=document.createElement('div');card.className='card kc-fold kc-visa-card';card.id='f-visa';
  const rows=Object.keys(names).filter(c=>V[c]).map(c=>[names[c],V[c]]).sort((a,b)=>'NFAEV'.indexOf(a[1][0])-'NFAEV'.indexOf(b[1][0])||a[0].localeCompare(b[0]));
  card.innerHTML=`<h3 role="button" tabindex="0" aria-expanded="false">🛂 Visa guide for Indian passports</h3>
   <p class="sub">For a normal Indian passport and a tourist trip. Checked November 2026. Rules change often, so always confirm on the country’s official site or embassy before you book.</p>
   <label>Find a country<input id="kc-vq" placeholder="e.g. Thailand" autocomplete="off"></label>
   <p class="kc-vkey">${Object.entries(CAT).filter(([k])=>k!=='N').map(([k,v])=>`${v[0]} ${esc(v[1])}`).join(' · ')}</p>
   <div class="kc-vlist">${rows.map(([n,v])=>`<div class="kc-vrow" data-n="${esc(n.toLowerCase())}"><span class="kc-vc">${CAT[v[0]][0]}</span><div><b>${esc(n)}</b> <small>${esc(CAT[v[0]][1])}</small><p>${esc(v[1])} <a href="${esc(wv(n))}" target="_blank" rel="noopener">Entry rules ↗</a></p></div></div>`).join('')}</div>
   <p class="note">Most countries need a passport valid for at least 6 months after your trip, a return ticket and proof of money. A valid US, UK or Schengen visa opens extra doors in many countries (see the notes).</p>`;
  const tools=fun.querySelector('.kc-guides')||fun.querySelector('#f-pack');(tools&&tools.nextElementSibling)?tools.after(card):fun.appendChild(card);
  const h=card.querySelector('h3');const t=()=>{card.classList.toggle('kc-open');h.setAttribute('aria-expanded',card.classList.contains('kc-open'))};h.addEventListener('click',t);h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}});
  card.querySelector('#kc-vq').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();card.querySelectorAll('.kc-vrow').forEach(r=>r.hidden=!!q&&!r.dataset.n.includes(q))});
  const jump=fun.querySelector('nav.jump');if(jump&&!jump.querySelector('a[href="#f-visa"]'))jump.insertAdjacentHTML('beforeend','<a href="#f-visa">🛂 Visa</a>');
  /* the planner: a trip abroad gets the visa line in its tips card */
  const out=$('#p-out');if(out)new MutationObserver(()=>{if(out.querySelector('.kc-visa-tip'))return;const p=window.bgCurrentPlan&&bgCurrentPlan();if(!p||!p.days)return;
    const cs=[...new Set(p.days.flatMap(d=>String(d.city||'').split(/\s*(?:→|->)\s*/)).map(x=>x.trim()))];
    const found=[];cs.forEach(c=>{const pi=window.bgPlaceInfo?bgPlaceInfo(c):null;if(pi&&/^X/.test(pi.reg||'')&&pi.state){const v=kcVisa(pi.state);if(v&&!found.some(f=>f.n===pi.state))found.push({n:pi.state,v})}});
    if(!found.length)return;const card=document.createElement('div');card.className='card kc-visa-tip';
    card.innerHTML='<h3>🛂 Visa for this trip</h3>'+found.map(f=>`<p>${f.v.label[0]} <b>${esc(f.n)}: ${esc(f.v.label[1])}.</b> ${esc(f.v.note)} <a href="${esc(wv(f.n))}" target="_blank" rel="noopener">Entry rules ↗</a></p>`).join('')+'<p class="sub">For Indian passports, checked Nov 2026. Confirm on the official site before booking.</p>';
    const first=out.querySelector('.card');first?first.after(card):out.appendChild(card)}).observe(out,{childList:true});
})();
