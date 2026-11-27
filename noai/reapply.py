"""Put the emojis back: take the emoji-kept clean-up (noai/keep) and re-apply every later change."""
import re, shutil
S = '/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
K = S + 'noai/keep/'
CUR = S + 'bk/pre-emoji-back/'
BK = S + 'bk/pre-noai/'


def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)


def rep(s, a, b, n=1):
    assert s.count(a) == n, (a[:70], s.count(a))
    return s.replace(a, b)


# loader: exactly as it was, city colours and all
for f in ['kc-loader.js', 'kc-loader.css']:
    shutil.copy(BK + f, S + f)

# kc-ai, kc-extra: clean-up only
for f in ['kc-ai.js', 'kc-extra.js']:
    shutil.copy(K + f, S + f)

# kc-extra.css: popup font
s = rd(K + 'kc-extra.css')
s = rep(s, "font:13px/1.4 'DM Sans',sans-serif;color:#16121F", "font:13px/1.4 'Instrument Sans',sans-serif;color:#1F1B16")
wr(S + 'kc-extra.css', s)

# kc-extra2.js: skeletons + share picture
s = rd(K + 'kc-extra2.js')
s = rep(s, '<span id="wx-now" class="wx">🌡 Weather…</span>', '<span id="wx-now" class="wx kc-skel" aria-busy="true">🌡 Weather…</span>')
s = rep(s, "const el=$('#wx-now');if(!el)return;", "const el=$('#wx-now');if(!el)return;el.classList.remove('kc-skel');el.removeAttribute('aria-busy');")
s = rep(s, '<p class="sub" style="padding:16px">Loading the map…</p>', '<p class="kc-skel kc-mapskel" aria-busy="true">Loading the map…</p>')
for a, b in [("g.fillStyle='#F1ECFF';g.fillRect(0,0,W,H);", "g.fillStyle='#EEE8DB';g.fillRect(0,0,W,H);"),
             ("const card=(x,y,w,h,f)=>{g.fillStyle='#16121F';g.fillRect(x+12,y+12,w,h);g.fillStyle=f;g.fillRect(x,y,w,h);g.lineWidth=6;g.strokeStyle='#16121F';g.strokeRect(x,y,w,h)};",
              "const card=(x,y,w,h,f)=>{g.fillStyle=f;g.fillRect(x,y,w,h);g.lineWidth=3;g.strokeStyle='#2B261F';g.strokeRect(x,y,w,h)};"),
             ("card(70,70,940,300,'var(--accent)');", "card(70,70,940,300,'#B5431C');"),
             ("g.fillStyle='#fff';g.font='900 64px Unbounded, Arial Black, sans-serif';g.fillText('Kidhar Chale?',110,170);",
              "g.fillStyle='#FAF7F0';g.font='800 84px \"Big Shoulders\", \"Arial Narrow\", sans-serif';g.fillText('KIDHAR CHALE?',110,175);"),
             ("card(70,430,940,ch,'#FFFFFF');g.fillStyle='#16121F';", "card(70,430,940,ch,'#FAF7F0');g.fillStyle='#1F1B16';"),
             ("g.fillStyle='#FFD23F';g.beginPath();g.arc(140,y-15,18,0,7);g.fill();g.strokeStyle='#16121F';", "g.fillStyle='#E3A23B';g.beginPath();g.arc(140,y-15,16,0,7);g.fill();g.strokeStyle='#2B261F';"),
             ("g.fillStyle='#16121F';g.fillText(x.length", "g.fillStyle='#1F1B16';g.fillText(x.length"),
             ("g.fillStyle='#16121F';g.font='600 30px DM Sans", "g.fillStyle='#1F1B16';g.font='600 30px DM Sans")]:
    s = rep(s, a, b)
s = s.replace("DM Sans, Arial, sans-serif", "\"Instrument Sans\", Arial, sans-serif")
s = s.replace("g.font='800 40px \"Instrument Sans\", Arial, sans-serif';g.fillText('MY ROUTE'", "g.font='800 44px \"Big Shoulders\", \"Arial Narrow\", sans-serif';g.fillText('MY ROUTE'")
wr(S + 'kc-extra2.js', s)

# kc-ux.js: terms link, Hindi, motion module, emoji motion
s = rd(K + 'kc-ux.js')
s = rep(s, """L.innerHTML='<a href="privacy.html">Privacy and cookies</a>'+""", """L.innerHTML='<a href="privacy.html">Privacy and cookies</a> · <a href="terms.html">Terms of use</a>'+""")
s = rep(s, "'Cookie settings':'कुकी सेटिंग्स'", "'Cookie settings':'कुकी सेटिंग्स','Terms of use':'उपयोग की शर्तें'")
c = rd(CUR + 'kc-ux.js')
i = c.find('/* ===== MOTION: sliding'); j = c.rfind('\nmark();')
motion = c[i:j]
assert i > 0 and len(motion) > 500
i2 = s.rfind('\nmark();')
s = s[:i2] + '\n' + motion + s[i2:]
wr(S + 'kc-ux.js', s)

# kc-ux.css: everything added after the clean-up, minus the icon-only rules
s = rd(K + 'kc-ux.css')
c = rd(CUR + 'kc-ux.css')
tail = c[c.find('/* ===== printed-ticket look'):]
drop = ['.kc-ic{', '.pass .line i{top:-10px', '.pass .line i .kc-ic', '[data-say] .kc-ic', '.sk{font:700', '.kc-tour-e{font:800']
tail = '\n'.join(l for l in tail.split('\n') if not any(l.startswith(d) for d in drop))
s = s.rstrip() + '\n\n' + tail
wr(S + 'kc-ux.css', s)

# the page itself
h = rd(K + 'sa-index.html')
cur = rd(CUR + 'sa-index.html')
link_new = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?[^"]+">', cur).group()
h = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?[^"]+">', lambda m: link_new, h, count=1)
h = rep(h, '--display:"Unbounded", "Arial Black", system-ui, sans-serif;', '--display:"Big Shoulders", "Arial Narrow", "Roboto Condensed", system-ui, sans-serif;')
h = rep(h, '--body:"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;', '--body:"Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif;')
h = rep(h, '--mono:"Space Mono", ui-monospace, Menlo, monospace;', '--mono:"IBM Plex Mono", ui-monospace, Menlo, monospace;')
h = rep(h, 'textarea:focus-visible{outline:none;box-shadow:3px 3px 0 var(--accent)}', 'textarea:focus-visible{outline:2px solid var(--accent);outline-offset:1px;box-shadow:none}')
h = rep(h, "$('#w-from').value=b.dataset.v;grab();marks();go(2)});", "$('#w-from').value=b.dataset.v;grab();marks();setTimeout(()=>go(2),matchMedia('(prefers-reduced-motion: reduce)').matches?0:260)});")
# go(): same function body as the current page
gi = cur.find('function go(n){'); gj = cur.find('\n}\n', gi)
hi = h.find('function go(n){'); hj = h.find('\n}\n', hi)
h = h[:hi] + cur[gi:gj] + h[hj:]
wr('/home/claude/standalone/index.html', h)
print('done')
