import asyncio,sys,urllib.request
sys.path.insert(0,'.')
from e2e import mk,B,M,O
from playwright.async_api import async_playwright
async def make(pg):
  await pg.click('#m-know');await pg.wait_for_timeout(300)
  await pg.fill('#p-from','Delhi');await pg.fill('#p-to','Rishikesh');await pg.fill('#p-days','3');await pg.fill('#p-budget','6000')
  await pg.click('#p-go');await pg.wait_for_timeout(1500);await pg.screenshot(path=O+'ai-loader.png');await pg.wait_for_timeout(3500)
  return await pg.evaluate("(document.querySelector('#p-out h3')||{}).textContent")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    urllib.request.urlopen(M+'/setprop?k=GEMINI_KEY&v=')
    c,pg,e=await mk(b,p,'iPhone 13');await pg.goto(B);await pg.wait_for_timeout(1500)
    print('AI off ->',await make(pg));await c.close()
    urllib.request.urlopen(M+'/setprop?k=GEMINI_KEY&v=test')
    c,pg,e2=await mk(b,p,'iPhone 13');await pg.goto(B);await pg.wait_for_timeout(1500)
    print('AI on  ->',await make(pg))
    ideas=await pg.evaluate("kcSample().then(s=>s&&s.json(\"You help budget backpackers who don't know where to go. x\")).then(r=>r.ideas.map(i=>i.title))")
    print('AI picks ->',ideas)
    bad=await pg.evaluate("kcSample().then(s=>s.json('Write a poem')).then(()=>'allowed',e=>'refused: '+e.code)");print('other prompt ->',bad)
    print('errors',e,e2);await b.close()
    urllib.request.urlopen(M+'/setprop?k=GEMINI_KEY&v=')
asyncio.run(main())
