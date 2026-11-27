"""Accessibility checks without extra tools: colour contrast (WCAG AA), names on buttons/links/fields, image alt text, tap target size, headings, keyboard focus ring."""
import asyncio,json,sys
from playwright.async_api import async_playwright
JS=r"""()=>{
const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const [r,g,b,a]=m.map(Number);if(a===0)return null;const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return {L:0.2126*f(r)+0.7152*f(g)+0.0722*f(b),a:a===undefined?1:a}};
const bgOf=el=>{while(el){const cs=getComputedStyle(el);const b=cs.backgroundColor;const l=lum(b);if(l&&l.a>0.9)return l;if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!cs.backgroundImage.includes('gradient'))return null;el=el.parentElement}return lum(getComputedStyle(document.body).backgroundColor)};
const ratio=(a,b)=>{const [x,y]=[a.L,b.L].sort((p,q)=>q-p);return (x+0.05)/(y+0.05)};
const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.opacity!=='0'&&el.offsetParent!==null};
const out={contrast:[],noname:[],noalt:[],small:[],nolabel:[]};
const seen=new Set();
document.querySelectorAll('body *').forEach(el=>{if(!vis(el)||el.closest('.leaflet-container,svg'))return;
  const own=[...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim().length>1);
  if(own){const cs=getComputedStyle(el);const fg=lum(cs.color),bg=bgOf(el);if(fg&&bg){const r=ratio(fg,bg);const size=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700;const need=(size>=24||(size>=18.66&&bold))?3:4.5;
    if(r<need){const k=cs.color+'|'+el.className;if(!seen.has(k)){seen.add(k);out.contrast.push(`${r.toFixed(2)} need ${need}: <${el.tagName.toLowerCase()} class="${String(el.className).slice(0,30)}"> "${el.textContent.trim().slice(0,40)}" ${cs.color}`)}}}}});
document.querySelectorAll('button,a[href],[role=button]').forEach(el=>{if(!vis(el))return;const n=(el.getAttribute('aria-label')||el.textContent||el.title||'').trim();if(!n)out.noname.push(el.outerHTML.slice(0,90));
  const r=el.getBoundingClientRect();if((r.height<24||r.width<24)&&!el.closest('p,li,small,.links,figcaption,dd')&&el.tagName!=='A')out.small.push(`${Math.round(r.width)}x${Math.round(r.height)} ${el.outerHTML.slice(0,70)}`)});
document.querySelectorAll('img').forEach(el=>{if(vis(el)&&!el.hasAttribute('alt'))out.noalt.push(el.outerHTML.slice(0,90))});
document.querySelectorAll('input,select,textarea').forEach(el=>{if(!vis(el)||el.type==='hidden'||el.classList.contains('kc-hp'))return;const id=el.id;const lab=(id&&document.querySelector(`label[for="${id}"]`))||el.closest('label');if(!lab&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby'))out.nolabel.push(el.outerHTML.slice(0,90))});
out.h1=[...document.querySelectorAll('h1')].filter(vis).length;out.lang=document.documentElement.lang;
return out}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();res={}
    for scheme in ['light','dark']:
      for dev in ['iPhone 13','laptop']:
        kw=dict(**p.devices[dev]) if dev!='laptop' else dict(viewport={'width':1366,'height':800})
        c=await b.new_context(color_scheme=scheme,**kw);await c.add_init_script("localStorage.setItem('bg_toured','true')")
        await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
        pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1200)
        await pg.evaluate("()=>{const p=bgPlanQuick({from:'Delhi',stops:['Jaipur'],nd:3,bud:5000,ppl:1});bgRenderPlan(p)}")
        agg={}
        for v in ['plan','explore','go','stay','city','fun']:
          await pg.evaluate(f"bgShow('{v}');document.querySelectorAll('.kc-fold').forEach(c=>c.classList.add('kc-open'))");await pg.wait_for_timeout(500)
          r=await pg.evaluate(JS)
          for k,vv in r.items():
            if isinstance(vv,list):agg.setdefault(k,[]);[agg[k].append(x) for x in vv if x not in agg[k]]
        res[scheme+'-'+dev]=agg;await c.close()
    # keyboard focus visible
    c=await b.new_context(viewport={'width':1366,'height':800});await c.add_init_script("localStorage.setItem('bg_toured','true')");await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1000)
    nofocus=[]
    for i in range(25):
      await pg.keyboard.press('Tab');f=await pg.evaluate("(()=>{const e=document.activeElement;const cs=getComputedStyle(e);return {t:e.tagName+' '+(e.textContent||e.id||'').trim().slice(0,30),o:cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0,b:cs.boxShadow!=='none'}})()")
      if not (f['o'] or f['b']):nofocus.append(f['t'])
    res['focus_missing']=nofocus
    json.dump(res,open('t/a11y.json','w'),indent=1,ensure_ascii=False)
    for k,v in res.items():
      if isinstance(v,dict):print(k,{kk:len(vv) for kk,vv in v.items()})
      else:print(k,v)
    await b.close()
asyncio.run(main())
