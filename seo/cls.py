import asyncio,sys
from playwright.async_api import async_playwright
OBS='''window.__s=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)__s.push({t:Math.round(e.startTime),v:+e.value.toFixed(3),src:(e.sources||[]).slice(0,4).map(s=>{const n=s.node;return n?(n.id?'#'+n.id:n.nodeName+(n.className&&typeof n.className=='string'?'.'+n.className.split(' ').join('.'):'')):'?'})})}).observe({type:'layout-shift',buffered:true});'''
async def main():
  async with async_playwright() as p:
    for m in (False,True):
      b=await p.chromium.launch();kw=dict(**p.devices['Moto G4']) if m else dict(viewport={'width':1350,'height':940})
      c=await b.new_context(**kw);await c.add_init_script(OBS)
      await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
      pg=await c.new_page();cdp=await c.new_cdp_session(pg);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':150 if m else 40,'downloadThroughput':(1.6 if m else 10)*1024*1024/8,'uploadThroughput':100000})
      if m:await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
      await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(4000)
      print('MOBILE' if m else 'DESKTOP');[print(x) for x in await pg.evaluate('__s')];await b.close()
asyncio.run(main())
