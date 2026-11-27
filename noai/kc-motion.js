/* ===== MOTION: sliding tab highlight, fresh-plan and list animations ===== */
(()=>{
  const RM=matchMedia('(prefers-reduced-motion: reduce)');
  /* 1. tab highlight slides to the chosen tab */
  const nav=document.querySelector('nav.tabs');
  if(nav){const ind=document.createElement('i');ind.className='kc-ind';ind.setAttribute('aria-hidden','true');nav.appendChild(ind);
    const place=()=>{const b=nav.querySelector('button[aria-selected="true"]');
      if(!b||!b.offsetParent){nav.classList.remove('kc-ind-on');return}
      ind.style.width=b.offsetWidth+'px';ind.style.height=b.offsetHeight+'px';ind.style.transform=`translate(${b.offsetLeft}px,${b.offsetTop}px)`;nav.classList.add('kc-ind-on')};
    place();requestAnimationFrame(()=>{place();requestAnimationFrame(()=>nav.classList.add('kc-ind-anim'))});
    new MutationObserver(place).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-selected','hidden']});
    if(window.ResizeObserver)new ResizeObserver(place).observe(nav);
    addEventListener('resize',place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place)}
  /* 2. a new plan arrives card by card (not when you only change a stay) */
  const out=document.querySelector('#p-out');let sig='';
  if(out)new MutationObserver(()=>{const h=out.querySelector('h3'),n=out.querySelectorAll('.day').length;const s=(h?h.textContent:'')+'|'+n;
    if(n&&s!==sig&&!RM.matches){out.classList.add('kc-fresh');clearTimeout(out._kc);out._kc=setTimeout(()=>out.classList.remove('kc-fresh'),1400)}sig=n?s:sig}).observe(out,{childList:true});
  /* 3. places list: fade on a new filter, rise for "show more" cards, calm while typing */
  const xl=document.querySelector('#x-list');let first=xl&&xl.firstElementChild;
  if(xl)new MutationObserver(ms=>{if(RM.matches||document.documentElement.classList.contains('kc-typing')){first=xl.firstElementChild;return}
    if(xl.firstElementChild!==first){first=xl.firstElementChild;xl.classList.remove('kc-swap');void xl.offsetWidth;xl.classList.add('kc-swap');clearTimeout(xl._kc);xl._kc=setTimeout(()=>xl.classList.remove('kc-swap'),500)}
    else ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)n.classList.add('kc-new')}))}).observe(xl,{childList:true});
  const q=document.querySelector('#x-q');
  if(q){q.addEventListener('focus',()=>document.documentElement.classList.add('kc-typing'));q.addEventListener('blur',()=>document.documentElement.classList.remove('kc-typing'))}
})();
