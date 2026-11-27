import re,sys
src='/home/claude/standalone/index.html'; h=open(src).read()
title=re.search(r'<title>.*?</title>',h).group(0)
h=h.replace(title,'',1)
h=re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*','',h,flags=re.I)
h=re.sub(r'<meta charset="utf-8">\s*','',h); h=re.sub(r'<meta name="viewport"[^>]*>\s*','',h)
h=re.sub(r'<link rel="manifest"[^>]*>\s*','',h); h=re.sub(r'<link rel="icon"[^>]*>\s*','',h); h=re.sub(r'<link rel="apple-touch-icon"[^>]*>\s*','',h)
h=h.replace('</head>\n<body>\n','',1).replace('</head>','',1).replace('<body>','',1)
h=re.sub(r"<script>if\('serviceWorker'.*?</script>\s*",'',h,flags=re.S)
h=h.replace('</body>','').replace('</html>','')
h=title+'\n<meta name="claude:viewport-fit-sides" content="cover">\n'+h
for out in sys.argv[1:]: open(out,'w').write(h)
print(len(h))
