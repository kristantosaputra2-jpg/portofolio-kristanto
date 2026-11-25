import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {random,passwordHash} from '../backend/security.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('HTTP server serves assets, isolates private files, sets headers and persists a draft across restart',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'mrk-cms-test-')),salt=random();
 await writeFile(path.join(dir,'admin.json'),JSON.stringify({email:'owner@example.test',salt,hash:await passwordHash('Local-Test-Only-123',salt),rounds:6}));
 const port=18992,origin='http://127.0.0.1:'+port;let child;
 async function start(){child=spawn(process.execPath,['backend/server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),MRK_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{let out='';const timeout=setTimeout(()=>reject(new Error('Server startup timed out')),10000);child.stdout.on('data',chunk=>{out+=chunk;if(out.includes('Dashboard:')){clearTimeout(timeout);resolve();}});child.on('error',reject);child.on('exit',code=>{if(code)reject(new Error('Server failed: '+code));});});}
 async function stop(){if(!child)return;await new Promise(resolve=>{child.once('exit',resolve);child.kill();});child=null;}
 let cookie='',csrf='';
 async function api(url,{method='GET',data}={}){const reply=await fetch(origin+url,{method,headers:{origin,cookie,'x-csrf-token':csrf,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});return {reply,data:await reply.json()};}
 async function login(){const {reply,data}=await api('/api/login',{method:'POST',data:{email:'owner@example.test',password:'Local-Test-Only-123'}});assert.equal(reply.status,200);cookie=reply.headers.get('set-cookie').split(';')[0];csrf=data.csrf;}
 try{
  await start();
  for(const address of ['/private/admin.json','/backend/seed.json','/.git/config','/package.json'])assert.equal((await fetch(origin+address)).status,404,address);
  const html=await fetch(origin+'/');assert.equal(html.status,200);assert.ok(html.headers.get('content-security-policy').includes("object-src 'none'"));
  for(const address of ['/admin','/berbagi.html','/js/dashboard.js','/css/dashboard.css','/demo/kuis.html','/assets/foto-kristanto.jpg'])assert.equal((await fetch(origin+address)).status,200,address);
  const download=await fetch(origin+'/demo/kuis-mandiri.html');assert.ok(download.headers.get('content-disposition').includes('attachment'));assert.ok((await download.text()).includes('<style>'));
  assert.equal((await api('/api/admin/items')).reply.status,401);
  await login();
  const created=await api('/api/admin/items',{method:'POST',data:{kind:'prompt',content:{title:'Persistence test',steps:[],fields:[],links:{}}}});assert.equal(created.reply.status,201);const id=created.data.item.id;
  assert.ok(!(await api('/api/public')).data.items.some(x=>x.id===id));
  await stop();await start();await login();
  assert.equal((await api('/api/admin/items/'+id)).data.item.draft.title,'Persistence test');
 }finally{await stop();if(!path.resolve(dir).startsWith(path.resolve(tmpdir())+path.sep+'mrk-cms-test-'))throw new Error('Unsafe test cleanup path');await rm(dir,{recursive:true,force:true});}
});
