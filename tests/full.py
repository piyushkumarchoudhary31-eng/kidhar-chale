"""Full site check. Run: python3 full.py [--on]   (--on = backend, analytics and partner IDs switched on)"""
import asyncio,json,sys,urllib.request,time
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/kidhar-chale/';M='http://127.0.0.1:8792'
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/qa/t/'
ON='--on' in sys.argv
CFG="window.KC_CONFIG={api:'https://script.google.com/macros/s/TESTID/exec',ga:'G-TEST123',aff:{booking:'1234',agoda:'5678'}};" if ON else None
INIT="""try{localStorage.setItem('bg_toured','true')}catch(e){}
window.__csp=[];document.addEventListener('securitypolicyviolation',e=>{if(!String(e.blockedURI).startsWith('https://piyushkumarchoudhary31-eng.github.io/'))window.__csp.push(e.violatedDirective.split(' ')[0]+' '+(e.blockedURI||'inline'))});"""
DEV={'se':'iPhone SE','i13':'iPhone 13','android':'Pixel 7','ipad':'iPad Mini','tab820':None,'laptop':None,'wide':None}
problems=[]
def bad(tag,msg):problems.append(f'[{tag}] {msg}');print('  !!',tag,msg)
async def ctx(b,p,name,dark=False):
  if DEV.get(name):kw=dict(**p.devices[DEV[name]])
  elif name=='tab820':kw=dict(viewport={'width':820,'height':1180},is_mobile=True,has_touch=True,device_scale_factor=2)
  elif name=='wide':kw=dict(viewport={'width':1920,'height':1080})
  else:kw=dict(viewport={'width':1366,'height':768})
  c=await b.new_context(color_scheme='dark' if dark else 'light',**kw);await c.add_init_script(INIT)
  async def h(r):
    u=r.request.url
    if CFG and u.endswith('/assets/config.js'):return await r.fulfill(body=CFG,content_type='application/javascript')
    if ON and u.startswith('https://script.google.com/'):
      try:
        q=urllib.request.Request(M+'/exec'+('?'+u.split('?',1)[1] if '?' in u else ''),data=(r.request.post_data or '').encode() if r.request.method=='POST' else None,method=r.request.method)
        return await r.fulfill(body=urllib.request.urlopen(q).read(),content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
      except Exception as e:return await r.abort()
    if u.startswith('http://127.0.0.1'):return await r.continue_()
    return await r.abort()
  await c.route('**/*',h);return c
def watch(pg,tag,errs):
  pg.on('pageerror',lambda e:errs.append('pageerror: '+str(e)[:220]))
  pg.on('console',lambda m:errs.append('console: '+m.text[:220]) if m.type=='error' and 'net::ERR' not in m.text and 'Failed to load resource' not in m.text and 'Content Security Policy' not in m.text else None)
async def overflow(pg):return await pg.evaluate("document.documentElement.scrollWidth>innerWidth+1")
async def wide_items(pg):return await pg.evaluate("""()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return e.offsetParent&&r.width>0&&r.right>innerWidth+2&&!e.closest('.leaflet-container,.kc-rmap,.tw,pre,.kc-scroll,[style*="overflow"]')}).slice(0,4).map(e=>e.tagName+'.'+String(e.className).slice(0,40)+' '+Math.round(e.getBoundingClientRect().right))""")
async def tabs(pg):
  out=[]
  for v in ['explore','plan','go','city','money','stay','fun']:
    l=pg.locator(f'nav.tabs button[data-v="{v}"]')
    if await l.count() and await l.first.is_visible():
      await l.first.click();await pg.wait_for_timeout(450);out.append(v)
  return out
async def main_app(b,p,name,dark=False):
  tag=name+('-dark' if dark else '');print('==',tag)
  c=await ctx(b,p,name,dark);pg=await c.new_page();errs=[];watch(pg,tag,errs)
  t0=time.time();await pg.goto(B);await pg.wait_for_timeout(1400)
  if not await pg.evaluate("document.documentElement.classList.contains('kc-ready')"):bad(tag,'page never became ready')
  if await overflow(pg):bad(tag,'sideways scroll on home: '+str(await wide_items(pg)))
  await pg.screenshot(path=O+f'{tag}-home.png')
  # consent banner (only with analytics on)
  if ON:
    if await pg.locator('.kc-consent').count():await pg.click('.kc-consent [data-c="yes"]')
    else:bad(tag,'no consent banner with analytics on')
  # quiz: tap a city chip, check step 2 slides in
  chip=pg.locator('#v-plan button:has-text("Delhi")').first
  if await chip.count() and await chip.is_visible():
    await chip.click();await pg.wait_for_timeout(900)
  # explore search suggestions
  await pg.evaluate("bgShow('explore')");await pg.wait_for_timeout(400)
  q=pg.locator('#x-q')
  if await q.count():
    await q.fill('jai');await pg.wait_for_timeout(700)
    first=await pg.evaluate("(document.querySelector('#x-list article h3')||{}).textContent||''")
    if 'Jai' not in first:bad(tag,'explore search "jai" first result: '+first)
    await q.fill('');await pg.wait_for_timeout(300)
  # plan suggestions in the planner form
  # make a plan and look at it
  await pg.evaluate("()=>{const p=bgPlanQuick({from:'Delhi',stops:['Jaipur','Jodhpur'],nd:4,bud:7000,ppl:2});bgRenderPlan(p);bgShow('plan')}");await pg.wait_for_timeout(1200)
  n=await pg.evaluate("document.querySelectorAll('#p-out .day').length")
  if n<3:bad(tag,f'plan has {n} days')
  await pg.evaluate("document.querySelector('#p-out').scrollIntoView()");await pg.wait_for_timeout(1200)
  if await overflow(pg):bad(tag,'sideways scroll on plan: '+str(await wide_items(pg)))
  await pg.screenshot(path=O+f'{tag}-plan.png')
  # share link round trip
  link=await pg.evaluate("kcTripLink(bgCurrentPlan())")
  if '?trip=' not in link:bad(tag,'no trip link')
  # tabs
  seen=await tabs(pg)
  for v in seen:
    await pg.evaluate(f"bgShow('{v}')");await pg.wait_for_timeout(350)
    if await overflow(pg):bad(tag,f'sideways scroll on {v}: '+str(await wide_items(pg)))
  await pg.evaluate("bgShow('fun')");await pg.wait_for_timeout(300);await pg.screenshot(path=O+f'{tag}-tools.png')
  # open every tool drawer
  await pg.evaluate("document.querySelectorAll('.kc-fold > h3').forEach(h=>h.click())");await pg.wait_for_timeout(500)
  if await overflow(pg):bad(tag,'sideways scroll with tools open: '+str(await wide_items(pg)))
  # hindi
  await pg.click('.kc-lang');await pg.wait_for_timeout(700)
  if await overflow(pg):bad(tag,'sideways scroll in Hindi: '+str(await wide_items(pg)))
  await pg.click('.kc-lang');await pg.wait_for_timeout(300)
  # account sheet opens (when on)
  if ON:
    b2=pg.locator('.kc-acct-btn')
    if not await b2.count():bad(tag,'no account button')
    else:
      await pg.evaluate("scrollTo(0,0)");await b2.click();await pg.wait_for_timeout(500)
      if await overflow(pg):bad(tag,'sideways scroll with account sheet')
      await pg.screenshot(path=O+f'{tag}-acct.png');await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
  csp=await pg.evaluate('window.__csp')
  if csp:bad(tag,'blocked by security policy: '+str(sorted(set(csp))[:8]))
  if errs:bad(tag,'errors: '+str(errs[:6]))
  print('  ok in %.1fs, tabs %s'%(time.time()-t0,seen));await c.close()
async def pages(b,p):
  for path in ['places/kasol.html','places/index.html','places/rajasthan-places.html','about.html','student-savings.html','passes-and-permits.html','privacy.html','terms.html','404.html','places/paris.html']:
    for name in ['se','laptop']:
      c=await ctx(b,p,name);pg=await c.new_page();errs=[];watch(pg,path,errs)
      r=await pg.goto(B+path);await pg.wait_for_timeout(900)
      if not r or r.status!=200:bad(path,f'status {r and r.status}')
      if await overflow(pg):bad(path+' '+name,'sideways scroll: '+str(await wide_items(pg)))
      csp=await pg.evaluate('window.__csp')
      if csp:bad(path,'blocked: '+str(sorted(set(csp))[:6]))
      if errs:bad(path,'errors: '+str(errs[:4]))
      await c.close()
  print('== subpages checked')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name in ['se','i13','android','ipad','tab820','laptop','wide']:
      await main_app(b,p,name)
    await main_app(b,p,'i13',True);await main_app(b,p,'laptop',True)
    await pages(b,p)
    await b.close()
  print('\nRESULT:',len(problems),'problem(s)');[print(' -',x) for x in problems]
asyncio.run(main())
