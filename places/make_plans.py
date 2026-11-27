"""Make a sample plan for every Indian place from its nearest big city or gateway town, using the site's own planner."""
import asyncio, json, math
from playwright.async_api import async_playwright
S = '/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
P = json.load(open(S + 'places.json'))
CO = {}
for l in open(S + 'coords.txt'):
    n, a, b = l.strip().split('|'); CO[n] = (float(a), float(b))
HUBS = {'Delhi': (28.61, 77.21), 'Mumbai': (19.08, 72.88), 'Bengaluru': (12.97, 77.59), 'Chennai': (13.08, 80.27), 'Kolkata': (22.57, 88.36),
        'Hyderabad': (17.39, 78.49), 'Ahmedabad': (23.02, 72.57), 'Jaipur': (26.91, 75.79), 'Chandigarh': (30.73, 76.78), 'Guwahati': (26.14, 91.74),
        'Kochi': (9.93, 76.27), 'Bhubaneswar': (20.30, 85.82), 'Lucknow': (26.85, 80.95), 'Pune': (18.52, 73.86), 'Bhopal': (23.26, 77.41),
        'Patna': (25.59, 85.14), 'Jammu': (32.73, 74.86), 'Siliguri': (26.73, 88.40), 'Dehradun': (30.32, 78.03), 'Varanasi': (25.32, 82.97),
        'Madurai': (9.93, 78.12), 'Visakhapatnam': (17.69, 83.22), 'Udaipur': (24.58, 73.71), 'Jodhpur': (26.24, 73.02),
        'Srinagar': (34.08, 74.80), 'Leh': (34.16, 77.58), 'Manali': (32.24, 77.19), 'Gangtok': (27.33, 88.61), 'Shillong': (25.57, 91.88)}
GATE = {'Srinagar': 'Jammu & Kashmir', 'Leh': 'Ladakh', 'Manali': 'Himachal Pradesh', 'Gangtok': 'Sikkim', 'Shillong': 'Meghalaya'}


def km(a, b):
    R = 6371; la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(d))


jobs = []
for p in P:
    if p['reg'].startswith('X') or p['reg'] == 'I': continue
    c = CO.get(p['n'])
    if not c: continue
    # gateway towns only serve places in their own state
    cand = [(h, xy) for h, xy in HUBS.items() if h != p['n'] and km(xy, c) > 25 and (h not in GATE or GATE[h] == p['state'])]
    hub = min(cand, key=lambda h: km(h[1], c))
    d = km(hub[1], c) * 1.3
    nd = 2 if d < 250 else 3 if d < 600 else 4 if d < 1000 else 5
    jobs.append({'n': p['n'], 'from': hub[0], 'nd': nd, 'road': round(d)})


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); c = await b.new_context(reduced_motion='reduce')
        await c.add_init_script("localStorage.setItem('bg_toured','true')")
        await c.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.abort())
        pg = await c.new_page(); await pg.goto('http://127.0.0.1:8791/kidhar-chale/'); await pg.wait_for_timeout(1000)
        res = await pg.evaluate('''jobs=>jobs.map(j=>{let bud=j.nd*3000;let r=bgPlanQuick({from:j.from,stops:[j.n],nd:j.nd,bud,ppl:1});
            if(r&&r.error){r=bgPlanQuick({from:j.from,stops:[j.n],nd:j.nd+1,bud:bud+3000,ppl:1});if(r&&!r.error)j.nd++}
            if(!r||r.error)return Object.assign(j,{err:r&&r.error||'none'});
            let sum=0;r.days.forEach(d=>{d.items.forEach(i=>sum+=i.cost||0);const o=d.stay.options[d.stay.pick];if(o)sum+=+o.price||0});
            return Object.assign(j,{plan:{title:r.title,days:r.days.map(d=>({day:d.day,city:d.city,items:d.items.map(i=>[i.time,i.what,i.cost]),stay:d.stay.options[d.stay.pick]?{city:d.stay.city,type:d.stay.options[d.stay.pick].type,name:d.stay.options[d.stay.pick].name,price:d.stay.options[d.stay.pick].price}:{city:d.stay.city}})),tips:(r.tips||[]).slice(0,3),sum}})})''', jobs)
        json.dump(res, open(S + 'pages/plans.json', 'w'), ensure_ascii=False)
        ok = [r for r in res if 'plan' in r]; bad = [r for r in res if 'plan' not in r]
        print('ok', len(ok), 'failed', len(bad), [(r['n'], r['err']) for r in bad[:15]])
        from collections import Counter
        print(Counter(r['from'] for r in ok).most_common(30))
        await b.close()

asyncio.run(main())
