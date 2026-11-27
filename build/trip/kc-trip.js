/* ===== TRIP EXTRAS: add the plan to your calendar, a packing list for this trip, email the plan to yourself ===== */
(()=>{
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const out=$('#p-out');if(!out)return;
  const plan=()=>window.bgCurrentPlan&&bgCurrentPlan();
  const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
  const startDate=()=>{const v=($('#p-start')||{}).value;return v?new Date(v+'T00:00'):null};
  const inr=n=>'₹'+Math.round(+n||0).toLocaleString('en-IN');

  /* ---------- 1. calendar (.ics): one all-day entry per day, plus each timed bus/train with a reminder ---------- */
  const icsEsc=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/([,;])/g,'\\$1');
  const fold=l=>{const out=[];let cur='';for(const ch of l){if(new TextEncoder().encode(cur+ch).length>74){out.push(cur);cur=' '+ch}else cur+=ch}out.push(cur);return out.join('\r\n')};
  function ics(p,d0){const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kidhar Chale//Trip planner//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+icsEsc(p.title)];
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');const uid=Math.random().toString(36).slice(2);
    p.days.forEach((d,i)=>{const day=new Date(d0);day.setDate(day.getDate()+i);const next=new Date(day);next.setDate(next.getDate()+1);
      const o=d.stay&&d.stay.options&&d.stay.options[d.stay.pick||0];
      const desc=d.items.map(it=>`${it.time?it.time+'  ':''}${it.what}${it.cost?' ('+inr(it.cost)+')':''}`).join('\n')+(d.stay&&d.stay.city?`\nSleep: ${d.stay.city}${o?' · '+(o.name||o.type+' in '+(o.area||d.stay.city))+' about '+inr(o.price):''}`:'')+'\n\nMade with Kidhar Chale?';
      L.push('BEGIN:VEVENT','UID:kc-'+uid+'-d'+i+'@kidharchale','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+ymd(day),'DTEND;VALUE=DATE:'+ymd(next),'SUMMARY:'+icsEsc(`Day ${i+1}: ${d.city}`),'DESCRIPTION:'+icsEsc(desc),'TRANSP:TRANSPARENT','END:VEVENT');
      d.items.forEach((it,k)=>{const m=/^(\d{1,2}):(\d{2})$/.exec(String(it.time||'').trim());if(!m||it.kind!=='travel')return;
        const s=new Date(day);s.setHours(+m[1],+m[2],0,0);const e=new Date(s.getTime()+60*60e3);const t=x=>ymd(x)+'T'+pad(x.getHours())+pad(x.getMinutes())+'00';
        L.push('BEGIN:VEVENT','UID:kc-'+uid+'-d'+i+'-t'+k+'@kidharchale','DTSTAMP:'+stamp,'DTSTART:'+t(s),'DTEND:'+t(e),'SUMMARY:'+icsEsc('🚌 '+it.what.slice(0,80)),'DESCRIPTION:'+icsEsc(it.what+(it.cost?' · about '+inr(it.cost):'')+'\nCheck the exact time before you leave.'),
          'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc('Leaving soon: '+it.what.slice(0,60)),'TRIGGER:-PT1H','END:VALARM','END:VEVENT')})});
    L.push('END:VCALENDAR');return L.map(fold).join('\r\n')+'\r\n'}
  function saveIcs(p,d0){const blob=new Blob([ics(p,d0)],{type:'text/calendar;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=(String(p.title).replace(/[^\w\- ]+/g,' ').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'trip')+'.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
    try{window.kcTrack&&kcTrack('add_to_calendar',{days:p.days.length})}catch(_){}}

  /* ---------- 3. email the plan to yourself (signed in only, goes to your own account email) ---------- */
  const C=window.KC_CONFIG||{},API=(C.api||'').trim();
  async function emailPlan(p,btn,msg){let acct=null;try{acct=JSON.parse(localStorage.getItem('kc_acct')||'null')}catch(_){}
    if(!acct||!acct.token){if(window.kcAccount)kcAccount.open();return}
    btn.disabled=true;const t0=btn.textContent;btn.textContent='Sending…';msg.textContent='';
    try{const r=await fetch(API,{method:'POST',body:JSON.stringify({kind:'email_plan',token:acct.token,email:acct.em||'',title:p.title,text:window.bgPlanText?bgPlanText(p):p.title}),credentials:'omit',referrerPolicy:'no-referrer'});const j=await r.json();
      if(j.ok){msg.textContent='Sent to '+(acct.email||'your email')+'. Check spam if you don’t see it.';btn.textContent='✓ Sent';try{window.kcTrack&&kcTrack('email_plan')}catch(_){}return}
      msg.textContent=j.error==='limit'?'You can email 5 plans a day. Try again tomorrow.':j.error==='email'?'Sign out and sign in again once, then try.':j.error==='signin'?'Sign in again to email your plan.':'Couldn’t send right now. Try again later.'}
    catch(_){msg.textContent='Couldn’t connect. Check your internet.'}
    btn.disabled=false;btn.textContent=t0}

  /* buttons in the share card of every plan */
  new MutationObserver(()=>{const sh=out.querySelector('.kc-share');if(!sh||sh.querySelector('.kc-cal'))return;const p=plan();if(!p||!p.days)return;
    const row=document.createElement('div');row.className='row kc-cal';row.style.gap='8px';
    row.innerHTML='<button type="button" class="kc-cal-b">📅 Add to calendar</button>'+(API?'<button type="button" class="kc-mail-b">✉️ Email me this plan</button>':'')+'<p class="sub kc-cal-msg" role="status" style="flex-basis:100%;margin:0"></p>';
    (sh.querySelector('.row')||sh).after(row);const msg=row.querySelector('.kc-cal-msg');
    row.querySelector('.kc-cal-b').onclick=()=>{const p=plan();const d0=startDate();
      if(d0){saveIcs(p,d0);msg.textContent='Opening your calendar file. On iPhone tap "Add All"; on Android open it with your calendar app.';return}
      msg.innerHTML='When does the trip start? <input type="date" class="kc-cal-d" style="max-width:180px;display:inline-block;margin-left:6px" aria-label="Trip start date"> <button type="button" class="small primary kc-cal-go">Add</button>';
      const di=msg.querySelector('.kc-cal-d'),t=new Date();t.setDate(t.getDate()+7);di.value=t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());di.focus();
      msg.querySelector('.kc-cal-go').onclick=()=>{if(!di.value)return;const ps=$('#p-start');if(ps){ps.value=di.value;ps.dispatchEvent(new Event('change',{bubbles:true}))}saveIcs(plan(),new Date(di.value+'T00:00'));msg.textContent='Opening your calendar file. On iPhone tap "Add All"; on Android open it with your calendar app.'}};
    const mb=row.querySelector('.kc-mail-b');if(mb)mb.onclick=()=>emailPlan(plan(),mb,msg);
  }).observe(out,{childList:true});

  /* ---------- 2. a packing list for this trip: from its places, month and how you travel ---------- */
  const box=$('#f-pack');if(!box)return;
  const extra=document.createElement('div');extra.className='kc-packx';const kl=$('#k-list');kl?kl.before(extra):box.appendChild(extra);
  const ALT=/^(Ladakh)$/i,ALTP=/leh|ladakh|spiti|kaza|tso|pangong|nubra|zanskar|kedarnath|hemkund|gurudongmar|tawang|sela|lahaul|kinnaur|chitkul|rohtang|chopta|tungnath|roopkund|kheerganga|hampta|sandakphu|goecha|chadar|kashmir great lakes|kunzum|chandratal|keylong|jispa|sach pass|gangotri|gaumukh|kailash|everest|annapurna/i;
  const ILP=/^(Arunachal Pradesh|Nagaland|Mizoram|Manipur)$/;
  function items(p){if(!p||!p.days)return null;
    const names=[...new Set(p.days.flatMap(d=>String(d.city||'').split(/\s*(?:→|->)\s*/)).map(x=>x.trim()).filter(x=>x&&!/^on the (bus|train)$/i.test(x)))];
    const home=names[0];const info=names.slice(1).map(n=>window.bgPlaceInfo?bgPlaceInfo(n):null).filter(x=>x&&x.known);
    const tags=new Set(info.flatMap(x=>x.tags||[])),states=new Set(info.map(x=>x.state)),abroad=info.some(x=>/^X/.test(x.reg||''));
    const d0=startDate()||new Date(),m=d0.getMonth()+1,days=p.days.length;
    const cold=tags.has('s')||(tags.has('m')&&[11,12,1,2,3].includes(m))||(tags.has('d')&&[12,1,2].includes(m))||[...states].some(s=>/Ladakh|Sikkim|Himachal|Uttarakhand|Jammu|Kashmir|Arunachal/.test(s))&&[10,11,12,1,2,3].includes(m);
    const high=states.has('Ladakh')||names.some(n=>ALTP.test(n));
    const wet=[6,7,8,9].includes(m)&&!tags.has('d')&&!states.has('Ladakh'),hot=[4,5,6].includes(m)&&!tags.has('m')&&!tags.has('s');
    const night=p.days.some(d=>/^on the (bus|train)$/i.test(String(d.stay&&d.stay.city||''))),train=p.days.some(d=>d.items.some(i=>i.kind==='travel'&&/train|express|mail|rail/i.test(i.what)));
    const L=[];const add=(t,w)=>{if(!L.some(x=>x[0]===t))L.push([t,w])};
    if(cold){add('Thermal inner layer (top + bottom)','Nights are cold here this month; thermals keep a cheap jacket warm enough.');add('Warm jacket, woollen cap and gloves','Mornings and evenings drop near or below zero in the hills in these months.');add('Cold cream and lip balm','Cold wind cracks skin within a day.')}
    if(tags.has('m')||tags.has('s')||high){add('Sunscreen SPF 50 and sunglasses','Mountain sun burns fast, even when it feels cool; snow glare hurts the eyes.')}
    if(high){add('Read the altitude tips before you go','Tools has altitude sickness advice. Above 3,000 m, rest on day one and drink a lot of water. Ask a doctor about medicines before the trip.')}
    if(tags.has('t')){add('Trekking shoes with good grip','Sports shoes slip on wet rock and mud.');add('Head torch or small torch','Trails and campsites have no lights; phone torches drain the battery.');add('Rain poncho','Mountain weather changes in an hour.')}
    if(tags.has('b')||tags.has('i')){add('Swimwear and flip-flops','For the beach; most hostels have no spare ones.');add('Dry bag for phone and wallet','Sea spray, boats and sudden showers.')}
    if(tags.has('d')){add('Cotton scarf or stole','Covers face and neck from sun and sand in the desert.');if([11,12,1,2].includes(m))add('Warm layer for desert nights','Desert nights in winter get close to freezing.')}
    if(wet){add('Rain cover for your bag + umbrella','It is monsoon in these months; a soaked bag ruins clothes and electronics.');add('Quick-dry clothes, no jeans','Jeans stay wet for days in the monsoon.')}
    if(hot){add('Cap, cotton clothes, electrolyte sachets','It is very hot this month in the plains; carry water on every bus.')}
    if(tags.has('p')){add('Clothes that cover shoulders and knees','Temples, gurudwaras and monasteries on this trip expect it.');add('Socks for temple floors','Stone floors get very hot by noon, and shoes come off.')}
    if(tags.has('f')){add('Dull-coloured clothes','Safaris ask for green, brown or khaki; bright colours scare animals away.')}
    if(night){add('Neck pillow','You sleep on a bus or train on this trip.')}
    if(train){add('Chain and lock for your bag','To lock your bag to the berth on sleeper trains.')}
    if([...states].some(s=>ILP.test(s)))add('Inner Line Permit, printed + on phone','Needed to enter '+[...states].filter(s=>ILP.test(s)).join(', ')+'. See Passes and permits.');
    if(states.has('Ladakh'))add('Ladakh permit and ID copies','Needed for Nubra, Pangong and other protected areas; checkpoints keep copies.');
    if(abroad){add('Passport (valid 6+ months) and visa','Most countries refuse entry if the passport expires within 6 months.');add('Forex card or some US dollars','Indian debit cards often fail abroad or charge high fees.');add('Universal plug adapter','Plugs differ outside India.');add('Travel insurance papers','Hospitals abroad can cost lakhs without it.')}
    if(days>=6)add('Small packet of detergent','Wash clothes in the hostel and pack half as much.');
    return{key:p.title+'|'+m,where:names.slice(1).join(', '),month:d0.toLocaleDateString('en-IN',{month:'long'}),L}}
  let ck={};try{ck=JSON.parse(localStorage.getItem('bg_packx')||'{}')}catch(_){}
  function draw(){const r=items(plan());if(!r||!r.L.length){extra.innerHTML='';return}
    if(ck.key!==r.key)ck={key:r.key,on:{}};
    extra.innerHTML=`<p class="eyebrow">For your trip: ${esc(r.where)} in ${esc(r.month)}</p><div class="kc-packx-l">${r.L.map(([t,w],i)=>`<label class="check" for="kx${i}"><input type="checkbox" id="kx${i}" ${ck.on[t]?'checked':''} data-t="${esc(t)}"><span>${esc(t)}<small>${esc(w)}</small></span></label>`).join('')}</div><p class="eyebrow" style="margin-top:6px">Every trip</p>`;
    extra.querySelectorAll('input').forEach(x=>x.onchange=()=>{ck.on[x.dataset.t]=x.checked;try{localStorage.setItem('bg_packx',JSON.stringify(ck))}catch(_){}})}
  draw();new MutationObserver(draw).observe(out,{childList:true});const ps=$('#p-start');if(ps)ps.addEventListener('change',draw);
})();
