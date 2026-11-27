// A small stand-in for Google Apps Script services, so the real backend file can be tested locally.
const crypto=require('crypto'),zlib=require('zlib'),vm=require('vm'),fs=require('fs');
const signed=buf=>Array.from(buf,b=>b>127?b-256:b);
const toBuf=x=>typeof x==='string'?Buffer.from(x,'utf8'):Buffer.from(x.map(b=>{if(!Number.isInteger(b)||b<-128||b>127)throw new Error('not a Java byte: '+b);return b&255}));
function Blob(bytes,type){this.b=bytes;this.t=type}
Blob.prototype.getBytes=function(){return this.b.slice()};Blob.prototype.getDataAsString=function(){return toBuf(this.b).toString('utf8')};
const stats={hmac:0};
const Utilities={DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},
 newBlob:(d,t)=>new Blob(typeof d==='string'?signed(Buffer.from(d,'utf8')):d.slice(),t),
 gzip:b=>new Blob(signed(zlib.gzipSync(toBuf(b.b))),'application/x-gzip'),
 ungzip:b=>new Blob(signed(zlib.gunzipSync(toBuf(b.b)))),
 computeHmacSha256Signature:(v,k)=>{stats.hmac++;return signed(crypto.createHmac('sha256',toBuf(k)).update(toBuf(v)).digest())},
 computeDigest:(a,v)=>signed(crypto.createHash('sha256').update(toBuf(v)).digest()),
 getUuid:()=>crypto.randomUUID(),
 base64Encode:b=>toBuf(b).toString('base64'),base64Decode:s=>signed(Buffer.from(s,'base64')),
 base64EncodeWebSafe:b=>toBuf(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_'),
 base64DecodeWebSafe:s=>signed(Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64')),
 formatDate:(d)=>d.toISOString().slice(0,10).replace(/-/g,'')};
let now=()=>Date.now();
const cacheStore=new Map();
const Cache={get:k=>{if(k.length>250)throw new Error('cache key too long');const e=cacheStore.get(k);if(!e||e.x<now())return null;return e.v},
 put:(k,v,ttl)=>{if(k.length>250)throw new Error('key');if(String(v).length>100000)throw new Error('value');if(ttl>21600)throw new Error('ttl');cacheStore.set(k,{v:String(v),x:now()+(ttl||600)*1000})},remove:k=>cacheStore.delete(k)};
const props=new Map();
const outbox=[];
let quota=100;
function Range(sh,r,c,nr,nc){this.sh=sh;this.r=r;this.c=c;this.nr=nr||1;this.nc=nc||1}
Range.prototype.getValues=function(){const o=[];for(let i=0;i<this.nr;i++){const row=this.sh.rows[this.r-1+i]||[];const a=[];for(let j=0;j<this.nc;j++){const v=row[this.c-1+j];a.push(v===undefined?'':v)}o.push(a)}return o};
Range.prototype.getValue=function(){return this.getValues()[0][0]};
Range.prototype.setValues=function(v){if(v.length!==this.nr||v[0].length!==this.nc)throw new Error('size mismatch');v.forEach((row,i)=>row.forEach((x,j)=>{if(typeof x==='string'&&x.length>50000)throw new Error('cell over 50000');const R=this.sh.rows[this.r-1+i]||(this.sh.rows[this.r-1+i]=[]);R[this.c-1+j]=x}));return this};
Range.prototype.setValue=function(x){return this.setValues([[x]])};
Range.prototype.setNumberFormat=function(){return this};Range.prototype.getRow=function(){return this.r};
Range.prototype.createTextFinder=function(t){const self=this;let ent=false,mc=false;const f={matchEntireCell(b){ent=b;return f},matchCase(b){mc=b;return f},findNext(){const v=self.getValues();for(let i=0;i<v.length;i++)for(let j=0;j<v[i].length;j++){const s=String(v[i][j]);if(ent?s===t:s.includes(t))return new Range(self.sh,self.r+i,self.c+j)}return null}};return f};
function Sheet(name){this.name=name;this.rows=[]}
Sheet.prototype.setName=function(n){this.name=n;return this};
Sheet.prototype.appendRow=function(a){a.forEach(x=>{if(typeof x==='string'&&x.length>50000)throw new Error('cell over 50000')});this.rows.push(a.slice());return this};
Sheet.prototype.getLastRow=function(){return this.rows.length};Sheet.prototype.getMaxRows=function(){return 1000};Sheet.prototype.getMaxColumns=function(){return 26};
Sheet.prototype.getRange=function(r,c,nr,nc){if(typeof r==='string')return new Range(this,1,1,1,1);return new Range(this,r,c,nr,nc)};
Sheet.prototype.getDataRange=function(){return new Range(this,1,1,this.rows.length,Math.max(1,...this.rows.map(r=>r.length)))};
Sheet.prototype.deleteRow=function(r){this.rows.splice(r-1,1)};Sheet.prototype.setFrozenRows=function(){};
const books={};
function Book(name){this.id='sheet'+Object.keys(books).length;this.name=name;this.sheets=[new Sheet('Sheet1')];books[this.id]=this}
Book.prototype.getId=function(){return this.id};Book.prototype.getSheets=function(){return this.sheets};Book.prototype.getUrl=function(){return 'https://docs.google.com/'+this.id};
Book.prototype.getSheetByName=function(n){return this.sheets.find(s=>s.name===n)||null};
Book.prototype.insertSheet=function(n){const s=new Sheet(n);this.sheets.push(s);return s};
const aiLog=[];let aiMode='ok';
const PLAN={title:'Delhi → Rishikesh (AI)',summary:'An AI test plan. Two sentences.',days:[{day:1,city:'Delhi → Rishikesh',items:[{time:'06:00',what:'UPSRTC bus from Kashmere Gate',cost:350,kind:'travel'}],stay:{city:'Rishikesh',options:[{name:null,type:'Dorm',area:'Tapovan',price:400,note:'Walk in and compare.'}]}},{day:2,city:'Rishikesh',items:[{time:'09:00',what:'Laxman Jhula walk',cost:0,kind:'sight'}],stay:{city:'Rishikesh',options:[{name:null,type:'Dorm',area:'Tapovan',price:400,note:'Same bed.'}]}},{day:3,city:'Rishikesh → Delhi',items:[{time:'15:00',what:'Bus back',cost:350,kind:'travel'}],stay:{city:'On the bus',options:[]}}],tips:['Carry cash'],verify:['Bus times']};
const IDEAS={ideas:[{title:'Ganga weekend',stops:['Rishikesh'],why:'Close and cheap. Great cafes.',travel:'Bus 6 h',cost:3000,types:['Spiritual']},{title:'Hill escape',stops:['Mussoorie'],why:'Cool air. Easy bus.',travel:'Bus 7 h',cost:4000,types:['Mountains']},{title:'Fort town',stops:['Jaipur'],why:'Forts and food. Cheap stays.',travel:'Train 5 h',cost:3500,types:['Heritage']}]};
const UrlFetchApp={fetch:(url,o)=>{const b=JSON.parse(o.payload);aiLog.push({url,key:o.headers['x-goog-api-key'],prompt:b.contents[0].parts[0].text.slice(0,60),sys:!!b.systemInstruction});
  if(aiMode==='404first'&&url.includes('flash-lite-latest'))return{getResponseCode:()=>404,getContentText:()=>'{}'};
  if(aiMode==='429')return{getResponseCode:()=>429,getContentText:()=>'{}'};
  const t=b.contents[0].parts[0].text;const data=t.startsWith('You are a frugal')?PLAN:IDEAS;
  return{getResponseCode:()=>200,getContentText:()=>JSON.stringify({candidates:[{content:{parts:[{text:'```json\n'+JSON.stringify(data)+'\n```'}]}}]})}}};
const ctx={Utilities,console,UrlFetchApp,
 CacheService:{getScriptCache:()=>Cache},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.has(k)?props.get(k):null,setProperty:(k,v)=>props.set(k,v)})},
 LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
 MailApp:{sendEmail:(a,b,c)=>{quota--;outbox.push(typeof a==='object'?a:{to:a,subject:b,body:c})},getRemainingDailyQuota:()=>quota},
 Session:{getEffectiveUser:()=>({getEmail:()=>'owner@example.com'})},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({s,setMimeType(){return this},getContent(){return s}})},
 SpreadsheetApp:{create:n=>new Book(n),openById:id=>{if(!books[id])throw new Error('no sheet');return books[id]}},
 Logger:{log:x=>console.log('[Logger]',x)},Date,Math,JSON,String,Number,Object,Array};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2]||'../batch2/kidhar-chale-backend.gs','utf8'),ctx);
module.exports={aiLog,setAiMode:m=>{aiMode=m},ctx,outbox,books,props,cacheStore,stats,setNow:f=>{now=f},setQuota:q=>{quota=q}};
