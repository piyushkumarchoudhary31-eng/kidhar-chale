import re,sys
S='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
p='/home/claude/standalone/index.html';h=open(p).read()
if '<!--KC-EXTRA-->' in h:
  i=h.find('<!--KC-EXTRA-->');j=h.find('</script>',i)+len('</script>\n');h=h[:i]+h[j:]
if '<style id="kc-extra">' in h:
  k=h.find('<style id="kc-extra">');l=h.find('</style>',k)+len('</style>\n');h=h[:k]+h[l:]
coords=open(S+'coords.txt').read().strip().replace('\\','').replace('`','')
data="const COORDS_RAW=`"+coords+"`;\n"+open(S+'states.js').read()+"\n"+open(S+'sights.js').read()
import os
MODS=[m for m in open(S+'modules.txt').read().split() if m] if os.path.exists(S+'modules.txt') else []
ux=open(S+"kc-ux.js").read()
extra_js="\n".join(open(S+m).read() for m in MODS if m.endswith('.js'))
extra_css="\n".join(open(S+m).read() for m in MODS if m.endswith('.css'))
assert ux.count("\nmark();\n")==1
ux=ux.replace("\nmark();\n","\n"+extra_js+"\nmark();\n")
js="<!--KC-EXTRA--><script>\n{\n"+data+"\n"+open(S+"kc-extra.js").read()+"\n"+open(S+"kc-extra2.js").read()+"\n"+open(S+"kc-loader.js").read()+"\n"+open(S+"kc-ai.js").read()+"\n"+ux+"\n}\n</script>\n"
css='<style id="kc-extra">\n'+open(S+'kc-extra.css').read()+'\n'+open(S+'kc-loader.css').read()+'\n'+open(S+'kc-ux.css').read()+'\n'+extra_css+'</style>\n'
h=h.replace('</head>',css+'</head>',1)
i=h.find("<script>if('serviceWorker'");i=i if i>0 else h.rfind('</body>');h=h[:i]+js+h[i:]
open(p,'w').write(h);print(len(h))
