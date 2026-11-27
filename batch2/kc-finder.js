/* ===== FINDER: "Trips under ₹X from my city" in one screen ===== */
(()=>{
  const ex=document.querySelector('#v-explore');if(!ex)return;
  const CITIES=['Delhi','Mumbai','Bengaluru','Kolkata','Chennai','Hyderabad','Pune','Ahmedabad','Jaipur','Jodhpur','Lucknow','Chandigarh','Bhopal','Indore','Patna','Guwahati','Bhubaneswar','Kochi','Thiruvananthapuram','Coimbatore','Nagpur','Varanasi','Dehradun','Amritsar','Udaipur','Surat','Visakhapatnam','Madurai','Mysuru','Ranchi','Raipur','Siliguri','Srinagar','Jammu','Goa'];
  let st={from:'',bud:5000,days:3};try{Object.assign(st,JSON.parse(localStorage.getItem('bg_finder')||'{}'))}catch(e){}
  if(!st.from){try{const w=JSON.parse(localStorage.getItem('bg_wiz')||'{}');if(w.from)st.from=w.from}catch(e){}}
  const card=document.createElement('div');card.className='card kc-finder';card.id='kc-finder';
  const chips=(name,vals,cur,fmt)=>vals.map(v=>`<button type="button" class="kc-chip" data-${name}="${v}" aria-pressed="${+cur===v}">${fmt(v)}</button>`).join('');
  const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
  card.innerHTML=`<h2>💸 Trips under ${inr(st.bud)}</h2><p class="sub">Pick your city, budget and days. We show trips that fit, with real costs.</p>
   <label class="kc-fl">From<input id="kf-from" list="kf-cities" placeholder="Your city, e.g. Delhi" autocomplete="off" value="${(st.from||'').replace(/"/g,'&quot;')}"></label><datalist id="kf-cities">${CITIES.map(c=>`<option value="${c}">`).join('')}</datalist>
   <p class="kc-fl">Budget per person</p><div class="kc-chips" id="kf-bud">${chips('b',[3000,5000,8000,12000,20000],st.bud,inr)}</div>
   <p class="kc-fl">Days</p><div class="kc-chips" id="kf-days">${chips('d',[2,3,4,5,7],st.days,v=>v+' days')}</div>
   <button class="primary" id="kf-go" type="button">Show trips under ${inr(st.bud)}</button><p class="bad" id="kf-err" hidden></p>`;
  const first=ex.querySelector(':scope > .seg')||ex.firstElementChild;first.after(card);
  const h2=card.querySelector('h2'),go=card.querySelector('#kf-go');
  const sync=()=>{h2.textContent='💸 Trips under '+inr(st.bud);go.textContent='Show trips under '+inr(st.bud);try{localStorage.setItem('bg_finder',JSON.stringify(st))}catch(e){}};
  card.addEventListener('click',e=>{const b=e.target.closest('.kc-chip');if(!b)return;
    if(b.dataset.b){st.bud=+b.dataset.b;card.querySelectorAll('[data-b]').forEach(x=>x.setAttribute('aria-pressed',x===b))}
    if(b.dataset.d){st.days=+b.dataset.d;card.querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b))}sync()});
  go.onclick=()=>{const f=card.querySelector('#kf-from').value.trim(),err=card.querySelector('#kf-err');
    if(!f){err.textContent='Type the city you start from.';err.hidden=false;card.querySelector('#kf-from').focus();return}err.hidden=true;st.from=f;sync();
    if(window.kcTrack)kcTrack('budget_finder',{from:f,budget:st.bud,days:st.days});
    if(window.bgShow)bgShow('plan');const pick=document.querySelector('#m-pick');if(pick)pick.click();
    const set=(id,v)=>{const e=document.querySelector(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
    set('#w-from',f);set('#w-days',st.days);set('#w-budget',st.bud);
    setTimeout(()=>{const any=document.querySelector('#w-any');if(any)any.click();setTimeout(()=>{const r=document.querySelector('#wiz');if(r)r.scrollIntoView({block:'start',behavior:'smooth'})},300)},120)};
  /* shortcut on the laptop home */
  const tr=document.querySelector('#kc-empty');if(tr){const s=document.createElement('p');s.className='kc-findlink';s.innerHTML='<button type="button" class="ghost">💸 Find trips under ₹5,000 from my city</button>';tr.prepend(s);
    s.querySelector('button').onclick=()=>{if(window.bgShow)bgShow('explore');setTimeout(()=>{card.scrollIntoView({block:'start',behavior:'smooth'});card.querySelector('#kf-from').focus({preventScroll:true})},350)}}
  if(window.HI_ADD)window.HI_ADD({});
})();
