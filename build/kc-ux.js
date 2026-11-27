/* ---------- UX ROUND (27 Nov 2026): fewer tabs, shorter form, less scrolling, Hindi, home, tour ---------- */
(function(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ld=(k,d)=>{try{const v=localStorage.getItem('bg_'+k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem('bg_'+k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const go=(v,el)=>{window.bgShow(v);if(el)setTimeout(()=>el.scrollIntoView({block:'start',behavior:'smooth'}),60)};

/* ===== 6. Five tabs: Explore · Plan · Book (Go + Stay) · Now · Tools (Money + Kit) ===== */
const vGo=$('#v-go'),vStay=$('#v-stay'),vMoney=$('#v-money'),vFun=$('#v-fun');
const bookStay=document.createElement('div');bookStay.id='book-stay';bookStay.className='stack';
[...vStay.children].forEach(c=>bookStay.appendChild(c));vGo.appendChild(bookStay);
const toolsMoney=document.createElement('div');toolsMoney.id='tools-money';toolsMoney.className='stack';
[...vMoney.children].forEach(c=>toolsMoney.appendChild(c));
const kitIntro=vFun.querySelector('.card');kitIntro.after(toolsMoney);
const jumpRow=(items)=>{const n=document.createElement('nav');n.className='jump kc-jump';n.setAttribute('aria-label','Jump to');
  n.innerHTML=items.map(([t,id])=>`<button type="button" data-to="${id}">${t}</button>`).join('');
  n.querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>{const t=document.getElementById(b.dataset.to);if(t){if(t.classList.contains('kc-fold'))t.classList.add('kc-open');t.scrollIntoView({block:'start',behavior:'smooth'})}});return n};
const goTop=vGo.querySelector('.card');goTop.querySelector('h2').after(jumpRow([['🎫 Tickets','v-go'],['🛏 Beds','book-stay']]));
const kitNav=kitIntro.querySelector('nav.jump');
if(kitNav){const a=document.createElement('a');a.href='#tools-money';a.textContent='💰 Money';kitNav.prepend(a)}
const kh=kitIntro.querySelector('h2');if(kh)kh.textContent='Tools';
const ks=kitIntro.querySelector('.sub');if(ks)ks.textContent='Trip money and split bills first, then tools for the road: packing, night-bus safety, fare check, phrases, passport stamps and more. Tap a tool to open it.';
const nav=$('nav.tabs');
nav.querySelector('[data-v=stay]').hidden=true;nav.querySelector('[data-v=money]').hidden=true;
const relabel=(v,t)=>{const b=nav.querySelector(`[data-v=${v}]`);if(!b)return;const tn=[...b.childNodes].reverse().find(n=>n.nodeType===3);if(tn)tn.nodeValue=t};
relabel('go','Book');relabel('fun','Tools');
nav.classList.add('kc-five');
/* anything that still opens Stay or Money lands in the right new place */
const redirect=()=>{if(!vStay.hidden){vStay.hidden=true;go('go',bookStay)}if(!vMoney.hidden){vMoney.hidden=true;go('fun',toolsMoney)}};
new MutationObserver(redirect).observe(vStay,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(redirect).observe(vMoney,{attributes:true,attributeFilter:['hidden']});
const H=location.hash.slice(1);if(H==='stay')go('go',bookStay);if(H==='money')go('fun',toolsMoney);

/* ===== which tab is open (for the slim header and other tweaks) ===== */
const views=['explore','plan','go','city','fun'];
const mark=()=>{const v=views.find(x=>{const e=$('#v-'+x);return e&&!e.hidden})||'plan';document.body.dataset.kcTab=v;if(v==='fun')autoDay()};
views.forEach(x=>{const e=$('#v-'+x);if(e)new MutationObserver(mark).observe(e,{attributes:true,attributeFilter:['hidden']})});

/* ===== 3. The big ticket only on Plan; a slim strip elsewhere (tap it to open Plan) ===== */
const pass=$('#pass');if(pass){pass.addEventListener('click',()=>{if(document.body.dataset.kcTab!=='plan')window.bgShow('plan')});pass.title='Your trip'}

/* ===== 2. Plan form: the basics first, the rest under "More options", button always in reach ===== */
const form=$('#p-form');
if(form){const keep=['p-move','p-night','p-sleep','p-extra'].map(id=>{const e=$('#'+id);return e?(e.closest('label')&&id!=='p-move'&&id!=='p-sleep'?e.closest('label'):e):null}).filter(Boolean);
  const det=document.createElement('details');det.className='kc-more';det.innerHTML='<summary><b>More options</b> <span id="kc-more-sum"></span></summary><div class="stack" style="gap:12px;margin-top:10px"></div>';
  keep[0].before(det);keep.forEach(e=>det.lastElementChild.appendChild(e));
  const sum=()=>{const m=$$('#p-move .opt[aria-pressed="true"]').map(b=>b.textContent.replace(/^\W+/,'').trim());const sl=$$('#p-sleep .opt[aria-pressed="true"]').map(b=>b.textContent.replace(/^\W+/,'').trim());
    $('#kc-more-sum').textContent='· '+(m.length?m.slice(0,2).join(', ')+(m.length>2?' +'+(m.length-2):''):'no travel picked')+' · '+(sl.length?sl.slice(0,2).join(', ')+(sl.length>2?' +'+(sl.length-2):''):'no stay picked')+($('#p-night')&&$('#p-night').checked?' · overnight OK':'')};
  sum();det.addEventListener('click',()=>setTimeout(sum,30));det.addEventListener('change',sum);
  const err=$('#p-err');if(err)new MutationObserver(()=>{if(!err.hidden&&/Pick at least/.test(err.textContent))det.open=true}).observe(err,{attributes:true,childList:true,characterData:true,subtree:true});
  $('#p-go').classList.add('kc-sticky')}

/* ===== 1. honest timing on Pick for me ===== */
$$('#wiz .dayhead .sub').forEach(e=>{if(/20 sec/.test(e.textContent))e.textContent='⚡ 4 quick questions'});

/* ===== 4. Explore: search first ===== */
const xq=$('#x-q');if(xq){const card=xq.closest('.card'),row=xq.closest('.row'),quick=card.querySelector('.quick'),h=card.querySelector('h2');
  h.after(row);row.after(quick);xq.placeholder='Place or state, e.g. Spiti';}

/* ===== 8. Plan: jump to a day ===== */
const out=$('#p-out');
const dayChips=()=>{if(!out)return;const days=[...out.querySelectorAll('.card.day')];const old=out.querySelector('.kc-days');
  if(days.length<2){if(old)old.remove();return}if(old&&old.dataset.n==days.length)return;if(old)old.remove();
  const n=document.createElement('nav');n.className='kc-days';n.dataset.n=days.length;n.setAttribute('aria-label','Jump to a day');
  n.innerHTML=days.map((d,i)=>{d.id='kc-day-'+(i+1);const e=d.querySelector('.eyebrow');return`<button type="button" data-d="${i+1}">${esc(e?e.textContent:'Day '+(i+1))}</button>`}).join('');
  n.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const t=document.getElementById('kc-day-'+b.dataset.d);const y=t.getBoundingClientRect().top+scrollY-64;scrollTo({top:y,behavior:'smooth'})});
  days[0].before(n)};
if(out){new MutationObserver(()=>{dayChips();remember()}).observe(out,{childList:true});dayChips()}

/* ===== 9. Money: work out "today is day ___" from the trip start date ===== */
function autoDay(){const st=($('#p-start')&&$('#p-start').value)||((ld('wiz',{})||{}).start)||'';const md=$('#m-day'),mdays=$('#m-days');if(!st||!md)return;
  const d0=new Date(st+'T00:00'),now=new Date();now.setHours(0,0,0,0);const n=Math.floor((now-d0)/864e5)+1;const tot=+mdays.value||0;
  let note=$('#kc-daynote');if(!note){note=document.createElement('p');note.id='kc-daynote';note.className='sub';note.style.fontSize='12.5px';md.closest('.row').after(note)}
  if(n>=1&&(!tot||n<=tot)){if(+md.value!==n){md.value=n;md.dispatchEvent(new Event('input'))}note.textContent=`Day ${n} worked out from your trip start date (${d0.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}). Change it if needed.`}
  else if(n<1)note.textContent=`Your trip starts ${d0.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}. Plan your daily budget below.`;else note.textContent=''}

/* ===== 10. Tools: each tool opens like a drawer ===== */
const folds=[...vFun.children].filter(c=>c.classList&&c.classList.contains('card')&&c!==kitIntro&&c.querySelector(':scope > h3'));
folds.forEach((c,i)=>{c.classList.add('kc-fold');const h=c.querySelector(':scope > h3');h.setAttribute('role','button');h.tabIndex=0;h.setAttribute('aria-expanded','false');
  const t=()=>{c.classList.toggle('kc-open');h.setAttribute('aria-expanded',c.classList.contains('kc-open'))};h.addEventListener('click',t);h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}})});
vFun.addEventListener('click',e=>{const a=e.target.closest('nav.jump a[href^="#"]');if(!a)return;const t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();if(t.classList.contains('kc-fold')){t.classList.add('kc-open');const h=t.querySelector(':scope > h3');if(h)h.setAttribute('aria-expanded','true')}t.scrollIntoView({block:'start',behavior:'smooth'})});

/* ===== 12. Home: continue your trip, recently viewed, my trips ===== */
const vPlan=$('#v-plan');const home=document.createElement('div');home.id='kc-home';home.className='stack';home.style.gap='10px';vPlan.prepend(home);
function addRecent(n){if(!n)return;let r=ld('recent',[]).filter(x=>x!==n);r.unshift(n);sv('recent',r.slice(0,8));drawHome()}
document.addEventListener('click',e=>{const b=e.target.closest('#x-list [data-add],#x-list [data-sh],#x-list [data-tk],#wk-out [data-plan],.idea [data-plan]');if(!b)return;const card=b.closest('article,.card,.idea');const h=card&&card.querySelector('h3');if(h)addRecent(h.textContent.trim())},true);
function remember(){const p=window.bgCurrentPlan&&window.bgCurrentPlan();if(!p||!p.days||p.example||!p.title)return;let T=ld('mytrips',[]);if(T[0]&&T[0].title===p.title&&T[0].n===p.days.length)return;
  T=T.filter(x=>x.title!==p.title);T.unshift({title:p.title,n:p.days.length,at:Date.now(),plan:p});sv('mytrips',T.slice(0,5));drawHome();try{window.dispatchEvent(new CustomEvent('kc:plan',{detail:{trip:String(p.title).slice(0,90),days:p.days.length,budget:p.meta&&+p.meta.budget||0}}))}catch(e){}
  /* a new plan also sets up Money: its budget and number of days */
  const mb=$('#m-budget'),md=$('#m-days');if(p.meta&&p.meta.budget&&mb&&md){mb.value=p.meta.budget;md.value=p.days.length;mb.dispatchEvent(new Event('input'));md.dispatchEvent(new Event('input'))}}
function drawHome(){const T=ld('mytrips',[]),R=ld('recent',[]);if(!T.length&&!R.length){home.innerHTML='';return}
  const cur=window.bgCurrentPlan&&window.bgCurrentPlan();
  home.innerHTML=`<div class="card kc-home"><div class="dayhead"><h3>Welcome back</h3><button class="ghost small" type="button" id="kc-home-x">Hide</button></div>
   ${T.length?`<p class="eyebrow">My trips</p><div class="kc-trips">${T.map((t,i)=>`<button type="button" class="kc-trip" data-t="${i}"><b>${esc(t.title)}</b><small>${t.n} day${t.n>1?'s':''}${cur&&cur.title===t.title?' · open now':''}</small></button>`).join('')}</div>`:''}
   ${R.length?`<p class="eyebrow">Recently viewed</p><div class="quick">${R.map(n=>`<button type="button" data-r="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}</div>`;
  home.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=ld('mytrips',[])[+b.dataset.t];if(t&&window.bgRenderPlan){window.bgRenderPlan(t.plan);setTimeout(()=>$('#p-out').scrollIntoView({block:'start',behavior:'smooth'}),60)}});
  home.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{window.bgShow('explore');const x=$('#x-q');if(x){x.value=b.dataset.r;x.dispatchEvent(new Event('input'))}});
  const hx=$('#kc-home-x');if(hx)hx.onclick=()=>{home.hidden=true}}
