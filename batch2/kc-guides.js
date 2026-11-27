/* ===== GUIDES: links to the place guides, student savings, passes and About ===== */
(()=>{
  const L=[['places/','🗺 All 1,000 place guides'],['student-savings.html','🎓 Student savings'],['passes-and-permits.html','🏔 Passes and permits'],['about.html','👋 About']];
  const fun=document.querySelector('#v-fun');
  if(fun&&!fun.querySelector('.kc-guides')){const c=document.createElement('div');c.className='card kc-guides';
    c.innerHTML='<h2>📚 Guides</h2><p class="sub">Read before you go: real student discounts, when the mountain passes open, and a guide for every place.</p><div class="kc-glinks">'+L.slice(0,3).map(([h,t])=>`<a href="${h}">${t}</a>`).join('')+'</div>';
    const first=fun.firstElementChild;first?first.after(c):fun.prepend(c)}
  const leg=document.querySelector('footer.foot .kc-legal');
  if(leg&&!leg.querySelector('.kc-glink'))leg.insertAdjacentHTML('afterbegin',L.map(([h,t])=>`<a class="kc-glink" href="${h}">${t.replace(/^\S+\s/,'')}</a>`).join(' · ')+' · ');
  const kf=document.querySelector('.kc-footer');
  if(kf&&!kf.querySelector('.kc-gcol')){const d=document.createElement('div');d.className='kc-gcol';d.innerHTML='<h4>Guides</h4><ul>'+L.map(([h,t])=>`<li><a href="${h}">${t.replace(/^\S+\s/,'')}</a></li>`).join('')+'</ul>';kf.appendChild(d)}
  if(typeof HI==='object')Object.assign(HI,{'Guides':'गाइड','Read before you go: real student discounts, when the mountain passes open, and a guide for every place.':'जाने से पहले पढ़ें: छात्रों की असली छूट, पहाड़ी दर्रे कब खुलते हैं, और हर जगह की गाइड।','All 1,000 place guides':'सभी 1,000 जगहों की गाइड','Student savings':'छात्र बचत','Passes and permits':'दर्रे और परमिट','About':'हमारे बारे में','Trips under ₹5,000':'₹5,000 से कम की ट्रिप्स','Pick your city, budget and days. We show trips that fit, with real costs.':'अपना शहर, बजट और दिन चुनें। हम असली खर्च के साथ फिट होने वाली ट्रिप्स दिखाएँगे।','From':'कहाँ से','Budget per person':'प्रति व्यक्ति बजट','Days':'दिन','Share this trip':'यह ट्रिप शेयर करें','Friends open the full plan from the link. No app or sign-up needed.':'दोस्त लिंक से पूरा प्लान खोल सकते हैं। कोई ऐप या साइन-अप नहीं चाहिए।','Share trip link':'ट्रिप लिंक शेयर करें','Send on WhatsApp':'WhatsApp पर भेजें','Copy as text':'टेक्स्ट कॉपी करें','Full guide: sample budget, nearby places':'पूरी गाइड: अनुमानित बजट, आस-पास की जगहें'});
})();
