/* ===== MONEY CONVERTER for trips abroad: live rates (ExchangeRate-API, free), last rates kept for offline ===== */
(()=>{
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CUR={NP:'NPR',BT:'BTN',LK:'LKR',BD:'BDT',MV:'MVR',TH:'THB',VN:'VND',KH:'USD',LAO:'LAK',MY:'MYR',SG:'SGD',ID:'IDR',PH:'PHP',JP:'JPY',KR:'KRW',HK:'HKD',TW:'TWD',CN:'CNY',MNG:'MNT',
    AE:'AED',OM:'OMR',JO:'JOD',TUR:'TRY',GE:'GEL',AM:'AMD',AZ:'AZN',UZ:'UZS',KG:'KGS',KZ:'KZT',TJ:'TJS',
    PT:'EUR',ES:'EUR',FR:'EUR',IT:'EUR',GR:'EUR',AT:'EUR',DE:'EUR',NED:'EUR',BE:'EUR',SI:'EUR',CRO:'EUR',EE:'EUR',FI:'EUR',ME:'EUR',IE:'EUR',BG:'EUR',
    SUI:'CHF',CZ:'CZK',HU:'HUF',PL:'PLN',BA:'BAM',AL:'ALL',RO:'RON',IS:'ISK',NO:'NOK',GB:'GBP',
    EG:'EGP',MA:'MAD',KE:'KES',TZ:'TZS',UG:'UGX',ZA:'ZAR',NA:'NAD',ZW:'USD',MG:'MGA',MU:'MUR',ET:'ETB',BW:'BWP',TUN:'TND',
    PE:'PEN',BO:'BOB',CL:'CLP',ARG:'ARS',BRA:'BRL',CO:'COP',EC:'USD',MX:'MXN',GT:'GTQ',CU:'USD',CR:'CRC',US:'USD',CA:'CAD',AU:'AUD',NZ:'NZD',FJ:'FJD'};
  const NAME={USD:'US dollar',EUR:'Euro',GBP:'British pound',AED:'UAE dirham',THB:'Thai baht',VND:'Vietnamese dong',NPR:'Nepali rupee',LKR:'Sri Lankan rupee',BDT:'Bangladeshi taka',MVR:'Maldivian rufiyaa',BTN:'Bhutanese ngultrum',
    LAK:'Lao kip',MYR:'Malaysian ringgit',SGD:'Singapore dollar',IDR:'Indonesian rupiah',PHP:'Philippine peso',JPY:'Japanese yen',KRW:'Korean won',HKD:'Hong Kong dollar',TWD:'Taiwan dollar',CNY:'Chinese yuan',MNT:'Mongolian tögrög',
    OMR:'Omani rial',JOD:'Jordanian dinar',TRY:'Turkish lira',GEL:'Georgian lari',AMD:'Armenian dram',AZN:'Azerbaijani manat',UZS:'Uzbek som',KGS:'Kyrgyz som',KZT:'Kazakh tenge',TJS:'Tajik somoni',
    CHF:'Swiss franc',CZK:'Czech koruna',HUF:'Hungarian forint',PLN:'Polish złoty',BAM:'Bosnian mark',ALL:'Albanian lek',RON:'Romanian leu',ISK:'Icelandic króna',NOK:'Norwegian krone',
    EGP:'Egyptian pound',MAD:'Moroccan dirham',KES:'Kenyan shilling',TZS:'Tanzanian shilling',UGX:'Ugandan shilling',ZAR:'South African rand',NAD:'Namibian dollar',MGA:'Malagasy ariary',MUR:'Mauritian rupee',ETB:'Ethiopian birr',BWP:'Botswana pula',TND:'Tunisian dinar',
    PEN:'Peruvian sol',BOB:'Bolivian boliviano',CLP:'Chilean peso',ARS:'Argentine peso',BRL:'Brazilian real',COP:'Colombian peso',MXN:'Mexican peso',GTQ:'Guatemalan quetzal',CRC:'Costa Rican colón',CAD:'Canadian dollar',AUD:'Australian dollar',NZD:'NZ dollar',FJD:'Fijian dollar'};
  const KEY='bg_fx';let fx=null;try{fx=JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){}
  let loading=null;
  const rates=()=>{if(fx&&Date.now()-fx.t<12*3600e3)return Promise.resolve(fx);if(loading)return loading;
    return loading=fetch('https://open.er-api.com/v6/latest/INR').then(r=>r.json()).then(j=>{if(j&&j.result==='success'&&j.rates){fx={t:Date.now(),at:j.time_last_update_utc||'',r:j.rates};try{localStorage.setItem(KEY,JSON.stringify(fx))}catch(_){}}loading=null;return fx}).catch(()=>{loading=null;return fx})};
  const fmt=(n,c)=>{try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:c,maximumFractionDigits:n<100?2:0}).format(n)}catch(_){return c+' '+Math.round(n).toLocaleString('en-IN')}};
  const curOf=country=>{const code=Object.keys(window.bgST||{}).find(c=>(bgST[c]||[])[0]===country);return code&&CUR[code]};
  window.kcFx={rates,curOf,fmt};
  /* Tools: converter drawer */
  const fun=$('#v-fun');if(fun){
    const card=document.createElement('div');card.className='card kc-fold kc-fx';card.id='f-fx';
    const list=[...new Set(Object.values(CUR))].sort((a,b)=>(NAME[a]||a).localeCompare(NAME[b]||b));
    let st={c:'THB',amt:1000,dir:'in'};try{Object.assign(st,JSON.parse(localStorage.getItem('bg_fxui')||'{}'))}catch(_){}
    card.innerHTML=`<h3 role="button" tabindex="0" aria-expanded="false">💱 Money converter</h3>
      <p class="sub">For trips abroad. Rates update twice a day and are saved, so it works offline too.</p>
      <div class="kc-fx-row"><label>Amount<input id="kc-fx-a" type="number" inputmode="decimal" min="0" value="${+st.amt||1000}"></label>
       <label>Currency<select id="kc-fx-c">${list.map(c=>`<option value="${c}"${c===st.c?' selected':''}>${esc(NAME[c]||c)} (${c})</option>`).join('')}</select></label></div>
      <div class="kc-chips" id="kc-fx-d"><button type="button" class="kc-chip" data-d="in" aria-pressed="${st.dir==='in'}">₹ to this currency</button><button type="button" class="kc-chip" data-d="out" aria-pressed="${st.dir==='out'}">This currency to ₹</button></div>
      <p class="kc-fx-out" id="kc-fx-o" aria-live="polite"></p>
      <p class="sub kc-fx-src" id="kc-fx-s"></p>`;
    const g=fun.querySelector('#f-visa')||fun.querySelector('.kc-guides');g?g.after(card):fun.appendChild(card);
    const h=card.querySelector('h3');const t=()=>{card.classList.toggle('kc-open');h.setAttribute('aria-expanded',card.classList.contains('kc-open'));if(card.classList.contains('kc-open'))draw()};h.addEventListener('click',t);h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}});
    const A=card.querySelector('#kc-fx-a'),Cs=card.querySelector('#kc-fx-c'),O=card.querySelector('#kc-fx-o'),Sx=card.querySelector('#kc-fx-s');
    async function draw(){st.amt=+A.value||0;st.c=Cs.value;try{localStorage.setItem('bg_fxui',JSON.stringify(st))}catch(_){}
      const f=await rates();if(!f||!f.r||!f.r[st.c]){O.textContent='Rates need internet the first time. Connect once and they are saved.';Sx.textContent='';return}
      const r=f.r[st.c];O.innerHTML=st.dir==='in'?`${esc(fmt(st.amt,'INR'))} = <b>${esc(fmt(st.amt*r,st.c))}</b>`:`${esc(fmt(st.amt,st.c))} = <b>${esc(fmt(st.amt/r,'INR'))}</b>`;
      Sx.innerHTML=`1 ${esc(st.c)} = ${esc(fmt(1/r,'INR'))}. Rates ${f.at?'from '+esc(new Date(f.at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})):''} by <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Exchange Rate API</a>. Banks and cards charge 2–4% more.`}
    A.addEventListener('input',draw);Cs.addEventListener('change',draw);
    card.querySelector('#kc-fx-d').addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(!b)return;st.dir=b.dataset.d;card.querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()});
    const jump=fun.querySelector('nav.jump');if(jump&&!jump.querySelector('a[href="#f-fx"]'))jump.insertAdjacentHTML('beforeend','<a href="#f-fx">💱 Money</a>');
    window.kcFxOpen=c=>{if(c&&[...Cs.options].some(o=>o.value===c))Cs.value=c;if(!card.classList.contains('kc-open'))t();window.bgShow&&bgShow('fun');setTimeout(()=>card.scrollIntoView({block:'start',behavior:'smooth'}),200)};
  }
  /* plan abroad: the total in local money */
  const out=$('#p-out');if(out)new MutationObserver(()=>{const sum=out.querySelector('#p-sum');if(!sum||out.querySelector('.kc-fx-line'))return;const p=window.bgCurrentPlan&&bgCurrentPlan();if(!p||!p.days)return;
    const cs=[...new Set(p.days.flatMap(d=>String(d.city||'').split(/\s*(?:→|->)\s*/)).map(x=>x.trim()))];let cur=null;
    for(const c of cs){const pi=window.bgPlaceInfo?bgPlaceInfo(c):null;if(pi&&/^X/.test(pi.reg||'')&&pi.state){cur=curOf(pi.state);if(cur)break}}
    if(!cur||cur==='BTN')return;const line=document.createElement('p');line.className='sub kc-fx-line';sum.closest('.dayhead').after(line);
    rates().then(f=>{if(!f||!f.r||!f.r[cur]){line.remove();return}const rs=+String(sum.textContent).replace(/[^\d]/g,'');line.innerHTML=`About <b>${esc(fmt(rs*f.r[cur],cur))}</b> in ${esc(NAME[cur]||cur)} · <button type="button" class="link kc-fx-go">converter</button>`;line.querySelector('.kc-fx-go').onclick=()=>window.kcFxOpen&&kcFxOpen(cur)})}).observe(out,{childList:true});
})();
