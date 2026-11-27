/* ===== HIDDEN GEMS from travellers: signed-in people suggest, the owner approves in the Sheet ===== */
(()=>{
  const C=window.KC_CONFIG||{},API=(C.api||'').trim();if(!API)return;
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ex=$('#v-explore');if(!ex)return;
  const card=document.createElement('div');card.className='card kc-gems';card.id='kc-gems';
  card.innerHTML='<h2>💎 Hidden gems from travellers</h2><p class="sub">Places real travellers loved that most people skip. Checked by us before they show up here.</p><div class="kc-gem-list"><p class="sub">Loading…</p></div><button type="button" class="ghost" data-gem>➕ Suggest a hidden gem</button>';
  const f=$('#kc-finder');f?f.after(card):ex.prepend(card);
  const list=card.querySelector('.kc-gem-list');
  const draw=g=>{if(!Array.isArray(g)||!g.length){list.innerHTML='<p class="sub">No gems yet. Know a place most people miss? Be the first to add it.</p>';return}
    list.innerHTML=g.slice(0,12).map(x=>`<article class="kc-gem"><div class="dayhead"><h3>${esc(x.place)}</h3><span class="sub">${esc(x.state)}</span></div><p>${esc(x.why)}</p>${x.best?`<p class="sub"><b>Best time:</b> ${esc(x.best)}</p>`:''}${x.reach?`<p class="sub"><b>Getting there:</b> ${esc(x.reach)}</p>`:''}${x.tip?`<p class="sub">💡 ${esc(x.tip)}</p>`:''}<a class="kc-gem-plan" href="?to=${encodeURIComponent(x.place)}#plan">Plan a trip here →</a></article>`).join('')};
  let cache=null;try{cache=JSON.parse(localStorage.getItem('bg_gems')||'null')}catch(_){}
  if(cache&&Date.now()-cache.t<3600e3)draw(cache.d);
  else fetch(API+'?action=gems',{credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>r.json()).then(d=>{try{localStorage.setItem('bg_gems',JSON.stringify({t:Date.now(),d}))}catch(_){}draw(d)}).catch(()=>{if(cache)draw(cache.d);else list.innerHTML='<p class="sub">Hidden gems need internet to load.</p>'});
  function open(){let acct=null;try{acct=JSON.parse(localStorage.getItem('kc_acct')||'null')}catch(_){}
    if(!acct||!acct.token){if(window.kcAccount)kcAccount.open();return}
    const w=document.createElement('div');w.className='kc-sheet';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Suggest a hidden gem');
    w.innerHTML=`<div class="kc-sheet-in"><div class="kc-sheet-h"><h2>Suggest a hidden gem</h2><button type="button" class="kc-x" aria-label="Close">✕</button></div><form novalidate>
      <div class="kc-two"><label>Place<input name="place" maxlength="60" required placeholder="e.g. Lamayuru"></label><label>State or country<input name="state" maxlength="40" required placeholder="e.g. Ladakh"></label></div>
      <label>Why should people go?<textarea name="why" rows="3" maxlength="300" required placeholder="What makes it special, in 1–2 lines"></textarea></label>
      <div class="kc-two"><label>Best time (optional)<input name="best" maxlength="60" placeholder="e.g. Jun–Sep"></label><label>How to reach (optional)<input name="reach" maxlength="160" placeholder="e.g. Bus from Leh, 3 h"></label></div>
      <label>One tip (optional)<input name="tip" maxlength="200" placeholder="e.g. Stay at the monastery guesthouse"></label>
      <input type="text" name="website" class="kc-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="primary" type="submit">Send for review</button><p class="kc-msg" role="alert"></p><p class="sub">We check every place before it appears. Your name is never shown.</p></form></div>`;
    document.body.appendChild(w);const close=()=>{w.classList.add('kc-out');setTimeout(()=>w.remove(),220)};w.querySelector('.kc-x').onclick=close;w.addEventListener('click',e=>{if(e.target===w)close()});
    const fm=w.querySelector('form'),m=w.querySelector('.kc-msg');setTimeout(()=>fm.place.focus(),250);
    fm.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(fm).entries());if(d.website)return close();
      if((d.place||'').trim().length<2||(d.state||'').trim().length<2){m.textContent='Add the place and its state or country.';return}
      if((d.why||'').trim().length<20){m.textContent='Tell us a little more about why it is special.';return}
      const b=fm.querySelector('button[type=submit]');b.disabled=true;b.textContent='Sending…';
      try{const r=await fetch(API,{method:'POST',body:JSON.stringify(Object.assign({kind:'gem_suggest',token:acct.token},d)),credentials:'omit',referrerPolicy:'no-referrer'});const j=await r.json();
        if(j.ok){fm.innerHTML='<p class="kc-done">✅ Thanks! We will check it and add it soon.</p><button type="button" class="primary">Close</button>';fm.querySelector('button').onclick=close;try{window.kcTrack&&kcTrack('gem_suggested')}catch(_){}return}
        m.textContent=j.error==='limit'?'You can suggest 3 places a day. Thank you!':j.error==='signin'?'Sign in again, then try.':'Could not send. Try again later.'}
      catch(_){m.textContent='Couldn’t connect. Check your internet.'}b.disabled=false;b.textContent='Send for review'}}
  document.addEventListener('click',e=>{if(e.target.closest('[data-gem]'))open()});
})();
