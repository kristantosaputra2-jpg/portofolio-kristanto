import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
let count=0;
async function walk(dir) {
 for(const ent of await readdir(dir,{withFileTypes:true})) {
  const p=path.join(dir,ent.name); if(ent.isDirectory()) await walk(p);
  else if(/\.(m?js)$/.test(p)) { const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'}); if(r.status) throw new Error(r.stderr);count++; }
 }
}
await walk('public');await walk('backend');await walk('functions');
const data=await readFile('public/js/data.js','utf8');
if (/"admin"\s*:|mrk123|"pin"\s*:/.test(data)) throw new Error('Konfigurasi admin ditemukan di file publik.');
console.log(`${count} file JavaScript lulus pemeriksaan sintaks; konfigurasi admin tidak ada di data publik.`);
