"""Add a Content Security Policy to every page of the site (run after each build).
Only the site's own inline scripts (by hash) and a short list of trusted hosts may run or be contacted."""
import re,sys,hashlib,base64,pathlib
ROOT=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/home/claude/kidhar-chale')
HOSTS_SCRIPT="https://cdnjs.cloudflare.com https://www.googletagmanager.com"
CONNECT="'self' https://en.wikipedia.org https://commons.wikimedia.org https://api.open-meteo.com https://script.google.com https://script.googleusercontent.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://upload.wikimedia.org https://*.g.doubleclick.net https://www.google.com"
IMG="'self' data: blob: https://upload.wikimedia.org https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net https://www.google.com"
TAG=re.compile(r'<meta http-equiv="Content-Security-Policy"[^>]*>\n?')
SCRIPT=re.compile(r'<script(?![^>]*\bsrc=)(?![^>]*application/ld\+json)[^>]*>(.*?)</script>',re.S)
def policy(html):
  hashes=sorted({"'sha256-"+base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()+"'" for m in SCRIPT.finditer(html)})
  inl=("'unsafe-inline' "+' '.join(hashes)+" ") if hashes else ""   # old browsers fall back to unsafe-inline; new ones obey the hashes
  return ("default-src 'self'; script-src 'self' "+inl+HOSTS_SCRIPT+"; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com; "
    f"img-src {IMG}; connect-src {CONNECT}; worker-src 'self'; manifest-src 'self'; media-src 'self' blob: data:; "
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; upgrade-insecure-requests").replace('  ',' ')
n=0
for f in sorted(ROOT.rglob('*.html')):
  if '.git' in f.parts:continue
  h=f.read_text();h0=h;h=TAG.sub('',h)
  meta=f'<meta http-equiv="Content-Security-Policy" content="{policy(h)}">\n<meta name="referrer" content="strict-origin-when-cross-origin">\n'
  h=re.sub(r'<meta name="referrer"[^>]*>\n?','',h)
  m=re.search(r'<meta charset[^>]*>\n?',h,re.I)
  if not m:print('no charset:',f);continue
  h=h[:m.end()]+('' if h[m.end()-1]=='\n' else '\n')+meta+h[m.end():]
  if h!=h0:f.write_text(h);n+=1
print('pages with CSP:',n)