drawHome();remember();

/* ===== 13. First visit: a 3-card tour ===== */
const welcome=$('#welcome');
if(!ld('toured',false)){const ov=document.createElement('div');ov.className='kc-tour';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Quick tour');
  const S=[['🧭','Pick a place','Not sure where to go? Tap <b>✨ Pick for me</b> and answer 4 quick questions, or browse 680+ places in <b>Explore</b>.'],
    ['🗺','Get a day-by-day plan','Tell us where, days and budget. You get buses, beds, food and costs for every day, with no backtracking.'],
    ['🎒','Book, go, and track money','<b>Book</b> opens ticket and bed sites already searched. <b>Now</b> shows what’s open near you. <b>Tools</b> tracks spends and splits bills.']];
  let k=0;const draw=()=>{const [e,t,d]=S[k];ov.innerHTML=`<div class="kc-tour-card"><div class="kc-tour-e" aria-hidden="true">${e}</div><p class="eyebrow">${k+1} of 3</p><h2>${t}</h2><p>${d}</p>
    <div class="kc-dots">${S.map((_,i)=>`<i class="${i===k?'on':''}"></i>`).join('')}</div>
    <div class="row" style="gap:8px"><button type="button" class="ghost" id="kc-skip">Skip</button><button type="button" class="primary" id="kc-next">${k<2?'Next →':'Let’s go 🎒'}</button></div></div>`;
    $('#kc-skip').onclick=end;$('#kc-next').onclick=()=>{if(k<2){k++;draw()}else end()}};
  const end=()=>{sv('toured',true);sv('hideWelcome',true);ov.remove();if(welcome)welcome.hidden=true};
  document.body.appendChild(ov);draw();if(welcome)welcome.hidden=true}
