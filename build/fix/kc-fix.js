/* ===== Instagram link in the footers ===== */
(()=>{const IG='https://www.instagram.com/piyush_choudhary_21/';
  const leg=document.querySelector('footer.foot .kc-legal');if(leg&&!leg.querySelector('.kc-ig'))leg.insertAdjacentHTML('beforeend',` · <a class="kc-ig" href="${IG}" target="_blank" rel="noopener">Instagram</a>`);
  const kf=document.querySelector('.kc-footer .kc-gcol ul');if(kf&&!kf.querySelector('.kc-ig'))kf.insertAdjacentHTML('beforeend',`<li><a class="kc-ig" href="${IG}" target="_blank" rel="noopener">Instagram</a></li>`);
})();
/* ===== small flow fixes: fill your home city for you and put the cursor where you need it next ===== */
(()=>{
  const $=s=>document.querySelector(s);
  const home=()=>{let w={},f={};try{w=JSON.parse(localStorage.getItem('bg_wiz')||'{}')}catch(_){}try{f=JSON.parse(localStorage.getItem('bg_finder')||'{}')}catch(_){}
    return String(w.from||($('#p-from')||{}).value||f.from||'').trim()};
  const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
  const focus=el=>{if(el&&el.offsetParent){el.focus({preventScroll:true});el.scrollIntoView({block:'center',behavior:'smooth'})}};
  /* Tickets on a place card: the "From" box gets your home city, and the cursor goes to the next empty box */
  document.addEventListener('click',e=>{if(!e.target.closest('#x-list [data-tk],.kc-guide-tk'))return;setTimeout(()=>{const f=$('#t-from'),t=$('#t-to'),d=$('#t-date');if(!f||!t)return;
    const h=home();if(!f.value.trim()&&h&&h.toLowerCase()!==t.value.trim().toLowerCase())set(f,h);
    focus(!f.value.trim()?f:!d.value?d:null)},80)});
  /* "Open plan" after adding a place: show the form where the place went, fill your home city */
  document.addEventListener('click',e=>{const b=e.target.closest('.toast button');if(!b||!/Open plan/i.test(b.textContent))return;setTimeout(()=>{const to=$('#p-to');
    if(to&&!to.offsetParent){const k=$('#m-know');if(k)k.click()}const f=$('#p-from'),h=home();if(f&&!f.value.trim()&&h)set(f,h);
    setTimeout(()=>focus(f&&!f.value.trim()?f:$('#p-days')&&!$('#p-days').value?$('#p-days'):to),250)},60)});
  /* On the way: picking a town from the list moves on, like the other boxes */
  const next={'ow-from':'#ow-to','ow-to':'#ow-go'};
  Object.keys(next).forEach(id=>{const el=document.getElementById(id);if(!el)return;el.setAttribute('enterkeyhint','next');
    el.addEventListener('input',e=>{if(e.inputType==='insertReplacementText'||e.inputType===undefined&&e.isTrusted){const dl=el.list;if(dl&&[...dl.options].some(o=>o.value===el.value))setTimeout(()=>focus($(next[id])),40)}});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'&&el.value.trim()){e.preventDefault();const n=$(next[id]);if(n.tagName==='BUTTON')n.click();else focus(n)}})});
  const ow=$('#ow-from');if(ow&&!ow.value.trim()){const h=home();if(h)ow.placeholder='e.g. '+h}
})();
/* ===== dates: no picking a day that has already gone ===== */
(()=>{const d=new Date(),t=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  ['#t-date','#s-in','#p-start','#w-start'].forEach(s=>{const el=document.querySelector(s);if(!el)return;el.min=t;if(el.value&&el.value<t){el.value=t;el.dispatchEvent(new Event('change',{bubbles:true}))}});
  document.addEventListener('focusin',e=>{const el=e.target;if(el&&el.classList&&el.classList.contains('kc-cal-d'))el.min=t});
})();
