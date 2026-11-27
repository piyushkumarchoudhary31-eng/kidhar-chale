import asyncio,json,sys
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/noai/t/'
B='http://127.0.0.1:8791/kidhar-chale/'
async def ctx(b,p,phone,dark=False,tour=True):
  kw=dict(**p.devices['iPhone 13']) if phone else dict(viewport={'width':1440,'height':900})
  c=await b.new_context(color_scheme='dark' if dark else 'light',**kw)
  if tour:await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
  await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
  return c
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for phone in (True,False):
      for dark in (False,True):
        t=('phone' if phone else 'laptop')+('-dark' if dark else '')
        c=await ctx(b,p,phone,dark);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(B);await pg.wait_for_timeout(1200);await pg.screenshot(path=O+t+'-home.png')
        if not dark:
          await pg.evaluate("document.querySelector('[data-kctry]').click()");await pg.wait_for_timeout(2600)
          await pg.screenshot(path=O+t+'-plan.png')
          for v in ['explore','go','now','fun']:
            bt=pg.locator(f'nav.tabs button[data-v="{v}"]')
            if await bt.count() and await bt.first.is_visible():
              await bt.first.click();await pg.wait_for_timeout(500);await pg.screenshot(path=O+t+f'-{v}.png')
        print(t,'errors',errs,'overflow',await pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        await c.close()
    c=await ctx(b,p,True,tour=False);pg=await c.new_page();await pg.goto(B);await pg.wait_for_timeout(1200);await pg.screenshot(path=O+'phone-tour.png');await c.close()
    await b.close()
asyncio.run(main())
