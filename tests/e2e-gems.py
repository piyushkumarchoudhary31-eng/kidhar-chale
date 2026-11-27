import asyncio,sys,json,urllib.request
sys.path.insert(0,'.')
from e2e import mk,B,M,O
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c,pg,e=await mk(b,p,'iPhone 13');await pg.goto(B);await pg.wait_for_timeout(1500)
    await pg.evaluate("bgShow('explore')");await pg.wait_for_timeout(800)
    print('gems card:',await pg.text_content('.kc-gem-list'))
    await pg.click('[data-gem]');await pg.wait_for_timeout(400);print('not signed in -> account sheet:',await pg.locator('.kc-acct-sheet').count())
    await pg.fill('.kc-acct-form input[name=email]','gem@example.com');await pg.click('.kc-acct-form button[type=submit]');await pg.wait_for_timeout(700)
    code=json.loads(urllib.request.urlopen(M+'/outbox').read())[-1]['subject'][:6];await pg.type('input.kc-otp',code);await pg.wait_for_timeout(800)
    await pg.fill('.kc-acct-form input[name=name]','Gem');await pg.click('.kc-acct-form button[type=submit]');await pg.wait_for_timeout(2500)
    if await pg.locator('.kc-acct-sheet .kc-x').count():await pg.click('.kc-acct-sheet .kc-x');await pg.wait_for_timeout(400)
    await pg.evaluate("bgShow('explore')");await pg.click('[data-gem]');await pg.wait_for_timeout(400)
    await pg.fill('.kc-sheet input[name=place]','Lamayuru');await pg.fill('.kc-sheet input[name=state]','Ladakh');await pg.fill('.kc-sheet textarea[name=why]','Moonland cliffs and an old monastery with almost no crowds.')
    await pg.screenshot(path=O+'gem-form.png');await pg.click('.kc-sheet button[type=submit]');await pg.wait_for_timeout(1200)
    print('after send:',await pg.text_content('.kc-sheet form'))
    print('errors',e);await b.close()
asyncio.run(main())
