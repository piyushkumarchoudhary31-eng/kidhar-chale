import asyncio
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/know/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    c=await b.new_context(**p.devices['iPhone 13']);await c.add_init_script("try{localStorage.setItem('bg_toured','true');localStorage.setItem('bg_uilang','\"hi\"')}catch(e){}")
    async def h(r):return await (r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
    await c.route('**/*',h);pg=await c.new_page();await pg.goto('http://127.0.0.1:8791/kidhar-chale/');await pg.wait_for_timeout(2000)
    if await pg.locator('#m-know').is_visible():await pg.click('#m-know')
    await pg.wait_for_timeout(500);await pg.evaluate("document.querySelector('#p-form').scrollIntoView()");await pg.wait_for_timeout(500)
    await pg.screenshot(path=O+'hi-form.png')
    # untranslated text on visible screens
    for v in ['plan','explore','go','now','tools']:
      await pg.evaluate(f"bgShow('{v}');window.__v='{v}'");await pg.wait_for_timeout(700)
      t=await pg.evaluate("""()=>{const out=new Set();const w=document.createTreeWalker(document.querySelector('#v-'+(window.__v||'plan'))||document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const s=n.textContent.trim();const e=n.parentElement;if(!s||!/[A-Za-z]{3}/.test(s)||/[\\u0900-\\u097F]/.test(s))continue;if(!e||!e.offsetParent||e.closest('script,style,.leaflet-container,svg'))continue;out.add(s)}return [...out].slice(0,400)}""")
      print('==',v,len(t));print('\n'.join(t))
    await b.close()
    c=await b.new_context(viewport={'width':1366,'height':900}) if False else None
asyncio.run(main())
