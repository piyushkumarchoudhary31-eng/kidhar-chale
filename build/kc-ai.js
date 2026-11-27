/* ---------- CLAUDE LAYER: AI planning, voice and live group rooms. Does nothing outside Claude. ---------- */
(function(){
const has=!!(window.claude&&window.claude.use);
let sp=null;
window.kcSample=()=>{if(!has)return Promise.resolve(null);if(!sp)sp=window.claude.use('sample').catch(()=>null);return sp};
if(!has)return;
/* voice: a speaker button on every survival phrase */
window.claude.use('tts').then(t=>{if(!t)return;const L=document.getElementById('ph-list');if(!L)return;
  const add=()=>{L.querySelectorAll('.phr').forEach(r=>{if(r.querySelector('[data-kcsay]'))return;const s=r.querySelector('.say');if(!s)return;
    const b=document.createElement('button');b.className='small ghost';b.type='button';b.dataset.kcsay=s.textContent;b.setAttribute('aria-label','Hear '+s.textContent);b.innerHTML='<svg class="kc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M16.5 9a4 4 0 0 1 0 6"/></svg>';
    b.onclick=()=>t.speak(b.dataset.kcsay.replace('___','').replace(/\//g,','),{rate:.85}).catch(()=>{});r.appendChild(b)})};
  add();new MutationObserver(add).observe(L,{childList:true})}).catch(()=>{});
/* live group rooms: friends with the link see each other's expenses at once, and can join with the 6-letter code */
const dbP=window.claude.use('db').catch(()=>null);let db=null,unsub=null;dbP.then(d=>{db=d});
const pack=r=>({data:JSON.stringify(r),at:Date.now()});const unpack=d=>{try{const r=JSON.parse(d.data);return r&&r.id?r:null}catch(e){return null}};
window.kcRoomPush=r=>{if(db&&r&&r.id)db.doc('trips/'+r.id).set(pack(r)).catch(()=>{})};
window.kcRoomWatch=(id,cb)=>{if(unsub){unsub();unsub=null}if(!id)return;dbP.then(d=>{if(!d)return;unsub=d.doc('trips/'+id).onSnapshot(sn=>{if(sn.exists){const r=unpack(sn.data());if(r)cb(r)}},()=>{})})};
window.kcRoomFetch=id=>dbP.then(d=>d?new Promise(res=>{let done=false,u=null;const fin=v=>{if(done)return;done=true;setTimeout(()=>u&&u(),0);res(v)};
  setTimeout(()=>fin(null),10000);u=d.doc('trips/'+id).onSnapshot(sn=>{if(sn.metadata&&sn.metadata.fromCache&&!sn.exists)return;fin(sn.exists?unpack(sn.data()):null)},()=>fin(null))}):null);
})();