else{sv('hideWelcome',true);if(welcome)welcome.hidden=true}

/* ===== 11. Hindi switch (menus, buttons and headings; place details stay in English) ===== */
const HI={"Free trip planner for India · no ads · no sign-up":"भारत के लिए फ्री ट्रिप प्लानर · कोई विज्ञापन नहीं · कोई साइन-अप नहीं","Plan a budget trip in seconds":"सेकंडों में बजट ट्रिप प्लान करें","Buses, trains, beds and food, day by day, with what it really costs. Don't know where to go? Let us pick.":"बस, ट्रेन, बेड और खाना, दिन-ब-दिन, असली खर्च के साथ। पता नहीं कहाँ जाएँ? हम चुन देंगे।","Trending budget trips":"ट्रेंडिंग बजट ट्रिप्स","Tap one to get the full day-by-day plan.":"किसी पर टैप करें और पूरा दिन-ब-दिन प्लान पाएँ।","Explore by what you love":"जो पसंद है, वहीं से खोजें","443 places in India and 244 abroad, with when to go and the cheapest way there.":"भारत में 443 और विदेश में 244 जगहें, कब जाएँ और सबसे सस्ता रास्ता भी।","How it works":"यह कैसे काम करता है","Tell it":"बताइए","where you start, where you want to go, days and budget.":"कहाँ से शुरू, कहाँ जाना है, कितने दिन और कितना बजट।","Get a plan":"प्लान पाइए","with no backtracking: buses and trains, beds and food, day by day.":"बिना उल्टा लौटे: बस और ट्रेन, बेड और खाना, दिन-ब-दिन।","Book and go.":"बुक करें और निकलें।","Ticket sites open already searched, and Money tracks what you spend.":"टिकट साइटें पहले से सर्च होकर खुलती हैं, और Money आपका खर्च गिनता है।","Book and go":"बुक करें और चलें","Help":"मदद","Places":"जगहें","Weekend trips":"वीकेंड ट्रिप्स","States":"राज्य","Buses, trains, flights":"बस, ट्रेन, फ्लाइट","Right now near me":"अभी मेरे आस-पास","Money and split":"पैसे और बँटवारा","Plan a trip":"ट्रिप प्लान करें","Pick for me":"मेरे लिए चुनो","See an example":"एक उदाहरण देखें","Keyboard: 1–5 tabs, / search":"कीबोर्ड: 1–5 टैब, / खोज","Travel more, spend less. A free planner for students and budget travellers. Everything stays in your browser.":"ज़्यादा घूमें, कम खर्च करें। छात्रों और बजट यात्रियों के लिए फ्री प्लानर। सब कुछ आपके ब्राउज़र में ही रहता है।",'Explore':'खोजें','Plan':'प्लान','Book':'बुकिंग','Now':'अभी','Tools':'टूल्स','Go':'बुकिंग','Kit':'टूल्स',
'📍 Places':'📍 जगहें','🚗 Weekend':'🚗 वीकेंड','🗺 Map':'🗺 नक्शा','🏛 States':'🏛 राज्य',
"✨ Not sure where to go? Answer 4 questions and we'll pick":'✨ पता नहीं कहाँ जाएँ? 4 सवालों के जवाब दें, हम चुन देंगे',
'Search':'खोजें','Region':'इलाका','💸 Cheapest only':'💸 सिर्फ़ सबसे सस्ते','🎲 Surprise me':'🎲 कुछ भी दिखाओ','Clear filters':'फ़िल्टर हटाएँ',
'🎉 Festivals & fairs':'🎉 त्योहार और मेले','Travel by state':'राज्य के हिसाब से घूमें','🚗 Weekend trips from my city':'🚗 मेरे शहर से वीकेंड ट्रिप','My city':'मेरा शहर','📍 Near me':'📍 मेरे पास',
'Up to 150 km':'150 किमी तक','Up to 300 km':'300 किमी तक','Up to 500 km':'500 किमी तक','📅 Long weekends in 2027':'📅 2027 के लंबे वीकेंड','Ideas':'आइडिया',
'🗺 Map of all places':'🗺 सभी जगहों का नक्शा','🗓 Good this month':'🗓 इस महीने अच्छा','📍 Show me':'📍 मुझे दिखाओ',
'✨ Pick for me':'✨ मेरे लिए चुनो','📍 I know where':'📍 मुझे पता है कहाँ','Where are you starting from?':'आप कहाँ से शुरू कर रहे हैं?','Starting city':'शुरुआती शहर',
'How many days do you have?':'आपके पास कितने दिन हैं?','Weekend · 2':'वीकेंड · 2','A week · 7':'एक हफ़्ता · 7','Leaving on':'निकलने की तारीख',
'How much can you spend?':'आप कितना खर्च कर सकते हैं?','Budget per person (₹)':'प्रति व्यक्ति बजट (₹)','₹1 lakh':'₹1 लाख','What kind of place?':'कैसी जगह चाहिए?',
'🤷 Idk, you choose. Surprise me':'🤷 पता नहीं, आप ही चुनो','Your trip drops 🔥':'आपकी ट्रिप तैयार 🔥','Change answers':'जवाब बदलें','🔄 Show different ideas':'🔄 और आइडिया दिखाओ',
'← Back':'← पीछे','Next →':'आगे →','⚡ 4 quick questions':'⚡ 4 छोटे सवाल','Plan a trip':'ट्रिप प्लान करें','Starting from':'कहाँ से',
'Places to see, in the order you want to go (comma between)':'घूमने की जगहें, जिस क्रम में जाना है (बीच में कॉमा)','Days':'दिन','Total budget per person (₹)':'प्रति व्यक्ति कुल बजट (₹)',
'People':'लोग','Start date':'शुरू होने की तारीख','More options':'और विकल्प','How do you like to travel?':'आप कैसे सफ़र करना पसंद करते हैं?','Tap all you\'re happy with':'जो भी ठीक लगे, सब चुनें',
'🚌 Govt bus':'🚌 सरकारी बस','🛏 Sleeper / Volvo bus':'🛏 स्लीपर / वोल्वो बस','🚆 Train (sleeper)':'🚆 ट्रेन (स्लीपर)','❄️ AC train':'❄️ एसी ट्रेन','🚙 Shared jeep / taxi':'🚙 शेयर्ड जीप / टैक्सी',
'🛵 Rent a scooter':'🛵 किराए की स्कूटी','✈️ Flight if it saves a day':'✈️ फ़्लाइट, अगर एक दिन बचे','Where do you like to sleep?':'आप कहाँ रुकना पसंद करते हैं?',
'🛏 Dorm bed':'🛏 डॉर्म बेड','🔑 Hostel private room':'🔑 हॉस्टल का प्राइवेट कमरा','🏨 Budget hotel':'🏨 बजट होटल','🏡 Homestay':'🏡 होमस्टे','🛕 Dharamshala / ashram':'🛕 धर्मशाला / आश्रम','⛺ Camp / tent':'⛺ कैंप / टेंट',
'Anything else? (food, pace, must-sees)':'और कुछ? (खाना, रफ़्तार, ज़रूर देखना)','Make my plan':'मेरा प्लान बनाओ','See an example':'एक उदाहरण देखें','Your itinerary':'आपका सफ़रनामा',
'Book buses, trains, flights':'बस, ट्रेन, फ़्लाइट बुक करें','From':'कहाँ से','To':'कहाँ तक','Date':'तारीख','⇅ Swap':'⇅ बदलें','Cheapest-ticket rules for India':'भारत में सबसे सस्ते टिकट के नियम',
'🛣 On the way':'🛣 रास्ते में','🏍 Bike':'🏍 बाइक','🚗 Car':'🚗 कार','Show stops on the way':'रास्ते के पड़ाव दिखाओ','🚆 Train helpers':'🚆 ट्रेन मदद','🏞 Journeys worth taking just for the view':'🏞 नज़ारों के लिए खास सफ़र',
'🎫 Tickets':'🎫 टिकट','🛏 Beds':'🛏 बिस्तर','Find the cheapest bed':'सबसे सस्ता बिस्तर ढूँढें','City or area':'शहर या इलाका','Max per night (₹)':'एक रात की अधिकतम कीमत (₹)',
'What should a bed cost here?':'यहाँ बिस्तर कितने का होना चाहिए?','Show typical prices':'आम कीमतें दिखाओ','⏰ Right now':'⏰ अभी','📍 Use my location':'📍 मेरी लोकेशन लो','Or pick a city':'या शहर चुनें',
'🆘 Find help near me':'🆘 पास में मदद ढूँढें','City cheat sheets':'शहर की चीट शीट','Any other place':'कोई और जगह','Place':'जगह','Show info':'जानकारी दिखाओ','Emergency in India':'भारत में इमरजेंसी',
'Tools':'टूल्स','💰 Money':'💰 पैसा','Trip money':'ट्रिप का पैसा','Trip budget (₹)':'ट्रिप बजट (₹)','Trip days':'ट्रिप के दिन','Today is day':'आज कौन सा दिन है','You can spend today':'आज आप खर्च कर सकते हैं',
'Amount (₹)':'रकम (₹)','For':'किस पर','Add spend':'खर्च जोड़ें','Split with friends':'दोस्तों में बाँटें','Who\'s in the group (comma separated)':'ग्रुप में कौन है (कॉमा लगाकर)','Paid by':'किसने दिया',
'For what':'किस लिए','Add shared expense':'साझा खर्च जोड़ें','💸 Ways to pay less at sights':'💸 टिकट पर कम पैसे देने के तरीके','🎒 Packing list':'🎒 पैकिंग लिस्ट','Untick everything':'सब हटाएँ',
'Before you leave the house':'घर से निकलने से पहले','🛡 Night-bus safety':'🛡 रात की बस में सुरक्षा','Copy message':'मैसेज कॉपी करें','🛺 Is this fare fair?':'🛺 क्या ये किराया सही है?',
'City':'शहर','Ride':'सवारी','Distance (km)':'दूरी (किमी)','They asked (₹)':'उन्होंने माँगा (₹)','🗣 Survival phrases':'🗣 काम के वाक्य','Language':'भाषा','🛂 Trip passport':'🛂 ट्रिप पासपोर्ट',
'Place you reached':'जहाँ पहुँचे','Stamp it':'मुहर लगाओ','🔥 Today\'s challenge':'🔥 आज का चैलेंज','I did it':'मैंने कर लिया','Give me another':'दूसरा दो','🌦 Where to go this month':'🌦 इस महीने कहाँ जाएँ',
'Month':'महीना','👥 Group trip':'👥 ग्रुप ट्रिप','Trip name':'ट्रिप का नाम','Who\'s coming (comma separated)':'कौन आ रहा है (कॉमा लगाकर)','Create trip':'ट्रिप बनाओ','Join':'जुड़ें','Update':'अपडेट करें',
'Add expense':'खर्च जोड़ें','🆘 My emergency card':'🆘 मेरा इमरजेंसी कार्ड','Your name':'आपका नाम','Blood group':'ब्लड ग्रुप','Emergency contact name':'इमरजेंसी संपर्क का नाम','Their phone':'उनका फ़ोन',
'Show my emergency card':'मेरा इमरजेंसी कार्ड दिखाओ','📵 Phone stolen or lost? Do this':'📵 फ़ोन चोरी या गुम? ये करें','🛺 Show this to the driver':'🛺 ड्राइवर को ये दिखाएँ','Address or place':'पता या जगह',
'Show it big':'बड़ा करके दिखाओ','🏔 Going high? Altitude sickness basics':'🏔 ऊँचाई पर जा रहे हैं? ऊँचाई की बीमारी की बातें','🧍‍♀️ Travelling solo or as a woman':'🧍‍♀️ अकेले या महिला यात्री',
'Welcome back':'फिर से स्वागत है','My trips':'मेरी ट्रिप्स','Recently viewed':'हाल में देखी गईं','Hide':'छिपाएँ','Hide ✕':'छिपाएँ ✕','Skip':'छोड़ें',
'Pick a place':'जगह चुनें','Get a day-by-day plan':'दिन-ब-दिन का प्लान पाएँ','Book, go, and track money':'बुक करें, जाएँ, और पैसे का हिसाब रखें','Let’s go 🎒':'चलो चलें 🎒',
'Show more places':'और जगहें दिखाओ','+ Add to my plan':'+ मेरे प्लान में जोड़ें','📋 Cheat sheet':'📋 चीट शीट','Best time':'सबसे अच्छा समय','Get there':'कैसे पहुँचें','Daily cost':'रोज़ का खर्च',
'Total per person':'प्रति व्यक्ति कुल','Your plan':'आपका प्लान','Example plan':'उदाहरण प्लान','Planning your trip':'आपकी ट्रिप प्लान हो रही है','Finding trips for you':'आपके लिए ट्रिप ढूँढ रहे हैं','Show quick ideas now':'अभी झटपट आइडिया दिखाओ'};
const PHI={'Place or state, e.g. Spiti':'जगह या राज्य, जैसे स्पीति','e.g. Jodhpur':'जैसे जोधपुर','e.g. Jaipur, Pushkar, Udaipur':'जैसे जयपुर, पुष्कर, उदयपुर','Delhi, Jodhpur, Mumbai…':'दिल्ली, जोधपुर, मुंबई…','Vegetarian, no early mornings, want one trek':'शाकाहारी, सुबह जल्दी नहीं, एक ट्रेक चाहिए'};
let lang=ld('uilang','en');const orig=new WeakMap(),origPh=new WeakMap();
function tr(root){if(lang!=='hi')return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){const pe=n.parentElement;if(!pe||pe.closest('script,style,.kc-lang'))continue;const raw=n.nodeValue,t=raw.trim();if(!t||!(t in HI))continue;if(!orig.has(n))orig.set(n,raw);n.nodeValue=raw.replace(t,HI[t])}
  (root.querySelectorAll?root:document).querySelectorAll('input[placeholder]').forEach(i=>{if(i.placeholder in PHI){if(!origPh.has(i))origPh.set(i,i.placeholder);i.placeholder=PHI[i.placeholder]}})}
