import asyncio,sys,json,urllib.request
sys.path.insert(0,'.')
from e2e import mk,B,M,O
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c,pg,e=await mk(b,p,'iPhone 13');await pg.goto(B);await pg.wait_for_timeout(1200)
    await pg.evaluate("document.querySelector('#p-start').value='2026-12-20'")
    await pg.evaluate("()=>{const p=bgPlanQuick({from:'Delhi',stops:['Manali','Kasol'],nd:6,bud:9000,ppl:1});bgRenderPlan(p);bgShow('plan');const m=document.querySelector('#m-know');if(m)m.click()}");await pg.wait_for_timeout(800)
    async with pg.expect_download() as dl:
      await pg.click('.kc-cal-b')
    d=await dl.value;path=await d.path();t=open(path).read()
    print('ics file:',d.suggested_filename,'| events:',t.count('BEGIN:VEVENT'),'| alarms:',t.count('BEGIN:VALARM'),'| first day:',[l for l in t.splitlines() if l.startswith('DTSTART;VALUE=DATE')][0],'| lines<=75:',all(len(l.encode())<=75 for l in t.split('\r\n')))
    await pg.evaluate("bgShow('fun')");await pg.wait_for_timeout(300)
    print('packing for this trip:',await pg.evaluate("[...document.querySelectorAll('.kc-packx label span')].map(s=>s.firstChild.textContent)"))
    print('packing heading:',await pg.text_content('.kc-packx .eyebrow'))
    # no start date -> asks
    await pg.evaluate("document.querySelector('#p-start').value='';bgShow('plan')");await pg.evaluate("()=>{const p=bgPlanQuick({from:'Jaipur',stops:['Goa'],nd:5,bud:9000,ppl:1});bgRenderPlan(p);bgShow('plan');const m=document.querySelector('#m-know');if(m)m.click()}");await pg.wait_for_timeout(500)
    await pg.click('.kc-cal-b');await pg.wait_for_timeout(200);print('asks for date:',await pg.locator('.kc-cal-d').count())
    # email plan: sign in first
    await pg.evaluate("scrollTo(0,0)");await pg.click('.kc-acct-btn');await pg.fill('.kc-acct-form input[name=email]','mail@example.com');await pg.click('.kc-acct-form button[type=submit]');await pg.wait_for_timeout(700)
    code=json.loads(urllib.request.urlopen(M+'/outbox').read())[-1]['subject'][:6];await pg.type('input.kc-otp',code);await pg.wait_for_timeout(800)
    await pg.fill('.kc-acct-form input[name=name]','Mail');await pg.click('.kc-acct-form button[type=submit]');await pg.wait_for_timeout(2500)
    if await pg.locator('.kc-acct-sheet .kc-x').count():await pg.click('.kc-acct-sheet .kc-x')
    await pg.wait_for_timeout(500);await pg.evaluate("bgShow('plan');document.querySelector('#m-know').click()");await pg.wait_for_timeout(300);await pg.click('.kc-mail-b');await pg.wait_for_timeout(1200)
    print('email msg:',await pg.text_content('.kc-cal-msg'))
    last=json.loads(urllib.request.urlopen(M+'/outbox').read())[-1];print('email sent to',last['to'],'subject',last['subject'])
    await pg.locator('.kc-share').scroll_into_view_if_needed();await pg.screenshot(path=O+'share-card.png')
    print('errors',e);await b.close()
asyncio.run(main())
