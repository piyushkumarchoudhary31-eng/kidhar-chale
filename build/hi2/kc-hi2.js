/* ===== Hindi for text with numbers in it ("360 places", "5 days"…) ===== */
(()=>{
  const RE=[[/^([\d,]+) places$/,'$1 जगहें'],[/^1 place$/,'1 जगह'],[/^(\d+) days$/,'$1 दिन'],[/^Show more places \((\d+) left\)$/,'और जगहें दिखाएँ ($1 बाकी)'],[/^(\d+) of (\d+) packed$/,'$2 में से $1 पैक'],
    [/^💸 Trips under (₹[\d,]+)$/,'💸 $1 से कम की ट्रिप्स'],[/^Show trips under (₹[\d,]+)$/,'$1 से कम की ट्रिप्स दिखाएँ'],[/^Step (\d) of (\d)$/,'चरण $1 / $2'],[/^Spoken in: (.*)$/,'बोली जाती है: $1'],
    [/^Your trip: (.*)$/,'आपकी ट्रिप: $1'],[/^For your trip: (.*) in (.*)$/,'आपकी ट्रिप के लिए: $1 ($2)'],[/^(\d+) Underrated$/,'$1 कम मशहूर'],[/^Great in (\w+)$/,'$1 में बढ़िया'],[/^Skip in (\w+)$/,'$1 में न जाएँ']];
  const done=new Map();
  window.kcHiRe=root=>{const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){const pe=n.parentElement;if(!pe||pe.closest('script,style,.kc-lang'))continue;const t=n.nodeValue.trim();if(!t||t.length>80)continue;
      for(const [re,rep] of RE){if(re.test(t)){if(!done.has(n))done.set(n,n.nodeValue);n.nodeValue=n.nodeValue.replace(t,t.replace(re,rep));break}}}};
  const isHi=()=>document.documentElement.lang==='hi';
  let pend=false;new MutationObserver(()=>{if(!isHi()||pend)return;pend=true;requestAnimationFrame(()=>{pend=false;kcHiRe(document.body)})}).observe(document.body,{childList:true,subtree:true});
  const lb=document.querySelector('.kc-lang');if(lb)lb.addEventListener('click',()=>{if(isHi())kcHiRe(document.body);else{done.forEach((v,n)=>{if(n.isConnected)n.nodeValue=v});done.clear()}});
  if(isHi())kcHiRe(document.body);
})();
