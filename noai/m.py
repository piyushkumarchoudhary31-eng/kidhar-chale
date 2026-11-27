import asyncio
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/motion/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    c=await b.new_context(**p.devices['iPhone 13'],record_video_dir=O,record_video_size={'width':390,'height':844})
    await c.add_init_script("localStorage.setItem('bg_toured','true')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1500)
    await pg.locator('#w-fromq button[data-v="Delhi"]').tap()
    for t in (120,300,420,560):
      await pg.wait_for_timeout(t-([0,120,300,420][[120,300,420,560].index(t)]))
      st=await pg.evaluate('''()=>[...document.querySelectorAll('.wpane')].map(p=>p.hidden?'-':(p.dataset.s+':'+getComputedStyle(p).opacity.slice(0,4)+(p.classList.contains('kc-leave')?'L':''))).join(' ')''')
      print(t,'ms',st)
    await pg.wait_for_timeout(600)
    await pg.locator('#w-next').tap();await pg.wait_for_timeout(900)
    await pg.locator('#w-back').tap();await pg.wait_for_timeout(900)
    await pg.locator('nav.tabs button[data-v="explore"]').tap();await pg.wait_for_timeout(150)
    print('explore mid',await pg.evaluate("getComputedStyle(document.querySelector('#v-explore>*')).opacity"),await pg.evaluate("document.querySelector('nav.tabs .kc-ind').getBoundingClientRect().x|0"))
    await pg.wait_for_timeout(1000)
    print('explore end',await pg.evaluate("getComputedStyle(document.querySelector('#v-explore>*')).opacity"),await pg.evaluate("document.querySelector('nav.tabs .kc-ind').getBoundingClientRect().x|0"),await pg.evaluate("document.querySelector('nav.tabs button[data-v=explore]').getBoundingClientRect().x|0"))
    await pg.locator('#x-genres button[data-g="m"]').tap();await pg.wait_for_timeout(900)
    await pg.locator('nav.tabs button[data-v="plan"]').tap();await pg.wait_for_timeout(900)
    await pg.evaluate("document.querySelector('[data-kctry]').click()");await pg.wait_for_timeout(2300)
    await pg.screenshot(path=O+'mid-plan.png')
    await pg.wait_for_timeout(1500)
    vis=await pg.evaluate('''()=>[...document.querySelectorAll('section[id^="v-"]:not([hidden]) *')].filter(e=>e.offsetParent&&+getComputedStyle(e).opacity<0.99).length''')
    print('elements still faded after settle:',vis)
    await pg.locator('nav.tabs button[data-v="fun"]').tap();await pg.wait_for_timeout(800)
    h=pg.locator('.kc-fold>h3').first
    if await h.count():await h.tap();await pg.wait_for_timeout(900)
    print('errors',errs)
    await c.close();await b.close()
asyncio.run(main())
