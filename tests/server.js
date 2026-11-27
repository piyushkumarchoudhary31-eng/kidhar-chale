const http=require('http');const G=require('./gas-mock.js');let off=0;
http.createServer((q,r)=>{let body='';q.on('data',c=>body+=c);q.on('end',()=>{
  const u=new URL(q.url,'http://x');let out;
  try{
    if(u.pathname==='/advance'){off+=+u.searchParams.get('ms');G.setNow(()=>Date.now()+off);out='{}'}
    else if(u.pathname==='/outbox'){out=JSON.stringify(G.outbox)}
    else if(u.pathname==='/dump'){const b=Object.values(G.books)[0];out=JSON.stringify(b?b.sheets.map(s=>({name:s.name,rows:s.rows})):[])}
    else if(u.pathname==='/stats'){out=JSON.stringify(G.stats)}
    else if(q.method==='POST'){out=G.ctx.doPost({postData:{contents:body}}).getContent()}
    else out=G.ctx.doGet({parameter:Object.fromEntries(u.searchParams)}).getContent();
  }catch(e){r.writeHead(500);r.end(String(e.stack));return}
  r.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});r.end(out)})}).listen(8792,'127.0.0.1',()=>console.log('mock backend on 8792'));
