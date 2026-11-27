import asyncio,sys
sys.path.insert(0,'.')
from e2e import mk,B,O
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    A,pa,ea=await mk(b,p,'iPhone 13');await pa.goto(B);await pa.wait_for_timeout(1200)
    await pa.evaluate("bgShow('fun')");await pa.evaluate("(()=>{const c=document.querySelector('#gr-start').closest('.card');c.classList.add('kc-open')})()")
    await pa.fill('#gr-name','Goa trip');await pa.fill('#gr-mem','Piyush, Aman, Riya');await pa.click('#gr-create');await pa.wait_for_timeout(500)
    await pa.select_option('#gr-pay','Piyush');await pa.fill('#gr-amt','900');await pa.fill('#gr-what','Bus tickets');await pa.click('#gr-add');await pa.wait_for_timeout(1500)
    code=(await pa.text_content('#gr-c')).strip();print('code',code,'| A status:',await pa.text_content('#kc-gr-live'))
    await pa.locator('#gr-room').scroll_into_view_if_needed();await pa.screenshot(path=O+'room-a.png')
    Bc,pb,eb=await mk(b,p,'laptop');await pb.goto(B+'?room='+code);await pb.wait_for_timeout(3000)
    print('B joined, sees:',await pb.evaluate("[...document.querySelectorAll('#gr-list .li')].map(x=>x.textContent.trim())"),'| B status:',await pb.text_content('#kc-gr-live'))
    await pb.select_option('#gr-pay','Riya');await pb.fill('#gr-amt','600');await pb.fill('#gr-what','Dinner');await pb.click('#gr-add');await pb.wait_for_timeout(1500)
    await pb.screenshot(path=O+'room-b.png')
    await pa.wait_for_timeout(12000)
    print('A after poll sees:',await pa.evaluate("[...document.querySelectorAll('#gr-list .li')].map(x=>x.textContent.trim())"),'| settle:',await pa.text_content('#gr-settle'))
    # A deletes Dinner -> B sees it gone
    await pa.evaluate("[...document.querySelectorAll('#gr-list .li')].find(x=>x.textContent.includes('Dinner')).querySelector('[data-id]').click()");await pa.wait_for_timeout(1500)
    await pb.wait_for_timeout(12000)
    print('B after delete sees:',await pb.evaluate("[...document.querySelectorAll('#gr-list .li')].map(x=>x.textContent.trim())"))
    print('bad code:');await pb.click('#gr-leave');await pb.fill('#gr-code','ZZZZZZ');await pb.click('#gr-join');await pb.wait_for_timeout(1500);print(' ',await pb.text_content('#gr-err'))
    print('errors',ea,eb);await b.close()
asyncio.run(main())
