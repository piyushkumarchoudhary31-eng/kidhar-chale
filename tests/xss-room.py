import asyncio,sys,json,urllib.request
sys.path.insert(0,'.');sys.path.insert(0,'../sec')
from e2e import mk,B,M
from xss import P
from playwright.async_api import async_playwright
room={'id':'XSSAB2','name':P('rname'),'members':[P('m1'),P('m2')],'exps':[{'id':'e1','amt':5,'by':P('m1'),'what':P('what'),'at':1}],'del':[],'plan':P('plan'),'planAt':5}
urllib.request.urlopen(urllib.request.Request(M+'/exec',data=json.dumps({'kind':'room_put','id':'XSSAB2','room':room}).encode(),method='POST')).read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c,pg,e=await mk(b,p,'iPhone 13')
    await pg.goto(B+'?room=XSSAB2');await pg.wait_for_timeout(3000)
    print('room shown:',await pg.text_content('#gr-c'),'fired:',await pg.evaluate('window.__x||[]'),'errors',e)
    await b.close()
asyncio.run(main())
