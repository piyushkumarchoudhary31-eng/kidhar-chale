import asyncio,json
from playwright.async_api import async_playwright
RATES=json.dumps({'result':'success','time_last_update_utc':'Fri, 27 Nov 2026 00:02:31 +0000','rates':{'INR':1,'THB':0.39,'EUR':0.0107,'USD':0.0115,'NPR':1.6}})
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("localStorage.setItem('bg_toured','true');window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+e.blockedURI))")
    async def h(r):
      u=r.request.url
      if 'open.er-api.com' in u:return await r.fulfill(body=RATES,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
      if u.startswith('http://127.0.0.1'):return await r.continue_()
      return await r.abort()
    await c.route('**/*',h);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1000)
    await pg.evaluate("bgShow('explore')");await pg.fill('#x-q','Chiang');await pg.wait_for_timeout(700)
    print('card badge:',await pg.evaluate("(document.querySelector('#x-list article .kc-visa')||{}).textContent"))
    await pg.fill('#x-q','Kasol');await pg.wait_for_timeout(600);print('India card badge (should be none):',await pg.evaluate("!!document.querySelector('#x-list article .kc-visa')"))
    await pg.evaluate("bgShow('fun')");await pg.click('#f-visa > h3');await pg.fill('#kc-vq','thai');await pg.wait_for_timeout(200)
    print('visa search:',await pg.evaluate("[...document.querySelectorAll('.kc-vrow:not([hidden])')].map(r=>r.textContent.trim().slice(0,90))"))
    print('countries in guide:',await pg.evaluate("document.querySelectorAll('.kc-vrow').length"))
    await pg.click('#f-fx > h3');await pg.wait_for_timeout(500);print('converter:',await pg.text_content('#kc-fx-o'),'|',(await pg.text_content('#kc-fx-s'))[:60])
    await pg.locator('#f-fx').scroll_into_view_if_needed();await pg.screenshot(path='t/fx.png')
    await pg.evaluate("()=>{const p=bgPlanQuick({from:'Delhi',stops:['Bangkok'],nd:6,bud:40000,ppl:1});bgRenderPlan(p);bgShow('plan');document.querySelector('#m-know').click()}");await pg.wait_for_timeout(1200)
    print('plan fx line:',await pg.evaluate("(document.querySelector('.kc-fx-line')||{}).textContent"))
    print('plan visa card:',await pg.evaluate("(document.querySelector('.kc-visa-tip')||{}).textContent"))
    print('csp:',await pg.evaluate('window.__csp'),'errors',errs);await b.close()
asyncio.run(main())
