"""Build a static guide page for every place, a page per state/country, a places index, and the sitemap."""
import json, math, re, unicodedata, html, os, shutil
from collections import defaultdict
S = '/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
R = '/home/claude/kidhar-chale/'
U = 'https://piyushkumarchoudhary31-eng.github.io/kidhar-chale/'
TODAY = '2026-11-28'
P = json.load(open(S + 'places.json'))
CO = {}
for l in open(S + 'coords.txt'):
    n, a, b = l.strip().split('|'); CO[n] = (float(a), float(b))
PLANS = {x['n']: x for x in json.load(open(S + 'pages/plans.json')) if 'plan' in x}
MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
TAG = {'u': 'Underrated', 'r': 'Remote', 'b': 'Beaches', 'm': 'Mountains', 's': 'Snow', 't': 'Treks', 'l': 'Lakes', 'w': 'Waterfalls', 'd': 'Desert',
       'h': 'Heritage', 'p': 'Spiritual', 'f': 'Wildlife', 'i': 'Islands', 'k': 'Backpacker hub'}
TAGE = {'u': '💎', 'r': '🛖', 'b': '🏖', 'm': '🏔', 's': '❄️', 't': '🥾', 'l': '🏞', 'w': '💧', 'd': '🐪', 'h': '🏛', 'p': '🛕', 'f': '🐅', 'i': '🏝', 'k': '🎒'}
REGN = {'N': 'North India and the Himalaya', 'NE': 'Northeast India and Sikkim', 'E': 'East India', 'W': 'West India', 'S': 'South India', 'C': 'Central India', 'I': 'Indian islands',
        'XSA': 'Nepal, Bhutan, Sri Lanka and neighbours', 'XSE': 'Southeast Asia', 'XEA': 'East Asia', 'XME': 'Middle East and Central Asia', 'XEU': 'Europe', 'XAF': 'Africa', 'XAM': 'The Americas', 'XOC': 'Australia and the Pacific'}
E = lambda s: html.escape(str(s), quote=True)


