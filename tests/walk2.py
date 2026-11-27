import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone SE']);await c.add_init_script("localStorage.setItem('bg_toured','true')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1200)
    await pg.click('#w-fromq button:has-text("Jodhpur")');await pg.wait_for_timeout(800)
    await pg.evaluate("bgShow('explore')");await pg.fill('#x-q','Jaisalmer');await pg.wait_for_timeout(600)
    await pg.locator('#x-list article [data-tk]').first.click();await pg.wait_for_timeout(800)
    print('Tickets -> from:',repr(await pg.input_value('#t-from')),'to:',repr(await pg.input_value('#t-to')),'focus:',await pg.evaluate('document.activeElement.id'),'| redBus:',await pg.evaluate("(document.querySelector('#t-bus a')||{}).href"))
    await pg.evaluate("bgShow('explore')");await pg.wait_for_timeout(300);await pg.locator('#x-list article [data-add]').first.click();await pg.wait_for_timeout(500)
    await pg.locator('.toast button').first.click();await pg.wait_for_timeout(900)
    print('Open plan -> p-to visible:',await pg.evaluate("!!document.querySelector('#p-to').offsetParent"),'p-from:',repr(await pg.input_value('#p-from')),'p-to:',repr(await pg.input_value('#p-to')),'focus:',await pg.evaluate('document.activeElement.id'))
    await pg.screenshot(path='t/walk2-plan.png')
    await pg.evaluate("bgShow('go')");await pg.locator('#ow-from').scroll_into_view_if_needed();await pg.click('#ow-from');await pg.keyboard.type('Ajmer');await pg.keyboard.press('Enter');await pg.wait_for_timeout(300)
    print('otw: Enter in From -> focus',await pg.evaluate('document.activeElement.id'))
    print('errors',errs);await b.close()
asyncio.run(main())
