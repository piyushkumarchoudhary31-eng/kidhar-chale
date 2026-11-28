import asyncio
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/know/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    async def h(r):return await (r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
    await c.route('**/*',h);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1800)
    # stale book: set an old search, then make a new plan
    await pg.evaluate("bgShow('go')");await pg.fill('#t-from','Jodhpur');await pg.fill('#t-to','Polo Forest')
    await pg.evaluate("bgShow('plan');document.querySelector('#p-start').value='2026-12-04';bgRenderPlan(bgPlanQuick({from:'Mumbai',stops:['Goa'],nd:4,bud:8000,ppl:1}))");await pg.wait_for_timeout(800)
    print('book after new plan:',await pg.evaluate("[document.querySelector('#t-from').value,document.querySelector('#t-to').value,document.querySelector('#t-date').value]"))
    # pick-for-me estimate vs plan for Kuldhara
    if await pg.locator('#m-know').is_visible():await pg.click('#m-know')
    print('estimate Kuldhara 2d:',await pg.evaluate("bgEstimate('Jodhpur',['Kuldhara'],2,1)"))
    await pg.evaluate("bgRenderPlan(bgPlanQuick({from:'Jodhpur',stops:['Kuldhara'],nd:2,bud:3000,ppl:1}))");await pg.wait_for_timeout(600)
    await pg.evaluate("document.querySelector('#kc-troute').scrollIntoView()");await pg.wait_for_timeout(3500)
    await pg.locator('#kc-troute').screenshot(path=O+'kuldhara.png')
    print('plan total:',await pg.evaluate("document.querySelector('#p-sum').textContent"),'| route list:',(await pg.evaluate("document.querySelector('.kt-list').innerText")).replace('\n',' | ')[:300])
    await c.close()
    c=await b.new_context(viewport={'width':1366,'height':900});await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}");await c.route('**/*',h)
    pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1800)
    print('itinerary header clipped:',await pg.evaluate("(()=>{const e=document.querySelector('#p-head .eyebrow');if(!e)return 'none';const r=e.getBoundingClientRect();return [Math.round(r.right),e.scrollWidth>e.clientWidth+1,getComputedStyle(e).overflow]})()"))
    print(errs);await b.close()
asyncio.run(main())
