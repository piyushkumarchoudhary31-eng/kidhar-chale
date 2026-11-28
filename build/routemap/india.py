"""Build assets/india-map.json: India states from DataMeet (Survey of India based), CC BY 4.0.
Lambert conformal conic like Survey of India maps. Run: python3 india.py"""
import struct,math,json,sys
SHP='/home/claude/datameet/maps/States/Admin2'
OUT='/home/claude/kidhar-chale/assets/india-map.json'
W=1000
P1,P2,P0,L0=map(math.radians,(12.472944,35.172806,24.0,80.0))
n=math.log(math.cos(P1)/math.cos(P2))/math.log(math.tan(math.pi/4+P2/2)/math.tan(math.pi/4+P1/2))
F=math.cos(P1)*math.tan(math.pi/4+P1/2)**n/n
R0=F/math.tan(math.pi/4+P0/2)**n
def lcc(lo,la):
  r=F/math.tan(math.pi/4+math.radians(la)/2)**n;t=n*(math.radians(lo)-L0)
  return r*math.sin(t),R0-r*math.cos(t)
def names():
  d=open(SHP+'.dbf','rb').read();N,hl,rl=struct.unpack('<xxxxIHH',d[:12])
  f=[];o=32
  while d[o]!=0x0d:f.append(d[o+16]);o+=32
  return [d[hl+i*rl+1:hl+i*rl+1+f[0]].decode('utf8','replace').strip() for i in range(N)]
def shapes():
  d=open(SHP+'.shp','rb').read();o=100;out=[]
  while o<len(d):
    num,ln=struct.unpack('>ii',d[o:o+8]);o+=8;rec=d[o:o+ln*2];o+=ln*2
    t=struct.unpack('<i',rec[:4])[0]
    if t==0:out.append([]);continue
    np_,npts=struct.unpack('<ii',rec[36:44]);parts=struct.unpack('<%di'%np_,rec[44:44+4*np_])
    pts=struct.unpack('<%dd'%(2*npts),rec[44+4*np_:44+4*np_+16*npts])
    rings=[];pp=list(parts)+[npts]
    for a,b in zip(pp,pp[1:]):rings.append([(pts[2*i],pts[2*i+1]) for i in range(a,b)])
    out.append(rings)
  return out
def dp(pts,eps):
  if len(pts)<3:return pts
  keep=[False]*len(pts);keep[0]=keep[-1]=True;st=[(0,len(pts)-1)]
  while st:
    a,b=st.pop();ax,ay=pts[a];bx,by=pts[b];dx,dy=bx-ax,by-ay;L=math.hypot(dx,dy) or 1e-9;m=0;mi=-1
    for i in range(a+1,b):
      x,y=pts[i];d=abs(dy*x-dx*y+bx*ay-by*ax)/L
      if d>m:m=d;mi=i
    if m>eps:keep[mi]=True;st+=[(a,mi),(mi,b)]
  return [p for p,k in zip(pts,keep) if k]
def area(r):return abs(sum(r[i][0]*r[i-1][1]-r[i-1][0]*r[i][1] for i in range(len(r))))/2
nm=names();sh=shapes()
allp=[lcc(x,y) for rs in sh for r in rs for (x,y) in r[::50]]
mnx=min(p[0] for p in allp);mxx=max(p[0] for p in allp);mny=min(p[1] for p in allp);mxy=max(p[1] for p in allp)
pad=0.012*(mxx-mnx);S=(W-0)/((mxx-mnx)+2*pad);H=round(((mxy-mny)+2*pad)*S)
tx=-(mnx-pad);ty=mxy+pad  # screen: X=(x+tx)*S, Y=(ty-y)*S
EPS=float(sys.argv[1]) if len(sys.argv)>1 else 0.9
def scr(lo,la):x,y=lcc(lo,la);return ((x+tx)*S,(ty-y)*S)
states=[];tot=0
for name,rs in zip(nm,sh):
  ds=[]
  for r in rs:
    q=[scr(x,y) for x,y in r];
    # thin to a grid first
    t=[];last=None
    for x,y in q:
      k=(round(x*4),round(y*4))
      if k!=last:t.append((x,y));last=k
    if len(t)>3:
      x0,y0=t[0];far=max(range(len(t)),key=lambda i:(t[i][0]-x0)**2+(t[i][1]-y0)**2)
      s=dp(t[:far+1],EPS)[:-1]+dp(t[far:],EPS)
    else:s=t
    a=area(s) if len(s)>=3 else 0
    if a<1.2:
      # tiny island: keep as a small dot so island groups still show
      if name in('Lakshadweep','Andaman & Nicobar') and area(q)>0.02:
        cx=sum(p[0] for p in q)/len(q);cy=sum(p[1] for p in q)/len(q);ds.append('M%.1f,%.1fh1.2v1.2h-1.2z'%(cx-.6,cy-.6))
      continue
    pts=[(round(x,1),round(y,1)) for x,y in s]
    out='M%g,%g'%pts[0]+'l'+' '.join('%g,%g'%(round(b[0]-a[0],1),round(b[1]-a[1],1)) for a,b in zip(pts,pts[1:]))+'z'
    ds.append(out);tot+=len(pts)
  states.append({'n':name,'d':''.join(ds)})
proj={'p1':12.472944,'p2':35.172806,'p0':24.0,'l0':80.0,'tx':tx,'ty':ty,'s':S}
J={'v':1,'w':W,'h':H,'proj':proj,'src':'DataMeet India community, based on Survey of India boundaries (CC BY 4.0)','states':states}
s=json.dumps(J,separators=(',',':'),ensure_ascii=False);open(OUT,'w').write(s)
print('points',tot,'bytes',len(s),'H',H)
