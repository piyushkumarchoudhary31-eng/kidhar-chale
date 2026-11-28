import asyncio,sys,json
from playwright.async_api import async_playwright
B='http://127.0.0.1:8791/kidhar-chale/';O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/routemap/'
WIKI={'laxman jhula':(30.1263,78.3296,'Lakshman Jhula'),'ram jhula':(30.1225,78.3134,'Ram Jhula'),'beatles ashram':(30.1110,78.3110,'Chaurasi Kutia'),'neer garh':(30.1330,78.3390,'Neergarh Waterfall'),'mall road':(30.4598,78.0664,'Mall Road, Mussoorie'),'kempty':(30.4870,78.0230,'Kempty Falls')}
PLANS={
'ai':{'title':'Delhi → Rishikesh → Mussoorie','summary':'x','days':[
 {'day':1,'city':'Delhi → Rishikesh','items':[{'time':'06:00','what':'Volvo bus Delhi → Rishikesh (~6 h)','cost':700,'kind':'travel'},{'time':'14:00','what':'Laxman Jhula and Ram Jhula walk','cost':0,'kind':'sight'},{'time':'18:00','what':'Triveni Ghat Ganga aarti','cost':0,'kind':'sight'}],'stay':{'city':'Rishikesh','options':[]}},
 {'day':2,'city':'Rishikesh','items':[{'time':'09:00','what':'Beatles Ashram (entry ₹150), then Neer Garh waterfall','cost':150,'kind':'sight'},{'time':'13:00','what':'Lunch at Chotiwala','cost':200,'kind':'food'}],'stay':{'city':'Rishikesh','options':[]}},
 {'day':3,'city':'Rishikesh → Mussoorie','items':[{'time':'08:00','what':'Shared taxi Rishikesh → Mussoorie (~3 h)','cost':400,'kind':'travel'},{'time':'15:00','what':'Mall Road and Kempty Falls','cost':0,'kind':'sight'}],'stay':{'city':'Mussoorie','options':[]}},
 {'day':4,'city':'Mussoorie → Delhi','items':[{'time':'21:00','what':'Overnight bus Mussoorie → Delhi (~8 h)','cost':800,'kind':'travel'}],'stay':{'city':'On the bus','options':[]}}],'tips':[],'verify':[],'meta':{'budget':6000,'people':1}},
'abroad':{'title':'Bangkok trip','summary':'x','days':[{'day':1,'city':'Delhi → Bangkok','items':[{'time':'06:00','what':'Budget flight Delhi → Bangkok (~4 h)','cost':9000,'kind':'travel'}],'stay':{'city':'Bangkok','options':[]}},{'day':2,'city':'Bangkok','items':[{'time':'09:00','what':'Grand Palace','cost':500,'kind':'sight'}],'stay':{'city':'Bangkok','options':[]}}],'tips':[],'verify':[],'meta':{}},
}
which=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name,kw,dark in [('phone',dict(**p.devices['iPhone 13']),False),('laptop',dict(viewport={'width':1366,'height':900}),True)]:
      c=await b.new_context(color_scheme='dark' if dark else 'light',**kw)
      await c.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
      async def h(r):
        u=r.request.url
        if u.startswith('http://127.0.0.1'):return await r.continue_()
        if 'wikipedia.org/w/api.php' in u and 'prop=coordinates' in u:
          import urllib.parse;q=urllib.parse.parse_qs(urllib.parse.urlparse(u).query)['gsrsearch'][0].lower()
          for k,(la,lo,t) in WIKI.items():
            if k in q:return await r.fulfill(body=json.dumps({'query':{'pages':{'1':{'index':1,'title':t,'coordinates':[{'lat':la,'lon':lo}]}}}}),content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
          return await r.fulfill(body='{}',content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
        return await r.abort()
      await c.route('**/*',h)
      pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
      await pg.goto(B);await pg.wait_for_timeout(1300)
      await pg.evaluate("bgShow('plan')")
      if await pg.locator('#m-know').is_visible():await pg.click('#m-know')
      await pg.evaluate("p=>bgRenderPlan(p)",PLANS[which]);await pg.wait_for_timeout(800)
      await pg.evaluate("document.querySelector('#kc-troute').scrollIntoView()");await pg.wait_for_timeout(4000)
      await pg.locator('#kc-troute').screenshot(path=O+f'{which}-{name}.png')
      print(name,(await pg.evaluate("document.querySelector('#kc-troute .kt-list').innerText")).replace('\n',' | ')[:500],errs)
      await c.close()
    await b.close()
asyncio.run(main())
