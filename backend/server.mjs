import http from 'node:http';
import {readFile, mkdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {handle} from './service.mjs';
import {headers} from './security.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const privateDir=process.env.MRK_DATA_DIR || path.join(root,'private');
await mkdir(privateDir,{recursive:true});
let config;
try { config=JSON.parse(await readFile(path.join(privateDir,'admin.json'),'utf8')); }
catch { console.error('Konfigurasi akun belum ada. Jalankan node scripts/set-admin.mjs untuk menyiapkannya.'); process.exit(1); }
const sqlite=new DatabaseSync(path.join(privateDir,'content.sqlite'));
sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
sqlite.exec(await readFile(path.join(root,'backend/schema.sql'),'utf8'));
const db={
 async all(sql,args=[]) { return sqlite.prepare(sql).all(...args); },
 async first(sql,args=[]) { return sqlite.prepare(sql).get(...args) || null; },
 async run(sql,args=[]) { return sqlite.prepare(sql).run(...args); },
 async batch(queries) { sqlite.exec('BEGIN IMMEDIATE'); try { for(const [sql,args] of queries) sqlite.prepare(sql).run(...args); sqlite.exec('COMMIT'); } catch(e) { sqlite.exec('ROLLBACK'); throw e; } }
};
const seed=JSON.parse(await readFile(path.join(root,'backend/seed.json'),'utf8'));
for (const row of seed) {
 await db.run('INSERT OR IGNORE INTO items(id,kind,slug,draft,published,version,updated) VALUES(?,?,?,?,?,1,?)',[row.id,row.kind,row.slug,JSON.stringify(row.content),row.published ? JSON.stringify(row.content):null,new Date().toISOString()]);
 const saved=await db.first('SELECT * FROM items WHERE id=?',[row.id]);
 if(!(await db.first('SELECT id FROM revisions WHERE item_id=? LIMIT 1',[row.id]))) await db.run('INSERT INTO revisions(id,item_id,action,snapshot,created) VALUES(?,?,?,?,?)',['seed-'+row.id,row.id,'Versi awal',JSON.stringify(saved),saved.updated]);
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
const port=Number(process.env.PORT || 8787), publicDir=path.join(root,'public');
const server=http.createServer(async(req,res)=>{
 try {
  const host=req.headers.host || '';
  if (![`127.0.0.1:${port}`,`localhost:${port}`].includes(host)) { res.writeHead(403); res.end('Host tidak diizinkan.'); return; }
  const origin='http://'+host, url=new URL(req.url,origin);
  if (url.pathname.startsWith('/api/')) {
   let total=0, chunks=[];
   for await (const chunk of req) { total+=chunk.length; if(total>1000000) { res.writeHead(413,headers); res.end('Kiriman terlalu besar'); return; } chunks.push(chunk); }
   const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
   const reply=await handle(request,db,{...config,origin},req.socket.remoteAddress);
   res.writeHead(reply.status,Object.fromEntries(reply.headers)); res.end(Buffer.from(await reply.arrayBuffer())); return;
  }
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,headers); res.end(); return; }
  const pathname=decodeURIComponent(url.pathname);
  let rel=pathname==='/'?'/index.html':pathname==='/admin'||pathname==='/admin/'?'/admin.html':pathname;
  if (rel.split('/').some(p=>p.startsWith('.') || p.includes('\\'))) { res.writeHead(404,headers);res.end('Tidak ditemukan');return; }
  const filename=path.resolve(publicDir,'.'+rel);
  if (!filename.startsWith(publicDir+path.sep)) { res.writeHead(404,headers);res.end();return; }
  const info=await stat(filename); if(!info.isFile()) throw new Error('Not a file');
  res.writeHead(200,{...headers,'Content-Type':types[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-cache',...((url.searchParams.get('download')==='1'||rel==='/demo/kuis-mandiri.html')&&rel.startsWith('/demo/')?{'Content-Disposition':`attachment; filename="${path.basename(filename)}"`}:{})});
  res.end(req.method==='HEAD'?undefined:await readFile(filename));
 } catch { if(!res.headersSent) res.writeHead(404,headers); res.end('Halaman tidak ditemukan.'); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Portofolio: http://127.0.0.1:${port}\nDashboard: http://127.0.0.1:${port}/admin`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{sqlite.close();process.exit(0);}));
