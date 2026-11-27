import asyncio
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/swtest/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("localStorage.setItem('bg_toured','true')")
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(B);await pg.wait_for_timeout(2500)
    print('sw active:',await pg.evaluate("navigator.serviceWorker.controller?'yes':'no (first load)'"))
    await pg.reload();await pg.wait_for_timeout(1500);print('sw controlling:',await pg.evaluate("!!navigator.serviceWorker.controller"))
    await pg.goto(B+'places/kasol.html');await pg.wait_for_timeout(1200)
    await pg.goto(B+'?trip=abc#plan');await pg.wait_for_timeout(1000)
    print('cache keys:',await pg.evaluate("caches.open('kidhar-chale-v14').then(c=>c.keys()).then(k=>k.map(r=>r.url.replace(location.origin,'')).filter(u=>!u.includes('.png')))"))
    await c.set_offline(True)
    await pg.goto(B);await pg.wait_for_timeout(1500);print('offline home ok:',await pg.evaluate("document.documentElement.classList.contains('kc-ready')"))
    await pg.goto(B+'places/kasol.html');await pg.wait_for_timeout(800);print('offline kasol:',await pg.title())
    await pg.goto(B+'places/zzz.html');await pg.wait_for_timeout(800);print('offline unvisited page shows:',await pg.title())
    print('errors',errs);await b.close()
asyncio.run(main())
