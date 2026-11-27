/* ===== suggestions stay visible above the phone keyboard ===== */
(()=>{
  const coarse=matchMedia('(pointer:coarse)');
  const fit=inp=>{const box=document.getElementById(inp.id+'-ac');if(!box)return;
    const vv=window.visualViewport,bottom=vv?vv.offsetTop+vv.height:innerHeight,top=vv?vv.offsetTop:0;
    const nav=document.querySelector('nav.tabs'),nr=nav&&nav.offsetParent?nav.getBoundingClientRect():null;
    const floor=nr&&nr.top<bottom&&nr.top>innerHeight/2?Math.min(bottom,nr.top):bottom;
    const r=inp.getBoundingClientRect(),below=floor-r.bottom-10,above=r.top-top-10;
    const up=below<170&&above>below;box.classList.toggle('kc-up',up);
    box.style.maxHeight=Math.max(110,Math.min(300,up?above:below))+'px'};
  document.addEventListener('focusin',e=>{const inp=e.target;if(!inp.matches||!inp.matches('input[role="combobox"]'))return;
    fit(inp);if(!coarse.matches)return;
    /* give the keyboard a moment, then lift the field so there is room for suggestions */
    setTimeout(()=>{if(document.activeElement!==inp)return;const vv=window.visualViewport,r=inp.getBoundingClientRect(),room=(vv?vv.height:innerHeight);
      if(r.top>room*0.35){window.scrollBy({top:r.top-Math.max(70,room*0.12),behavior:'smooth'})}setTimeout(()=>fit(inp),380)},320)});
  document.addEventListener('input',e=>{const t=e.target;if(t.matches&&t.matches('input[role="combobox"]'))fit(t)},true);
  if(window.visualViewport){const re=()=>{const a=document.activeElement;if(a&&a.matches&&a.matches('input[role="combobox"]'))fit(a)};visualViewport.addEventListener('resize',re);visualViewport.addEventListener('scroll',re)}
})();
