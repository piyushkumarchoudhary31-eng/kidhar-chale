import asyncio,sys
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/kidhar-chale/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h in [(820,1180),(1024,768)] if len(sys.argv)<2 else [(int(sys.argv[1]),int(sys.argv[2]))]:
      c=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<1024,has_touch=True,device_scale_factor=1)
      await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
      await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
      pg=await c.new_page();await pg.goto(B);await pg.wait_for_timeout(1200)
      for v in ['explore','go','city']:
        await pg.evaluate(f"bgShow('{v}')");await pg.wait_for_timeout(700);await pg.screenshot(path=f't/tab{w}-{v}.png')
      await c.close()
    await b.close()
asyncio.run(main())
