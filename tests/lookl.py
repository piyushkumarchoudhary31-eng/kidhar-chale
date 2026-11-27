import asyncio
from playwright.async_api import async_playwright
CFG="window.KC_CONFIG={api:'https://script.google.com/macros/s/X/exec',ga:'',aff:{}};"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(viewport={'width':1366,'height':860});await c.add_init_script("localStorage.setItem('bg_toured','true')")
    async def h(r):
      u=r.request.url
      if u.endswith('config.js'):return await r.fulfill(body=CFG,content_type='application/javascript')
      if 'script.google.com' in u:return await r.fulfill(body='[]' if 'gems' in u else '{"ok":true,"on":false}',content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
      if u.startswith('http://127.0.0.1'):return await r.continue_()
      return await r.abort()
    await c.route('**/*',h)
    pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1500)
    await pg.evaluate("document.querySelector('#p-start').value='2026-12-10';(()=>{const p=bgPlanQuick({from:'Delhi',stops:['Manali'],nd:5,bud:8000,ppl:1});bgRenderPlan(p);bgShow('plan');document.querySelector('#m-know').click()})()");await pg.wait_for_timeout(1200)
    await pg.locator('.kc-share').scroll_into_view_if_needed();await pg.wait_for_timeout(300);await pg.screenshot(path='t/lap-share.png')
    for v in ['explore','go','stay','fun']:
      await pg.evaluate(f"bgShow('{v}');scrollTo(0,0)");await pg.wait_for_timeout(600);await pg.screenshot(path=f't/lap-{v}.png',full_page=True)
    await b.close()
asyncio.run(main())
