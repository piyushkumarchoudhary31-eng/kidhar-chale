/* ===== AI PLANS ON THE WEBSITE: through our backend, only when a free AI key is set there ===== */
(()=>{
  const C=window.KC_CONFIG||{},API=(C.api||'').trim();
  if(!API||(window.claude&&window.claude.use))return; /* inside Claude, Claude does the AI */
  const post=async(kind,data,signal)=>{const r=await fetch(API,{method:'POST',body:JSON.stringify(Object.assign({kind},data)),credentials:'omit',referrerPolicy:'no-referrer',signal});if(!r.ok)throw new Error('net');return r.json()};
  const SK='kc_ai_on';
  let status=null;
  const check=()=>{if(status)return status;
    try{const c=JSON.parse(sessionStorage.getItem(SK)||'null');if(c&&Date.now()-c.t<3600e3)return status=Promise.resolve(c.on)}catch(_){}
    return status=post('ai_status',{}).then(j=>{const on=!!(j&&j.ok&&j.on);try{sessionStorage.setItem(SK,JSON.stringify({on,t:Date.now()}))}catch(_){}return on}).catch(()=>{status=null;return false})};
  const err=(code,msg)=>{const e=new Error(msg||code);e.code=code;return e};
  let off=0; /* after "busy" or a failure, use the built-in planner for a while */
  const sampler={json:async(prompt,opts)=>{
    const task=/^You are a frugal backpacking/.test(prompt)?'plan':/^You help budget backpackers/.test(prompt)?'ideas':'';
    if(!task)throw err('request');
    const j=await post('ai',{task,prompt},opts&&opts.signal);
    if(!j||!j.ok){if(j&&j.error==='busy'){off=Date.now()+10*60e3;throw err('rate_limited')}if(j&&j.error==='off'){try{sessionStorage.setItem(SK,JSON.stringify({on:false,t:Date.now()}))}catch(_){}status=Promise.resolve(false)}off=Date.now()+2*60e3;throw err('failed')}
    return j.data}};
  window.kcSample=()=>Date.now()<off?Promise.resolve(null):check().then(on=>on?sampler:null);
  /* ask once, quietly, after the page settles, so the first plan doesn't wait for it */
  const warm=()=>check();('requestIdleCallback' in window)?requestIdleCallback(warm,{timeout:5000}):setTimeout(warm,3000);
})();
