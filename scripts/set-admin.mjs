import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInterface} from 'node:readline/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {random,passwordHash} from '../backend/security.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), dir=path.join(root,'private');
await mkdir(dir,{recursive:true});
const rl=createInterface({input:process.stdin,output:process.stdout});
console.log('Konfigurasi admin lokal. Isian sandi pada terminal dapat terlihat; gunakan komputer pribadi.');
const email=(await rl.question('Email admin: ')).trim().toLowerCase();
const password=await rl.question('Kata sandi baru (minimal 12 karakter): ');
const confirmation=await rl.question('Ulangi kata sandi: '); rl.close();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password!==confirmation) throw new Error('Email atau konfirmasi tidak sesuai. Tidak ada perubahan.');
const salt=random();
await writeFile(path.join(dir,'admin.json'),JSON.stringify({email,salt,hash:await passwordHash(password,salt),rounds:6},null,2),{mode:0o600});
try { const {DatabaseSync}=await import('node:sqlite'); const db=new DatabaseSync(path.join(dir,'content.sqlite')); db.exec('DELETE FROM sessions'); db.close(); } catch {}
console.log('Akun lokal disimpan. Mulai ulang server. Semua sesi lama dibatalkan.');
