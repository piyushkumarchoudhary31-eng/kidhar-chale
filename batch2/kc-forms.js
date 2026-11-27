/* ===== FORMS: feedback, real-cost reports, partner links (switched on from assets/config.js) ===== */
(()=>{
  const C=window.KC_CONFIG||{},API=(C.api||'').trim(),AFF=C.aff||{};
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
  /* --- partner links: add our partner ID to Booking.com and Agoda links --- */
  if(AFF.booking||AFF.agoda){
    document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;try{const u=new URL(a.href);
      if(AFF.booking&&/(^|\.)booking\.com$/.test(u.hostname)&&!u.searchParams.has('aid')){u.searchParams.set('aid',AFF.booking);a.href=u.toString()}
      if(AFF.agoda&&/(^|\.)agoda\.com$/.test(u.hostname)&&!u.searchParams.has('cid')){u.searchParams.set('cid',AFF.agoda);a.href=u.toString()}}catch(_){}},true);
    ['#v-go','#v-stay'].forEach(id=>{const v=$(id);if(v&&!v.querySelector('.kc-aff'))v.insertAdjacentHTML('beforeend','<p class="kc-aff sub">Some hotel links are partner links. If you book, we may earn a small fee. You pay the same price, and it keeps Kidhar Chale free.</p>')});
  }
  if(!API)return; /* forms stay hidden until the backend address is set */
  const post=async(kind,data)=>{const r=await fetch(API,{method:'POST',body:JSON.stringify(Object.assign({kind},data))});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||'failed');return j};
  /* --- a simple sheet that slides up --- */
  function sheet(title,body,onSubmit){const old=$('.kc-sheet');if(old)old.remove();
    const w=document.createElement('div');w.className='kc-sheet';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label',title);
    w.innerHTML=`<div class="kc-sheet-in"><div class="kc-sheet-h"><h2>${esc(title)}</h2><button type="button" class="kc-x" aria-label="Close">✕</button></div><form novalidate>${body}<input type="text" name="website" class="kc-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="primary" type="submit">Send</button><p class="kc-msg" role="status"></p></form></div>`;
    document.body.appendChild(w);const t0=Date.now(),f=w.querySelector('form'),msg=w.querySelector('.kc-msg'),close=()=>{w.classList.add('kc-out');setTimeout(()=>w.remove(),220)};
    w.querySelector('.kc-x').onclick=close;w.addEventListener('click',e=>{if(e.target===w)close()});document.addEventListener('keydown',function k(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',k)}});
    setTimeout(()=>{const i=f.querySelector('input:not(.kc-hp),textarea,select');if(i)i.focus()},250);
    f.onsubmit=async e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(f).entries());
      if(fd.website)return close(); /* filled by bots only */
      if(Date.now()-t0<3000){msg.textContent='Take a second to check it, then send.';return}
      let last=0;try{last=+localStorage.getItem('bg_lastsend')||0}catch(_){}if(Date.now()-last<45000){msg.textContent='Please wait a moment before sending again.';return}
      const err=onSubmit.check(fd);if(err){msg.textContent=err;return}
      const b=f.querySelector('button[type=submit]');b.disabled=true;b.textContent='Sending…';msg.textContent='';
      try{await post(onSubmit.kind,Object.assign(onSubmit.extra(fd),{ms:Date.now()-t0}));try{localStorage.setItem('bg_lastsend',Date.now())}catch(_){}
        f.innerHTML=`<p class="kc-done">✅ ${esc(onSubmit.thanks)}</p><button type="button" class="primary">Close</button>`;f.querySelector('button').onclick=close;if(window.kcTrack)kcTrack(onSubmit.kind+'_sent')}
      catch(_){b.disabled=false;b.textContent='Send';msg.textContent='Could not send. Check your internet and try again.'}}}
  /* --- feedback --- */
  window.kcFeedback=(place)=>sheet('Tell us what to fix',`
    <label>What is it about?<select name="type"><option>A price or timing is wrong</option><option>Add a place</option><option>Something is broken</option><option>An idea</option><option>Other</option></select></label>
    <label>Your message<textarea name="msg" rows="4" maxlength="1500" required placeholder="${place?'About '+esc(place)+': ':''}What should we change?"></textarea></label>
    <label>Email or Instagram (optional, only if you want a reply)<input name="contact" maxlength="120" autocomplete="email"></label>`,
    {kind:'feedback',thanks:'Thanks! We read every message.',check:d=>(d.msg||'').trim().length<8?'Write a little more so we can understand.':'',extra:d=>({type:d.type,msg:(place?'['+place+'] ':'')+d.msg.trim(),contact:(d.contact||'').trim(),page:location.pathname+location.hash})});
  /* --- what I really spent --- */
  window.kcReport=(place)=>sheet('What did your trip really cost?',`
    <label>Place<input name="place" maxlength="80" required value="${esc(place||'')}" placeholder="e.g. Kasol"></label>
    <div class="kc-two"><label>Started from<input name="from" maxlength="60" placeholder="e.g. Delhi"></label><label>Month<select name="month">${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i)=>`<option value="${i+1}"${i===new Date().getMonth()?' selected':''}>${m}</option>`).join('')}</select></label></div>
    <div class="kc-two"><label>Days<input name="days" type="number" inputmode="numeric" min="1" max="60" required value="3"></label><label>People in your group<input name="people" type="number" inputmode="numeric" min="1" max="30" value="1"></label></div>
    <label>Total spent per person, all in (₹)<input name="total" type="number" inputmode="numeric" min="100" max="500000" required placeholder="e.g. 4500"></label>
    <details><summary>Split it up (optional)</summary><div class="kc-two"><label>Travel (₹)<input name="travel" type="number" inputmode="numeric" min="0"></label><label>Stay (₹)<input name="stay" type="number" inputmode="numeric" min="0"></label></div><label>Food (₹)<input name="food" type="number" inputmode="numeric" min="0"></label></details>
    <label>One tip for others (optional)<textarea name="tip" rows="2" maxlength="300" placeholder="e.g. Take the 6 am HRTC bus, it is half the price of a cab"></textarea></label>
    <p class="sub">We show averages only, never names. Prices help other students plan.</p>`,
    {kind:'report',thanks:'Thanks! Your costs will help other travellers plan.',check:d=>{const dy=+d.days,t=+d.total;if(!(d.place||'').trim())return'Add the place.';if(!(dy>=1&&dy<=60))return'Days should be between 1 and 60.';if(!(t>=100&&t<=500000))return'Add your total in rupees.';if(t/dy>50000)return'That looks too high per day. Please check the total.';return''},
     extra:d=>({place:d.place.trim(),from:(d.from||'').trim(),month:+d.month,days:+d.days,people:+d.people||1,total:+d.total,travel:+d.travel||0,stay:+d.stay||0,food:+d.food||0,tip:(d.tip||'').trim()})});
  /* --- averages from real trips, shown on place cards --- */
  let stats=null;
  const loadStats=()=>{try{const c=JSON.parse(localStorage.getItem('bg_stats')||'null');if(c&&Date.now()-c.t<3600e3)return Promise.resolve(c.d)}catch(_){}
    return fetch(API+'?action=stats').then(r=>r.json()).then(d=>{try{localStorage.setItem('bg_stats',JSON.stringify({t:Date.now(),d}))}catch(_){}return d}).catch(()=>({}))};
  const badge=(art)=>{if(!stats||art.querySelector('.kc-real'))return;const h=art.querySelector('h3');const s=h&&stats[h.textContent.trim()];
    const row=art.querySelector('.kc-guide');const html=s?`<p class="kc-real">👥 ${s.n} traveller${s.n>1?'s':''} spent about <b>${inr(s.perDay)} a day</b> (avg ${s.days} days)</p>`:'';
    const btn=`<button type="button" class="small ghost kc-rep" data-rep="${esc(h?h.textContent.trim():'')}">✍️ I went here: share what I spent</button>`;
    (row||art.lastElementChild).insertAdjacentHTML('afterend',html+btn)};
  const xl=$('#x-list');
  loadStats().then(d=>{stats=d||{};if(xl){xl.querySelectorAll('article').forEach(badge);new MutationObserver(()=>xl.querySelectorAll('article').forEach(badge)).observe(xl,{childList:true})}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-rep]');if(b)kcReport(b.dataset.rep)});
  /* --- entry points: footer, plan, links from guide pages --- */
  const foot=$('footer.foot .kc-legal');if(foot)foot.insertAdjacentHTML('beforeend',' · <button type="button" class="kc-fb">Feedback</button>');
  document.addEventListener('click',e=>{if(e.target.closest('.kc-fb'))kcFeedback()});
  const out=$('#p-out');if(out)new MutationObserver(()=>{const sh=out.querySelector('.kc-share');if(sh&&!sh.querySelector('.kc-rep2')){sh.insertAdjacentHTML('beforeend','<p class="sub kc-rep2">Back from this trip? <button type="button" class="small ghost" data-rep="">✍️ Share what you really spent</button></p>');const p=window.bgCurrentPlan&&bgCurrentPlan();const b=sh.querySelector('.kc-rep2 [data-rep]');if(p&&b){const cs=String(p.title||'').split(/\s*→\s*/);b.dataset.rep=cs[1]||cs[0]||''}}}).observe(out,{childList:true});
  const q=new URLSearchParams(location.search);
  if(q.get('report')!==null){kcReport(q.get('report'));history.replaceState(null,'',location.pathname+location.hash)}
  if(q.get('feedback')!==null){kcFeedback(q.get('feedback'));history.replaceState(null,'',location.pathname+location.hash)}
})();
