import asyncio,json
from playwright.async_api import async_playwright
OBS='''window.__m={lcp:0,cls:0,lt:[]};
new PerformanceObserver(l=>{for(const e of l.getEntries())__m.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)__m.cls+=e.value}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())__m.lt.push([e.startTime,e.duration])}).observe({type:'longtask',buffered:true});'''
async def run(p,mobile):
  b=await p.chromium.launch()
  kw=dict(**p.devices['Moto G4']) if mobile else dict(viewport={'width':1350,'height':940})
  c=await b.new_context(**kw);await c.add_init_script(OBS)
  await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
  pg=await c.new_page();cdp=await c.new_cdp_session(pg)
  await cdp.send('Network.enable')
  if mobile:
    await cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':150,'downloadThroughput':1.6*1024*1024/8,'uploadThroughput':750*1024/8})
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
  else:
    await cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':40,'downloadThroughput':10*1024*1024/8,'uploadThroughput':10*1024*1024/8})
  await pg.goto('http://127.0.0.1:8791/kidhar-chale/',wait_until='load');await pg.wait_for_timeout(5000)
  r=await pg.evaluate('''()=>{const fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||0;const tbt=__m.lt.filter(x=>x[0]>fcp).reduce((s,x)=>s+Math.max(0,x[1]-50),0);
    const res=performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation'));return {fcp:Math.round(fcp),lcp:Math.round(__m.lcp),cls:+__m.cls.toFixed(3),tbt:Math.round(tbt),longest:Math.round(Math.max(0,...__m.lt.map(x=>x[1]))),kb_transferred:Math.round(res.reduce((s,x)=>s+(x.transferSize||0),0)/1024),requests:res.length}}''')
  await b.close();return r
async def main():
  async with async_playwright() as p:
    for m in (True,False):
      rs=[await run(p,m) for _ in range(2)]
      print('MOBILE (slow 4G, 4x CPU)' if m else 'DESKTOP',rs)
asyncio.run(main())
