import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("localStorage.setItem('bg_toured','true')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1200)
    step=lambda:pg.evaluate("[...document.querySelectorAll('.wpane')].find(x=>!x.hidden).dataset.s")
    await pg.click('#w-fromq button:has-text("Delhi")');await pg.wait_for_timeout(900);print('step',await step())
    await pg.click('#w-next');await pg.wait_for_timeout(700);print('step',await step())
    await pg.screenshot(path='t/w3.png')
    await pg.click('#w-next');await pg.wait_for_timeout(700);print('step',await step())
    await pg.screenshot(path='t/w4.png')
    await pg.click('#w-any');await pg.wait_for_timeout(1500);print('step',await step())
    ideas=await pg.evaluate("[...document.querySelectorAll('#w-res .idea h3')].map(h=>h.textContent).slice(0,4)");print('ideas',ideas)
    await pg.screenshot(path='t/w5.png')
    btn=pg.locator('#w-res .idea [data-plan]').first
    await btn.click();await pg.wait_for_timeout(3800)
    print('plan:',await pg.evaluate("(document.querySelector('#p-out h3')||{}).textContent"),'visible:',await pg.evaluate("!!document.querySelector('#p-out .day')&&!!document.querySelector('#p-out').offsetParent"),'p-start:',await pg.input_value('#p-start'))
    await pg.screenshot(path='t/w6.png')
    print('errors',errs);await b.close()
asyncio.run(main())
