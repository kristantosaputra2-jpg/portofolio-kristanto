import {esc,clone,date,safeURL,request} from './cms-common.js';
import {defaultSupport} from './support.js';
const root=document.getElementById('dashboard');
const kinds={portfolio:'Portofolio utama',project:'Proyek terbuka',tutorial:'Tutorial',prompt:'Prompt'};
let csrf='',items=[],current=null,doc=null,dirty=false,busy=false,tab='content',filter='all',search='';
const labels={support:'Traktir Kopi',mode:'Metode dukungan',enabled:'Tampilkan tombol dukungan',url:'Tautan dukungan',buttonLabel:'Teks tombol',message:'Pesan dukungan',meta:'Informasi pencarian',brand:'Identitas',hero:'Pembuka',ticker:'Pita berjalan',about:'Tentang saya',work:'Karya portofolio',expertise:'Keahlian',stack:'Alat yang dipakai',process:'Cara kerja',contact:'Kontak',footer:'Footer',title:'Judul',description:'Deskripsi',first:'Nama depan',last:'Nama belakang',degree:'Gelar',tag:'Label',role:'Peran',cta:'Teks tombol kontak',annos:'Catatan pembuka',text:'Teks',nameSub:'Keterangan nama',todoTitle:'Judul daftar tugas',todo:'Daftar tugas',done:'Selesai',note:'Catatan',openTitle:'Judul catatan kolaborasi',openSub:'Keterangan kolaborasi',words:'Kata pada pita',phrases:'Kalimat pada pita',speed:'Durasi putaran (detik)',photo:'Foto',caption:'Keterangan foto',label:'Label',titleHl:'Bagian judul yang disorot',titleRest:'Lanjutan judul',bio:'Biografi',tags:'Tag',tools:'Alat',stats:'Statistik',value:'Nilai',projects:'Karya',filters:'Kategori karya',key:'Kunci',sub:'Keterangan singkat',cats:'Kunci kategori',thumb:'Ilustrasi bawaan',image:'Gambar utama',deco:'Hiasan',statusType:'Jenis status',status:'Teks status',platform:'Platform',problem:'Masalah',solution:'Solusi',users:'Pengguna',ai:'AI di produk',link:'Tautan',images:'Gambar slideshow',src:'Alamat gambar',alt:'Deskripsi gambar',limit:'Jumlah karya awal',moreAll:'Teks tampilkan semua',moreLabel:'Label tautan tambahan',moreLink:'Tautan tambahan',cards:'Kartu',icon:'Ikon bawaan',checks:'Daftar poin',go:'Tujuan kategori',intro:'Pengantar',groups:'Kelompok',items:'Daftar',steps:'Langkah',worked:'Konteks kerja',socials:'Media sosial',email:'Email',instagram:'Instagram',youtube:'YouTube',tiktok:'TikTok',whatsapp:'WhatsApp',facebook:'Facebook',linkedin:'LinkedIn',website:'Website',form:'Formulir',options:'Pilihan',copy:'Hak cipta',base:'Kalimat penutup',ctx:'Konteks',name:'Nama',heading:'Judul',body:'Isi',num:'Nomor',titleA:'Judul bagian pertama',titleB:'Judul bagian kedua',checkTitle:'Judul daftar',groupsTitle:'Judul kelompok'};
function message(text,error=false){const box=document.getElementById('editor-message');if(box){box.textContent=text;box.classList.toggle('error',error);}}
function mark(){dirty=true;const box=document.getElementById('dirty-note');if(box){box.hidden=false;box.textContent='Ada perubahan yang belum disimpan. Simpan draf sebelum membuka pratinjau atau menerbitkan.';}}
async function mutate(path,content,method='POST'){return request(path,{method,headers:{'x-csrf-token':csrf},body:JSON.stringify(content)});}
function confirmAction(title,text,label='Lanjutkan') {
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='dash-dialog';dialog.innerHTML=`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button data-no>Batal</button><button data-yes class="primary">${esc(label)}</button></div>`;document.body.append(dialog);dialog.showModal();
  const finish=result=>{dialog.close();dialog.remove();resolve(result);};dialog.querySelector('[data-no]').onclick=()=>finish(false);dialog.querySelector('[data-yes]').onclick=()=>finish(true);dialog.oncancel=e=>{e.preventDefault();finish(false);};
 });
}
async function protectedAction(action){
 if(busy)return;busy=true;root.querySelectorAll('button').forEach(b=>b.disabled=true);
 try{await action();}catch(e){if(e.status===401){dirty=false;login('Sesi berakhir. Masuk kembali untuk melanjutkan.');}else message(e.message,true);}
 finally{busy=false;root.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
function login(reason='') {
 csrf='';root.innerHTML=`<main class="login-page"><section class="login-card"><span class="share-note">Meja kerja privat.</span><h1>Masuk dashboard</h1><p>Kelola portofolio, panduan, dan catatan Berbagi.</p><form id="login-form"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Kata sandi<input name="password" type="password" autocomplete="current-password" required></label><p class="login-error" id="login-error" role="alert">${esc(reason)}</p><button type="submit" class="action-btn">Masuk</button></form><a href="/">← Kembali ke portofolio</a></section></main>`;
 document.getElementById('login-form').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,b=form.querySelector('button');b.disabled=true;document.getElementById('login-error').textContent='Memeriksa akun…';
  try{const session=await request('/api/login',{method:'POST',body:JSON.stringify({email:form.elements.email.value,password:form.elements.password.value})});form.elements.password.value='';csrf=session.csrf;await load(session.email);}
  catch(err){document.getElementById('login-error').textContent=err.message;b.disabled=false;}
 };
}
async function load(email) {
 items=(await request('/api/admin/items')).items;
 root.innerHTML=`<header class="dash-top"><div><h1>Meja kerja Mr.K</h1><small>${esc(email)}</small></div><nav><a href="/" target="_blank" rel="noopener">Lihat portofolio ↗</a><a href="/berbagi.html" target="_blank" rel="noopener">Berbagi ↗</a><button class="plain-button" id="logout">Keluar</button></nav></header><div class="dash-layout"><aside class="dash-sidebar"><h2>Koleksi konten</h2><input id="admin-search" type="search" placeholder="Cari judul…" aria-label="Cari konten"><select id="admin-filter" aria-label="Saring jenis"><option value="all">Semua jenis</option>${Object.entries(kinds).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><div class="new-content"><select id="new-kind" aria-label="Jenis konten baru"><option value="tutorial">Tutorial</option><option value="project">Proyek terbuka</option><option value="prompt">Prompt</option></select><button id="new-content">+ Buat</button></div><ul class="item-list" id="item-list"></ul></aside><main class="dash-main" id="editor"><div class="dashboard-welcome"><span class="share-note">Siapkan dulu. Terbitkan saat siap.</span><h2>Semua catatan,<br>satu meja kerja.</h2><p>Pilih konten di sebelah kiri atau buat catatan baru. Draf hanya terlihat setelah kamu masuk.</p><p>Video cukup memakai tautan YouTube. Aplikasi jadi dan kode sumber ditautkan ke GitHub.</p></div></main></div>`;
 document.getElementById('logout').onclick=()=>protectedAction(async()=>{if(dirty&&!await confirmAction('Keluar dashboard?','Perubahan yang belum disimpan akan hilang.','Keluar'))return;await mutate('/api/logout',{});dirty=false;login();});
 document.getElementById('admin-search').oninput=e=>{search=e.target.value;list();};document.getElementById('admin-filter').onchange=e=>{filter=e.target.value;list();};
 document.getElementById('new-content').onclick=()=>protectedAction(async()=>{
  if(dirty&&!await confirmAction('Buat catatan baru?','Perubahan pada catatan ini belum disimpan.','Lanjutkan'))return;
  const kind=document.getElementById('new-kind').value;
  const content={title:kind==='project'?'Proyek baru':kind==='prompt'?'Prompt baru':'Tutorial baru',summary:'',category:'',cover:'',video:'',body:'',version:'',requirements:'',readiness:'',license:'',links:{download:'',demo:'',source:'',issues:'',guide:''},steps:[],fields:[],template:'',related:[]};
  const {item}=await mutate('/api/admin/items',{kind,content});items.unshift(item);select(item);list();
 });list();
 if(current){const updated=items.find(x=>x.id===current.id);if(updated)select(updated);}
}
function titleOf(item){return item.kind==='portfolio'?'Portofolio utama':item.draft.title;}
function statusOf(item){return !item.published?'Draf':JSON.stringify(item.draft)!==JSON.stringify(item.published)?'Terbit · ada draf baru':'Terbit';}
function list(){
 const box=document.getElementById('item-list');if(!box)return;
 const selected=items.filter(i=>(filter==='all'||i.kind===filter)&&titleOf(i).toLowerCase().includes(search.toLowerCase()));
 box.innerHTML=selected.map(i=>`<li><button data-item="${i.id}" aria-current="${current?.id===i.id}"><strong>${esc(titleOf(i))}</strong><small>${kinds[i.kind]} · ${statusOf(i)}</small></button></li>`).join('')||'<li>Belum ada konten yang cocok.</li>';
 box.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>protectedAction(async()=>{if(dirty&&!await confirmAction('Pindah catatan?','Perubahan yang belum disimpan akan hilang.','Pindah'))return;select(items.find(i=>i.id===b.dataset.item));}));
}
function select(item){current=item;doc=clone(item.draft);if(item.kind==='portfolio')doc.support={...defaultSupport,...doc.support};dirty=false;tab='content';editor();list();}
function update(item){items=items.map(i=>i.id===item.id?item:i);current=item;doc=clone(item.draft);dirty=false;editor();list();}
function editor(){
 const box=document.getElementById('editor');if(!current)return;
 const preview=current.kind==='portfolio'?'/?preview=portfolio':'/berbagi.html?preview='+current.id;
 box.innerHTML=`<div class="editor-heading"><div><h2>${esc(titleOf(current))}</h2><p>${kinds[current.kind]} · Diperbarui ${date(current.updated)}</p></div><span class="status-pill ${current.published?'live':''}">${statusOf(current)}</span></div><div class="editor-actions"><button class="save" id="save-draft">Simpan draf</button><a id="preview-link" href="${preview}" target="_blank" rel="noopener">Pratinjau ↗</a><button class="publish" id="publish">Terbitkan</button>${current.published&&current.kind!=='portfolio'?'<button class="danger" id="unpublish">Batalkan publikasi</button>':''}</div><div class="dirty-note" id="dirty-note" hidden></div><p id="editor-message" class="editor-message" role="status" aria-live="polite"></p><div class="editor-tabs" role="tablist" aria-label="Editor"><button role="tab" id="tab-content" aria-selected="${tab==='content'}">Isi konten</button><button role="tab" id="tab-history" aria-selected="${tab==='history'}">Riwayat versi</button></div><div id="editor-body"></div>`;
 document.getElementById('save-draft').onclick=()=>protectedAction(save);
 document.getElementById('preview-link').onclick=e=>{if(dirty){e.preventDefault();message('Simpan draf dahulu agar pratinjau menampilkan perubahan terbaru.',true);}};
 document.getElementById('publish').onclick=()=>protectedAction(async()=>{
  if(!await confirmAction('Terbitkan konten?','Versi draf ini akan terlihat oleh semua pengunjung.','Terbitkan'))return;
  if(dirty)await save();const {item}=await mutate('/api/admin/items/'+current.id+'/publish',{version:current.version});update(item);message('Konten diterbitkan. Pengunjung akan melihat versi ini saat memuat halaman.');
 });
 document.getElementById('unpublish')?.addEventListener('click',()=>protectedAction(async()=>{
  if(!await confirmAction('Batalkan publikasi?','Konten akan disembunyikan dari publik. Draf dan riwayat tetap tersimpan.','Sembunyikan'))return;
  if(dirty)await save();const {item}=await mutate('/api/admin/items/'+current.id+'/unpublish',{version:current.version});update(item);message('Konten kini hanya terlihat di dashboard.');
 }));
 document.getElementById('tab-content').onclick=()=>{tab='content';renderBody();tabs();};document.getElementById('tab-history').onclick=()=>{tab='history';renderBody();tabs();};renderBody();
}
function tabs(){document.getElementById('tab-content').setAttribute('aria-selected',tab==='content');document.getElementById('tab-history').setAttribute('aria-selected',tab==='history');}
async function save(){const {item}=await mutate('/api/admin/items/'+current.id,{version:current.version,content:doc},'PUT');update(item);message('Draf tersimpan. Belum mengubah versi publik.');}
async function renderBody(){
 const body=document.getElementById('editor-body');body.replaceChildren();
 if(tab==='history'){
  body.innerHTML='<p>Memuat riwayat…</p>';
  try{const id=current.id,{revisions}=await request('/api/admin/items/'+id+'/history');if(tab!=='history'||current.id!==id)return;
   body.innerHTML='<p class="field-help">Pulihkan mengembalikan isi ke draf. Klik Terbitkan jika ingin menayangkannya.</p><ul class="history-list">'+revisions.map(r=>`<li><div><strong>${esc(r.action)}</strong><small>${date(r.created)}</small></div><button class="small-btn" data-restore="${r.id}">Pulihkan ke draf</button></li>`).join('')+'</ul>'+(revisions.length?'':'<p>Belum ada riwayat perubahan. Simpan draf untuk membuat versi pertama.</p>');
   body.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>protectedAction(async()=>{if(!await confirmAction('Pulihkan versi ini?','Draf saat ini akan diganti. Versi publik tetap seperti sebelumnya.','Pulihkan'))return;const {item}=await mutate('/api/admin/items/'+current.id+'/restore',{version:current.version,revision:b.dataset.restore});update(item);message('Versi dipulihkan sebagai draf.');}));
  }catch(e){message(e.message,true);}return;
 }
 const form=document.createElement('form');form.className='editor-form';form.onsubmit=e=>e.preventDefault();body.append(form);
 if(current.kind==='portfolio'){
  const help=document.createElement('p');help.className='field-help';help.textContent='Buka bagian yang ingin diubah. Kartu, daftar, dan gambar dapat ditambah, dipindah, atau dihapus melalui tombol di masing-masing bagian.';form.append(help);
  for(const key of Object.keys(doc))form.append(tree(doc,key,[key]));
  const support=form.querySelector('[data-path="support"]');
  if(support){const help=document.createElement('p');help.className='field-help';help.textContent='Tempel tautan halaman dukunganmu, lalu aktifkan tombol. Isi tautan Trakteer milikmu. Tanpa tautan, tombol tidak ditampilkan. Dukungan bersifat sukarela dan tidak membatasi akses materi.';support.querySelector('.group-body').prepend(help);}
 }else resourceForm(form);
}
function field(label,value,onInput,{type='text',help='',code=false}={}){
 const wrapper=document.createElement('label');wrapper.className='edit-field';const text=document.createElement('span');text.textContent=label;wrapper.append(text);
 const input=document.createElement(type==='textarea'?'textarea':type==='select'?'select':'input');
 if(type!=='textarea'&&type!=='select')input.type=type;
 if(type==='checkbox')input.checked=!!value;else input.value=value??'';
 if(code)input.classList.add('code-text');input.addEventListener('input',()=>{onInput(type==='checkbox'?input.checked:type==='number'?Number(input.value):input.value);mark();});wrapper.append(input);
 if(help){const small=document.createElement('small');small.textContent=help;wrapper.append(small);}return wrapper;
}
function pick(label,value,choices,onInput,help=''){
 const wrapper=field(label,value,onInput,{type:'select',help});const input=wrapper.querySelector('select');
 for(const [key,title] of choices){const option=document.createElement('option');option.value=key;option.textContent=title;input.append(option);}input.value=value;
 return wrapper;
}
function group(title,opened=false){const el=document.createElement('details');el.className='editor-group';el.open=opened;const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');body.className='group-body';el.append(summary,body);return [el,body];}
function smallButton(label,fn){const b=document.createElement('button');b.type='button';b.className='small-btn';b.textContent=label;b.onclick=fn;return b;}
function redrawKeepingGroups(){const open=[...document.querySelectorAll('details[data-path][open]')].map(e=>e.dataset.path);renderBody();for(const el of document.querySelectorAll('details[data-path]'))el.open=open.includes(el.dataset.path);mark();}
function imageField(label,object,key){
 const box=document.createElement('div');box.className='edit-field';box.append(field(label,object[key],v=>object[key]=v,{help:'Unggah gambar atau gunakan alamat gambar yang sudah tersedia.'}));
 const tools=document.createElement('div');tools.className='image-editor';const href=safeURL(object[key],true);
 if(href){const img=document.createElement('img');img.src=href;img.alt='Pratinjau gambar';tools.append(img);}
 const labelEl=document.createElement('label');labelEl.className='image-upload';labelEl.textContent='Unggah / ganti gambar';const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';labelEl.append(input);tools.append(labelEl);box.append(tools);
 input.onchange=()=>protectedAction(async()=>{
  const file=input.files[0];if(!file)return;if(file.size>15000000)throw new Error('Gambar sumber maksimal 15 MB.');
  const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,1400/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  let blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.82));if(blob?.size>512000)blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.55));if(!blob||blob.size>512000)throw new Error('Gambar masih terlalu besar. Pilih gambar yang lebih kecil.');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
  const result=await mutate('/api/admin/media',{mime:blob.type,data});object[key]=result.url;redrawKeepingGroups();message('Gambar diunggah. Simpan draf untuk menyimpannya pada konten ini.');
 });return box;
}
function tree(parent,key,path){
 const value=parent[key],name=labels[key]||String(key).replace(/([a-z])([A-Z])/g,'$1 $2'),pathKey=path.join('.');
 if(value&&typeof value==='object'){
  const [el,body]=group(Array.isArray(value)?`${name} (${value.length})`:name);el.dataset.path=pathKey;
  if(Array.isArray(value)){
   value.forEach((entry,index)=>{
    const wrap=document.createElement('div');wrap.className='array-entry';const head=document.createElement('div');head.className='entry-head';const title=document.createElement('span');title.textContent=`${index+1}. ${entry?.title||entry?.label||entry?.name||name}`;head.append(title);const tools=document.createElement('div');tools.className='entry-tools';
    if(index)tools.append(smallButton('↑',()=>{[value[index-1],value[index]]=[value[index],value[index-1]];redrawKeepingGroups();}));
    if(index<value.length-1)tools.append(smallButton('↓',()=>{[value[index+1],value[index]]=[value[index],value[index+1]];redrawKeepingGroups();}));
    tools.append(smallButton('Hapus',()=>{value.splice(index,1);redrawKeepingGroups();}));head.append(tools);wrap.append(head);
    if(entry&&typeof entry==='object')for(const k of Object.keys(entry))wrap.append(tree(entry,k,[...path,index,k]));
    else wrap.append(field(name,entry,v=>value[index]=v,{type:typeof entry==='number'?'number':typeof entry==='boolean'?'checkbox':String(entry).length>100?'textarea':'text'}));
    body.append(wrap);
   });
   body.append(smallButton('+ Tambah',()=>{
    let sample=value[0];if(sample===undefined){let original=items.find(i=>i.id===current.id)?.draft;for(const p of path)original=original?.[p];sample=original?.[0];}
    const blank=x=>Array.isArray(x)?[]:x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,blank(v)])):typeof x==='boolean'?false:typeof x==='number'?0:'';
    value.push(sample===undefined?'':blank(sample));redrawKeepingGroups();
   }));
  }else for(const k of Object.keys(value))body.append(tree(value,k,[...path,k]));
  return el;
 }
 if(['image','photo','src'].includes(key))return imageField(name,parent,key);
 if(key==='statusType')return pick(name,value,[['live','Terpakai'],['proto','Prototipe'],['dev','Dikembangkan'],['concept','Konsep']],v=>parent[key]=v);
 return field(name,value,v=>parent[key]=v,{type:typeof value==='boolean'?'checkbox':typeof value==='number'?'number':/text|bio|description|note|problem|solution|users|stack|ai|intro|ctx/.test(key)||String(value).length>100?'textarea':'text'});
}
function resourceForm(form){
 const d=doc;form.append(field('Judul',d.title,v=>d.title=v),field('Ringkasan',d.summary,v=>d.summary=v,{type:'textarea',help:'Ditampilkan pada kartu koleksi.'}),field('Kategori',d.category,v=>d.category=v,{help:'Contoh: Ujian offline, Gamifikasi, atau Pembelajaran.'}),imageField('Gambar sampul',d,'cover'),field('Isi / pengantar',d.body,v=>d.body=v,{type:'textarea',help:'Teks biasa, tanpa HTML. Baris baru dipertahankan.'}));
 const [links,linkBody]=group('Video dan tautan');
 linkBody.append(field('Video YouTube',d.video,v=>d.video=v,{help:'Tempel tautan YouTube. File video tidak diunggah ke website.'}));
 d.links ||= {};
 for(const [key,label] of [['download','Unduh aplikasi jadi (GitHub Releases)'],['demo','Demo / aplikasi online'],['source','Kode sumber GitHub'],['issues','Laporkan masalah'],['guide','Panduan tambahan']])linkBody.append(field(label,d.links[key],v=>d.links[key]=v,{help:'Gunakan alamat lengkap https://. Kosongkan jika belum tersedia.'}));
 form.append(links);
 if(current.kind==='project'){
  const [meta,content]=group('Informasi aplikasi',true);
  content.append(field('Versi',d.version,v=>d.version=v),field('Status kesiapan',d.readiness,v=>d.readiness=v,{help:'Tulis keadaan sebenarnya: siap pakai, prototipe, atau masih diuji.'}),field('Kebutuhan perangkat',d.requirements,v=>d.requirements=v,{type:'textarea'}),field('Lisensi',d.license,v=>d.license=v,{help:'Isi sesuai lisensi yang benar-benar ada di repository.'}));form.append(meta);
 }
 d.steps ||= [];const [steps,stepBody]=group('Langkah panduan & prompt bertahap ('+d.steps.length+')',true);steps.dataset.path='steps';
 d.steps.forEach((step,i)=>{
  const entry=document.createElement('div');entry.className='array-entry';const head=document.createElement('div');head.className='entry-head';head.innerHTML='<span>Langkah '+(i+1)+'</span>';const tools=document.createElement('div');tools.className='entry-tools';
  if(i)tools.append(smallButton('↑',()=>{[d.steps[i-1],d.steps[i]]=[d.steps[i],d.steps[i-1]];redrawKeepingGroups();}));if(i<d.steps.length-1)tools.append(smallButton('↓',()=>{[d.steps[i+1],d.steps[i]]=[d.steps[i],d.steps[i+1]];redrawKeepingGroups();}));tools.append(smallButton('Hapus',()=>{d.steps.splice(i,1);redrawKeepingGroups();}));head.append(tools);entry.append(head,field('Judul langkah',step.title,v=>step.title=v),field('Petunjuk',step.text,v=>step.text=v,{type:'textarea'}),field('Prompt siap salin (opsional)',step.prompt,v=>step.prompt=v,{type:'textarea',code:true}));stepBody.append(entry);
 });stepBody.append(smallButton('+ Tambah langkah',()=>{d.steps.push({title:'Langkah baru',text:'',prompt:''});redrawKeepingGroups();}));form.append(steps);
 const [gen,genBody]=group('Penyesuai prompt (opsional)');gen.dataset.path='generator';
 const note=document.createElement('p');note.className='field-help';note.textContent='Tambahkan isian, lalu tulis penandanya pada template. Contoh: isian berkunci topik dipakai sebagai {{topik}}. Tanpa isian, penyesuai tidak ditampilkan ke publik.';genBody.append(note);
 d.fields ||= [];
 d.fields.forEach((f,i)=>{
  const entry=document.createElement('div');entry.className='array-entry';entry.append(field('Nama isian',f.label,v=>f.label=v),field('Kunci isian',f.key,v=>f.key=v,{help:'Huruf kecil dan garis bawah, misalnya: mata_pelajaran.'}),pick('Jenis isian',f.type,[['text','Teks singkat'],['textarea','Teks panjang'],['select','Pilihan'],['number','Angka']],v=>{f.type=v;if(v==='select'&&!f.options?.length)f.options=['Pilihan pertama'];redrawKeepingGroups();}),field('Nilai awal',f.default,v=>f.default=v));
  if(f.type==='select')entry.append(field('Pilihan (satu per baris)',(f.options||[]).join('\n'),v=>f.options=v.split('\n').map(s=>s.trim()).filter(Boolean),{type:'textarea'}));
  entry.append(smallButton('Hapus isian',()=>{d.fields.splice(i,1);redrawKeepingGroups();}));genBody.append(entry);
 });genBody.append(smallButton('+ Tambah isian',()=>{let n=d.fields.length+1;while(d.fields.some(f=>f.key==='isian_'+n))n++;d.fields.push({key:'isian_'+n,label:'Isian baru',type:'text',default:'',options:[]});redrawKeepingGroups();}),field('Template hasil prompt',d.template,v=>d.template=v,{type:'textarea',code:true,help:'Kosongkan untuk memakai gabungan seluruh prompt pada langkah panduan.'}));form.append(gen);
 const [related,relatedBody]=group('Catatan terkait');
 for(const item of items.filter(x=>x.id!==current.id&&x.kind!=='portfolio'))relatedBody.append(field(titleOf(item),(d.related||[]).includes(item.id),checked=>{d.related ||= [];d.related=checked?[...new Set([...d.related,item.id])]:d.related.filter(id=>id!==item.id);},{type:'checkbox'}));form.append(related);
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
try{const session=await request('/api/session');csrf=session.csrf;await load(session.email);}catch(e){login(e.status===401?'':e.message);}
