"""Student savings and passes/permits pages, using the same look as the place pages."""
import json, html
R = '/home/claude/kidhar-chale/'
U = 'https://piyushkumarchoudhary31-eng.github.io/kidhar-chale/'


def head(title, desc, path, ld):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{U}{path}">
<meta name="theme-color" content="#B5431C">
<meta property="og:type" content="article"><meta property="og:site_name" content="Kidhar Chale?"><meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{U}{path}"><meta property="og:image" content="{U}og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="icon-192.png" type="image/png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@700;800&family=Instrument+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="assets/page.css">
<style>.tw{{overflow-x:auto;margin:10px 0}}table{{border-collapse:collapse;width:100%;font-size:15px;min-width:520px}}th,td{{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}}th{{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}}ul.tips{{padding-left:20px;margin:0}}ul.tips li{{margin:6px 0;max-width:68ch}}.src{{font-size:13.5px;color:var(--muted)}}.m{{display:inline-block;width:12px;height:12px;border-radius:50%;border:1.5px solid var(--ink);vertical-align:-1px}}.m.on{{background:var(--accent);border-color:var(--accent)}}.m.half{{background:linear-gradient(90deg,var(--accent) 50%,transparent 50%);border-color:var(--accent)}}.warn{{border-left:0;background:color-mix(in srgb,var(--tag) 18%,var(--surface));border:1.5px solid var(--edge);border-radius:6px;padding:10px 14px}}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body><div class="wrap">
<header class="top"><a class="brand" href="./"><i>?</i><span>Kidhar Chale<b>?</b></span></a><a class="cta-s" href="./#plan">Plan a trip</a></header>
<main>
'''


FOOT = '''</main>
<footer class="foot"><p><a href="./">Trip planner</a> · <a href="places/">All 1,000 places</a> · <a href="student-savings.html">Student savings</a> · <a href="passes-and-permits.html">Passes and permits</a> · <a href="about.html">About</a> · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></p>
<p class="muted">Rules, fees and timings change. Always check the official source before you travel.</p></footer>
</div></body></html>
'''

# ---------- student savings ----------
t = 'Student Travel Savings in India: Train Concession, Free Entry and Cheap Stays'
d = 'How students in India save on travel: the 50% railway student concession, free monument days, cheap stays like YHAI and gurudwaras, and money tips for budget trips.'
ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': t, 'description': d, 'dateModified': '2026-11-28', 'author': {'@type': 'Person', 'name': 'Piyush Choudhary'}, 'publisher': {'@type': 'Organization', 'name': 'Kidhar Chale?'}}
h = head(t + ' | Kidhar Chale?', d, 'student-savings.html', ld)
h += '''<p class="crumbs"><a href="./">Home</a> › Student savings</p>
<h1>Travel more on a student budget</h1>
<p class="lede">Every rupee saved on the ticket is one more day on the road. Here is what actually works for students in India, with links to the official rules.</p>
<p class="muted">Last checked: 28 November 2026</p>

<section class="card"><h2>🚆 Trains: the student concession</h2>
<ul class="tips">
<li><b>50% off Sleeper and Second class</b> for students travelling home or on educational tours (75% for SC/ST students). You need a concession certificate signed by your college or school.</li>
<li>The concession works only on <b>counter (I-) tickets</b>, not on IRCTC e-tickets. You can book a normal ticket first, then exchange it at a reservation counter with the certificate; the difference is refunded minus a ₹20 clerkage charge.</li>
<li><b>Monthly season tickets at half price</b> for students, for daily travel up to 150 km between home and college.</li>
<li>For short hops, buy unreserved tickets on the official <b>UTS app</b> instead of standing in the queue.</li>
</ul>
<p class="src">Source: <a href="https://erail.in/info/train-fare-general/401?ID=210" target="_blank" rel="noopener">erail summary of the Indian Railways student concession rules</a>, <a href="https://indianrailways.gov.in/railwayboard/uploads/directorate/traffic_comm/Comm_Cir_2025/ANNEXURE%204%20%20%20%20%20%20%20General%20Rules%20for%20Concession.pdf" target="_blank" rel="noopener">Indian Railways general rules for concession (PDF)</a>.</p></section>

