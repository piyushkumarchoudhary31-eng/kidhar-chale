import asyncio,json
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/seo/t/'
B='http://127.0.0.1:8791/'
async def ctx(b,phone,dark=False):
  kw=dict(**b._pw.devices['iPhone 13']) if phone else dict(viewport={'width':1440,'height':900})
  c=await b.new_context(color_scheme='dark' if dark else 'light',**kw)
  await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
  await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
  return c
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();b._pw=p
    for phone in (True,False):
      tag='phone' if phone else 'laptop'
      c=await ctx(b,phone);pg=await c.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(B+'kidhar-chale/');await pg.wait_for_timeout(1500)
      info=await pg.evaluate('''()=>{const m=n=>{const e=document.querySelector(n);return e&&(e.content||e.href)};let ld=null;try{ld=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'].map(x=>x['@type'])}catch(e){ld='BAD '+e}
        return {title:document.title,desc:m('meta[name=description]'),canon:m('link[rel=canonical]'),og:m('meta[property="og:image"]'),ld,legal:!!document.querySelector('.kc-legal a[href="privacy.html"]'),banner:!!document.querySelector('.kc-consent'),overflow:document.documentElement.scrollWidth>innerWidth,
        imgsNoAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,h1:[...document.querySelectorAll('h1')].filter(h=>h.offsetParent).map(h=>h.textContent.trim()).slice(0,3),
        small:[...document.querySelectorAll('body *')].filter(e=>e.offsetParent&&e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType==3&&n.nodeValue.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).length}}''')
      titles=[]
      for v in ['explore','go','stay','plan']:
        btn=pg.locator(f'nav.tabs button[data-v="{v}"]')
        if await btn.count() and await btn.first.is_visible():await btn.first.click();await pg.wait_for_timeout(250);titles.append(await pg.title())
      print(tag,json.dumps(info,ensure_ascii=False),titles,'errors:',errs)
      await pg.evaluate('window.scrollTo(0,document.body.scrollHeight)');await pg.wait_for_timeout(300)
      await pg.screenshot(path=O+f'{tag}-footer.png')
      await c.close()
    # analytics-on copy
    for phone in (True,False):
      tag='phone' if phone else 'laptop'
      c=await ctx(b,phone);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(B+'gatest/');await pg.wait_for_timeout(1200)
      await pg.screenshot(path=O+f'ga-{tag}-banner.png')
      cov=await pg.evaluate('''()=>{const k=document.querySelector('.kc-consent').getBoundingClientRect(),t=document.querySelector('nav.tabs').getBoundingClientRect();return {banner:[k.top,k.bottom],tabs:[t.top,t.bottom],overlap:!(k.bottom<=t.top||k.top>=t.bottom)}}''')
      dl0=await pg.evaluate('(window.dataLayer||[]).length')
      await pg.click('.kc-consent [data-c="yes"]');await pg.wait_for_timeout(200)
      await pg.evaluate("document.querySelector('[data-kctry]').click()");await pg.wait_for_timeout(2500)
      await pg.click('nav.tabs button[data-v="explore"]');await pg.wait_for_timeout(300)
      dl=await pg.evaluate('(window.dataLayer||[]).map(a=>Array.from(a).map(x=>typeof x=="object"&&!(x instanceof Date)?JSON.stringify(x).slice(0,90):String(x).slice(0,40)).join(" | "))')
      print('GA',tag,cov,'before consent dataLayer:',dl0,'consent stored:',await pg.evaluate("localStorage.getItem('bg_consent')"));print('\n'.join(dl));print('errors',errs)
      await pg.reload();await pg.wait_for_timeout(800);print('banner after reload:',await pg.locator('.kc-consent').count())
      await c.close()
    for path,tag in [('kidhar-chale/privacy.html','privacy'),('kidhar-chale/nope/xyz','404')]:
      for phone in (True,False):
        for dark in (False,True):
          c=await ctx(b,phone,dark);pg=await c.new_page()
          url=B+path if tag=='privacy' else B+'kidhar-chale/404.html'
          await pg.goto(url);await pg.wait_for_timeout(300)
          ov=await pg.evaluate('document.documentElement.scrollWidth>innerWidth')
          await pg.screenshot(path=O+f'{tag}-{"phone" if phone else "laptop"}-{"dark" if dark else "light"}.png',full_page=False)
          print(tag,phone,dark,'overflow',ov);await c.close()
    await b.close()
asyncio.run(main())