def slug(s):
    s = unicodedata.normalize('NFD', s.replace('&', ' and ')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def months(best):
    out = []
    for part in best.split(','):
        a, _, b = part.partition('-'); a = int(a); b = int(b or a)
        out.append(MS[a - 1] + ('–' + MS[b - 1] if b != a else ''))
    return ', '.join(out)


def km(a, b):
    R_ = 6371; la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R_ * math.asin(math.sqrt(d))


def cost_txt(c, abroad):
    if abroad:
        return ['₹ Cheap (under ₹2,500 a day)', '₹₹ Moderate (₹2,500–5,000 a day)', '₹₹₹ Pricey (over ₹5,000 a day)'][c - 1]
    return ['₹ Cheap: dorms, buses and dhabas', '₹₹ Moderate: a mix of dorms, homestays and shared cabs', '₹₹₹ Pricier: fewer budget beds and more cab rides'][c - 1]


inr = lambda n: '₹' + indian(round(n))


def indian(n):
    s = str(n)
    if len(s) <= 3: return s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2: parts.insert(0, head[-2:]); head = head[:-2]
    if head: parts.insert(0, head)
    return ','.join(parts) + ',' + tail


for p in P:
    p['slug'] = slug(p['n']); p['abroad'] = p['reg'].startswith('X'); p['ss'] = slug(p['state']) + '-places'
seen = defaultdict(list)
for p in P: seen[p['slug']].append(p)
for k, v in seen.items():
    if len(v) > 1:
        for p in v: p['slug'] = slug(p['n'] + ' ' + p['state'])
assert len({p['slug'] for p in P}) == len(P)
by_state = defaultdict(list)
for p in P: by_state[p['state']].append(p)
state_reg = {p['state']: p['reg'] for p in P}

HEAD = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#B5431C">
<meta property="og:type" content="article"><meta property="og:site_name" content="Kidhar Chale?"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{url}"><meta property="og:image" content="{U}og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}icon-192.png" type="image/png"><link rel="apple-touch-icon" href="{root}apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@700;800&family=Instrument+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="{root}assets/page.css">
<script type="application/ld+json">{ld}</script>
</head><body><div class="wrap">
<header class="top"><a class="brand" href="{root}"><i>?</i><span>Kidhar Chale<b>?</b></span></a><a class="cta-s" href="{root}#plan">Plan a trip</a></header>
'''
FOOT = '''<footer class="foot"><p><a href="{root}">Trip planner</a> · <a href="{root}places/">All 1,000 places</a> · <a href="{root}student-savings.html">Student savings</a> · <a href="{root}passes-and-permits.html">Passes and permits</a> · <a href="{root}about.html">About</a> · <a href="{root}privacy.html">Privacy</a> · <a href="{root}terms.html">Terms</a></p>
<p class="muted">Prices and timings are typical estimates and change often. Always check before you book or travel.</p></footer>
</div><script src="{root}assets/config.js"></script><script src="{root}assets/photo.js" defer></script></body></html>
'''


def page(p):
    root = '../'
    url = f'{U}places/{p["slug"]}.html'
    ab = p['abroad']
    title = f'{p["n"]} on a Budget: Best Time, How to Reach, Cost | Kidhar Chale?'
    desc = f'{p["why"]} Best time: {months(p["best"])}. {p["reach"]}.'
    if len(desc) > 158: desc = desc[:155].rsplit(' ', 1)[0] + '…'
    c = CO.get(p['n'])
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'TouristDestination', 'name': p['n'], 'description': p['why'], 'url': url,
         'containedInPlace': {'@type': 'Country' if ab else 'State', 'name': p['state']},
         **({'geo': {'@type': 'GeoCoordinates', 'latitude': c[0], 'longitude': c[1]}} if c else {}),
         'touristType': [TAG[t] for t in p['tags'] if t in TAG]},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Kidhar Chale?', 'item': U},
            {'@type': 'ListItem', 'position': 2, 'name': 'Places', 'item': U + 'places/'},
            {'@type': 'ListItem', 'position': 3, 'name': p['state'], 'item': f'{U}places/{p["ss"]}.html'},
            {'@type': 'ListItem', 'position': 4, 'name': p['n'], 'item': url}]}]}
    h = HEAD.format(title=E(title), desc=E(desc), url=url, U=U, root=root, ld=json.dumps(ld, ensure_ascii=False))
    h += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="{root}places/">Places</a> › <a href="{p["ss"]}.html">{E(p["state"])}</a> › <span>{E(p["n"])}</span></nav>\n<main>\n'
    h += f'<div class="kc-ph kc-ph-wait" data-ph="{E(p["n"])}|{E(p["state"])}" aria-hidden="true"></div>\n'
    h += f'<h1>{E(p["n"])}</h1><p class="lede">{E(p["why"])}</p>\n'
    h += '<p class="tags">' + ''.join(f'<span>{TAGE.get(t, "")} {TAG[t]}</span>' for t in p['tags'] if t in TAG) + (f'<span>🌏 {E(p["state"])}</span>' if ab else f'<span>📍 {E(p["state"])}</span>') + '</p>\n'
    h += '<section class="card facts"><dl>'
    h += f'<div><dt>Best time</dt><dd>{months(p["best"])}</dd></div>'
    h += f'<div><dt>How to get there</dt><dd>{E(p["reach"])}</dd></div>'
    h += f'<div><dt>Daily cost</dt><dd>{cost_txt(p["cost"], ab)}</dd></div>'
    if c: h += f'<div><dt>On the map</dt><dd><a href="https://www.google.com/maps/search/?api=1&amp;query={c[0]},{c[1]}" target="_blank" rel="noopener">Google Maps</a> · <a href="https://www.openstreetmap.org/?mlat={c[0]}&amp;mlon={c[1]}#map=11/{c[0]}/{c[1]}" target="_blank" rel="noopener">OpenStreetMap</a></dd></div>'
    h += '</dl><div class="kc-real" data-place="' + E(p['n']) + '"></div></section>\n'
    pl = PLANS.get(p['n'])
    if pl:
        d = pl['plan']['days']; n = len(d)
        h += f'<section class="card"><h2>Sample budget from {E(pl["from"])}</h2>'
        h += f'<p class="big">about {inr(pl["plan"]["sum"])} <small>per person, {n} days</small></p>'
        h += '<p>Built by our planner for a tight budget: government buses or sleeper trains, dorm beds and local food. Real trips usually cost 20 to 40 percent more, and travel times on mountain roads can be much longer.</p>'
        h += '<ol class="outline">' + ''.join(f'<li><b>Day {x["day"]}</b> {E(x["city"])}{(" · sleep in " + E(x["stay"]["city"])) if x["stay"].get("price") else ""}</li>' for x in d) + '</ol>'
        h += f'<p><a class="btn" href="{root}?to={E(p["n"])}&amp;from={E(pl["from"])}&amp;days={n}#plan">Make the full day-by-day plan</a> <a class="btn alt" href="{root}?to={E(p["n"])}#plan">Plan from my city</a></p></section>\n'
    else:
        h += f'<section class="card"><h2>Plan this trip</h2><p>Make a day-by-day plan with buses, trains, beds and real costs, starting from your city.</p><p><a class="btn" href="{root}?to={E(p["n"])}#plan">Plan a trip to {E(p["n"])}</a></p></section>\n'
    # nearby
    if c:
        near = sorted([(km(c, CO[q['n']]), q) for q in P if q is not p and q['n'] in CO], key=lambda x: x[0])
        near = [x for x in near if x[0] <= 220][:6]
    else:
        near = [(0, q) for q in by_state[p['state']] if q is not p][:6]
    if near:
        h += f'<section><h2>{"Nearby" if c else "More in " + E(p["state"])}</h2><ul class="near">' + ''.join(
            f'<li><a href="{q["slug"]}.html"><b>{E(q["n"])}</b><span>{E(q["why"])}</span>{f"<small>{round(dk)} km away</small>" if c else ""}</a></li>' for dk, q in near) + '</ul></section>\n'
    w = p['n'].replace(' ', '_')
    h += f'<section><h2>Read more</h2><p class="links"><a href="https://en.wikipedia.org/w/index.php?search={E(p["n"])}+{E(p["state"])}" target="_blank" rel="noopener">Wikipedia</a> · <a href="https://en.wikivoyage.org/w/index.php?search={E(p["n"])}" target="_blank" rel="noopener">Wikivoyage</a> · <a href="https://www.google.com/search?q={E(p["n"])}+{E(p["state"])}&amp;tbm=isch" target="_blank" rel="noopener">Photos</a></p></section>\n'
    h += '</main>\n' + FOOT.format(root=root)
    return h


def state_page(state, lst):
    root = '../'; ss = slug(state) + '-places'; ab = lst[0]['abroad']
    url = f'{U}places/{ss}.html'
    title = f'{len(lst)} Budget Places to Visit in {state} | Kidhar Chale?'
    desc = f'{len(lst)} places in {state} for budget travellers, with the best time to go, how to reach and daily cost: ' + ', '.join(p['n'] for p in lst[:6]) + ' and more.'
    if len(desc) > 158: desc = desc[:155].rsplit(' ', 1)[0] + '…'
    ld = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': f'Places to visit in {state}', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'url': f'{U}places/{p["slug"]}.html', 'name': p['n']} for i, p in enumerate(lst)]}
    h = HEAD.format(title=E(title), desc=E(desc), url=url, U=U, root=root, ld=json.dumps(ld, ensure_ascii=False))
    h += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="{root}places/">Places</a> › <span>{E(state)}</span></nav>\n<main>\n'
    h += f'<h1>Budget places in {E(state)}</h1><p class="lede">{len(lst)} places picked for students and budget travellers, sorted with the cheapest first.</p>\n<ul class="near grid">'
    for p in sorted(lst, key=lambda x: (x['cost'], x['n'])):
        h += f'<li><a href="{p["slug"]}.html"><b>{E(p["n"])}</b><span>{E(p["why"])}</span><small>Best {months(p["best"])} · {"₹" * p["cost"]}</small></a></li>'
    h += '</ul>\n</main>\n' + FOOT.format(root=root)
    return h


def index_page():
    root = '../'; url = f'{U}places/'
    title = 'All 1,000 Places: Budget Travel Guides for India and Abroad | Kidhar Chale?'
    desc = 'Every place on Kidhar Chale?: 643 in India and 357 abroad, with the best time to go, how to reach and daily cost, grouped by state and country.'
    ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'All places', 'url': url}
    h = HEAD.format(title=E(title), desc=E(desc), url=url, U=U, root=root, ld=json.dumps(ld))
    h += '<main>\n<h1>All 1,000 places</h1><p class="lede">643 places in India and 357 abroad. Pick a state or country.</p>\n'
    groups = defaultdict(list)
    for st, lst in by_state.items(): groups[state_reg[st]].append((st, lst))
    for reg in ['N', 'NE', 'E', 'W', 'S', 'C', 'I', 'XSA', 'XSE', 'XEA', 'XME', 'XEU', 'XAF', 'XAM', 'XOC']:
        if reg not in groups: continue
        h += f'<section><h2>{REGN[reg]}</h2><ul class="states">' + ''.join(
            f'<li><a href="{slug(st)}-places.html">{E(st)} <small>{len(lst)}</small></a></li>' for st, lst in sorted(groups[reg], key=lambda x: -len(x[1]))) + '</ul></section>\n'
    h += '</main>\n' + FOOT.format(root=root)
    return h


out = R + 'places/'
if os.path.isdir(out): shutil.rmtree(out)
os.makedirs(out)
for p in P: open(out + p['slug'] + '.html', 'w').write(page(p))
for st, lst in by_state.items(): open(out + slug(st) + '-places.html', 'w').write(state_page(st, lst))
assert not set(slug(s) + '-places' for s in by_state) & set(p['slug'] for p in P), 'state slug clashes with a place slug'
open(out + 'index.html', 'w').write(index_page())
# sitemap
urls = [(U, '1.0', 'weekly'), (U + 'places/', '0.8', 'weekly')] + [(f'{U}places/{slug(st)}-places.html', '0.6', 'monthly') for st in by_state] + [(f'{U}places/{p["slug"]}.html', '0.7', 'monthly') for p in P]
urls += [(U + x, '0.4', 'monthly') for x in ['student-savings.html', 'passes-and-permits.html', 'about.html']] + [(U + x, '0.2', 'yearly') for x in ['privacy.html', 'terms.html']]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><changefreq>{f}</changefreq><priority>{pr}</priority></url>\n' for u, pr, f in urls) + '</urlset>\n'
open(R + 'sitemap.xml', 'w').write(sm)
json.dump({p['n']: p['slug'] for p in P}, open(S + 'pages/slugs.json', 'w'), ensure_ascii=False)
print('pages', len(P), 'state pages', len(by_state), 'sitemap urls', len(urls))
