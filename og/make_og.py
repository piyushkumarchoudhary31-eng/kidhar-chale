import asyncio,json,re,unicodedata,html,os
from collections import defaultdict
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
OUT='/home/claude/kidhar-chale/places/og/';os.makedirs(OUT,exist_ok=True)
P=json.load(open(S+'places.json'))
def slug(s):
  s=unicodedata.normalize('NFD',s.replace('&',' and ')).encode('ascii','ignore').decode().lower();return re.sub(r'[^a-z0-9]+','-',s).strip('-')
by=defaultdict(list)
for p in P:by[p['state']].append(p)
E=lambda s:html.escape(str(s))
TPL='''<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#EEE8DB;font-family:"Instrument Sans",sans-serif;color:#1F1B16;padding:56px 64px;display:flex;flex-direction:column;justify-content:space-between}
.k{font:600 22px "IBM Plex Mono",monospace;letter-spacing:.14em;color:#B5431C}
h1{font:800 {fs}px/0.95 "Big Shoulders",sans-serif;letter-spacing:-.01em;margin:14px 0 0;max-width:1080px}
.t{display:flex;align-items:stretch;background:#B5431C;color:#fff;border-radius:10px;position:relative;margin-top:26px}
.t:before,.t:after{content:"";position:absolute;top:50%;width:30px;height:30px;border-radius:50%;background:#EEE8DB;transform:translateY(-50%)}.t:before{left:-15px}.t:after{right:-15px}
.n{padding:22px 34px;border-right:3px dashed rgba(255,255,255,.5);display:flex;flex-direction:column;justify-content:center}
.n b{font:800 84px/0.9 "Big Shoulders",sans-serif}.n span{font:600 20px "IBM Plex Mono",monospace;letter-spacing:.08em}
.l{padding:22px 34px;font:700 27px/1.35 "Instrument Sans",sans-serif;display:flex;flex-direction:column;justify-content:center}
.f{display:flex;justify-content:space-between;align-items:flex-end;font:700 24px "Instrument Sans",sans-serif}
.br{font:800 44px "Big Shoulders",sans-serif}.br i{font-style:normal;background:#E3A23B;border:3px solid #2B261F;border-radius:8px;padding:0 8px;margin-left:4px}
.f small{font:600 20px "IBM Plex Mono",monospace;color:#665D51;letter-spacing:.06em}
</style></head><body><div><p class="k">{kick}</p><h1>{title}</h1>
<div class="t"><div class="n"><b>{n}</b><span>PLACES</span></div><div class="l">{list}</div></div></div>
<div class="f"><span class="br">Kidhar Chale<i>?</i></span><small>BEST TIME · HOW TO REACH · REAL COSTS</small></div></body></html>'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1200,'height':630})
    for st,lst in by.items():
      ab=lst[0]['reg'].startswith('X');top=lst[:4]
      title=f'Budget trips in {st}';fs=96 if len(title)<24 else 80 if len(title)<32 else 64
      h=TPL.replace('{kick}','FREE TRAVEL GUIDE · '+('ABROAD' if ab else 'INDIA')).replace('{title}',E(title)).replace('{fs}',str(fs)).replace('{n}',str(len(lst))).replace('{list}',''.join(f'<span>{E(x["n"])}</span>' for x in top)+('<span style="opacity:.8">and more</span>' if len(lst)>4 else ''))
      await pg.set_content(h);await pg.wait_for_timeout(60)
      await pg.screenshot(path=OUT+slug(st)+'-places.png')
    await b.close()
asyncio.run(main())
print(len(by),'images')
