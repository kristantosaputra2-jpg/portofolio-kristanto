import {esc,safeURL,videoID,request,copy,fillPrompt} from './cms-common.js';
import {mountSupport} from './support.js';
const root=document.getElementById('library'), names={project:'Proyek terbuka',tutorial:'Tutorial',prompt:'Prompt'};
let items=[],filter='all',search='',category='';
const query=new URLSearchParams(location.search), preview=query.get('preview');
const linkFor=item=>'/berbagi.html?baca='+encodeURIComponent(item.slug);
function card(item) {
 const d=item.content,cover=safeURL(d.cover,true);
 return `<article class="resource-card">${cover?`<img src="${esc(cover)}" alt="${esc(d.title)}" loading="lazy">`:''}<span class="resource-type">${names[item.kind]}</span><h2><a href="${linkFor(item)}">${esc(d.title)}</a></h2><p>${esc(d.summary)}</p>${d.category?`<span class="category">${esc(d.category)}</span>`:''}<a class="resource-open" href="${linkFor(item)}">${item.kind==='project'?'Lihat aplikasi & panduan':'Buka catatan'} ↗</a></article>`;
}
function listing() {
 root.innerHTML=`<div class="library-hero"><span class="share-note">Catatan yang bisa dibawa pulang.</span><h1>Belajar, mencoba,<br>berbagi.</h1><p>Tutorial dari praktik, prompt untuk dikembangkan, dan akses proyek terbuka. Pilih yang kamu perlukan.</p></div><div class="library-filters" role="group" aria-label="Jenis konten">${[['all','Semua'],...Object.entries(names)].map(([k,v])=>`<button data-filter="${k}" aria-pressed="${filter===k}">${v}</button>`).join('')}</div><div class="library-tools"><label>Cari catatan<input id="resource-search" type="search" placeholder="Judul, topik, atau kebutuhan…" value="${esc(search)}"></label><label>Kategori<select id="resource-category"><option value="">Semua kategori</option>${[...new Set(items.map(i=>i.content.category).filter(Boolean))].sort().map(c=>`<option${c===category?' selected':''}>${esc(c)}</option>`).join('')}</select></label></div><p id="resource-count" class="resource-count" aria-live="polite"></p><div class="library-grid" id="resource-grid"></div>`;
 function draw() {
  const selected=items.filter(i=>(filter==='all'||i.kind===filter)&&(!category||i.content.category===category)&&[i.content.title,i.content.summary,i.content.category].join(' ').toLowerCase().includes(search.toLowerCase()));
  document.getElementById('resource-count').textContent=selected.length+' catatan';
  document.getElementById('resource-grid').innerHTML=selected.length?selected.map(card).join(''):'<div class="empty-state"><h2>Belum ada catatan yang cocok.</h2><p>Coba kata lain atau pilih semua kategori.</p></div>';
 }
 root.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;root.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();});
 document.getElementById('resource-search').oninput=e=>{search=e.target.value;draw();};document.getElementById('resource-category').onchange=e=>{category=e.target.value;draw();};draw();
}
function detail(item) {
 const d=item.content,cover=safeURL(d.cover,true),vid=videoID(d.video);
 document.title=d.title+' — Berbagi Mr.K';
 const actions=[['download',item.kind==='project'?'Unduh aplikasi':'Unduh HTML contoh'],['demo','Buka demo'],['guide','Panduan tambahan'],['source','Kode sumber GitHub'],['issues','Laporkan masalah']].filter(([key])=>safeURL(d.links?.[key]));
 root.innerHTML=`${preview?'<div class="notice" role="status">Pratinjau draf privat — belum diterbitkan. <a href="/admin.html">Kembali ke dashboard</a></div>':''}<a class="back-link" href="/berbagi.html">← Semua catatan</a><article class="resource-detail"><span class="resource-type">${names[item.kind]}${d.category?' · '+esc(d.category):''}</span><h1>${esc(d.title)}</h1><p class="lede">${esc(d.summary)}</p>${cover?`<img class="detail-cover" src="${esc(cover)}" alt="${esc(d.title)}">`:''}<div class="detail-meta">${[d.version?'Versi '+d.version:'',d.readiness,d.license?'Lisensi: '+d.license:''].filter(Boolean).map(v=>`<span>${esc(v)}</span>`).join('')}</div>${d.requirements?`<h2>Kebutuhan perangkat</h2><p class="prose">${esc(d.requirements)}</p>`:''}<div class="detail-actions">${actions.map(([key,label],i)=>`<a class="${i?'secondary':''}" href="${esc(safeURL(d.links[key]))}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</div>${d.body?`<div class="prose">${esc(d.body)}</div>`:''}${vid?`<h2>Video panduan</h2><div class="video-box" id="video-box"><button id="play-video">▶ Putar tutorial YouTube</button></div><p><a class="back-link" href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener noreferrer">Buka di YouTube ↗</a></p>`:''}<div id="detail-steps"></div>${d.fields?.length?'<div id="generator"></div>':''}<div id="related"></div></article>`;
 const steps=document.getElementById('detail-steps');
 (d.steps||[]).forEach((s,i)=>{
  const section=document.createElement('section');section.innerHTML=`<h2>${i+1}. ${esc(s.title)}</h2><p class="prose">${esc(s.text)}</p>${s.prompt?`<div class="prompt-block"><h3>Prompt siap salin</h3><pre>${esc(s.prompt)}</pre><button type="button">Salin prompt</button></div>`:''}`;
  section.querySelector('button')?.addEventListener('click',e=>copy(s.prompt,e.currentTarget));steps.append(section);
 });
 if(vid) document.getElementById('play-video').onclick=()=>{
  const iframe=document.createElement('iframe');iframe.title='Video panduan '+d.title;iframe.src='https://www.youtube-nocookie.com/embed/'+vid+'?autoplay=1';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;document.getElementById('video-box').replaceChildren(iframe);
 };
 if(d.fields?.length) generator(d);
 const related=items.filter(x=>x.id!==item.id&&(d.related||[]).includes(x.id));
 if(related.length) document.getElementById('related').innerHTML='<h2>Catatan terkait</h2><div class="related-list">'+related.map(x=>`<a href="${linkFor(x)}">${esc(x.content.title)} ↗</a>`).join('')+'</div>';
}
function generator(d) {
 const box=document.getElementById('generator');box.className='generator';
 box.innerHTML='<details><summary>Sesuaikan prompt ini</summary><p>Isi kebutuhanmu. Hasilnya dirangkai dari template; salin ke AI pilihanmu.</p><form></form><label for="prompt-result">Hasil prompt</label><textarea id="prompt-result" class="generator-output" readonly></textarea><button type="button" class="action-btn" id="copy-generated">Salin hasil prompt</button><p id="generator-note" role="status"></p></details>';
 const form=box.querySelector('form'), values={};
 for(const field of d.fields) {
  const label=document.createElement('label');label.textContent=field.label;
  const input=document.createElement(field.type==='select'?'select':field.type==='textarea'?'textarea':'input');
  if(field.type==='select') for(const option of field.options){const el=document.createElement('option');el.value=option;el.textContent=option;input.append(el);}
  else if(field.type!=='textarea') input.type=field.type==='number'?'number':'text';
  input.name=field.key;input.maxLength=500;input.value=field.default|| (field.type==='select'?field.options[0]:'');values[field.key]=input.value;
  input.oninput=()=>{values[field.key]=input.value;draw();};label.append(input);form.append(label);
 }
 form.onsubmit=e=>e.preventDefault();
 function draw(){const template=d.template||(d.steps||[]).map(s=>s.prompt).filter(Boolean).join('\n\n');const result=fillPrompt(template,values);box.querySelector('textarea.generator-output').value=result;document.getElementById('generator-note').textContent=/\{\{[a-z][a-z0-9_]*\}\}/.test(result)?'Ada bagian template yang belum memiliki isian. Kamu bisa menyesuaikannya setelah menyalin.':'';}
 document.getElementById('copy-generated').onclick=e=>copy(box.querySelector('textarea.generator-output').value,e.currentTarget);draw();
}
try {
 const data=await request('/api/public');items=data.items.filter(i=>i.kind!=='portfolio');
 mountSupport(data.items.find(i=>i.kind==='portfolio')?.content.support,document.querySelector('.share-footer'));
 if(preview){const data=await request('/api/admin/items/'+encodeURIComponent(preview));detail({...data.item,content:data.item.draft});}
 else if(query.get('baca')){const selected=items.find(x=>x.slug===query.get('baca'));if(selected) detail(selected);else root.innerHTML='<div class="empty-state"><h1>Catatan tidak ditemukan.</h1><p>Konten mungkin sudah tidak diterbitkan.</p><a class="back-link" href="/berbagi.html">Kembali ke koleksi</a></div>';}
 else listing();
} catch(e){root.innerHTML=`<div class="empty-state"><h1>${preview?'Pratinjau belum dapat dibuka':'Koleksi belum dapat dimuat'}</h1><p>${esc(e.message)}</p><p>Untuk paket ZIP, jalankan Mulai-Portofolio.cmd, lalu buka alamat lokal yang ditampilkan.</p><a class="back-link" href="${preview?'/admin.html':'/'}">${preview?'Masuk dashboard':'Kembali ke portofolio'}</a></div>`;}
