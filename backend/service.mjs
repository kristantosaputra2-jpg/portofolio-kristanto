import {random, digest, passwordHash, equal, headers} from './security.mjs';
const now = () => new Date().toISOString();
const kinds = ['project','tutorial','prompt','portfolio'];
const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {status,headers:{...headers,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});
const error = (message, status=400) => { throw Object.assign(new Error(message), {status}); };
function inspect(value, depth=0) {
  if (depth > 20) error('Isi terlalu bertingkat.');
  if (typeof value === 'string' && value.length > 150000) error('Teks terlalu panjang.');
  if (Array.isArray(value) && value.length > 400) error('Maksimal 400 entri per daftar.');
  if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) {
    if (['__proto__','constructor','prototype','admin'].includes(k)) error('Kolom tidak diizinkan.');
    inspect(v, depth+1);
  }
}
export function validate(doc, kind) {
  if (!doc || Array.isArray(doc) || typeof doc !== 'object') error('Isi konten tidak valid.');
  if (JSON.stringify(doc).length > 700000) error('Konten terlalu besar; unggah gambar melalui tombol gambar.');
  inspect(doc);
  if (kind === 'portfolio') {
    if(doc.support){
      if(typeof doc.support.enabled!=='boolean'||typeof doc.support.url!=='string')error('Pengaturan Traktir Kopi tidak valid.');
      if(!['link',undefined].includes(doc.support.mode))error('Metode Traktir Kopi tidak valid.');
      if(doc.support.url&&!/^https:\/\/[^\s]+$/i.test(doc.support.url))error('Tautan alternatif Traktir Kopi harus memakai https://.');
      if(doc.support.enabled && !/^https:\/\/[^\s]+$/i.test(doc.support.url))error('Isi tautan Traktir Kopi dengan alamat https:// sebelum menampilkan tombol.');
      for(const key of ['title','message','buttonLabel'])if(typeof doc.support[key]!=='string')error('Pengaturan teks Traktir Kopi tidak valid.');
    }
    for (const k of ['meta','brand','hero','ticker','about','work','expertise','stack','process','contact','footer']) if (!doc[k]) error('Bagian portofolio tidak lengkap: '+k);
    if (!Array.isArray(doc.work.projects) || !Array.isArray(doc.hero.annos)) error('Struktur portofolio tidak valid.');
    return doc;
  }
  if (typeof doc.title !== 'string' || !doc.title.trim() || doc.title.length > 180) error('Judul wajib diisi (maksimal 180 karakter).');
  for (const k of ['summary','category','body','version','requirements','video','cover','readiness','license']) if (doc[k] !== undefined && typeof doc[k] !== 'string') error('Kolom '+k+' harus berupa teks.');
  for (const [key,href] of Object.entries(doc.links || {})) {
    if (href && (typeof href !== 'string' || (!/^https:\/\//i.test(href) && !/^\/demo\/[a-zA-Z0-9_./-]+(?:\?download=1)?$/.test(href)) || href.includes('..'))) error('Tautan '+key+' harus memakai https:// atau menunjuk demo lokal.');
  }
  if (doc.cover && !/^(\/api\/media\/[a-f0-9-]+|assets\/[\w./-]+|https:\/\/[^\s]+)$/.test(doc.cover)) error('Alamat gambar tidak valid.');
  if (doc.video && !youtubeID(doc.video)) error('Gunakan tautan video YouTube yang valid.');
  if (!Array.isArray(doc.steps || []) || (doc.steps || []).length > 30) error('Maksimal 30 langkah.');
  for (const s of doc.steps || []) {
    if (!s || typeof s.title !== 'string' || typeof s.text !== 'string') error('Judul dan isi langkah wajib berupa teks.');
    if (s.prompt !== undefined && typeof s.prompt !== 'string') error('Prompt harus berupa teks.');
  }
  const fields = doc.fields || [];
  if (!Array.isArray(fields) || fields.length > 20) error('Maksimal 20 isian generator.');
  const keys = new Set();
  for (const f of fields) {
    if (!f || !/^[a-z][a-z0-9_]{0,30}$/.test(f.key) || keys.has(f.key) || typeof f.label !== 'string' || !f.label.trim()) error('Kunci generator harus unik, diawali huruf kecil, tanpa spasi.');
    keys.add(f.key);
    if (!['text','textarea','select','number'].includes(f.type)) error('Tipe isian generator tidak valid.');
    if (typeof (f.default || '') !== 'string' || !Array.isArray(f.options || []) || (f.options || []).some(o=>typeof o !== 'string')) error('Pilihan generator tidak valid.');
    if (f.type === 'select' && !(f.options || []).length) error('Isian pilihan memerlukan minimal satu opsi.');
  }
  return doc;
}
export function youtubeID(input) {
  try {
    const u = new URL(input); if (u.protocol !== 'https:') return '';
    let id='';
    if (u.hostname === 'youtu.be') id=u.pathname.slice(1);
    if (['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)) id=u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || '';
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch { return ''; }
}
async function body(req) {
  if (!req.headers.get('content-type')?.startsWith('application/json')) error('Kirim data sebagai JSON.',415);
  const text = await req.text(); if (text.length > 1000000) error('Ukuran kiriman terlalu besar.',413);
  try { return JSON.parse(text); } catch { error('Data tidak dapat dibaca.'); }
}
function serial(row) { return {...row,draft:JSON.parse(row.draft),published:row.published ? JSON.parse(row.published):null}; }
export async function handle(request, db, config, clientIP='local') {
  try {
    const url = new URL(request.url), path = url.pathname.replace(/\/$/,'');
    if (!['GET','POST','PUT'].includes(request.method)) return json({error:'Metode tidak diizinkan.'},405,{'Allow':'GET, POST, PUT'});
    if (request.method !== 'GET') {
      if (request.headers.get('origin') !== url.origin || (config.origin && url.origin !== config.origin)) error('Permintaan harus berasal dari website ini.',403);
    }
    if (path === '/api/public' && request.method === 'GET') {
      const rows = await db.all('SELECT id,kind,slug,published,updated FROM items WHERE published IS NOT NULL ORDER BY updated DESC');
      return json({items:rows.map(r=>({id:r.id,kind:r.kind,slug:r.slug,content:JSON.parse(r.published),updated:r.updated}))});
    }
    const token = request.headers.get('cookie')?.match(/(?:^|;\s*)mrk_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    const session = token ? await db.first('SELECT * FROM sessions WHERE token=? AND expires>?',[await digest(token),Date.now()]) : null;
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    if (path === '/api/login' && request.method === 'POST') {
      if (!config.email || !config.salt || !config.hash) error('Akun admin belum dikonfigurasi di server.',503);
      const data = await body(request);
      if (typeof data.email !== 'string' || typeof data.password !== 'string' || data.password.length > 256) error('Email atau kata sandi salah.',401);
      const timestamp=Date.now(), window=Math.floor(timestamp/900000), bucket=await digest(clientIP+':'+window);
      await db.run('DELETE FROM login_limits WHERE expires<?',[timestamp]);
      await db.run('INSERT INTO login_limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1',[bucket,timestamp+900000]);
      const limit=await db.first('SELECT count FROM login_limits WHERE bucket=?',[bucket]);
      if (limit.count>8) error('Terlalu banyak percobaan. Coba lagi setelah 15 menit.',429);
      const computed=await passwordHash(data.password,config.salt,config.rounds || 6);
      if (!equal(data.email.trim().toLowerCase(),config.email.toLowerCase()) || !equal(computed,config.hash)) error('Email atau kata sandi salah.',401);
      const fresh=random(), csrf=random();
      await db.run('DELETE FROM sessions WHERE expires<?',[timestamp]);
      if (token) await db.run('DELETE FROM sessions WHERE token=?',[await digest(token)]);
      await db.run('INSERT INTO sessions(token,csrf,expires) VALUES(?,?,?)',[await digest(fresh),csrf,timestamp+28800000]);
      return json({email:config.email,csrf},200,{'Set-Cookie':`mrk_session=${fresh}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`});
    }
    if (path.startsWith('/api/media/') && request.method === 'GET') {
      const id=path.split('/').pop(), mediaPath='/api/media/'+id;
      if (!session) {
        const visible=await db.first('SELECT id FROM items WHERE published IS NOT NULL AND instr(published,?)>0 LIMIT 1',[JSON.stringify(mediaPath)]);
        if (!visible) error('Gambar tidak ditemukan.',404);
      }
      const media=await db.first('SELECT mime,data FROM media WHERE id=?',[id]);
      if (!media) error('Gambar tidak ditemukan.',404);
      const bytes=Uint8Array.from(atob(media.data),c=>c.charCodeAt(0));
      return new Response(bytes,{headers:{...headers,'Content-Type':media.mime,'Cache-Control':'private, no-cache'}});
    }
    if (!session) error('Silakan masuk sebagai admin.',401);
    if (path === '/api/session' && request.method === 'GET') return json({email:config.email,csrf:session.csrf});
    if (request.method !== 'GET' && !equal(request.headers.get('x-csrf-token'),session.csrf)) error('Sesi tidak valid. Muat ulang dashboard.',403);
    if (path === '/api/logout' && request.method === 'POST') {
      await db.run('DELETE FROM sessions WHERE token=?',[session.token]);
      return json({ok:true},200,{'Set-Cookie':`mrk_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`});
    }
    if (path === '/api/admin/media' && request.method === 'POST') {
      const data=await body(request);
      if (!['image/webp','image/png','image/jpeg'].includes(data.mime) || typeof data.data !== 'string' || data.data.length>700000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data.data)) error('Unggah gambar JPG, PNG, atau WebP, maksimal 500 KB.');
      let bytes; try { bytes=Uint8Array.from(atob(data.data),c=>c.charCodeAt(0)); } catch { error('Gambar tidak valid.'); }
      const signature=data.mime==='image/png' ? bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71 : data.mime==='image/jpeg' ? bytes[0]===255 && bytes[1]===216 && bytes[2]===255 : String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP';
      if (!signature || bytes.length>512000) error('Format atau ukuran gambar tidak valid.');
      const id=crypto.randomUUID(); await db.run('INSERT INTO media(id,mime,data,created) VALUES(?,?,?,?)',[id,data.mime,data.data,now()]);
      return json({url:'/api/media/'+id},201);
    }
    if (path === '/api/admin/items' && request.method === 'GET') {
      return json({items:(await db.all('SELECT * FROM items ORDER BY updated DESC')).map(serial)});
    }
    if (path === '/api/admin/items' && request.method === 'POST') {
      const data=await body(request);
      if (!kinds.includes(data.kind) || data.kind==='portfolio') error('Jenis konten tidak valid.');
      const doc=validate(data.content,data.kind), id=crypto.randomUUID();
      const slug=(doc.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'catatan')+'-'+id.slice(0,6);
      const row={id,kind:data.kind,slug,draft:JSON.stringify(doc),published:null,version:1,updated:now()};
      await db.batch([
        ['INSERT INTO items(id,kind,slug,draft,published,version,updated) VALUES(?,?,?,?,?,?,?)',Object.values(row)],
        ['INSERT INTO revisions(id,item_id,action,snapshot,created) VALUES(?,?,?,?,?)',[crypto.randomUUID(),id,'Dibuat',JSON.stringify(row),row.updated]]
      ]);
      return json({item:serial(row)},201);
    }
    const match=path.match(/^\/api\/admin\/items\/([a-zA-Z0-9-]+)(?:\/(history|publish|unpublish|restore))?$/);
    if (match) {
      const [,id,action]=match;
      const old=await db.first('SELECT * FROM items WHERE id=?',[id]); if (!old) error('Konten tidak ditemukan.',404);
      if (!action && request.method==='GET') return json({item:serial(old)});
      if (action==='history' && request.method==='GET') return json({revisions:await db.all('SELECT id,action,created FROM revisions WHERE item_id=? ORDER BY created DESC LIMIT 100',[id])});
      if ((!action && request.method!=='PUT') || (action && request.method!=='POST')) error('Metode tidak diizinkan.',405);
      const data=await body(request);
      if (!Number.isInteger(data.version) || data.version!==old.version) error('Konten berubah di tab lain. Muat ulang sebelum menyimpan.',409);
      let draft=old.draft, published=old.published, label='Draf disimpan';
      if (!action) draft=JSON.stringify(validate(data.content,old.kind));
      else if (action==='publish') { validate(JSON.parse(draft),old.kind); published=draft; label='Diterbitkan'; }
      else if (action==='unpublish') {
        if (old.kind==='portfolio') error('Portofolio utama harus tetap tersedia.');
        published=null; label='Publikasi dibatalkan';
      } else if (action==='restore') {
        const revision=await db.first('SELECT snapshot FROM revisions WHERE id=? AND item_id=?',[data.revision,id]);
        if (!revision) error('Versi tidak ditemukan.',404);
        draft=JSON.parse(revision.snapshot).draft; validate(JSON.parse(draft),old.kind); label='Versi dipulihkan sebagai draf';
      } else error('Aksi tidak tersedia.',404);
      const row={...old,draft,published,version:old.version+1,updated:now()};
      // Optimistic SQL guard plus revision insert only when that exact revision wins.
      const rid=crypto.randomUUID();
      await db.batch([
        ['UPDATE items SET draft=?,published=?,version=?,updated=? WHERE id=? AND version=?',[draft,published,row.version,row.updated,id,old.version]],
        ['INSERT INTO revisions(id,item_id,action,snapshot,created) SELECT ?,?,?,?,? WHERE changes()=1',[rid,id,label,JSON.stringify(row),row.updated]]
      ]);
      const won=await db.first('SELECT id FROM revisions WHERE id=?',[rid]);
      if (!won) error('Konten berubah di tab lain. Muat ulang sebelum menyimpan.',409);
      return json({item:serial(row),message:label});
    }
    error('Alamat tidak ditemukan.',404);
  } catch (e) {
    if (!e.status) console.error('CMS request failed:',e.message);
    return json({error:e.status ? e.message : 'Server belum siap atau gagal menyimpan. Coba lagi.'},e.status || 500);
  }
}
