"""Strip the 'looks AI-made' patterns from Kidhar Chale sources (run once on the pre-noai backups)."""
import re, sys
S = '/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
BK = S + 'bk/pre-noai/'
OUT = {'sa-index.html': '/home/claude/standalone/index.html'}
for n in ['kc-extra.js', 'kc-extra2.js', 'kc-loader.js', 'kc-ai.js', 'kc-ux.js', 'kc-extra.css', 'kc-loader.css', 'kc-ux.css']:
    OUT[n] = S + n

SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
BUS = f'<svg class="kc-ic" {SV}><rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 20v-3M17 20v-3"/><path d="M8 14h.01M16 14h.01"/></svg>'
TRAIN = f'<svg class="kc-ic" {SV}><rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 10h12M9 21l1.5-4M15 21l-1.5-4"/><path d="M9 14h.01M15 14h.01"/></svg>'
PLANE = f'<svg class="kc-ic" {SV}><path d="M10.5 4.5a1.5 1.5 0 0 1 3 0V10l7 4v2l-7-2v4l2 1.5V21l-3.5-1-3.5 1v-1.5l2-1.5v-4l-7 2v-2l7-4z"/></svg>'
SPK = f'<svg class="kc-ic" {SV}><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M16.5 9a4 4 0 0 1 0 6"/></svg>'

EM = r'(?:[\U0001F000-\U0001FAFF☀-✔✖-➿⭐⌚-⏿](?:️|‍|[♀♂])*)+'


def emoji_out(s):
    def f(m):
        return ' ' if (m.group(1) and m.group(2)) else ''
    return re.sub(r'( ?)' + EM + r'( ?)', f, s)


SPECIAL = [
    # pressed options: no tick mark, the fill shows the state
    ('.opt[aria-pressed="true"]::after{content:" ✓";color:var(--accent)}', '.opt[aria-pressed="true"]::after{content:none}'),
    ('<div class="line" aria-hidden="true"><i>🚌</i></div>', '<div class="line" aria-hidden="true"><i>' + BUS + '</i></div>'),
    ("$('#pass .line i').textContent=(m.length&&m.every(k=>k==='flight'))?'✈️':(m.length&&m.every(k=>/train/.test(k)))?'🚆':'🚌';",
     "$('#pass .line i').innerHTML=(m.length&&m.every(k=>k==='flight'))?'" + PLANE + "':(m.length&&m.every(k=>/train/.test(k)))?'" + TRAIN + "':'" + BUS + "';"),
    ('aria-label="Hear ${esc(x)}">🔊</button>', 'aria-label="Hear ${esc(x)}">' + SPK + '</button>'),
    ("b.textContent='🔊'", "b.innerHTML='" + SPK + "'"),
    ('Tap 🔊 to hear it', 'Tap the speaker to hear it'),
    ('Your trip drops 🔥', 'Your trip ideas'),
    ('आपकी ट्रिप तैयार 🔥', 'आपकी ट्रिप के आइडिया'),
    ("const KIND={monument:'🏛',temple:'🛕',view:'🌅',food:'🍢',market:'🛍',aarti:'🪔',show:'🎭',museum:'🖼'}",
     "const KIND={monument:'Fort',temple:'Temple',view:'View',food:'Food',market:'Market',aarti:'Aarti',show:'Show',museum:'Museum'}"),
    ("${KIND[s.k]||'📍'}", "${KIND[s.k]||'Place'}"),
    ("const KS={food:'🍢',sight:'🏛',rest:'☕',fuel:'⛽',place:'📍'}", "const KS={food:'Food',sight:'Sight',rest:'Chai',fuel:'Fuel',place:'Stop'}"),
    ("${KS[s.k]||'📍'}", "${KS[s.k]||'Stop'}"),
    ('<div class="kc-tour-e" aria-hidden="true">${e}</div>', '<div class="kc-tour-e" aria-hidden="true">0${k+1}</div>'),
    ("g.fillText('💡',110,ly);", ''),
]


import os
KEEP = os.environ.get('KEEP_EMOJI') == '1'
if KEEP:
    TMP = S + 'noai/keep/'
    os.makedirs(TMP, exist_ok=True)
    OUT = {k: TMP + k for k in OUT}


def text_fixes(s):
    if KEEP:
        return s.replace("'—'", "'-'").replace("||'—'", "||'-'").replace(" — ", ", ").replace('—', '-')
    for a, b in SPECIAL:
        s = s.replace(a, b)
    # sentence that only listed emojis
    s = re.sub(r'are marked 🪔 🌅 🍢 below\.', 'are tagged below.', s)
    s = emoji_out(s)
    # em dashes: empty-value placeholders and comments
    s = s.replace("'—'", "'-'").replace("||'—'", "||'-'").replace(" — ", ", ")
    s = s.replace('—', '-')
    return s


def radius(m):
    v = m.group(1).strip()
    if v.endswith('%') or v in ('0', 'inherit'):
        return m.group(0)
    parts = []
    for p in v.split():
        mm = re.fullmatch(r'(\d+(?:\.\d+)?)px', p)
        if not mm:
            parts.append(p); continue
        n = float(mm.group(1))
        parts.append('4px' if n >= 90 else '8px' if n >= 20 else '6px' if n >= 10 else p)
    return 'border-radius:' + ' '.join(parts)


