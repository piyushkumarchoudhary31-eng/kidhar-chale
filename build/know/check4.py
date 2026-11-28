import asyncio,json
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/know/'
OLD={'title':'Jodhpur → Delhi → Jodhpur','summary':'old','meta':{'budget':8000,'people':3},'days':[{'day':1,'city':'Jodhpur → Delhi','items':[{'time':'21:00','what':'Sleeper-class train Jodhpur → Delhi (~10.5 h)','cost':350,'kind':'travel'}],'stay':{'city':'On the train','options':[]}},{'day':2,'city':'Delhi','items':[{'time':'10:30','what':'Explore Delhi: Red Fort, Qutub Minar, Humayun’s Tomb and endless street food.','cost':0,'kind':'sight'}],'stay':{'city':'Delhi','options':[{'name':None,'type':'Dorm bed','area':'Delhi','price':520,'note':''},{'name':None,'type':'Homestay','area':'Delhi','price':900,'note':''}]}},{'day':3,'city':'Delhi → Jodhpur','items':[{'time':'21:00','what':'Sleeper-class train Delhi → Jodhpur (~10.5 h)','cost':350,'kind':'travel'}],'stay':{'city':'On the train','options':[]}}],'tips':[],'verify':[]}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    async def h(r):return await (r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    c=await b.new_context(viewport={'width':1366,'height':900});await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
    await c.add_init_script("if(!sessionStorage.getItem('x')){sessionStorage.setItem('x',1);localStorage.setItem('bg_plan',JSON.stringify("+json.dumps(OLD)+"));localStorage.setItem('bg_formsig','\"x\"')}")
    await c.route('**/*',h);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(2000)
    print('refreshed note:',await pg.evaluate("!!document.querySelector('.kc-refreshed')"),'| day2 sight cost:',await pg.evaluate("bgCurrentPlan().days[1].items.filter(i=>i.kind==='sight').map(i=>i.cost+' '+i.what)"))
    print('form:',await pg.evaluate("['p-from','p-to','p-days','p-budget','p-people'].map(i=>document.querySelector('#'+i).value)"))
    print('stay links:',await pg.evaluate("[...document.querySelectorAll('.sopt a')].map(a=>a.href.split('?')[1]).slice(0,2)"))
    print('day nav:',await pg.evaluate("[...document.querySelectorAll('.kt-nav')].map(a=>a.textContent+' '+a.href.slice(0,140))"))
    # typo check
    await pg.evaluate("bgShow('plan')")
    if await pg.locator('#m-know').is_visible():await pg.click('#m-know')
    await pg.fill('#p-from','Jodhpur');await pg.fill('#p-to','Delhii');await pg.fill('#p-days','5');await pg.fill('#p-budget','8000')
    await pg.evaluate("document.querySelector('#p-go').click()");await pg.wait_for_timeout(600)
    print('typo msg:',await pg.evaluate("document.querySelector('#p-err').innerText"))
    await pg.evaluate("document.querySelector('#p-err [data-fix]').click()");await pg.wait_for_timeout(3500)
    print('after fix: to=',await pg.evaluate("document.querySelector('#p-to').value"),'| plan:',await pg.evaluate("bgCurrentPlan().title"))
    await pg.fill('#p-to','Kuldharaa');await pg.evaluate("document.querySelector('#p-go').click()");await pg.wait_for_timeout(500)
    print('typo2:',await pg.evaluate("document.querySelector('#p-err').innerText"))
    await pg.fill('#p-to','Xyzpur');await pg.evaluate("document.querySelector('#p-go').click()");await pg.wait_for_timeout(500)
    print('unknown:',await pg.evaluate("document.querySelector('#p-err').innerText"))
    print(errs);await b.close()
asyncio.run(main())
