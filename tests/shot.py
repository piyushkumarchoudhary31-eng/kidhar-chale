import asyncio,sys,json
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/kidhar-chale/';O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/routemap/'
Q=sys.argv[1] if len(sys.argv)>1 else "{from:'Jodhpur',stops:['Delhi'],nd:5,bud:8000,ppl:1}"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name,kw,dark in [('phone',dict(**p.devices['iPhone 13']),False),('laptop',dict(viewport={'width':1366,'height':900}),False),('phone-dark',dict(**p.devices['Pixel 7']),True)]:
      c=await b.new_context(color_scheme='dark' if dark else 'light',**kw)
      await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
      async def h(r):
        u=r.request.url
        if u.startswith('http://127.0.0.1'):return await r.continue_()
        return await r.abort()
      await c.route('**/*',h)
      pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('console',lambda m:errs.append('console '+m.text[:200]) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
      await pg.goto(B);await pg.wait_for_timeout(1300)
      await pg.evaluate("()=>{const p=bgPlanQuick("+Q+");bgShow('plan')}");await pg.wait_for_timeout(300)
      if await pg.locator('#m-know').is_visible():await pg.click('#m-know');await pg.wait_for_timeout(300)
      await pg.evaluate("()=>{const p=bgPlanQuick("+Q+");bgRenderPlan(p)}");await pg.wait_for_timeout(800)
      print(await pg.evaluate("()=>{const o=document.querySelector('#p-out');let e=o,h=[];while(e){if(getComputedStyle(e).display==='none'||e.hidden)h.push(e.id||e.className);e=e.parentElement}return h}"))
      await pg.evaluate("document.querySelector('#kc-troute')&&document.querySelector('#kc-troute').scrollIntoView()");await pg.wait_for_timeout(3500)
      el=pg.locator('#kc-troute')
      if await el.count():await el.screenshot(path=O+f'{name}.png')
      else:print('NO CARD')
      info=await pg.evaluate("()=>{const c=document.querySelector('#kc-troute');return c?{order:[...document.querySelectorAll('#p-out > .card')].slice(0,3).map(x=>x.id||x.className),list:c.querySelector('.kt-list').innerText.slice(0,600),over:document.documentElement.scrollWidth>innerWidth+1}:null}")
      print(name,json.dumps(info,ensure_ascii=False)[:900],errs[:5])
      await c.close()
    await b.close()
asyncio.run(main())
