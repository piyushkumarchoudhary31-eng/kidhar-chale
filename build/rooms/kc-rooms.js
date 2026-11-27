/* ===== GROUP TRIPS LIVE: friends join with the 6-letter code and see expenses update by themselves ===== */
(()=>{
  const C=window.KC_CONFIG||{},API=(C.api||'').trim();
  if(!API||window.kcRoomPush)return; /* inside Claude the group trip already syncs */
  const $=s=>document.querySelector(s);
  const post=async(kind,data)=>{const r=await fetch(API,{method:'POST',body:JSON.stringify(Object.assign({kind},data)),credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw new Error('net');return r.json()};
  let watchId=null,watchCb=null,at=0,timer=0,quiet=0,pushT=0,pending=null;
  const live=(txt,ok)=>{const e=$('#kc-gr-live');if(e){e.textContent=txt;e.dataset.ok=ok?'1':'0'}};
  window.kcRoomFetch=id=>post('room_get',{id}).then(j=>j&&j.ok&&j.room?(at=j.at,j.room):null).catch(()=>null);
  window.kcRoomPush=r=>{if(!r||!r.id)return;pending=JSON.parse(JSON.stringify(r));clearTimeout(pushT);pushT=setTimeout(async()=>{const room=pending;pending=null;
    try{const j=await post('room_put',{id:room.id,room});if(j&&j.ok&&j.room){at=j.at;live('🟢 Live · saved for everyone','1');if(watchId===room.id&&watchCb)watchCb(j.room)}else live(j&&j.error==='full'?'This trip is full. Remove a few old expenses.':'Not saved yet. Will try again.',0)}
    catch(_){live('Offline. Changes will be sent when you are back online.',0);pending=pending||room;clearTimeout(pushT);pushT=setTimeout(()=>window.kcRoomPush(pending),20000)}},500)};
  async function poll(){clearTimeout(timer);if(!watchId)return;
    if(document.visibilityState==='visible'){try{const j=await post('room_get',{id:watchId,at});
      if(j&&j.ok){if(j.room&&watchCb){at=j.at;quiet=0;watchCb(j.room)}else quiet++;live('🟢 Live · friends with code '+watchId+' see this',1)}}catch(_){live('Offline. Showing what was saved on this phone.',0)}}
    timer=setTimeout(poll,Math.min(60000,10000+quiet*5000))}
  window.kcRoomWatch=(id,cb)=>{watchId=id||null;watchCb=cb||null;at=0;quiet=0;clearTimeout(timer);if(id)poll()};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&watchId){quiet=0;poll()}});
  /* wording: live codes instead of copy-paste messages */
  const room=$('#gr-room');if(room&&!$('#kc-gr-live')){const p=document.createElement('p');p.id='kc-gr-live';p.className='sub kc-gr-live';p.setAttribute('role','status');p.textContent='🟢 Live';
    const c=$('#gr-c');(c&&c.closest('.dayhead'))?c.closest('.dayhead').after(p):room.prepend(p)}
  const upd=$('#gr-upd');if(upd){const row=upd.closest('.row');if(row)row.hidden=true}
  const code=$('#gr-code');if(code){code.placeholder='6-letter code, e.g. K7QM2P';const l=code.closest('label');if(l&&l.firstChild&&l.firstChild.nodeType===3)l.firstChild.nodeValue='Got a trip code from a friend? ';code.setAttribute('autocapitalize','characters')}
  const sh=$('#gr-share');
  if(sh){sh.textContent='📤 Invite friends';sh.onclick=async()=>{const c=($('#gr-c')||{}).textContent||'';const name=($('#gr-title')||{}).textContent||'our trip';
    const url=location.origin+location.pathname.replace(/[^/]*$/,'')+'?room='+encodeURIComponent(c);
    const txt=`🎒 Join "${name}" on Kidhar Chale? to split our trip costs: ${url}\nOr open Tools → Group trip and type the code ${c}`;
    if(navigator.share&&matchMedia('(pointer:coarse)').matches){try{await navigator.share({title:name,text:txt});return}catch(e){if(e&&e.name==='AbortError')return}}
    const box=$('#gr-codebox');try{await navigator.clipboard.writeText(txt);const ok=$('#gr-ok');if(ok){ok.textContent='Invite copied. Paste it in your group chat.';ok.hidden=false;setTimeout(()=>ok.hidden=true,4000)}}
    catch(_){if(box){box.value=txt;box.hidden=false;box.focus();box.select()}}}}
  /* opening an invite link: ?room=K7QM2P */
  const q=new URLSearchParams(location.search),rc=(q.get('room')||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(/^[A-HJ-NP-Z2-9]{6}$/.test(rc)){history.replaceState(null,'',location.pathname+location.hash);
    setTimeout(()=>{if(window.bgShow)bgShow('fun');const inp=$('#gr-code'),j=$('#gr-join');const card=inp&&inp.closest('.card');
      if(card){card.classList.add('kc-open');const h=card.querySelector(':scope > h3');if(h)h.setAttribute('aria-expanded','true')}
      if(inp&&j){inp.value=rc;j.click();setTimeout(()=>{(card||inp).scrollIntoView({block:'start',behavior:'smooth'})},300)}},500)}
  if(typeof HI==='object')Object.assign(HI,{'📤 Invite friends':'📤 दोस्तों को बुलाएँ'});
})();
