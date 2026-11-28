import asyncio,json
from playwright.async_api import async_playwright
PLAN={'title':'Delhi → McLeod Ganj','summary':'x','days':[
 {'day':1,'city':'Delhi → McLeod Ganj','items':[{'time':'18:00','what':'Dinner near Majnu ka Tilla','cost':150,'kind':'food'},{'time':'18:45','what':'HRTC Volvo from Majnu ka Tilla to McLeod Ganj (~12 h)','cost':1100,'kind':'travel'}],'stay':{'city':'On the bus','options':[]}},
 {'day':2,'city':'McLeod Ganj','items':[{'time':'07:00','what':'Breakfast','cost':100,'kind':'food'},{'time':'09:00','what':'Walk from Galu Devi temple trailhead to Triund (~3 h)','cost':0,'kind':'sight'},{'time':'16:00','what':'Shared jeep back to McLeod','cost':0,'kind':'travel'}],'stay':{'city':'McLeod Ganj','options':[{'name':None,'type':'Dorm','area':'Jogiwara Road','price':400,'note':''}]}},
 {'day':3,'city':'McLeod Ganj → Delhi','items':[{'time':'10:00','what':'Dalai Lama Temple','cost':0,'kind':'sight'},{'time':'17:30','what':'Momos on Temple Road','cost':120,'kind':'food'},{'time':'18:00','what':'HRTC Volvo McLeod Ganj → Delhi (~12 h)','cost':1100,'kind':'travel'}],'stay':{'city':'On the bus','options':[]}}],
 'tips':['a'],'verify':['b'],'know':['Carry original ID for check-in.']}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1366,'height':900})
    await pg.add_init_script("try{localStorage.setItem('bg_toured','true')}catch(e){}")
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1500)
    await pg.evaluate("plan=>{window.__prompt='';window.kcSample=()=>Promise.resolve({json:(pr)=>{window.__prompt=pr;return Promise.resolve(JSON.parse(JSON.stringify(plan)))}})}",PLAN)
    await pg.evaluate("bgShow('plan')")
    if await pg.locator('#m-know').is_visible():await pg.click('#m-know')
    await pg.fill('#p-from','Delhi');await pg.fill('#p-to','McLeod Ganj');await pg.fill('#p-days','3');await pg.fill('#p-budget','6000')
    await pg.evaluate("document.querySelector('#p-go').click()");await pg.wait_for_timeout(4000)
    r=await pg.evaluate("bgCurrentPlan()")
    for d in r['days']:
      print('Day',d['day'],d['city'])
      for i in d['items']:print('  ',i['time'],i['kind'],i['cost'],i['what'])
    print(r.get('know'));pr=await pg.evaluate("window.__prompt");print(len(pr),'TRANSFER BUFFER' in pr,'"know"' in pr)
    await b.close()
asyncio.run(main())
