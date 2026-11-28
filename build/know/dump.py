import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1366,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1500)
    r=await pg.evaluate("()=>{const p=bgPlanQuick({from:'Delhi',stops:['Shimla','Manali'],nd:6,bud:9000,ppl:1});bgRenderPlan(p);return p}")
    for d in r['days']:
      print('Day',d['day'],d['city'])
      for i in d['items']:print('   ',i['time'],i['kind'],i['cost'],i['what'])
    print(r.get('know'))
    print(await pg.evaluate("document.querySelector('#p-know')?document.querySelector('#p-know').innerText:'NO KNOW'"))
    print(await pg.evaluate("bgPlanText(bgCurrentPlan()).slice(-700)"))
    print(errs);await b.close()
asyncio.run(main())
