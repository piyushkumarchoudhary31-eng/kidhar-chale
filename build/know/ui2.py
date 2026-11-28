import asyncio
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/know/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    async def h(r):return await (r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("try{localStorage.setItem('bg_toured','true');localStorage.setItem('bg_uilang','\"hi\"')}catch(e){}")
    await c.route('**/*',h);pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(2000)
    if await pg.locator('#m-know').is_visible():await pg.click('#m-know')
    await pg.wait_for_timeout(400);await pg.evaluate("scrollTo(0,document.querySelector('#p-form').getBoundingClientRect().top+scrollY-10)");await pg.wait_for_timeout(500)
    await pg.screenshot(path=O+'hi-form.png')
    await pg.evaluate("bgRenderPlan(bgPlanQuick({from:'Delhi',stops:['Shimla','Manali'],nd:6,bud:9000,ppl:1}))");await pg.wait_for_timeout(1500)
    await pg.evaluate("document.querySelector('.day').scrollIntoView()");await pg.wait_for_timeout(800)
    await pg.screenshot(path=O+'hi-plan.png');await c.close()
    c=await b.new_context(viewport={'width':1366,'height':900});await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
    await c.route('**/*',h);pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1800)
    await pg.evaluate("bgRenderPlan(bgPlanQuick({from:'Delhi',stops:['Jaipur','Jodhpur','Udaipur'],nd:7,bud:12000,ppl:1}))");await pg.wait_for_timeout(2000)
    await pg.evaluate("scrollTo(0,0)");await pg.wait_for_timeout(500);await pg.screenshot(path=O+'lap-top.png')
    await b.close()
asyncio.run(main())