<section class="card"><h2>🏛 Monuments and museums</h2>
<ul class="tips">
<li><b>Children under 15 enter ASI monuments free</b>, Indian or foreign. The Taj Mahal costs ₹50 for Indians (₹200 more for the main tomb) and is closed every Friday.</li>
<li><b>Free entry days</b> at ASI monuments: World Heritage Day (18 April), International Museum Day (18 May) and World Heritage Week (19 to 25 November). Plan Agra or Delhi trips around them.</li>
<li>Many state-run museums and forts sell cheaper student tickets. Always carry your college ID card and ask at the counter.</li>
</ul>
<p class="src">Sources: <a href="https://tajmahal.gov.in/ticketing.aspx" target="_blank" rel="noopener">Taj Mahal official ticketing</a>, <a href="https://newsonair.gov.in/free-entry-to-all-asi-protected-monuments-on-world-heritage-day-tomorrow" target="_blank" rel="noopener">AIR News on free entry days</a>, <a href="https://www.outlooktraveller.com/News/world-heritage-week-2026-explore-indias-historic-monuments-without-an-entry-fee" target="_blank" rel="noopener">Outlook Traveller on World Heritage Week</a>.</p></section>

<section class="card"><h2>🛏 Cheap and free places to sleep</h2>
<ul class="tips">
<li><b>YHAI youth hostels</b>: a membership gets you cheap dorm beds across India and some of the cheapest guided treks. <a href="https://www.yhaindia.org/" target="_blank" rel="noopener">yhaindia.org</a></li>
<li><b>Gurudwaras</b> offer free langar to everyone, and many have sarais (rooms) for pilgrims for a donation. Be respectful: cover your head and follow the rules.</li>
<li><b>Dharamshalas and ashrams</b> in pilgrim towns like Rishikesh, Haridwar, Varanasi and Pushkar give clean, very cheap rooms.</li>
<li><b>Hostel volunteering</b>: many backpacker hostels give a free bed and meals for a few hours of work a day. Read the terms before you agree.</li>
<li><b>Overnight buses and trains</b> save a night of stay. Our planner uses them when you tick "Overnight is fine".</li>
</ul></section>

<section class="card"><h2>🚌 Getting around for less</h2>
<ul class="tips">
<li>State government buses (HRTC, RSRTC, KSRTC, UPSRTC and others) are usually the cheapest way between towns, and many now sell tickets online.</li>
<li>In the mountains, <b>shared jeeps and sumos</b> leave from fixed stands and cost a fraction of a private taxi.</li>
<li>Split cabs, scooters and rooms with friends. The <a href="./#fun">Money tool</a> works out who owes whom.</li>
</ul></section>

<section class="card"><h2>🍛 Food and money</h2>
<ul class="tips">
<li>Eat where locals eat: thalis, dhabas, college canteens and temple or gurudwara langar.</li>
<li>Carry a bottle and refill it with filtered water to save on bottled water.</li>
<li>UPI works almost everywhere, but keep some cash for hills and villages where the network drops and ATMs are far apart.</li>
</ul></section>

