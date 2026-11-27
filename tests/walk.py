import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone SE']);await c.add_init_script("localStorage.setItem('bg_toured','true')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1200)
    # quiz: pick Jodhpur via chip so home city is known
    await pg.click('#w-fromq button:has-text("Jodhpur")');await pg.wait_for_timeout(800)
    # explore -> Tickets on a card
    await pg.evaluate("bgShow('explore')");await pg.fill('#x-q','Jaisalmer');await pg.wait_for_timeout(600)
    await pg.locator('#x-list article [data-tk]').first.click();await pg.wait_for_timeout(700)
    print('Tickets from card -> from:',repr(await pg.input_value('#t-from')),'to:',repr(await pg.input_value('#t-to')),'focus:',await pg.evaluate('document.activeElement.id'))
    await pg.screenshot(path='t/walk-tickets.png')
    # explore -> Add to my plan
    await pg.evaluate("bgShow('explore')");await pg.wait_for_timeout(300);await pg.locator('#x-list article [data-add]').first.click();await pg.wait_for_timeout(700)
    print('Add to plan -> tab:',await pg.evaluate("(document.querySelector('nav.tabs [aria-selected=true]')||{}).dataset.v"),'p-from:',repr(await pg.input_value('#p-from')),'p-to:',repr(await pg.input_value('#p-to')),'focus:',await pg.evaluate('document.activeElement.id'))
    await pg.screenshot(path='t/walk-add.png')
    # on the way
    await pg.evaluate("bgShow('go')");await pg.click('#sf-from');await pg.keyboard.type('Jodh',delay=40);await pg.wait_for_timeout(300);await pg.locator('#sf-from-ac [role=option]').first.click();await pg.wait_for_timeout(300)
    print('on the way: focus after From:',await pg.evaluate('document.activeElement.id'))
    await pg.keyboard.type('Jaip',delay=40);await pg.wait_for_timeout(300);await pg.keyboard.press('Enter');await pg.wait_for_timeout(600)
    print('on the way after To: focus',await pg.evaluate('document.activeElement.id'),'| result:',(await pg.evaluate("(document.querySelector('#sf-out')||document.querySelector('#sf-res')||{}).textContent||''"))[:160])
    await pg.locator('#sf-from').scroll_into_view_if_needed();await pg.screenshot(path='t/walk-otw.png')
    print('errors',errs);await b.close()
asyncio.run(main())
