import asyncio,json,urllib.request,sys
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/kidhar-chale/';M='http://127.0.0.1:8792'
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/acct/t/'
import os;os.makedirs(O,exist_ok=True)
CFG="window.KC_CONFIG={api:'https://script.google.com/macros/s/TESTID/exec',ga:'',aff:{booking:'',agoda:''}};"
def code():return json.loads(urllib.request.urlopen(M+'/outbox').read())[-1]['subject'][:6]
async def mk(b,p,dev,shots=True):
  kw=dict(**p.devices[dev]) if dev!='laptop' else dict(viewport={'width':1440,'height':900})
  c=await b.new_context(**kw);await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
  async def h(r):
    u=r.request.url
    if u.endswith('/assets/config.js'):return await r.fulfill(body=CFG,content_type='application/javascript')
    if u.startswith('https://script.google.com/'):
      q=urllib.request.Request(M+'/exec'+('?'+u.split('?',1)[1] if '?' in u else ''),data=(r.request.post_data or '').encode() if r.request.method=='POST' else None,method=r.request.method)
      body=urllib.request.urlopen(q).read();return await r.fulfill(body=body,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
    if u.startswith('http://127.0.0.1'):return await r.continue_()
    return await r.abort()
  await c.route('**/*',h);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
  pg.on('console',lambda m:errs.append('console:'+m.text[:200]) if m.type=='error' and 'net::ERR' not in m.text and 'Failed to load resource' not in m.text else None)
  return c,pg,errs
async def plan(pg,frm,to,days=3):
  await pg.evaluate(f"()=>{{const p=bgPlanQuick({{from:'{frm}',stops:['{to}'],nd:{days},bud:6000,ppl:1}});bgRenderPlan(p)}}");await pg.wait_for_timeout(600)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    A,pa,ea=await mk(b,p,'iPhone 13')
    await pa.goto(B);await pa.wait_for_timeout(1500)
    await plan(pa,'Delhi','Rishikesh')
    print('A trips before sign in:',await pa.evaluate("JSON.parse(localStorage.bg_mytrips||'[]').map(t=>t.title)"))
    await pa.evaluate('scrollTo(0,0)');await pa.screenshot(path=O+'a0-header.png')
    await pa.click('.kc-acct-btn');await pa.wait_for_timeout(500);await pa.screenshot(path=O+'a1-email.png')
    await pa.fill('.kc-acct-form input[name=email]','piyush@example.com');await pa.click('.kc-acct-form button[type=submit]');await pa.wait_for_timeout(800)
    await pa.screenshot(path=O+'a2-code.png')
    await pa.fill('input.kc-otp','000000' if code()!='000000' else '111111');await pa.wait_for_timeout(800)
    print('wrong code msg:',await pa.text_content('.kc-acct-form .kc-msg'))
    await pa.fill('input.kc-otp','');await pa.type('input.kc-otp',code(),delay=40);await pa.wait_for_timeout(900)
    await pa.screenshot(path=O+'a3-name.png')
    await pa.fill('.kc-acct-form input[name=name]','Piyush');await pa.click('.kc-acct-form button[type=submit]');await pa.wait_for_timeout(1800)
    await pa.screenshot(path=O+'a4-me.png')
    print('A signed in:',await pa.evaluate("JSON.parse(localStorage.kc_acct).name"),'| header:',(await pa.text_content('.kc-acct-btn')).strip())
    await pa.click('.kc-acct-sheet .kc-x');await pa.wait_for_timeout(400)
    # device B: laptop with its own trip
    Bc,pb,eb=await mk(b,p,'laptop')
    await pb.goto(B);await pb.wait_for_timeout(1500);await plan(pb,'Jaipur','Udaipur')
    await pb.evaluate("localStorage.setItem('bg_uilang',JSON.stringify('en'))")
    urllib.request.urlopen(M+'/advance?ms=61000')
    await pb.click('.kc-acct-btn');await pb.wait_for_timeout(400)
    await pb.fill('.kc-acct-form input[name=email]','Piyush@Example.com ');await pb.press('.kc-acct-form input[name=email]','Enter');await pb.wait_for_timeout(800)
    await pb.type('input.kc-otp',code(),delay=30)
    await pb.wait_for_timeout(3500)  # signs in, merges, reloads
    print('B trips after sign in:',await pb.evaluate("JSON.parse(localStorage.bg_mytrips||'[]').map(t=>t.title)"),'signed in:',await pb.evaluate("!!localStorage.kc_acct"))
    await pb.wait_for_timeout(3000)
    await pb.click('.kc-acct-btn');await pb.wait_for_timeout(600);await pb.screenshot(path=O+'b1-me-laptop.png')
    await pb.click('.kc-acct-sheet .kc-x');await pb.wait_for_timeout(300)
    # A gets B's trip after sync
    await pa.evaluate("kcAccount.sync()");await pa.wait_for_timeout(1500)
    print('A sees refresh bar:',await pa.locator('.kc-acct-bar').count(),'A trips now:',await pa.evaluate("JSON.parse(localStorage.bg_mytrips||'[]').map(t=>t.title)"))
    await pa.screenshot(path=O+'a5-bar.png')
    # A makes a new plan; B picks it up
    await plan(pa,'Delhi','Manali',4);await pa.wait_for_timeout(4000)
    await pb.evaluate("kcAccount.sync()");await pb.wait_for_timeout(1500)
    print('B trips after A new plan:',await pb.evaluate("JSON.parse(localStorage.bg_mytrips||'[]').map(t=>t.title)"))
    # delete a trip on B -> gone on A
    await pb.click('.kc-acct-btn');await pb.wait_for_timeout(400)
    dl=pb.locator('.kc-mt-del').last;await dl.click();await dl.click();await pb.wait_for_timeout(4000)
    await pa.evaluate("kcAccount.sync()");await pa.wait_for_timeout(1500)
    print('A trips after B deleted one:',await pa.evaluate("JSON.parse(localStorage.bg_mytrips||'[]').map(t=>t.title)"))
    dump=urllib.request.urlopen(M+'/dump').read().decode()
    print('sheet has readable email/name/trip?',any(x in dump.lower() for x in ['piyush','rishikesh','udaipur','manali']))
    # sign out on all devices from A
    await pa.click('.kc-acct-btn');await pa.wait_for_timeout(400);await pa.click('[data-outall]');await pa.wait_for_timeout(300);await pa.screenshot(path=O+'a6-confirm.png');await pa.click('.kc-confirm .kc-yes');await pa.wait_for_timeout(1200)
    print('A signed out:',not await pa.evaluate("!!localStorage.kc_acct"),'A kept trips:',await pa.evaluate("JSON.parse(localStorage.bg_mytrips||'[]').length"))
    await pb.evaluate("kcAccount.sync()");await pb.wait_for_timeout(1500)
    print('B signed out by "all devices":',not await pb.evaluate("!!localStorage.kc_acct"))
    # dark mode screenshot of sign-in sheet
    D=await b.new_context(**p.devices['iPhone SE'],color_scheme='dark');await D.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
    await D.route('**/*',lambda r:r.fulfill(body=CFG,content_type='application/javascript') if r.request.url.endswith('config.js') else (r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort()))
    pd=await D.new_page();await pd.goto(B);await pd.wait_for_timeout(1200);await pd.screenshot(path=O+'se-header-dark.png');await pd.click('.kc-acct-btn');await pd.wait_for_timeout(500);await pd.screenshot(path=O+'se-sheet-dark.png')
    print('SE overflow:',await pd.evaluate('document.documentElement.scrollWidth>innerWidth'))
    print('errors A:',ea,'B:',eb)
    await b.close()
if __name__=="__main__":asyncio.run(main())
