import asyncio,json,base64,sys
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/kidhar-chale/'
def P(tag):return f'"><img src=x onerror="(window.__x=window.__x||[]).push(\'{tag}\')">\'<svg onload="(window.__x=window.__x||[]).push(\'{tag}s\')">'
plan={'v':1,'title':P('title')+' → '+P('t2'),'summary':P('summary'),
 'days':[{'day':1,'city':P('city1')+' → '+P('city1b'),'items':[{'time':P('time'),'what':P('what'),'cost':P('cost'),'kind':'travel'}],
   'stay':{'city':P('staycity'),'pick':0,'options':[{'name':P('oname'),'type':P('otype'),'area':P('oarea'),'price':300,'note':P('onote')}]}},
  {'day':2,'city':P('city2'),'items':[{'time':'9','what':'x','cost':1,'kind':'food'}],'stay':{'city':'On the bus','options':[]}}],
 'tips':[P('tip')],'verify':[P('verify')],
 'meta':{'budget':P('mbud'),'people':P('mppl'),'from':P('mfrom'),'to':P('mto'),'start':P('mstart'),'nd':P('mnd'),'dest':P('mdest'),'city':P('mcity'),'style':P('mstyle')}}
tok='j'+base64.urlsafe_b64encode(json.dumps(plan).encode()).decode().rstrip('=')
async def crawl(pg):
  for v in ['plan','explore','go','stay','now','money','kit','fun','tools','book']:
    for b in await pg.locator(f'nav.tabs button[data-v="{v}"], .kc-top button[data-v="{v}"]').all():
      if await b.is_visible():
        await b.click();await pg.wait_for_timeout(250);break
  await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
  await pg.wait_for_timeout(400)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for dev in ['iPhone 13',None]:
      kw=dict(**p.devices[dev]) if dev else dict(viewport={'width':1440,'height':900})
      c=await b.new_context(**kw);await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
      await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
      pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:150]))
      await pg.goto(B+'?trip='+tok+'#plan');await pg.wait_for_timeout(1500)
      print(dev,'plan rendered:',await pg.evaluate("!!document.querySelector('#p-out .day')"))
      await crawl(pg)
      # try saving the trip if a save button exists
      for sel in ['#p-save','[data-save-trip]','button:has-text("Save")']:
        l=pg.locator(sel)
        if await l.count():
          try:
            await l.first.click(timeout=800)
          except Exception: pass
      await pg.reload();await pg.wait_for_timeout(1500);await crawl(pg)
      print(dev,'after trip link + reload, fired:',await pg.evaluate('window.__x||[]'))
      await pg.goto(B+'?to='+P('qto').replace('"','%22').replace('#','%23')+'&from='+P('qfrom').replace('#','%23')+'&days=3');await pg.wait_for_timeout(1200);await crawl(pg)
      print(dev,'after ?to/from:',await pg.evaluate('window.__x||[]'))
      for q in ['report','feedback','find']:
        await pg.goto(B+f'?{q}='+P('q'+q).replace('#','%23'));await pg.wait_for_timeout(900)
      print(dev,'after report/feedback/find:',await pg.evaluate('window.__x||[]'))
      await pg.goto(B+'#explore');await pg.wait_for_timeout(800)
      for sel in ['#x-q','#p-to','#p-from','#w-from','#w-to','#kf-from','#s-city','#t-from','#t-to']:
        l=pg.locator(sel)
        if await l.count():
          try:
            await l.first.fill(P('in'+sel[1:]),timeout=800);await pg.wait_for_timeout(300)
          except Exception as e: pass
      await crawl(pg)
      print(dev,'after typing in inputs:',await pg.evaluate('window.__x||[]'),'errors',errs[:5])
      await c.close()
    await b.close()
if __name__=="__main__":asyncio.run(main())
