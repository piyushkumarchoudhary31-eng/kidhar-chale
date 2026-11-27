import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(viewport={'width':820,'height':1180});await c.add_init_script("localStorage.setItem('bg_toured','true')")
    await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1000);await pg.evaluate("bgShow('explore')")
    print(await pg.evaluate("""()=>{const x=document.querySelector('#x-list');return [getComputedStyle(x).display,x.parentElement.id,x.parentElement.className,[...x.children].slice(0,3).map(e=>e.tagName+'.'+e.className),[...x.children].slice(-2).map(e=>e.tagName+'.'+e.className+' '+e.textContent.slice(0,30)),document.querySelector('.wrap').getBoundingClientRect().width]}"""))
    await pg.evaluate("document.querySelector('#x-list').scrollIntoView()");await pg.wait_for_timeout(500);await pg.screenshot(path='t/tab820-xlist.png')
    await b.close()
asyncio.run(main())
