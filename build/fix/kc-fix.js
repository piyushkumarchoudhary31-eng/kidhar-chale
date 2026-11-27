/* ===== Instagram link in the footers ===== */
(()=>{const IG='https://www.instagram.com/piyush_choudhary_21/';
  const leg=document.querySelector('footer.foot .kc-legal');if(leg&&!leg.querySelector('.kc-ig'))leg.insertAdjacentHTML('beforeend',` · <a class="kc-ig" href="${IG}" target="_blank" rel="noopener">Instagram</a>`);
  const kf=document.querySelector('.kc-footer .kc-gcol ul');if(kf&&!kf.querySelector('.kc-ig'))kf.insertAdjacentHTML('beforeend',`<li><a class="kc-ig" href="${IG}" target="_blank" rel="noopener">Instagram</a></li>`);
})();