function untr(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(orig.has(n)){n.nodeValue=orig.get(n);orig.delete(n)}}
  document.querySelectorAll('input[placeholder]').forEach(i=>{if(origPh.has(i)){i.placeholder=origPh.get(i);origPh.delete(i)}})}
let pend=false;new MutationObserver(()=>{if(lang!=='hi'||pend)return;pend=true;requestAnimationFrame(()=>{pend=false;tr(document.body)})}).observe(document.body,{childList:true,subtree:true,characterData:false});
const lb=document.createElement('button');lb.type='button';lb.className='kc-lang';
const setLb=()=>{lb.textContent=lang==='hi'?'EN':'हिंदी';lb.setAttribute('aria-label',lang==='hi'?'Switch to English':'हिंदी में देखें');document.documentElement.lang=lang==='hi'?'hi':'en'};
lb.onclick=()=>{lang=lang==='hi'?'en':'hi';sv('uilang',lang);if(lang==='hi')tr(document.body);else untr();setLb()};
const top=$('header.top')||$('header');if(top)top.appendChild(lb);setLb();if(lang==='hi')tr(document.body);


/* ---------- LAPTOP LAYOUT v2 (27 Nov), modelled on MakeMyTrip, ixigo, Booking, Airbnb, Skyscanner, Wanderlog, Google Travel:
   top menu bar, big search area, trending trips, plan with a summary fixed on the right, link footer.
   On phones every wrapper below is display:contents or hidden, so the phone layout is unchanged. ---------- */
