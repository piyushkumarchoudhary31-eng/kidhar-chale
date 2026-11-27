/* ===== ACCOUNT: sign in with a code sent to your email; trips saved privately (encrypted) in the cloud ===== */
(()=>{
  const C=window.KC_CONFIG||{},API=(C.api||'').trim();
  if(!API||!window.fetch||!window.JSON)return; /* accounts stay hidden until the backend address is set */
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const LS=window.localStorage,rawSet=Storage.prototype.setItem,rawGet=Storage.prototype.getItem,rawDel=Storage.prototype.removeItem;
  const AK='kc_acct',MK='kc_syncmeta';
  const rd=(k,d)=>{try{const v=rawGet.call(LS,k);return v?JSON.parse(v):d}catch(_){return d}};
  const wr=(k,v)=>{try{v==null?rawDel.call(LS,k):rawSet.call(LS,k,JSON.stringify(v))}catch(_){}};
  let acct=rd(AK,null);if(acct&&(typeof acct.token!=='string'||acct.token.length<30))acct=null;
  let meta=Object.assign({t:{},since:0,dirty:{}},rd(MK,{}));
  const saveAcct=()=>wr(AK,acct),saveMeta=()=>wr(MK,meta);
  const track=(n,p)=>{try{window.kcTrack&&kcTrack(n,p)}catch(_){}};

  /* what gets saved to the account: your plans, trips, money, lists and settings, not caches */
  const DENY=/^bg_(ph3|stats|lastsend|consent|toured|trips|finder|uilang|xmode|planMode|nowcity|examplePick|explore|hideWelcome)$/; /* caches and this-device settings stay here */
  const syncable=k=>typeof k==='string'&&/^bg_[A-Za-z0-9_]{1,40}$/.test(k)&&!DENY.test(k);
  let applying=false;
  const touch=k=>{if(!acct)return;meta.t[k]=Date.now();meta.dirty[k]=1;saveMeta();schedule()};
  Storage.prototype.setItem=function(k,v){let old=null;const mine=this===LS&&!applying&&acct&&syncable(k);if(mine)old=rawGet.call(this,k);
    rawSet.call(this,k,v);if(mine&&old!==String(v))touch(k)};
  Storage.prototype.removeItem=function(k){const mine=this===LS&&!applying&&acct&&syncable(k)&&rawGet.call(this,k)!==null;rawDel.call(this,k);if(mine)touch(k)};

  const post=async(kind,data,opt)=>{const r=await fetch(API,Object.assign({method:'POST',body:JSON.stringify(Object.assign({kind},data)),credentials:'omit',referrerPolicy:'no-referrer'},opt||{}));
    if(!r.ok)throw new Error('net');return r.json()};
  const ERR={email:'That email doesn’t look right. Check it and try again.',wait:'We just sent you a code. Wait a minute before asking again.',limit:'Too many codes for this email. Try again in an hour.',
    busy:'Sign-in is busy right now. Please try again a little later.',expired:'This code has expired. Ask for a new one.',tries:'Too many wrong tries. Ask for a new code.',
    code:'Type the 6-digit code from the email.',net:'Couldn’t connect. Check your internet and try again.',server:'Something went wrong on our side. Try again in a minute.',full:'Your account is full. Delete a few old trips and try again.'};
  const maskEmail=e=>{const [u,d]=String(e||'').split('@');if(!d)return '';return (u.length<=2?u[0]+'•':u[0]+'•'.repeat(Math.min(4,u.length-2))+u[u.length-1])+'@'+d};
  const ago=t=>{if(!t)return 'not yet';const s=(Date.now()-t)/1000;return s<60?'just now':s<3600?Math.round(s/60)+' min ago':s<86400?Math.round(s/3600)+' h ago':new Date(t).toLocaleDateString('en-IN',{day:'numeric',month:'short'})};

  /* ---------- sync ---------- */
  let timer=0,busy=false,again=false,state='idle';
  function schedule(ms){clearTimeout(timer);timer=setTimeout(()=>sync(false),ms==null?2500:ms)}
  function localTrips(){try{return JSON.parse(rawGet.call(LS,'bg_mytrips')||'[]')}catch(_){return[]}}
  function apply(keys){const ch=[];applying=true;
    try{Object.keys(keys||{}).forEach(k=>{const x=keys[k];if(!syncable(k)||!x)return;if(meta.dirty[k]&&(meta.t[k]||0)>x.t)return;
      const cur=rawGet.call(LS,k);if(x.v===null){if(cur!==null){rawDel.call(LS,k);ch.push(k)}}else if(cur!==x.v){rawSet.call(LS,k,x.v);ch.push(k)}
      meta.t[k]=x.t;delete meta.dirty[k]})}finally{applying=false}return ch}
  async function sync(first){
    if(!acct)return;if(busy){again=true;return}busy=true;setState('saving');
    const keys={},sentT={};
    if(first){for(let i=0;i<LS.length;i++){const k=LS.key(i);if(syncable(k))keys[k]={v:rawGet.call(LS,k),t:k==='bg_plan'?Date.now():0}}} /* first sign-in: the account wins, but the plan open on this screen stays */
    else Object.keys(meta.dirty).forEach(k=>{if(!syncable(k)){delete meta.dirty[k];return}keys[k]={v:rawGet.call(LS,k),t:meta.t[k]||Date.now()};sentT[k]=keys[k].t});
    const before=first?localTrips():null;
    try{const j=await post('sync',{token:acct.token,since:first?0:meta.since||0,keys});
      if(!j||!j.ok){const e=j&&j.error;if(e==='signin'){forget('Your sign-in ended. Sign in again to keep your trips saved.');return}setState('error',ERR[e]||ERR.server);if(e!=='full')schedule(60000);return}
      Object.keys(sentT).forEach(k=>{if((meta.t[k]||0)<=sentT[k])delete meta.dirty[k]});
      meta.since=j.now||meta.since;if(j.name&&j.name!==acct.name){acct.name=j.name;paint()}
      const ch=apply(j.keys);
      if(first&&before.length){/* your trips from this phone and from the account, together */
        const all=[...localTrips(),...before],seen=new Set(),merged=[];
        all.sort((a,b)=>(b.at||0)-(a.at||0)).forEach(t=>{if(t&&t.title&&!seen.has(t.title)){seen.add(t.title);merged.push(t)}});
        const v=JSON.stringify(merged.slice(0,20));if(v!==rawGet.call(LS,'bg_mytrips')){LS.setItem('bg_mytrips',v);if(!ch.includes('bg_mytrips'))ch.push('bg_mytrips')}}
      acct.last=Date.now();saveAcct();saveMeta();setState('ok');
      if(ch.length)changedFromCloud(first);
    }catch(_){setState('offline');schedule(45000)}
    finally{busy=false;if(again){again=false;schedule(500)}else if(Object.keys(meta.dirty).length&&state==='ok')schedule(800)}
  }
  let reloadAsked=false,reloading=false;
  function changedFromCloud(first){
    if(first){reloading=true;const s=$('.kc-acct-sheet');if(s)s.querySelector('.kc-acct-body').innerHTML='<p class="kc-done">✅ Your saved trips are here. Opening them…</p>';setTimeout(()=>location.reload(),900);return}
    if(reloadAsked)return;reloadAsked=true;
    const bar=document.createElement('div');bar.className='kc-acct-bar';bar.setAttribute('role','status');
    bar.innerHTML='<span>☁️ Updated from your other device.</span><button type="button" class="small primary">Refresh</button>';
    bar.querySelector('button').onclick=()=>location.reload();document.body.appendChild(bar)}
  function flush(){if(!acct||!Object.keys(meta.dirty).length)return;
    const keys={};Object.keys(meta.dirty).forEach(k=>{if(syncable(k))keys[k]={v:rawGet.call(LS,k),t:meta.t[k]||Date.now()}});
    const body=JSON.stringify({kind:'sync',token:acct.token,since:meta.since||0,keys});
    if(body.length<60000){try{fetch(API,{method:'POST',body,keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'})}catch(_){}}}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();else if(acct&&Date.now()-(acct.last||0)>180000)sync(false)});

  /* ---------- header button + Tools card ---------- */
  const btn=document.createElement('button');btn.type='button';btn.className='kc-acct-btn';
  const lang=$('.kc-lang');if(lang)lang.after(btn);else{const h=$('header.top')||$('header');if(h)h.appendChild(btn)}
  const card=document.createElement('div');card.className='card kc-acct-card';
  const fun=$('#v-fun');if(fun){const g=fun.querySelector('.kc-guides');(g||fun.firstElementChild)?(g||fun.firstElementChild).before(card):fun.prepend(card)}
  const initial=n=>esc((String(n||'?').trim()[0]||'?').toUpperCase());
  function paint(){
    if(acct){btn.innerHTML=`<span class="kc-av" aria-hidden="true">${initial(acct.name)}</span><span class="kc-acct-l">${esc(String(acct.name||'Account').split(' ')[0])}</span>`;btn.setAttribute('aria-label','Your account: '+(acct.name||''));btn.classList.add('on')}
    else{btn.innerHTML='<span aria-hidden="true">👤</span><span class="kc-acct-l">Sign in</span>';btn.setAttribute('aria-label','Sign in to save your trips');btn.classList.remove('on')}
    card.innerHTML=acct?`<div class="kc-acct-row"><span class="kc-av big" aria-hidden="true">${initial(acct.name)}</span><div><h2>Hi, ${esc(acct.name||'traveller')}</h2><p class="sub">Your trips are saved to your account <span class="kc-sync" data-s="${state}">${syncText()}</span></p></div></div><button type="button" class="ghost" data-acct>Manage account and trips</button>`
      :`<h2>💾 Save your trips</h2><p class="sub">Sign in with just your email. Your plans, money and lists stay safe and open on any phone or laptop.</p><button type="button" class="primary" data-acct>Sign in or create account</button>`;
    const sh=$('.kc-acct-sheet');if(sh&&sh.dataset.view==='me')viewMe(sh)}
  const syncText=()=>state==='saving'?'· saving…':state==='offline'?'· offline, will save later':state==='error'?'· not saved':'· saved '+ago(acct&&acct.last);
  function setState(s,msg){state=s;const el=document.querySelectorAll('.kc-sync');el.forEach(e=>{e.dataset.s=s;e.textContent=syncText()});const m=$('.kc-acct-sheet .kc-sync-msg');if(m)m.textContent=s==='error'?(msg||''):''}
  document.addEventListener('click',e=>{if(e.target.closest('.kc-acct-btn,[data-acct]'))open()});
  /* nudge on a new plan */
  const out=$('#p-out');if(out)new MutationObserver(()=>{const sh=out.querySelector('.kc-share');if(!sh||sh.querySelector('.kc-acct-nudge'))return;
    sh.insertAdjacentHTML('beforeend',acct?'<p class="sub kc-acct-nudge">☁️ Saved to your account. Open it on any device.</p>':'<p class="sub kc-acct-nudge">💾 Saved on this phone only. <button type="button" class="small ghost" data-acct>Sign in to keep it everywhere</button></p>')}).observe(out,{childList:true});

  /* ---------- the sheet ---------- */
  function sheet(){let w=$('.kc-acct-sheet');if(w)return w;
    w=document.createElement('div');w.className='kc-sheet kc-acct-sheet';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-labelledby','kc-acct-h');
    w.innerHTML='<div class="kc-sheet-in"><div class="kc-acct-top"><p class="kc-acct-kick">KIDHAR CHALE? · ACCOUNT</p><button type="button" class="kc-x" aria-label="Close">✕</button></div><div class="kc-acct-body"></div></div>';
    document.body.appendChild(w);const close=()=>{w.classList.add('kc-out');document.removeEventListener('keydown',k);setTimeout(()=>w.remove(),220);btn.focus({preventScroll:true})};
    const k=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',k);
    w.querySelector('.kc-x').onclick=close;w.addEventListener('click',e=>{if(e.target===w)close()});w._close=close;return w}
  function open(){const w=sheet();acct?viewMe(w):viewEmail(w)}
  const busyBtn=(b,on,txt)=>{b.disabled=on;if(txt)b.textContent=txt};
  const focusSoon=el=>setTimeout(()=>{if(el)el.focus()},260);
  let pending={email:'',sent:0};

  function viewEmail(w,msg){w.dataset.view='email';const b=w.querySelector('.kc-acct-body');
    b.innerHTML=`<h2 id="kc-acct-h">Save your trips</h2><p class="sub">Sign in or create an account with your email. We send you a 6-digit code. No password to remember.</p>
     <form class="kc-acct-form" novalidate><label>Your email<input type="email" name="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="254" required placeholder="you@gmail.com" value="${esc(pending.email)}"></label>
     <input type="text" name="website" class="kc-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
     <button class="primary" type="submit">Send me a code</button><p class="kc-msg" role="alert">${esc(msg||'')}</p></form>
     <ul class="kc-trust"><li><span aria-hidden="true">🔒</span>Your trips are encrypted. Nobody else can read them.</li><li><span aria-hidden="true">✉️</span>We never store your email in readable form, and never send ads.</li><li><span aria-hidden="true">🗑️</span>Delete your account and everything in it any time.</li></ul>
     <p class="sub kc-small">Without an account, everything still works and stays on this phone. <a href="privacy.html#account">How accounts work</a></p>`;
    const f=b.querySelector('form'),m=b.querySelector('.kc-msg'),inp=f.email;focusSoon(inp);
    f.onsubmit=async e=>{e.preventDefault();if(f.website.value)return;const email=inp.value.trim().toLowerCase();
      if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)){m.textContent=ERR.email;inp.focus();return}
      const sb=f.querySelector('button[type=submit]');busyBtn(sb,true,'Sending…');m.textContent='';
      try{const j=await post('auth_start',{email});if(!j.ok){busyBtn(sb,false,'Send me a code');m.textContent=ERR[j.error]||ERR.server;if(j.error==='wait'&&pending.email===email)viewCode(w);return}
        pending={email,sent:Date.now()};track('sign_in_code_sent');viewCode(w)}
      catch(_){busyBtn(sb,false,'Send me a code');m.textContent=ERR.net}}}

  function viewCode(w,needName){w.dataset.view='code';const b=w.querySelector('.kc-acct-body');
    b.innerHTML=`<h2 id="kc-acct-h">${needName?'Welcome! One last thing':'Check your email'}</h2>
     <p class="sub">${needName?'What should we call you?':`We sent a 6-digit code to <b>${esc(maskEmail(pending.email))}</b>. It works for 10 minutes. Check spam if you don’t see it.`}</p>
     <form class="kc-acct-form" novalidate>
      <label${needName?' hidden':''}>Code<input class="kc-otp" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" placeholder="••••••" aria-label="6-digit code" value="${esc(pending.code||'')}"></label>
      ${needName?'<label>Your name<input name="name" autocomplete="given-name" maxlength="40" required placeholder="e.g. Piyush"></label>':''}
      <button class="primary" type="submit">${needName?'Create my account':'Sign in'}</button><p class="kc-msg" role="alert"></p>
     </form>
     <div class="kc-acct-links">${needName?'':'<button type="button" class="link" data-resend>Send a new code</button>'}<button type="button" class="link" data-back>Use a different email</button></div>`;
    const f=b.querySelector('form'),m=b.querySelector('.kc-msg'),code=f.code,sb=f.querySelector('button[type=submit]');
    focusSoon(needName?f.name:code);
    code.addEventListener('input',()=>{code.value=code.value.replace(/\D/g,'').slice(0,6);if(code.value.length===6&&!needName)f.requestSubmit?f.requestSubmit():sb.click()});
    b.querySelector('[data-back]').onclick=()=>{pending={email:'',sent:0};viewEmail(w)};
    const rs=b.querySelector('[data-resend]');
    if(rs){const tick=()=>{const left=Math.ceil((pending.sent+60000-Date.now())/1000);if(!rs.isConnected)return;if(left>0){rs.disabled=true;rs.textContent=`Send a new code (${left}s)`;setTimeout(tick,1000)}else{rs.disabled=false;rs.textContent='Send a new code'}};tick();
      rs.onclick=async()=>{rs.disabled=true;m.textContent='';try{const j=await post('auth_start',{email:pending.email});if(!j.ok){m.textContent=ERR[j.error]||ERR.server}else{pending.sent=Date.now();m.textContent='';code.value='';code.focus()}}catch(_){m.textContent=ERR.net}tick()}}
    f.onsubmit=async e=>{e.preventDefault();const c=code.value.replace(/\D/g,'');if(c.length!==6){m.textContent=ERR.code;code.focus();return}
      const nm=needName?(f.name.value||'').trim():'';if(needName&&!nm){m.textContent='Add your name.';f.name.focus();return}
      busyBtn(sb,true,needName?'Creating…':'Checking…');m.textContent='';
      try{const j=await post('auth_verify',Object.assign({email:pending.email,code:c},needName?{name:nm}:{}));
        if(j.ok&&j.needName){pending.code=c;viewCode(w,true);return}
        if(!j.ok){busyBtn(sb,false,needName?'Create my account':'Sign in');m.textContent=j.error==='wrong'?`That code isn’t right. ${j.left} ${j.left===1?'try':'tries'} left.`:(ERR[j.error]||ERR.server);
          if(j.error==='expired'||j.error==='tries'){code.value=''}code.select&&code.select();return}
        acct={token:j.token,name:j.name,email:maskEmail(pending.email),em:pending.email,since:Date.now(),last:0};meta={t:{},since:0,dirty:{}};saveAcct();saveMeta();
        pending={email:'',sent:0};track(j.isNew?'sign_up':'login',{method:'email_code'});
        b.innerHTML=`<p class="kc-done">✅ ${j.isNew?'Account created':'Signed in'}. Saving your trips…</p>`;paint();
        await sync(true);if(!reloading&&w.isConnected)viewMe(w)}
      catch(_){busyBtn(sb,false,needName?'Create my account':'Sign in');m.textContent=ERR.net}}}

  function viewMe(w){w.dataset.view='me';const b=w.querySelector('.kc-acct-body');const T=localTrips();
    b.innerHTML=`<div class="kc-acct-row"><span class="kc-av big" aria-hidden="true">${initial(acct.name)}</span><div style="min-width:0"><h2 id="kc-acct-h">${esc(acct.name||'Your account')}</h2><p class="sub">${esc(acct.email||'')}</p></div></div>
     <p class="kc-syncline"><span class="kc-sync" data-s="${state}">${syncText().replace(/^· /,'')}</span> <button type="button" class="link" data-sync>Save now</button></p><p class="kc-msg kc-sync-msg" role="status"></p>
     <h3 class="kc-acct-sec">My saved trips</h3>
     ${T.length?`<ul class="kc-mytrips">${T.map((t,i)=>`<li><button type="button" class="kc-mt-open" data-open="${i}"><b>${esc(t.title)}</b><small>${+t.n||0} day${t.n>1?'s':''} · saved ${esc(ago(t.at))}</small></button><button type="button" class="kc-mt-del" data-del="${i}" aria-label="Delete ${esc(t.title)}">✕</button></li>`).join('')}</ul>`
       :'<p class="sub">No trips yet. Make a plan and it is saved here by itself.</p>'}
     <h3 class="kc-acct-sec">Settings</h3>
     <form class="kc-acct-name" novalidate><label>Name<span class="kc-inline"><input name="name" maxlength="40" autocomplete="given-name" value="${esc(acct.name||'')}"><button type="submit" class="small">Save</button></span></label></form>
     <div class="kc-acct-actions"><button type="button" data-out>Sign out</button><button type="button" class="ghost" data-outall>Sign out on all devices</button><button type="button" class="ghost kc-danger" data-delacct>Delete my account</button></div>
     <div class="kc-confirm" hidden></div>
     <p class="sub kc-small">🔒 Your trips are encrypted in our cloud. Only you can open them, by signing in with your email. <a href="privacy.html#account">How it works</a></p>`;
    b.querySelector('[data-sync]').onclick=()=>{for(let i=0;i<LS.length;i++){const k=LS.key(i);if(syncable(k)&&!(k in meta.t)){meta.t[k]=Date.now();meta.dirty[k]=1}}saveMeta();sync(false)};
    b.querySelectorAll('[data-open]').forEach(x=>x.onclick=()=>{const t=localTrips()[+x.dataset.open];if(t&&window.bgRenderPlan){w._close();window.bgShow&&bgShow('plan');bgRenderPlan(t.plan);setTimeout(()=>{const o=$('#p-out');o&&o.scrollIntoView({block:'start',behavior:'smooth'})},120)}});
    b.querySelectorAll('[data-del]').forEach(x=>x.onclick=()=>{if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Delete?';x.classList.add('sure');setTimeout(()=>{if(x.isConnected){x.dataset.sure='';x.textContent='✕';x.classList.remove('sure')}},3000);return}
      const T2=localTrips();T2.splice(+x.dataset.del,1);LS.setItem('bg_mytrips',JSON.stringify(T2));viewMe(w)});
    const nf=b.querySelector('.kc-acct-name');nf.onsubmit=async e=>{e.preventDefault();const nm=nf.name.value.replace(/[<>]/g,'').trim().slice(0,40);if(!nm)return;
      const sbt=nf.querySelector('button');busyBtn(sbt,true,'Saving…');try{const j=await post('sync',{token:acct.token,since:meta.since||0,keys:{},name:nm});if(j.ok){acct.name=j.name||nm;saveAcct();paint();viewMe(w)}else busyBtn(sbt,false,'Save')}catch(_){busyBtn(sbt,false,'Save')}};
    const cf=b.querySelector('.kc-confirm');
    const confirm=(html,yes,fn)=>{cf.hidden=false;cf.innerHTML=html+`<label class="kc-check"><input type="checkbox" name="wipe"> Also remove my trips and data from this ${matchMedia('(pointer:coarse)').matches?'phone':'browser'} (good on a shared device)</label><div class="kc-acct-actions"><button type="button" class="primary kc-yes">${yes}</button><button type="button" class="ghost kc-no">Cancel</button></div><p class="kc-msg" role="alert"></p>`;
      cf.querySelector('.kc-no').onclick=()=>{cf.hidden=true};cf.querySelector('.kc-yes').onclick=async()=>{const y=cf.querySelector('.kc-yes');busyBtn(y,true,'Please wait…');try{await fn(cf.querySelector('[name=wipe]').checked)}catch(_){busyBtn(y,false,yes);cf.querySelector('.kc-msg').textContent=ERR.net}};cf.scrollIntoView({block:'nearest',behavior:'smooth'})};
    b.querySelector('[data-out]').onclick=()=>confirm('<p><b>Sign out?</b> Your trips stay saved in your account.</p>','Sign out',async wipe=>{flush();try{await post('sign_out',{token:acct.token})}catch(_){}track('logout');forget('',wipe)});
    b.querySelector('[data-outall]').onclick=()=>confirm('<p><b>Sign out everywhere?</b> Every phone and laptop signed in to this account will be signed out.</p>','Sign out everywhere',async wipe=>{const j=await post('sign_out',{token:acct.token,all:true});if(!j.ok)throw 0;forget('',wipe)});
    b.querySelector('[data-delacct]').onclick=()=>confirm('<p><b>Delete your account?</b> This removes your account and every trip saved in it from our cloud. It cannot be undone.</p>','Yes, delete my account',async wipe=>{const j=await post('delete_account',{token:acct.token});if(!j.ok&&j.error!=='signin')throw 0;track('account_deleted');forget('Your account and its saved trips are deleted.',wipe)})}

  function forget(msg,wipe){clearTimeout(timer);acct=null;saveAcct();meta={t:{},since:0,dirty:{}};wr(MK,null);
    if(wipe){const ks=[];for(let i=0;i<LS.length;i++){const k=LS.key(i);if(/^bg_/.test(k)&&!/^bg_(toured|consent|uilang)$/.test(k))ks.push(k)}ks.forEach(k=>rawDel.call(LS,k));try{sessionStorage.clear()}catch(_){}setTimeout(()=>location.reload(),300)}
    paint();const w=$('.kc-acct-sheet');if(w)viewEmail(w,msg);else if(msg){const bar=document.createElement('div');bar.className='kc-acct-bar';bar.setAttribute('role','status');bar.innerHTML=`<span>${esc(msg)}</span><button type="button" class="small" data-acct>Sign in</button>`;document.body.appendChild(bar);setTimeout(()=>bar.remove(),9000)}}

  /* footer and privacy note: say that accounts are optional */
  const fp=$('footer.foot p');if(fp&&!fp.querySelector('.kc-acct-note'))fp.innerHTML='<b>Kidhar Chale?</b> is made free for travellers. No ads, and sign-in is optional. <span class="kc-acct-note">Without an account, your plans, spends and trips stay only in this browser. With one, they are also saved, encrypted, so you can open them on any device.</span> The weather asks Open-Meteo about a place’s location, and the map loads from OpenStreetMap. <a href="privacy.html">How we handle data</a>.';
  document.querySelectorAll('.kc-footer p').forEach(kb=>{if(/Everything stays in your browser/.test(kb.textContent))kb.textContent=kb.textContent.replace('Everything stays in your browser.','Your trips stay in your browser, or in your account if you sign in.')});
  if(typeof HI==='object')Object.assign(HI,{'Sign in':'साइन इन','Save your trips':'अपनी ट्रिप्स सेव करें','Sign in or create account':'साइन इन करें या अकाउंट बनाएँ','Sign in with just your email. Your plans, money and lists stay safe and open on any phone or laptop.':'सिर्फ़ ईमेल से साइन इन करें। आपके प्लान, खर्च और लिस्ट सुरक्षित रहेंगे और किसी भी फ़ोन या लैपटॉप पर खुलेंगे।','Manage account and trips':'अकाउंट और ट्रिप्स','Sign in or create an account with your email. We send you a 6-digit code. No password to remember.':'अपने ईमेल से साइन इन करें या अकाउंट बनाएँ। हम आपको 6 अंकों का कोड भेजेंगे। कोई पासवर्ड याद नहीं रखना।','Your email':'आपका ईमेल','Send me a code':'मुझे कोड भेजें','Check your email':'अपना ईमेल देखें','Code':'कोड','Use a different email':'दूसरा ईमेल डालें','Send a new code':'नया कोड भेजें','My saved trips':'मेरी सेव की गई ट्रिप्स','Settings':'सेटिंग्स','Name':'नाम','Save':'सेव करें','Sign out':'साइन आउट','Sign out on all devices':'सभी डिवाइस से साइन आउट','Delete my account':'मेरा अकाउंट डिलीट करें','Save now':'अभी सेव करें','Cancel':'रद्द करें','Your trips are encrypted. Nobody else can read them.':'आपकी ट्रिप्स एन्क्रिप्टेड हैं। कोई और इन्हें नहीं पढ़ सकता।','We never store your email in readable form, and never send ads.':'हम आपका ईमेल पढ़ने लायक रूप में कभी नहीं रखते, और कभी विज्ञापन नहीं भेजते।','Delete your account and everything in it any time.':'अपना अकाउंट और उसमें सब कुछ कभी भी डिलीट करें।','Create my account':'मेरा अकाउंट बनाएँ','Your name':'आपका नाम','What should we call you?':'हम आपको क्या कहें?','Welcome! One last thing':'स्वागत है! बस एक चीज़ और'});
  paint();
  if(acct)setTimeout(()=>sync(false),1200);
  window.kcAccount={open,get signedIn(){return !!acct},sync:()=>sync(false)};
})();
