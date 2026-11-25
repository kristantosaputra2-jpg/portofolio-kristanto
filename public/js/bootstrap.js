import {mountSupport} from './support.js';
(async()=>{
 if(location.hash==='#admin') { location.replace('/admin.html');return; }
 document.addEventListener('folio:admin',()=>location.assign('/admin.html'));
 window.addEventListener('hashchange',()=>{if(location.hash==='#admin') location.assign('/admin.html');});
 const preview=new URLSearchParams(location.search).get('preview');
 try {
  const response=await fetch(preview==='portfolio'?'/api/admin/items/portfolio':'/api/public',{credentials:'same-origin',cache:'no-store'});
  if(!response.ok) throw new Error('Konten online belum tersedia');
  const result=await response.json();
  const data=preview==='portfolio'?result.item.draft:result.items.find(x=>x.kind==='portfolio')?.content;
  if(data) window.SITE=data;
  if(preview==='portfolio') { const b=document.createElement('div'); b.className='preview-banner';b.textContent='Pratinjau draf privat — belum diterbitkan'; document.body.prepend(b); }
 } catch {
  if(preview) { document.body.classList.remove('loading');document.getElementById('app').textContent='Pratinjau privat memerlukan login admin dan server aktif.';return; }
 }
 const s=document.createElement('script');s.src='js/main.js';s.onload=()=>{
  const menu=document.getElementById('menu');if(menu){const link=document.createElement('a');link.href='/berbagi.html';link.textContent='Berbagi';menu.append(link);}
  const footer=document.querySelector('#footer nav');if(footer){const link=document.createElement('a');link.href='/berbagi.html';link.textContent='Berbagi';footer.append(link);}
  if(footer){const admin=document.createElement('a');admin.href='/admin';admin.textContent='Admin';admin.setAttribute('aria-label','Login Admin');footer.append(admin);}
  const contact=document.getElementById('contact');
  if(contact){const section=document.createElement('section');section.className='share-intro wrap';section.innerHTML='<span class="share-note">Dari meja kerja, untuk dipakai bersama.</span><h2>Belajar, mencoba, berbagi.</h2><p>Tutorial, prompt yang bisa disesuaikan, dan akses proyek terbuka.</p><a class="btn" href="/berbagi.html">Jelajahi Berbagi ↗</a>';contact.before(section);}
  mountSupport(window.SITE.support,document.getElementById('footer'));
 };s.onerror=()=>{document.body.classList.remove('loading');document.getElementById('app').textContent='File tampilan tidak dapat dimuat.';};document.body.append(s);
})();