(function(){
  const desk=window.matchMedia('(min-width:1024px)');
  const wrap=$('.wrap'),top=$('header.top'),nav=$('nav.tabs'),pass=$('#pass');
  /* 1. top bar: brand, tabs, trip chip, language */
  let side=$('.kc-side');
  if(wrap&&top&&nav&&!side){side=document.createElement('div');side.className='kc-side';wrap.prepend(side);side.append(top,nav)}
  const chip=document.createElement('button');chip.type='button';chip.className='kc-tripchip';chip.hidden=true;
  if(side&&!side.querySelector('.kc-tripchip')){nav.after(chip)}
  const goTab=v=>{const b=document.querySelector(`nav.tabs button[data-v="${v}"]`);if(b)b.click();else if(window.bgShow)window.bgShow(v);window.scrollTo(0,0)};
  chip.onclick=()=>goTab('plan');
  const drawChip=()=>{const a=($('#ps-a')||{}).textContent||'',b=($('#ps-b')||{}).textContent||'',c=($('#ps-cost')||{}).textContent||'',d=($('#ps-days')||{}).textContent||'';
    const has=/₹/.test(c);chip.hidden=!has;if(has)chip.innerHTML=`<span class="kc-tc-r">${esc(a)} → ${esc(b)}</span><span class="kc-tc-m">${esc(d.toLowerCase())} · ${esc(c.replace(/\s*\/\s*person/i,'').trim())}</span>`};
  if(pass){drawChip();new MutationObserver(drawChip).observe(pass,{subtree:true,childList:true,characterData:true})}
  /* 2. Plan: hero with headline + the ticket, search area inside it */
  const vp=$('#v-plan'),seg=vp&&vp.querySelector(':scope > .seg'),form=$('#p-form'),head=$('#p-head'),out=$('#p-out');
  if(vp&&seg&&form&&head&&out&&!$('#kc-hero')){
    const H=document.createElement('div');H.id='kc-hero';H.className='kc-col';
    H.innerHTML=`<div class="kc-hero-top"><div class="kc-hero-txt"><p class="kc-kick">Free trip planner for India · no ads · no sign-up</p><h1>Plan a budget trip in seconds</h1><p class="kc-hero-sub">Buses, trains, beds and food, day by day, with what it really costs. Don't know where to go? Let us pick.</p></div><div class="kc-hero-pass"></div></div>`;
    const A=document.createElement('div');A.id='kc-pa';A.className='kc-col';
    seg.before(H);H.append(A);A.append(seg,form);['wiz','welcome'].forEach(i=>{const e=document.getElementById(i);if(e)A.append(e)});
    const B=document.createElement('div');B.id='kc-pb';B.className='kc-col';H.after(B);B.append(head,out)}
  /* the ticket sits in the hero on laptops and goes back under the header on phones */
  const slot=$('.kc-hero-pass');
  const placePass=()=>{if(!pass||!slot||!side)return;if(desk.matches){if(pass.parentNode!==slot)slot.append(pass)}else if(pass.parentNode===slot){side.after(pass)}};
  placePass();desk.addEventListener?desk.addEventListener('change',placePass):desk.addListener(placePass);
  /* 3. below the search: trending trips, explore by type, how it works (shown while there is no plan) */
  const pb=$('#kc-pb');if(pb&&!$('#kc-empty')){
    const T=[['Delhi','Rishikesh',3,3000,'🏞','Ganga, cafés, rafting'],['Jaipur','Jodhpur, Jaisalmer',5,6000,'🏜','Forts and desert'],['Mumbai','Goa',4,5000,'🏖','Beaches on a budget'],['Kolkata','Darjeeling',5,7000,'🚂','Toy train and tea'],['Delhi','Manali',5,6000,'🏔','Snow and old Manali'],['Chennai','Puducherry',3,3000,'🌊','French quarter'],['Bengaluru','Coorg',3,3500,'☕','Coffee hills'],['Delhi','Amritsar',3,3000,'🕌','Golden Temple, Wagah']];
    const G=[['u','💎','Underrated'],['m','🏔','Mountains'],['b','🏖','Beaches'],['t','🥾','Treks'],['h','🏛','Heritage'],['p','🛕','Spiritual'],['d','🐪','Desert'],['f','🐅','Wildlife'],['k','🎒','Backpacker hubs'],['A','🌏','Abroad']];
    const E=document.createElement('div');E.id='kc-empty';E.className='stack';
    E.innerHTML=`<section class="kc-band"><div class="kc-band-h"><h2>Trending budget trips</h2><p class="sub">Tap one to get the full day-by-day plan.</p></div>
      <div class="kc-try">${T.map((t,i)=>`<button type="button" data-kctry="${i}"><span class="kc-try-e" aria-hidden="true">${t[4]}</span><span class="kc-try-t"><b>${t[0]} → ${t[1].replace(', ',' → ')}</b><small>${t[5]}</small></span><span class="kc-try-p">${t[2]} days<br><b>₹${t[3].toLocaleString('en-IN')}</b></span></button>`).join('')}</div></section>
      <section class="kc-band"><div class="kc-band-h"><h2>Explore by what you love</h2><p class="sub">443 places in India and 244 abroad, with when to go and the cheapest way there.</p></div>
      <div class="kc-types">${G.map(g=>`<button type="button" data-kcg="${g[0]}"><span aria-hidden="true">${g[1]}</span>${g[2]}</button>`).join('')}</div></section>
      <section class="kc-band"><div class="kc-band-h"><h2>How it works</h2></div>
      <ol class="kc-how"><li><span>1</span><b>Tell it</b> where you start, where you want to go, days and budget.</li><li><span>2</span><b>Get a plan</b> with no backtracking: buses and trains, beds and food, day by day.</li><li><span>3</span><b>Book and go.</b> Ticket sites open already searched, and Money tracks what you spend.</li></ol></section>`;
    pb.prepend(E);
    E.addEventListener('click',e=>{
      const b=e.target.closest('[data-kctry]');
      if(b){const t=T[+b.dataset.kctry];const k=$('#m-know');if(k)k.click();
        const s=(i,v)=>{const el=document.getElementById(i);if(!el)return;el.value=v;el.dispatchEvent(new Event('input'));el.dispatchEvent(new Event('change'))};
        s('p-from',t[0]);s('p-to',t[1]);s('p-days',t[2]);s('p-budget',t[3]);const g=$('#p-go');if(g)g.click();return}
      const g=e.target.closest('[data-kcg]');
      if(g){goTab('explore');const x=document.querySelector(`#x-genres button[data-g="${g.dataset.kcg}"]`);if(x)x.click();window.scrollTo(0,0)}})}
  /* no real plan yet (only the placeholder card): laptops show the trending trips instead */
  if(pb&&out){const t0=Date.now();let was=true;const np=()=>{const no=out.hidden||!out.querySelector('.day,.kc-days');pb.classList.toggle('kc-noplan',no);
      /* on laptops a fresh plan sits below the search box, so bring it into view (not on page load) */
      if(was&&!no&&desk.matches&&Date.now()-t0>1500&&!vp.hidden)requestAnimationFrame(()=>window.scrollTo({top:Math.max(0,head.getBoundingClientRect().top+window.scrollY-90),behavior:'smooth'}));
      was=no};np();new MutationObserver(np).observe(out,{childList:true,attributes:true,attributeFilter:['hidden']})}
  /* 4. when the quiz shows its ideas, show them side by side */
  const wz=$('#wiz'),wres=wz&&wz.querySelector('.wpane[data-s="5"]');
  if(wz&&wres&&vp){const sync=()=>vp.classList.toggle('kc-wres',!wz.hidden&&!wres.hidden);sync();
    new MutationObserver(sync).observe(wz,{attributes:true,subtree:true,attributeFilter:['hidden']})}
  /* 5. footer with link columns (laptop only) */
  const foot=$('footer.foot');if(foot&&!$('.kc-footer')){const F=document.createElement('div');F.className='kc-footer';
    const col=(h,items)=>`<div><h4>${h}</h4><ul>${items.map(([t,a])=>`<li><button type="button" data-kcf="${a}">${t}</button></li>`).join('')}</ul></div>`;
    F.innerHTML=`<div class="kc-f-brand"><p class="brand">Kidhar Chale<b>?</b></p><p class="sub">Travel more, spend less. A free planner for students and budget travellers. Everything stays in your browser.</p></div>`+
      col('Plan',[['Plan a trip','plan'],['Pick for me','pick'],['See an example','example']])+
      col('Explore',[['Places','x:0'],['Weekend trips','x:1'],['Map','x:2'],['States','x:3']])+
      col('Book and go',[['Buses, trains, flights','go'],['Right now near me','city'],['Money and split','fun']])+
      col('Help',[['हिंदी में देखें','lang'],['Keyboard: 1–5 tabs, / search','keys']]);
    foot.before(F);
    F.addEventListener('click',e=>{const b=e.target.closest('[data-kcf]');if(!b)return;const a=b.dataset.kcf;
      if(a==='pick'){goTab('plan');const m=$('#m-pick');if(m)m.click();return}
      if(a==='example'){goTab('plan');const x=$('#p-example');if(x)x.click();return}
      if(a==='lang'){const l=$('.kc-lang');if(l)l.click();return}
      if(a==='keys')return;
      if(a.startsWith('x:')){goTab('explore');const s=document.querySelectorAll('#v-explore > .seg button')[+a.slice(2)];if(s)s.click();return}
      goTab(a)})}
  /* 6. laptop keyboard: 1–5 switch tabs, / searches places */
  document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;if($('.kc-tour'))return;
    const vis=[...document.querySelectorAll('nav.tabs button')].filter(b=>b.offsetParent);
    if(/^[1-9]$/.test(e.key)&&vis[+e.key-1]){vis[+e.key-1].click();window.scrollTo(0,0);e.preventDefault()}
    else if(e.key==='/'){goTab('explore');const q=$('#x-q');if(q){q.focus();e.preventDefault()}}});
})();