CSS_LIT = [
    ('padding:0 6px;transform:rotate(-8deg);', 'padding:0 6px;'),
    ('border-radius:20px;transform:rotate(-1deg);', 'border-radius:20px;'),
    ('color:var(--tag-ink);transform:rotate(-2deg)}', 'color:var(--tag-ink)}'),
    ('.idea:nth-child(odd){transform:rotate(-.4deg)}', ''),
    ('.idea:nth-child(even){transform:rotate(.4deg)}', ''),
    ('background:radial-gradient(120% 140% at 100% 0%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 55%),var(--lilac)', 'background:var(--lilac)'),
    ('background:linear-gradient(180deg,color-mix(in srgb,var(--klui,var(--pop)) 22%,var(--surface)),var(--surface2))', 'background:color-mix(in srgb,var(--klui,var(--pop)) 14%,var(--surface))'),
    ('.note{font-size:13px;color:var(--muted);border-left:3px solid var(--tag);padding-left:10px}', '.note{font-size:13px;color:var(--muted);background:var(--surface2);border:1px solid var(--line);border-radius:6px;padding:8px 10px}'),
    ('.note{border-left:4px solid var(--accent)}', '.note{border-color:var(--line)}'),
]


def css_fixes(css):
    for a, b in CSS_LIT:
        css = css.replace(a, b)
    out = []
    for m in re.finditer(r'([^{}]*)\{([^{}]*)\}|([^{}]+)|([{}])', css):
        if m.group(3) is not None or m.group(4) is not None:
            out.append(m.group(3) or m.group(4)); continue
        sel, body = m.group(1), m.group(2)
        if ':focus' not in sel and '@keyframes' not in sel:
            body = re.sub(r'box-shadow:(?![^;]*\b0 0 0\b)[^;}]+', 'box-shadow:none', body)
        body = re.sub(r'border-radius:([^;}]+)', radius, body)
        body = re.sub(r'\b(?:2|2\.5|3|4)px (solid|dashed) var\(--edge\)', r'1.5px \1 var(--edge)', body)
        out.append(sel + '{' + body + '}')
    return ''.join(out)


TOKENS_LIGHT = '''--bg:#EEE8DB; --surface:#FAF7F0; --surface2:#F3EEE3; --ink:#1F1B16; --muted:#665D51; --line:#D7CDBB;
  --edge:#2B261F; --shadow:transparent; --pop:#24508E; --lilac:#E7DFCF;
  --accent:#B5431C; --accent-ink:#FFFFFF; --tag:#E3A23B; --tag-ink:#2A1A04; --good:#2E7A4C; --bad:#B3261E;'''
TOKENS_DARK = '''--bg:#15130F; --surface:#1E1B16; --surface2:#27231C; --ink:#EEE7D8; --muted:#A99F8E; --line:#3B352B;
  --edge:#8D8371; --shadow:transparent; --pop:#93B3E2; --lilac:#2A251D;
  --accent:#E07344; --accent-ink:#1B0D05; --tag:#E3A23B; --tag-ink:#2A1A04; --good:#6CC28E; --bad:#F08A7E;'''


def tokens(s):
    s = re.sub(r'--bg:#F1ECFF;.*?--bad:#D8203A;', TOKENS_LIGHT, s, count=1, flags=re.S)
    s = re.sub(r'--bg:#110E18;.*?--bad:#FF6E7F;', TOKENS_DARK, s, flags=re.S)
    s = s.replace('#FF3D8B', 'var(--accent)').replace('#C21767', 'var(--accent)')
    return s


def page_fixes(h):
    h = tokens(h)
    # stylesheets inside the page
    h = re.sub(r'(<style>)(.*?)(</style>)', lambda m: m.group(1) + css_fixes(m.group(2)) + m.group(3), h, flags=re.S)
    # dot grid off
    h = re.sub(r'background-image:radial-gradient\(color-mix\(in srgb,var\(--pop\) 18%,transparent\) 1\.2px,transparent 1\.3px\);background-size:22px 22px;', '', h)
    h = h.replace('/* Layout: sticker-zine phone app, thick ink outlines, hard offset shadows, floating pill tab bar */',
                  '/* Layout: printed travel-ticket look: warm paper, ink rules, small corners, no shadows */')
    h = h.replace('<meta name="theme-color" content="var(--accent)">', '<meta name="theme-color" content="#B5431C">')
    return h


for name, dest in OUT.items():
    src = open(BK + name, encoding='utf-8').read()
    if name.endswith('.html'):
        s = page_fixes(text_fixes(src))
    elif name.endswith('.css'):
        s = css_fixes(tokens(src)).replace('—', '·')
    else:
        s = text_fixes(src)
        s = tokens(s)
    open(dest, 'w', encoding='utf-8').write(s)
    left = re.findall(EM, s)
    print(name, 'emoji left:', len(left), sorted(set(left))[:10], ' em dash left:', s.count('—'))
