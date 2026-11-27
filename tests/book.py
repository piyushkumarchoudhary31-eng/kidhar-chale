import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("localStorage.setItem('bg_toured','true')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1000);await pg.evaluate("bgShow('go')");await pg.wait_for_timeout(400)
    await pg.click('#t-from');await pg.keyboard.type('Jodh',delay=60);await pg.wait_for_timeout(400)
    await pg.locator('#t-from-ac [role=option]').first.click();await pg.wait_for_timeout(400)
    print('after picking From, cursor in:',await pg.evaluate("document.activeElement.id"))
    await pg.keyboard.type('Jaip',delay=60);await pg.wait_for_timeout(400);await pg.keyboard.press('Enter');await pg.wait_for_timeout(400)
    print('after Enter on To suggestion, cursor in:',await pg.evaluate("document.activeElement.id"))
    await pg.fill('#t-date','2026-12-05');await pg.dispatch_event('#t-date','change');await pg.wait_for_timeout(300)
    print('summary:',await pg.text_content('#t-sum span'))
    for l in await pg.evaluate("[...document.querySelectorAll('#t-bus a,#t-train a,#t-fly a')].map(a=>a.querySelector('b').textContent+' | '+a.href)"):print('  ',l)
    await pg.screenshot(path='t/book-after.png',full_page=False)
    # typed without picking, then keyboard Next
    await pg.fill('#t-from','');await pg.click('#t-from');await pg.keyboard.type('Kasol');await pg.keyboard.press('Escape');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
    print('typed + Next key -> cursor in:',await pg.evaluate("document.activeElement.id"))
    # stay
    await pg.evaluate("bgShow('stay')");await pg.click('#s-city');await pg.keyboard.type('Udai',delay=60);await pg.wait_for_timeout(400);await pg.locator('#s-city-ac [role=option]').first.click();await pg.wait_for_timeout(300)
    print('stay: after picking city, cursor in:',await pg.evaluate("document.activeElement.id"))
    await pg.fill('#s-in','2026-12-06');await pg.fill('#s-n','2');await pg.fill('#s-ppl','2');await pg.dispatch_event('#s-ppl','input');await pg.wait_for_timeout(200)
    for l in await pg.evaluate("[...document.querySelectorAll('#s-links a')].slice(0,3).map(a=>a.querySelector('b').textContent+' | '+a.href)"):print('  ',l)
    # planner + quiz
    await pg.evaluate("bgShow('plan')");await pg.click('#m-know');await pg.click('#p-from');await pg.keyboard.type('Delh',delay=50);await pg.wait_for_timeout(400);await pg.locator('#p-from-ac [role=option]').first.click();await pg.wait_for_timeout(300)
    print('planner: after picking From, cursor in:',await pg.evaluate("document.activeElement.id"))
    await pg.reload();await pg.wait_for_timeout(1000);await pg.evaluate("bgShow('plan')");
    m=pg.locator('#m-pick, button:has-text(\"Pick for me\")').first
    if await m.count():await m.click()
    await pg.click('#w-from');await pg.keyboard.type('Jodh',delay=50);await pg.wait_for_timeout(400);await pg.locator('#w-from-ac [role=option]').first.click();await pg.wait_for_timeout(1200)
    print('quiz: after picking city, now showing step:',await pg.evaluate("[...document.querySelectorAll('.wpane')].find(x=>!x.hidden).dataset.s"))
    print('errors',errs);await b.close()
asyncio.run(main())