/* ===== SEO, privacy, consent and analytics ===== */
(()=>{
  /* Put the Google Analytics 4 Measurement ID here, e.g. 'G-AB12CD34EF'. Empty = no analytics, no banner. */
  const GA_ID='';
  const BASE_T='Kidhar Chale? Free Budget Trip Planner for India';
  const TT={explore:'Explore 687 places · Kidhar Chale?',plan:BASE_T,go:'Book buses, trains and flights · Kidhar Chale?',stay:'Cheap stays and hostels · Kidhar Chale?',city:'City guides · Kidhar Chale?',money:'Money and split · Kidhar Chale?',fun:'Tools · Kidhar Chale?'};
  const ls={get(k){try{return localStorage.getItem('bg_'+k)}catch(e){return null}},set(k,v){try{localStorage.setItem('bg_'+k,v)}catch(e){}}};
  /* 1. page title follows the open tab */
  let lastTab='';
  const syncTitle=()=>{const b=document.querySelector('nav.tabs button[aria-selected="true"]');const v=b&&b.dataset.v||'plan';document.title=TT[v]||BASE_T;
    if(v!==lastTab){if(lastTab)track('page_view',{page_title:document.title,page_location:location.origin+location.pathname+'#'+v});lastTab=v}};
  const nav=document.querySelector('nav.tabs');if(nav)new MutationObserver(syncTitle).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  /* 2. analytics, only after a yes */
  let on=false;
  function track(n,p){try{if(on&&window.gtag)window.gtag('event',n,p||{})}catch(e){}}
  window.kcTrack=track;
  function loadGA(){if(on||!GA_ID)return;on=true;window['ga-disable-'+GA_ID]=false;
    if(!window.gtag){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
      gtag('js',new Date());const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s)}
    gtag('config',GA_ID,{page_title:document.title})}
  function stopGA(){on=false;if(GA_ID)window['ga-disable-'+GA_ID]=true;
    document.cookie.split(';').map(c=>c.split('=')[0].trim()).filter(n=>/^_ga/.test(n)).forEach(n=>{const d=location.hostname;document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.'+d.split('.').slice(-3).join('.')})}
  function banner(){if(!GA_ID||document.querySelector('.kc-consent'))return;const B=document.createElement('div');B.className='kc-consent';B.setAttribute('role','dialog');B.setAttribute('aria-label','Cookie choice');
    B.innerHTML='<p><b>Can we count visits?</b> <span>Google Analytics would tell us which features people use, so we can make Kidhar Chale better. Your plans, notes and spends never leave your phone.</span> <a href="privacy.html">Privacy</a></p><div><button type="button" data-c="no">No thanks</button><button type="button" data-c="yes">Allow</button></div>';
    B.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;ls.set('consent',b.dataset.c);b.dataset.c==='yes'?loadGA():stopGA();B.remove()});
    document.body.appendChild(B)}
  if(GA_ID){const c=ls.get('consent');if(c==='yes')loadGA();else if(c!=='no')banner()}
  /* 3. footer: privacy link and cookie settings (phone and laptop) */
  const foot=document.querySelector('footer.foot');
  if(foot&&!foot.querySelector('.kc-legal')){
    if(GA_ID){const first=foot.querySelector('p');if(first)first.innerHTML='<b>Kidhar Chale?</b> is made free for travellers. No ads, no sign-up. It runs on your phone: plans, spends and trips are saved only in this browser, and your name and notes never leave it. The weather asks Open-Meteo about a place, the map loads from OpenStreetMap, and if you allow it, Google Analytics counts visits.'}
    const L=document.createElement('p');L.className='kc-legal';L.innerHTML='<a href="privacy.html">Privacy and cookies</a> · <a href="terms.html">Terms of use</a>'+(GA_ID?' · <button type="button" class="kc-cset">Cookie settings</button>':'');
    foot.appendChild(L);const cs=L.querySelector('.kc-cset');if(cs)cs.addEventListener('click',()=>{ls.set('consent','');banner()})}
  /* 4. key actions worth counting */
  window.addEventListener('kc:plan',e=>track('plan_created',e.detail||{}));
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');
    if(a){let u;try{u=new URL(a.href,location.href)}catch(_){return}
      if(u.origin!==location.origin&&/^https?:/.test(u.protocol)){const host=u.hostname.replace(/^www\./,'');
        if(/wa\.me|whatsapp/.test(host))track('share',{method:'whatsapp'});
        else if(/redbus|irctc|indianrail|booking\.com|agoda|hostelworld|makemytrip|goibibo|skyscanner|ixigo|abhibus|rome2rio|couchsurfing|airbnb|zostel|cleartrip|payumoney|obms-tourist/.test(host))track('booking_click',{site:host,link_text:(a.textContent||'').trim().slice(0,60)});
        else track('outbound_click',{site:host})}}
    const b=e.target.closest('#x-list [data-add]');if(b){const h=b.closest('article,.card');track('place_added',{place:h&&h.querySelector('h3')?h.querySelector('h3').textContent.trim():''})}
    if(e.target.closest('.kc-lang'))track('language_switch')},true);
  if(navigator.share){const s=navigator.share.bind(navigator);try{navigator.share=d=>s(d).then(r=>{track('share',{method:'native'});return r})}catch(e){}}
  window.addEventListener('appinstalled',()=>track('app_installed'));
  Object.assign(HI,{'Can we count visits?':'क्या हम विज़िट गिन सकते हैं?','Google Analytics would tell us which features people use, so we can make Kidhar Chale better. Your plans, notes and spends never leave your phone.':'Google Analytics से हमें पता चलेगा कि लोग कौन-से फ़ीचर इस्तेमाल करते हैं, ताकि हम Kidhar Chale को बेहतर बना सकें। आपके प्लान, नोट्स और खर्च कभी आपके फ़ोन से बाहर नहीं जाते।','No thanks':'नहीं, धन्यवाद','Allow':'अनुमति दें','Privacy':'प्राइवेसी','Privacy and cookies':'प्राइवेसी और कुकीज़','Cookie settings':'कुकी सेटिंग्स','Terms of use':'उपयोग की शर्तें'});
  syncTitle();
})();

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

mark();
document.documentElement.classList.add('kc-ready');
})();
