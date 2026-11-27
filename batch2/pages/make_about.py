import json, sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/batch2/pages')
src = open('/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/batch2/pages/make_info.py').read()
ns = {}
exec(src.split('# ---------- student savings ----------')[0], ns)
head, FOOT, R = ns['head'], ns['FOOT'], ns['R']
t = 'About Kidhar Chale? and the Student Who Made It'
d = 'Kidhar Chale? is a free budget trip planner made by Piyush Choudhary, a B.Com student who grew up moving with his father\'s army postings and travels India by public bus.'
ld = {'@context': 'https://schema.org', '@type': 'AboutPage', 'name': 'About Kidhar Chale?', 'description': d,
      'mainEntity': {'@type': 'Person', 'name': 'Piyush Choudhary', 'birthPlace': 'Makrana, Rajasthan'}}
h = head(t + ' | Kidhar Chale?', d, 'about.html', ld)
h += '''<p class="crumbs"><a href="./">Home</a> › About</p>
<h1>Hi, I'm Piyush 👋</h1>
<p class="lede">I made Kidhar Chale? because I wanted one place that tells a student exactly how to go somewhere, where to sleep and what it will really cost. So I built it, and kept it free.</p>

<section class="card"><h2>Where I come from</h2>
<p>I was born in Makrana in Rajasthan, the little town whose white marble went into the Taj Mahal. My father is in the army, so growing up we kept moving: Hisar, Kota, Amritsar, Jodhpur and Jammu &amp; Kashmir. New school, new friends, new city every few years. Somewhere in all that moving, travel stopped being a holiday and became a habit.</p>
<p>Jodhpur is still my favourite city. My first trip without family was to Goram Ghat, a small hill station near Jodhpur on the old metre-gauge railway, and I still remember how free that felt.</p></section>

<section class="card"><h2>How I travel</h2>
<p>I travel the way most students can: by public bus, sleeper trains and shared jeeps, sleeping in dorms and eating wherever the locals eat. My rule is simple: no backtracking, no wasted money, and always leave time to wander and take photos.</p>
<p>So far I have been to Leh and the Atal Tunnel, Kashmir and Dal Lake, Vaishno Devi, Kasol, Manali, Rishikesh and Haridwar, Amritsar, Jaisalmer, Bikaner, Pushkar, Bundi, Chittorgarh, Mount Abu, Ranakpur and Kumbhalgarh, and a lot of small Rajasthan towns most maps forget. India is big, and I plan to see all of it, then the world.</p></section>

<section class="card"><h2>Why this site exists</h2>
<ul class="tips">
<li><b>Free for everyone.</b> No sign-up and no ads. Your plans stay on your own phone.</li>
<li><b>Real costs.</b> Plans use government buses, sleeper trains, dorms and dhabas, because that is how students actually travel.</li>
<li><b>Honest.</b> Prices are estimates. I tell you where to check, and I fix things when travellers tell me they are wrong.</li>
</ul>
<p>I'm a B.Com student at the School of Open Learning, University of Delhi. I also write Hindi poetry as <i>Lafz aur Piyush</i>, and I'm working on a travel book: <i>How to Travel India as a Student</i>.</p></section>

<section class="card"><h2>Help make it better</h2>
<p>Found a wrong price, a better route, or a place I should add? Tell me. Every message makes the site better for the next traveller.</p>
<p><a class="btn" href="./?feedback=#plan">Send feedback</a> <a class="btn alt" href="./#plan">Plan a trip</a></p></section>
''' + FOOT
open(R + 'about.html', 'w').write(h)
print('ok')
