import asyncio,sys
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/seo/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    pg=await b.new_page(viewport={'width':1200,'height':630})
    await pg.goto('file://'+D+'og.html');await pg.wait_for_timeout(300)
    await pg.screenshot(path=D+'og-image.png')
    svg=open('/home/claude/kidhar-chale/icon.svg').read()
    for s,n in [(512,'icon-512.png'),(192,'icon-192.png'),(180,'apple-touch-icon.png')]:
      pg2=await b.new_page(viewport={'width':s,'height':s})
      # apple icon: full-bleed square (iOS rounds corners itself)
      bg='#FF3D8B' if n=='apple-touch-icon.png' else 'transparent'
      await pg2.set_content(f'<body style="margin:0;background:{bg}"><div style="width:{s}px;height:{s}px">{svg.replace("<svg ","<svg width=%d height=%d "%(s,s))}</div></body>')
      await pg2.screenshot(path=D+n,omit_background=(bg=='transparent'))
    await b.close()
asyncio.run(main())
