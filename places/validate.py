import re,unicodedata
from collections import Counter,defaultdict
S='/tmp/claude-0/-home-claude/1d6d6033-5f43-54b1-b899-79f6ed6e4a1f/scratchpad/'
def norm(x):return re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFD',x.lower()).encode('ascii','ignore').decode())
old=[l.rstrip('\n').split('|') for l in open(S+'places.txt') if l.strip()]
co={norm(l.split('|')[0]):l.strip().split('|') for l in open(S+'coords.txt') if l.strip()}
ind=[l.rstrip('\n').split('|') for l in open(S+'places/india_new.txt') if l.strip()]
abr=[l.rstrip('\n').split('|') for l in open(S+'places/abroad_new.txt') if l.strip()]
h=open('/home/claude/standalone/index.html').read()
codes=set(re.findall(r"\b([A-Z]{2,3}):\['",h))|set(re.findall(r"\b([A-Z]{2,4}):[A-Z]",h.split('const CTRY=')[1].split('};')[0]))|{'BW','TUN'}
TAGS=set('urbmstlwdhpfik')
errs=[]
names=Counter(norm(x[0]) for x in old)
for f in ind:
  if len(f)!=9:errs.append(('fields',f[0],len(f)))
for f in abr:
  if len(f)!=7:errs.append(('fields',f[0],len(f)))
allnew=ind+abr
for f in allnew:
  n=norm(f[0])
  if names[n]:errs.append(('dup-existing',f[0]))
  names[n]+=1
  if f[1] not in codes:errs.append(('code',f[0],f[1]))
  if set(f[2])-TAGS:errs.append(('tag',f[0],f[2]))
  if not re.fullmatch(r'\d{1,2}(-\d{1,2})?(,\d{1,2}(-\d{1,2})?)*',f[3]) or any(not 1<=int(m)<=12 for m in re.findall(r'\d+',f[3])):errs.append(('months',f[0],f[3]))
  if f[5] not in '123':errs.append(('cost',f[0],f[5]))
  if '—' in '|'.join(f):errs.append(('emdash',f[0]))
for n,c in names.items():
  if c>1:errs.append(('dup-new',n,c))
# coordinates vs state box from existing places
box=defaultdict(lambda:[90,-90,180,-180])
for x in old:
  c=co.get(norm(x[0]))
  if c:
    b=box[x[1]];la,lo=float(c[1]),float(c[2]);b[0]=min(b[0],la);b[1]=max(b[1],la);b[2]=min(b[2],lo);b[3]=max(b[3],lo)
manual={'HR':[27.6,31.0,74.4,77.6],'DL':[28.4,28.9,76.8,77.4],'PB':[29.5,32.6,73.8,77.0],'LD':[8.0,12.5,71.5,74.0],'MZ':[21.9,24.6,92.2,93.5],'TR':[22.9,24.6,91.1,92.4],'UP':[23.8,30.5,77.0,84.7],'WB':[21.5,27.3,85.8,89.9],'JH':[21.9,25.4,83.3,87.9],'BR':[24.2,27.6,83.3,88.3],'CG':[17.7,24.2,80.2,84.5],'TG':[15.8,19.95,77.2,81.4],'LA':[32.2,36.0,75.2,80.0],'NL':[25.2,27.1,93.3,95.3],'ML':[25.0,26.2,89.8,92.9],'AR':[26.6,29.5,91.5,97.5],'SK':[27.0,28.2,88.0,89.0],'WBH':[26.4,27.3,87.9,89.9],'GA':[14.8,15.85,73.6,74.4],'AN':[6.7,13.8,92.2,94.0],'AS':[24.0,28.0,89.7,96.1],'KL':[8.2,12.8,74.8,77.5],'TN':[8.0,13.6,76.2,80.4],'AP':[12.6,19.2,76.7,84.8],'OD':[17.8,22.6,81.3,87.6],'MP':[21.0,26.9,74.0,82.9],'GJ':[20.1,24.7,68.1,74.5],'RJ':[23.0,30.2,69.4,78.3],'MH':[15.6,22.1,72.6,80.9],'KA':[11.5,18.5,74.0,78.6],'HP':[30.3,33.3,75.5,79.0],'UK':[28.7,31.5,77.5,81.1],'JK':[32.2,35.0,73.2,76.8]}
for f in ind:
  la,lo=float(f[7]),float(f[8]);b=manual.get(f[1])
  if not b:errs.append(('nobox',f[0],f[1]));continue
  if not(b[0]<=la<=b[1] and b[2]<=lo<=b[3]):errs.append(('coord-outside',f[0],f[1],la,lo,b))
  if norm(f[0]) in co:errs.append(('coord-dup',f[0]))
print('india',len(ind),'abroad',len(abr),'total new',len(allnew),'=> grand total',len(old)+len(allnew))
print('india total',sum(1 for x in old if x[1] in manual or not x[1] in codes or True and not re.match('^(NP|BT|LK|BD|MV)$',x[1]) and len(co)>0) if False else '', )
for e in errs:print(e)
print('errors',len(errs))
