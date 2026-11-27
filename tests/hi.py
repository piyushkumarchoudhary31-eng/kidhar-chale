import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("localStorage.setItem('bg_toured','true');localStorage.setItem('bg_uilang','\"hi\"')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1500)
    allt={}
    for v in ['plan','explore','go','stay','city','fun']:
      await pg.evaluate(f"bgShow('{v}');document.querySelectorAll('.kc-fold').forEach(c=>c.classList.add('kc-open'))");await pg.wait_for_timeout(700)
      t=await pg.evaluate("""()=>{const out=[];const w=document.createTreeWalker(document.querySelector('#v-'+(document.querySelector('nav.tabs [aria-selected=true]')||{}).dataset?.v)||document.body,NodeFilter.SHOW_TEXT);let n;
        while(n=w.nextNode()){const t=n.nodeValue.trim();const pe=n.parentElement;if(!pe||!pe.offsetParent||pe.closest('script,style,#x-list,.kc-vlist,#c-out,#ph-list,input,select,option,.ac-list'))continue;
          if(/[A-Za-z]{3}/.test(t)&&!/[\\u0900-\\u097F]/.test(t)&&t.length>2)out.push(t)}return out}""")
      allt[v]=t
    for v,t in allt.items():print(v,len(t),len(' '.join(t)));print('   ',t[:12])
    json.dump(allt,open('t/hi-missing.json','w'),ensure_ascii=False,indent=0)
    await b.close()
asyncio.run(main())