<section class="card"><h2>🏔 Ladakh tip</h2>
<p>Indian visitors to Ladakh pay an online environment fee instead of an inner line permit. Students can ask at the Leh DC office about a reduced student fee. See <a href="passes-and-permits.html">passes and permits</a> for details.</p></section>
<p><a class="btn" href="./?find=1#explore">Find trips under my budget</a> <a class="btn alt" href="./#plan">Plan a trip</a></p>
''' + FOOT
open(R + 'student-savings.html', 'w').write(h)

# ---------- passes and permits ----------
t = 'Mountain Passes and Travel Permits in India: When They Open and How to Get Permits'
d = 'When Rohtang, Zoji La, Baralacha La, Kunzum and other passes are usually open, plus permits for Ladakh, Sikkim, Arunachal, Nagaland, Mizoram, Manipur and Lakshadweep.'
ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': t, 'description': d, 'dateModified': '2026-11-28', 'publisher': {'@type': 'Organization', 'name': 'Kidhar Chale?'}}
h = head(t + ' | Kidhar Chale?', d, 'passes-and-permits.html', ld)
M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
passes = [
    ('Rohtang Pass', 'Manali to Lahaul', '3,978 m', [6, 7, 8, 9, 10], [5, 11], 'Opens mid to late May; closed on most Tuesdays. Vehicles need an online permit (see below). Use the Atal Tunnel to go beyond.'),
    ('Atal Tunnel', 'Manali to Lahaul', '3,060 m', list(range(1, 13)), [], 'Open all year, but may shut for a few hours or days after heavy snow.'),
    ('Baralacha La', 'Manali to Leh', '4,890 m', [6, 7, 8, 9], [10], 'The Manali–Leh highway usually runs from June to about mid-October.'),
    ('Tanglang La', 'Manali to Leh', '5,328 m', [6, 7, 8, 9], [5, 10], 'Same season as the Manali–Leh highway.'),
    ('Kunzum Pass', 'Lahaul to Spiti', '4,551 m', [6, 7, 8, 9, 10], [11], 'Usually June to October. In winter, reach Spiti from Shimla via Kinnaur instead.'),
    ('Zoji La', 'Srinagar to Kargil and Leh', '3,528 m', [4, 5, 6, 7, 8, 9, 10, 11], [3, 12], 'Usually closed for some weeks in winter; in 2026 the BRO kept it open past February for the first time.'),
    ('Khardung La', 'Leh to Nubra', '5,359 m', list(range(1, 13)), [], 'Kept open most of the year; closes for short spells after snow.'),
    ('Chang La', 'Leh to Pangong', '5,360 m', list(range(1, 13)), [], 'Kept open most of the year; very cold and icy in winter.'),
    ('Mughal Road', 'Shopian to Poonch (Peer Ki Gali)', '3,490 m', [5, 6, 7, 8, 9, 10], [4, 11], 'Usually May to November.'),
    ('Sinthan Top', 'Anantnag to Kishtwar', '3,748 m', [6, 7, 8, 9, 10], [5, 11], 'Usually late May to November.'),
    ('Sach Pass', 'Chamba to Pangi', '4,420 m', [7, 8, 9], [6, 10], 'Usually late June to October; rough road.'),
    ('Jalori Pass', 'Jibhi to Shoja and Ani', '3,120 m', [3, 4, 5, 6, 7, 8, 9, 10, 11], [12, 2], 'Often blocked by snow from December to February.'),
    ('Sela Pass', 'Bomdila to Tawang', '4,170 m', list(range(1, 13)), [], 'The Sela tunnel keeps Tawang reachable all year; the old pass road can be snowbound.'),
    ('Nathu La', 'Gangtok to the China border', '4,310 m', list(range(1, 13)), [], 'Indian nationals only, with a permit through a registered operator. Closed on some days each week; check with your operator.'),
]
h += '''<p class="crumbs"><a href="./">Home</a> › Passes and permits</p>
<h1>Mountain passes and travel permits</h1>
<p class="lede">When the high passes usually open, and which permits Indian travellers need. Snow changes things every year, so use this to plan and check live status before you go.</p>
<p class="muted">Last checked: 28 November 2026</p>
<p class="warn"><b>Before any mountain trip:</b> check the latest road status with the district administration, state police or the Border Roads Organisation (BRO) on social media, and ask your bus or taxi stand on the day.</p>
<section class="card"><h2>🏔 When the passes are usually open</h2><p class="src"><span class="m on"></span> usually open · <span class="m half"></span> may open or close this month · <span class="m off"></span> usually closed</p><div class="tw"><table><tr><th>Pass</th><th>Route</th><th>Height</th>''' + ''.join(f'<th>{m}</th>' for m in M) + '<th>Notes</th></tr>'
for n, r, a, op, edge, note in passes:
    cells = ''.join(f'<td title="{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}"><span class="m {"on" if i + 1 in op else "half" if i + 1 in edge else "off"}"></span></td>' for i in range(12))
    h += f'<tr><td><b>{n}</b></td><td>{r}</td><td>{a}</td>{cells}<td>{note}</td></tr>'
h += '''</table></div><p class="src">Typical seasons, not guarantees. Zoji La update: <a href="https://www.tribuneindia.com/news/j-k/bro-breaks-record-zoji-la-pass-on-srinagar-leh-highway-stays-open-through-winter/" target="_blank" rel="noopener">The Tribune, March 2026</a>.</p></section>

