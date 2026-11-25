import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {handle,validate,youtubeID} from '../backend/service.mjs';
import {passwordHash,random} from '../backend/security.mjs';
import {fillPrompt,safeURL} from '../public/js/cms-common.js';
import {supportConfig,defaultSupport} from '../public/js/support.js';
const schema=await readFile(new URL('../backend/schema.sql',import.meta.url),'utf8');
const salt=random(),hash=await passwordHash('Test-Only-Password-123',salt),config={email:'owner@example.test',hash,salt,rounds:6};
function fixture(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(schema);
 const db={async all(s,a=[]){return sqlite.prepare(s).all(...a);},async first(s,a=[]){return sqlite.prepare(s).get(...a);},async run(s,a=[]){return sqlite.prepare(s).run(...a);},async batch(q){sqlite.exec('BEGIN');try{for(const[s,a]of q)sqlite.prepare(s).run(...a);sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 let cookie='',csrf='';
 async function call(path,{method='GET',data,origin='https://example.test',auth=true,sendCSRF=true,ip='test-ip'}={}){
  const headers={origin};if(auth&&cookie)headers.cookie=cookie;if(sendCSRF&&csrf)headers['x-csrf-token']=csrf;if(data!==undefined)headers['content-type']='application/json';
  const response=await handle(new Request('https://example.test/api'+path,{method,headers,...(data!==undefined?{body:JSON.stringify(data)}:{})}),db,config,ip);
  const contentType=response.headers.get('content-type')||'';const body=contentType.includes('json')?await response.json():new Uint8Array(await response.arrayBuffer());
  return {status:response.status,headers:response.headers,body};
 }
 async function login(){const r=await call('/login',{method:'POST',data:{email:config.email,password:'Test-Only-Password-123'}});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=r.body.csrf;return r;}
 return {sqlite,db,call,login};
}
const example={title:'Catatan uji',summary:'Sebuah draf',category:'Uji',steps:[],fields:[],links:{}};
test('owner-only login, cookie flags, CSRF, expiry, logout and rate limit',async()=>{
 const f=fixture();
 assert.equal((await f.call('/admin/items')).status,401);
 assert.equal((await f.call('/login',{method:'POST',origin:'https://evil.test',data:{}})).status,403);
 assert.equal((await f.call('/login',{method:'POST',data:{email:'other@example.test',password:'Test-Only-Password-123'}})).status,401);
 assert.equal((await f.call('/login',{method:'POST',data:{email:config.email,password:'wrong'}})).status,401);
 const r=await f.login();for(const flag of ['HttpOnly','Secure','SameSite=Strict'])assert.ok(r.headers.get('set-cookie').includes(flag));
 assert.equal((await f.call('/admin/items',{method:'POST',data:{kind:'tutorial',content:example},sendCSRF:false})).status,403);
 assert.equal((await f.call('/session')).body.email,config.email);
 assert.equal((await f.call('/logout',{method:'POST',data:{}})).status,200);
 assert.equal((await f.call('/session')).status,401);
 await f.login();f.sqlite.exec('UPDATE sessions SET expires=0');assert.equal((await f.call('/session')).status,401);
 f.sqlite.exec('DELETE FROM login_limits');
 for(let i=0;i<8;i++)await f.call('/login',{method:'POST',data:{email:config.email,password:'wrong'},ip:'limit-ip'});
 assert.equal((await f.call('/login',{method:'POST',data:{email:config.email,password:'wrong'},ip:'limit-ip'})).status,429);
 f.sqlite.close();
});
test('draft isolation, publishing, stale-save protection, unpublish and revision restore',async()=>{
 const f=fixture();await f.login();
 let result=await f.call('/admin/items',{method:'POST',data:{kind:'tutorial',content:example}});assert.equal(result.status,201);let item=result.body.item;
 assert.deepEqual((await f.call('/public',{auth:false})).body.items,[]);
 assert.equal((await f.call('/admin/items/'+item.id,{auth:false})).status,401);
 result=await f.call('/admin/items/'+item.id+'/publish',{method:'POST',data:{version:item.version}});assert.equal(result.status,200);item=result.body.item;
 assert.equal((await f.call('/public',{auth:false})).body.items[0].content.title,example.title);
 const version=item.version;
 result=await f.call('/admin/items/'+item.id,{method:'PUT',data:{version,content:{...example,title:'Versi baru'}}});assert.equal(result.status,200);item=result.body.item;
 assert.equal((await f.call('/admin/items/'+item.id,{method:'PUT',data:{version,content:example}})).status,409);
 assert.equal((await f.call('/public',{auth:false})).body.items[0].content.title,example.title);
 const history=(await f.call('/admin/items/'+item.id+'/history')).body.revisions;assert.equal(history.length,3);
 const first=history.find(r=>r.action==='Dibuat');
 item=(await f.call('/admin/items/'+item.id+'/restore',{method:'POST',data:{version:item.version,revision:first.id}})).body.item;
 assert.equal(item.draft.title,example.title);assert.equal(item.published.title,example.title);
 result=await f.call('/admin/items/'+item.id+'/unpublish',{method:'POST',data:{version:item.version}});assert.equal(result.status,200);
 assert.deepEqual((await f.call('/public',{auth:false})).body.items,[]);f.sqlite.close();
});
test('media stays private until referenced by a published item; executable uploads rejected',async()=>{
 const f=fixture();await f.login();
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1kAAAAASUVORK5CYII=';
 assert.equal((await f.call('/admin/media',{method:'POST',data:{mime:'image/svg+xml',data:btoa('<svg/>')}})).status,400);
 assert.equal((await f.call('/admin/media',{method:'POST',data:{mime:'image/png',data:btoa('<script>bad</script>')}})).status,400);
 const upload=await f.call('/admin/media',{method:'POST',data:{mime:'image/png',data:png}});assert.equal(upload.status,201);
 assert.equal((await f.call(upload.body.url.replace('/api',''),{auth:false})).status,404);
 let item=(await f.call('/admin/items',{method:'POST',data:{kind:'project',content:{...example,cover:upload.body.url}}})).body.item;
 item=(await f.call('/admin/items/'+item.id+'/publish',{method:'POST',data:{version:item.version}})).body.item;
 assert.equal((await f.call(upload.body.url.replace('/api',''),{auth:false})).status,200);
 await f.call('/admin/items/'+item.id+'/unpublish',{method:'POST',data:{version:item.version}});
 assert.equal((await f.call(upload.body.url.replace('/api',''),{auth:false})).status,404);f.sqlite.close();
});
test('validators reject unsafe links, arbitrary embeds, invalid field keys and polluted objects',()=>{
 assert.throws(()=>validate({...example,links:{source:'javascript:alert(1)'}},'project'));
 assert.throws(()=>validate({...example,video:'https://attacker.test/watch?v=abcdefghijk'},'tutorial'));
 assert.throws(()=>validate({...example,fields:[{key:'bad key',label:'Test',type:'text'}]},'prompt'));
 assert.throws(()=>validate(JSON.parse('{"title":"A","__proto__":{"x":1}}'),'prompt'));
 assert.equal(youtubeID('https://youtu.be/abcdefghijk'),'abcdefghijk');
 assert.equal(safeURL('javascript:alert(1)'), '');
 assert.equal(fillPrompt('Kelas {{kelas}}. Topik {{topik}}.',{kelas:'VIII',topik:'<script>literal</script>'}),'Kelas VIII. Topik <script>literal</script>.');
});
test('all packaged seed documents pass validation and contain no admin credential',async()=>{
 const seed=JSON.parse(await readFile(new URL('../backend/seed.json',import.meta.url),'utf8'));
 for(const row of seed)validate(row.content,row.kind);
 assert.ok(!JSON.stringify(seed).includes('"admin"'));assert.ok(seed.find(r=>r.id==='lewu-cbt').published===false);
});
test('Traktir Kopi requires a valid HTTPS support link',async()=>{
 const linkSupport={...defaultSupport,mode:'link'};
 assert.equal(supportConfig(undefined),null);
 assert.equal(supportConfig({...linkSupport,enabled:true}),null);
 assert.equal(supportConfig({...linkSupport,enabled:true,url:'javascript:alert(1)'}),null);
 assert.equal(supportConfig({...linkSupport,url:'https://example.test/support'}),null);
 assert.equal(supportConfig({...linkSupport,enabled:true,url:'https://example.test/support'}).url,'https://example.test/support');
 const seed=JSON.parse(await readFile(new URL('../backend/seed.json',import.meta.url),'utf8'));
 const site=seed.find(r=>r.id==='portfolio').content;
 assert.throws(()=>validate({...site,support:{...defaultSupport,enabled:true,url:'javascript:alert(1)'}},'portfolio'));
});
