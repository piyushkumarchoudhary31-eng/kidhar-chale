import asyncio,json,sys
from playwright.async_api import async_playwright
QS=[{'from':'Jodhpur','stops':['Delhi'],'nd':5,'bud':8000,'ppl':1},{'from':'Mumbai','stops':['Goa'],'nd':4,'bud':8000,'ppl':1},{'from':'Delhi','stops':['Shimla','Manali'],'nd':6,'bud':8000,'ppl':1},{'from':'Jodhpur','stops':['Kuldhara'],'nd':2,'bud':3000,'ppl':1},{'from':'Jodhpur','stops':['Kuldhara'],'nd':3,'bud':5000,'ppl':2},{'from':'Delhi','stops':['Jaipur','Jodhpur','Udaipur'],'nd':7,'bud':12000,'ppl':1}]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(1500)
    for q in QS[int(sys.argv[1]) if len(sys.argv)>1 else 0:]:
      r=await pg.evaluate("q=>{const p=bgPlanQuick(q);return p}",q)
      if r.get('error'):print('ERROR',q,r['error']);continue
      print('=====',r['title'],'| total',await pg.evaluate("p=>{let t=0;p.days.forEach(d=>{d.items.forEach(i=>t+=i.cost);const o=d.stay.options[d.stay.pick];if(o)t+=o.price});return t}",r))
      for d in r['days']:
        print('Day',d['day'],d['city'])
        for i in d['items']:print('   ',i['time'],i['kind'],i['cost'],i['what'][:150])
      print('  tips:',r['tips']);print('  know:',[k[:70] for k in r.get('know',[])])
    print(errs);await b.close()
asyncio.run(main())