<section class="card"><h2>📄 Permits for Indian travellers</h2><div class="tw"><table><tr><th>Where</th><th>What you need</th><th>How to get it</th></tr>
<tr><td><b>Ladakh</b> (Nubra, Pangong, Tso Moriri, Hanle)</td><td>No inner line permit since 2021. Pay the environment fee: ₹400 once, plus ₹20 a day wildlife fee (₹50 Red Cross optional). Valid 21 days. Under-12s exempt.</td><td>Online at <a href="https://www.lahdclehpermit.in/" target="_blank" rel="noopener">lahdclehpermit.in</a>; carry the printout and photo ID.</td></tr>
<tr><td><b>Rohtang Pass</b> (Himachal)</td><td>Vehicle permit ₹550 for sightseeing at the pass. Not needed if you go through the Atal Tunnel. Going beyond Sissu into Lahaul, non-HP vehicles pay a ₹200 (car) or ₹50 (bike) entry fee.</td><td>Online at <a href="https://rohtangpermits.hp.gov.in/" target="_blank" rel="noopener">rohtangpermits.hp.gov.in</a>; taxis in Manali arrange it.</td></tr>
<tr><td><b>Sikkim</b></td><td>No permit to enter the state. A Protected Area Permit is needed for Tsomgo Lake, Nathu La, Zuluk, Dzongu and North Sikkim (Lachen, Lachung, Gurudongmar: minimum 3 days, maximum 5).</td><td>Through a registered tour operator in Gangtok; carry photos and two photo IDs.</td></tr>
<tr><td><b>Arunachal Pradesh</b></td><td>Inner Line Permit (ILP) for all visitors from outside the state.</td><td>Official e-ILP portal (linked from the Arunachal tourism site), or liaison offices in Delhi, Kolkata and Guwahati.</td></tr>
<tr><td><b>Nagaland</b></td><td>Inner Line Permit.</td><td><a href="https://ilp.nagaland.gov.in/" target="_blank" rel="noopener">ilp.nagaland.gov.in</a></td></tr>
<tr><td><b>Mizoram</b></td><td>Inner Line Permit; temporary permits usually for 15 days, extendable.</td><td><a href="https://ilp.mizoram.gov.in/" target="_blank" rel="noopener">ilp.mizoram.gov.in</a></td></tr>
<tr><td><b>Manipur</b></td><td>Inner Line Permit; tourist permit valid 30 days. Kiosks at Imphal airport.</td><td><a href="https://manipurilponline.mn.gov.in/" target="_blank" rel="noopener">manipurilponline.mn.gov.in</a></td></tr>
<tr><td><b>Lakshadweep</b></td><td>Entry permit for every visitor, usually with a sponsor or an approved booking.</td><td>Through the Lakshadweep Administration.</td></tr>
<tr><td><b>Meghalaya, Assam, Tripura</b></td><td>No inner line permit. Meghalaya has been bringing in visitor registration, so check before you go.</td><td>Not needed.</td></tr>
</table></div>
<p class="src">Sources: <a href="https://discoverwithdheeraj.com/how-to-get-ladakh-inner-line-permits-online/" target="_blank" rel="noopener">Ladakh permit guide (May 2026)</a>, <a href="https://discoverwithdheeraj.com/rohtang-pass-permit-guide-2026/" target="_blank" rel="noopener">Rohtang permit guide 2026</a>, <a href="https://discoverwithdheeraj.com/sikkim-permits-rap-pap-ilp-guide/" target="_blank" rel="noopener">Sikkim permits 2026</a>, <a href="https://www.happyfares.in/blog/inner-line-permit-northeast-flying-arunachal-mizoram-nagaland-manipur-2026/" target="_blank" rel="noopener">Northeast ILP guide</a>, <a href="https://www.businesstoday.in/india/story/from-colonial-lines-to-protected-zones-why-indian-citizens-need-permits-to-visit-parts-of-india-562040-2026-10-16" target="_blank" rel="noopener">Business Today, October 2026</a>. Fees are set by each state and shown on the official portal before you pay.</p></section>
<p><a class="btn" href="./#plan">Plan a mountain trip</a> <a class="btn alt" href="student-savings.html">Student savings</a></p>
''' + FOOT
open(R + 'passes-and-permits.html', 'w').write(h)
print('ok')
