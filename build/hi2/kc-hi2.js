/* ===== Hindi for text with numbers in it ("360 places", "5 days"…) ===== */
(()=>{
  const RE=[[/^([\d,]+) places$/,'$1 जगहें'],[/^1 place$/,'1 जगह'],[/^(\d+) days$/,'$1 दिन'],[/^Show more places \((\d+) left\)$/,'और जगहें दिखाएँ ($1 बाकी)'],[/^(\d+) of (\d+) packed$/,'$2 में से $1 पैक'],
    [/^💸 Trips under (₹[\d,]+)$/,'💸 $1 से कम की ट्रिप्स'],[/^Show trips under (₹[\d,]+)$/,'$1 से कम की ट्रिप्स दिखाएँ'],[/^Step (\d) of (\d)$/,'चरण $1 / $2'],[/^Spoken in: (.*)$/,'बोली जाती है: $1'],
    [/^Your trip: (.*)$/,'आपकी ट्रिप: $1'],[/^For your trip: (.*) in (.*)$/,'आपकी ट्रिप के लिए: $1 ($2)'],[/^(\d+) Underrated$/,'$1 कम मशहूर'],[/^Great in (\w+)$/,'$1 में बढ़िया'],[/^Skip in (\w+)$/,'$1 में न जाएँ'],[/^(.+) · IN (\d+) DAYS$/,'$1 · $2 दिन में'],[/^(.+) · TOMORROW!$/,'$1 · कल!'],[/^(\d+) DAYS?$/,'$1 दिन'],[/^(₹[\d,]+) \/ PERSON$/,'$1 / व्यक्ति'],[/^(\d+) days? · open now$/,'$1 दिन · अभी खोलें'],[/^(\d+) days? · (\d+) places?$/,'$1 दिन · $2 जगहें']];
  /* lines the trip rules add to every plan (they can be long) */
  const RIDE={'auto or shared auto':'ऑटो या शेयर्ड ऑटो','local bus or taxi':'लोकल बस या टैक्सी','cab or airport bus':'कैब या एयरपोर्ट बस','metro, bus or taxi':'मेट्रो, बस या टैक्सी','local bus, or a taxi if you have bags':'लोकल बस, या सामान ज़्यादा हो तो टैक्सी'};
  const rd=x=>RIDE[x]||x;
  const LONG=[[/^Reach (.+)\. Go by (.+?) and be there at least (1 hour|2 hours) before departure$/,(m,a,b,c)=>`${a} पहुँचें। ${rd(b)} से जाएँ और निकलने से कम से कम ${c==='1 hour'?'1 घंटा':'2 घंटे'} पहले वहाँ रहें`],
    [/^Drop point: (.+)\. Then (.+) to your stay or the town centre$/,(m,a,b)=>`उतरने की जगह: ${a}। फिर ${rd(b)} से अपने ठहरने की जगह या शहर के बीच`],
    [/^Drop point: (.+)\. Then (.+) home$/,(m,a,b)=>`उतरने की जगह: ${a}। फिर ${rd(b)} से घर`],[/^Drop point: (.+)$/,'उतरने की जगह: $1'],
    [/^Change at (.+?): only (\d+) min after you arrive, so if you are late take the next (?:flight|one) \(ask at the counter\)$/,'$1 पर बदलें: पहुँचने के बाद सिर्फ़ $2 मिनट हैं, देर हो जाए तो अगली लें (काउंटर पर पूछें)'],
    [/^Change at (.+?): find your (?:bus or platform|flight check-in) \(you have ([\d.]+) h\)$/,'$1 पर बदलें: अपनी बस या प्लेटफ़ॉर्म ढूँढें ($2 घंटे हैं)'],
    [/^Shared taxi or auto to (.+) \(not a walk; split the fare\)$/,'शेयर्ड टैक्सी या ऑटो से $1 (पैदल नहीं; किराया बाँट लें)'],
    [/^Arrive back in (.+)$/,'$1 वापस पहुँचें'],[/^Day trip: (.+?)\. (.*)$/,'एक दिन की सैर: $1। $2'],[/^Evening: (.+)$/,'शाम: $1'],
    [/^See (.+?)(?: · entry ~(₹[\d,]+) \(Indian adults\))?$/,(m,a,f)=>`${a} देखें${f?` · प्रवेश ~${f} (भारतीय वयस्क)`:''}`],
    [/^(.+?) · entry ~(₹[\d,]+) \(Indian adults\)$/,'$1 · प्रवेश ~$2 (भारतीय वयस्क)'],
    [/^(Taxi|Shared jeep|Shared sumo|Shared taxi|Jeep|Cab|Auto|Boat) (.+?) → (.+?) and back \(~(\d+) km each way(.*)\)$/,(m,a,b,c,k,r)=>`${b} → ${c} और वापस, ${a} से (~${k} किमी एक तरफ़${/split (\d) ways/.test(r)?', किराया '+r.match(/split (\d) ways/)[1]+' लोगों में बाँटें':/whole taxi/.test(r)?', पूरी टैक्सी; साथी ढूँढें तो सस्ता':''})`],
    [/^Local bus or shared taxi (.+?) → (.+?) and back \(~(\d+) km each way\)$/,'लोकल बस या शेयर्ड टैक्सी से $1 → $2 और वापस (~$3 किमी एक तरफ़)'],
    [/^Lunch nearby or back in (.+)$/,'आस-पास या $1 लौटकर दोपहर का खाना'],
    [/^Arrive (.+?), freshen up, chai$/,'$1 पहुँचें, फ्रेश हों, चाय'],[/^Arrive (.+?) and check in$/,'$1 पहुँचें और चेक-इन करें'],[/^Check in and an easy evening walk around (.+)$/,'चेक-इन करें और $1 में शाम की हल्की सैर'],
    [/^Explore (.+?) \((.+)\)$/,'$1 घूमें ($2)'],[/^Walk around (.+?): old market, main viewpoint and the local temple or church \(free\)$/,'$1 में घूमें: पुराना बाज़ार, मुख्य व्यू-पॉइंट और लोकल मंदिर या चर्च (फ्री)'],
    [/^(Government bus|Sleeper \/ Volvo bus|Sleeper-class train|AC 3-tier train|Shared jeep \/ taxi|Budget flight|Government ferry) (.+?) → (.+?) \(~([\d.]+) h\)(.*)$/,(m,a,b,c,h,r)=>`${({'Government bus':'सरकारी बस','Sleeper / Volvo bus':'स्लीपर / वोल्वो बस','Sleeper-class train':'स्लीपर क्लास ट्रेन','AC 3-tier train':'AC 3-टियर ट्रेन','Shared jeep / taxi':'शेयर्ड जीप / टैक्सी','Budget flight':'सस्ती फ़्लाइट','Government ferry':'सरकारी फ़ेरी'})[a]} ${b} → ${c} (~${h} घंटे)${r}`],
    [/^Day (\d+)$/,'दिन $1'],[/^🎫 Tickets (.+)$/,'🎫 टिकट $1'],[/^Sleep: (.+)$/,'रुकना: $1'],[/^Home in (.+)\. Trip done! 🎉$/,'$1 में घर। ट्रिप पूरी! 🎉'],[/^More beds in (.+)$/,'$1 में और बिस्तर']];
  const done=new Map();
  window.kcHiRe=root=>{const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){const pe=n.parentElement;if(!pe||pe.closest('script,style,.kc-lang'))continue;const t=n.nodeValue.trim();if(!t||t.length>80)continue;
      for(const [re,rep] of RE){if(re.test(t)){if(!done.has(n))done.set(n,n.nodeValue);n.nodeValue=n.nodeValue.replace(t,t.replace(re,rep));break}}}
    const w2=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);
    while(n=w2.nextNode()){const pe=n.parentElement;if(!pe||pe.closest('script,style,.kc-lang'))continue;const t=n.nodeValue.trim();if(!t||t.length>400||/[\u0900-\u097F]/.test(t))continue;
      for(const [re,rep] of LONG){if(re.test(t)){if(!done.has(n))done.set(n,n.nodeValue);n.nodeValue=n.nodeValue.replace(t,t.replace(re,rep));break}}}};
  const isHi=()=>document.documentElement.lang==='hi';
  let pend=false;new MutationObserver(()=>{if(!isHi()||pend)return;pend=true;requestAnimationFrame(()=>{pend=false;kcHiRe(document.body)})}).observe(document.body,{childList:true,subtree:true});
  const lb=document.querySelector('.kc-lang');if(lb)lb.addEventListener('click',()=>{if(isHi())kcHiRe(document.body);else{done.forEach((v,n)=>{if(n.isConnected)n.nodeValue=v});done.clear()}});
  if(isHi())kcHiRe(document.body);
})();
