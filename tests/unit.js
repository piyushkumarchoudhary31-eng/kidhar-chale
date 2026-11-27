// Direct tests of the backend logic
const G=require('./gas-mock.js');const C=G.ctx;const assert=require('assert');
const post=d=>JSON.parse(C.doPost({postData:{contents:JSON.stringify(d)}}).getContent());
const lastCode=()=>{const m=G.outbox[G.outbox.length-1];return m.subject.slice(0,6)};
let r=post({kind:'auth_start',email:'bad'});assert.equal(r.error,'email');
r=post({kind:'auth_start',email:'  Piyush@Example.com '});assert.ok(r.ok,JSON.stringify(r));
const code=lastCode();assert.match(code,/^\d{6}$/);assert.ok(G.outbox[0].htmlBody.includes(code));assert.equal(G.outbox[0].to,'piyush@example.com');
r=post({kind:'auth_start',email:'piyush@example.com'});assert.equal(r.error,'wait');
const wrong=String((+code+1)%1000000).padStart(6,'0');
r=post({kind:'auth_verify',email:'piyush@example.com',code:wrong});assert.equal(r.error,'wrong');assert.equal(r.left,4);
r=post({kind:'auth_verify',email:'piyush@example.com',code});assert.ok(r.ok&&r.needName,JSON.stringify(r));
r=post({kind:'auth_verify',email:'piyush@example.com',code,name:'  Piyush <b>C</b> '});assert.ok(r.ok&&r.token&&r.isNew,JSON.stringify(r));assert.equal(r.name,'Piyush bC/b');
const tok=r.token;
r=post({kind:'auth_verify',email:'piyush@example.com',code,name:'X'});assert.equal(r.error,'expired','code used once only');
// sheet must not contain email or name in plain text
const dump=JSON.stringify(Object.values(G.books)[0].sheets.map(s=>s.rows));
assert.ok(!dump.toLowerCase().includes('piyush'),'no plain email or name in sheet');assert.ok(!dump.includes(tok),'no plain token in sheet');
// sync
r=post({kind:'sync',token:'nope'.repeat(10),keys:{}});assert.equal(r.error,'signin');
r=post({kind:'sync',token:tok,since:0,keys:{bg_plan:{v:'{"title":"A"}',t:1000},bg_lang:{v:'"hi"',t:0},'evil key':{v:'x',t:5},bg_x:{v:'y'.repeat(200001),t:5}}});
assert.ok(r.ok,JSON.stringify(r));assert.deepEqual(r.keys,{});assert.equal(r.name,'Piyush bC/b');const t1=r.now;
// second device, first login: sends its own with t=0; server keeps newer, returns them
r=post({kind:'sync',token:tok,since:0,keys:{bg_plan:{v:'{"title":"OLD"}',t:0},bg_money:{v:'[1]',t:0}}});
assert.equal(r.keys.bg_plan.v,'{"title":"A"}');assert.ok(!r.keys.bg_money,'own accepted key not echoed');assert.equal(r.keys.bg_lang.v,'"hi"');
// newer edit wins
r=post({kind:'sync',token:tok,since:r.now,keys:{bg_plan:{v:'{"title":"B"}',t:2000}}});assert.deepEqual(r.keys,{});
r=post({kind:'sync',token:tok,since:0,keys:{}});assert.equal(r.keys.bg_plan.v,'{"title":"B"}');assert.equal(r.keys.bg_money.v,'[1]');assert.ok(!r.keys['evil key']&&!r.keys.bg_x);
// older edit loses
r=post({kind:'sync',token:tok,since:0,keys:{bg_plan:{v:'{"title":"stale"}',t:1500}}});assert.equal(r.keys.bg_plan.v,'{"title":"B"}');
// deletion travels as null
r=post({kind:'sync',token:tok,since:0,keys:{bg_money:{v:null,t:3000}}});r=post({kind:'sync',token:tok,since:0,keys:{}});assert.strictEqual(r.keys.bg_money.v,null);
// rename
r=post({kind:'sync',token:tok,name:'Piyush',keys:{}});assert.equal(r.name,'Piyush');
// big data: 20 trips of ~6KB
const big={};for(let i=0;i<20;i++)big['bg_t'+i]={v:JSON.stringify({title:'Trip '+i,days:Array.from({length:6},(_,d)=>({city:'City '+d,items:Array.from({length:6},(_,k)=>({what:'Bus from somewhere to somewhere else number '+k+' '+Math.random(),cost:k*100}))}))}),t:5000+i};
G.stats.hmac=0;let t0=Date.now();r=post({kind:'sync',token:tok,since:0,keys:big});assert.ok(r.ok,JSON.stringify(r).slice(0,200));
console.log('big save hmac calls:',G.stats.hmac,'ms',Date.now()-t0);
const acc=Object.values(G.books)[0].getSheetByName('Accounts');console.log('stored chars:',acc.rows[1].slice(5).join('').length);
// too big is refused, nothing lost
const huge={};for(let i=0;i<5;i++)huge['bg_h'+i]={v:'z'.repeat(150000)+Math.random(),t:9000};r=post({kind:'sync',token:tok,since:0,keys:huge});assert.equal(r.error,'full');
r=post({kind:'sync',token:tok,since:0,keys:{}});assert.ok(r.keys.bg_t19&&!r.keys.bg_h0);
// tamper detection: change one character of stored data -> server refuses, does not overwrite
const row=acc.rows[1];const orig=row[5];row[5]=orig.slice(0,100)+(orig[100]==='A'?'B':'A')+orig.slice(101);
r=post({kind:'sync',token:tok,since:0,keys:{bg_plan:{v:'x',t:99999}}});assert.equal(r.error,'server');row[5]=orig;
r=post({kind:'sync',token:tok,since:0,keys:{}});assert.ok(r.ok);
// sign in again from another device keeps the same account
post({kind:'auth_start',email:'piyush@example.com'});
// wait rule blocks within 55s; fake time
const real=Date.now;G.setNow(()=>real()+60000);
r=post({kind:'auth_start',email:'piyush@example.com'});
// (cache uses mock now; codes rate limit)
assert.ok(r.ok,JSON.stringify(r));const code2=lastCode();
r=post({kind:'auth_verify',email:'PIYUSH@example.com',code:code2});assert.ok(r.ok&&r.token&&!r.isNew&&r.name==='Piyush',JSON.stringify(r));const tok2=r.token;
// five wrong guesses kill the code
G.setNow(()=>real()+120000);post({kind:'auth_start',email:'other@example.com'});const c3=lastCode();
for(let i=0;i<4;i++){r=post({kind:'auth_verify',email:'other@example.com',code:String((+c3+1+i)%1e6).padStart(6,'0')});assert.equal(r.error,'wrong')}
r=post({kind:'auth_verify',email:'other@example.com',code:'000000'===c3?'000001':'000000'});assert.equal(r.error,c3==='000000'?'wrong':'tries');
r=post({kind:'auth_verify',email:'other@example.com',code:c3});assert.equal(r.error,'expired');
// hourly limit
let lim=null;for(let i=0;i<7;i++){G.setNow(()=>real()+200000+i*60000);r=post({kind:'auth_start',email:'spam@example.com'});if(!r.ok){lim=r.error;break}}assert.equal(lim,'limit');
// sign out one device; other still works
r=post({kind:'sign_out',token:tok});assert.ok(r.ok);r=post({kind:'sync',token:tok,keys:{}});assert.equal(r.error,'signin');
r=post({kind:'sync',token:tok2,keys:{}});assert.ok(r.ok);
// delete account removes data and sessions
r=post({kind:'delete_account',token:tok2});assert.ok(r.ok);r=post({kind:'sync',token:tok2,keys:{}});assert.equal(r.error,'signin');
assert.equal(acc.rows.length,1,'account row gone');
// feedback still works
r=post({kind:'feedback',msg:'hello there test',ms:5000});assert.ok(r.ok);
// expired code
G.setNow(()=>real()+3600000*3);post({kind:'auth_start',email:'late@example.com'});const c4=lastCode();G.setNow(()=>real()+3600000*3+11*60000);
r=post({kind:'auth_verify',email:'late@example.com',code:c4});assert.equal(r.error,'expired');
// daily email cap
G.setQuota(2);G.setNow(()=>real()+3600000*5);r=post({kind:'auth_start',email:'q@example.com'});assert.equal(r.error,'busy');
console.log('ALL BACKEND TESTS PASSED');
