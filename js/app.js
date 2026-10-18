(()=>{
 const root=document.getElementById('ks-journal'),stage=root.querySelector('.stage'),spread=root.querySelector('.spread'),a=root.querySelector('.sheet-a'),b=root.querySelector('.sheet-b');
 const order=['dashboard','home','work','code','talk','learning','contact','store'],names=window.STUDIO_NAMES;let current='dashboard',timer=0,finish=0,token=0;
 const cms=window.PORTFOLIO_VALUES||{};
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function sheet(el,x,y,w,h){el.style.setProperty('--left',x+'px');el.style.setProperty('--top',y+'px');el.style.setProperty('--sw',w+'px');el.style.setProperty('--sh',h+'px')}
 function layout(){const width=stage.clientWidth,mobile=width<600,work=current==='work',dashboard=current==='dashboard';root.classList.toggle('is-work',work);root.classList.toggle('is-dashboard',dashboard);root.classList.toggle('is-code',current==='code');let bw,bh;
  if(dashboard){
    bw=width;
    bh=bw*.75;
    stage.style.height=bh+'px';
    root.style.setProperty('--bw',bw+'px');
    root.style.setProperty('--bh',bh+'px');
    sheet(a,0,0,0,0);
    sheet(b,0,0,0,0);
  }else if(work){
    /* Setelah binder diputar 90°, tinggi aslinya menjadi lebar visual.
       1.82 x lebar stage menghasilkan binder portrait sekitar 94% lebar area,
       jadi tidak lagi tampak diperkecil. */
    bw=width*1.82;
    bh=bw*.515;
    stage.style.height=bw+'px';
    root.style.setProperty('--bw',bw+'px');
    root.style.setProperty('--bh',bh+'px');
    const sw=bh*.80;
    const sx=(width-sw)/2;
    sheet(a,sx,bw*.075,sw,bw*.385);
    sheet(b,sx,bw*.515,sw,bw*.385);
  }else if(mobile){
    bw=width;bh=820;
    stage.style.height=bh+'px';
    root.style.setProperty('--bw',bw+'px');
    root.style.setProperty('--bh',bh+'px');
    sheet(a,width*.14,35,width*.72,340);
    sheet(b,width*.14,405,width*.72,350);
  }else{
    bw=width;bh=bw*.515;
    stage.style.height=bh+'px';
    root.style.setProperty('--bw',bw+'px');
    root.style.setProperty('--bh',bh+'px');
    sheet(a,width*.095,bh*.05,width*.34,bh*.9);
    sheet(b,width*.505,bh*.05,width*.345,bh*.9);
  }
 }
 function paint(){a.replaceChildren(root.querySelector('#ks-'+current+'-a').content.cloneNode(true));b.replaceChildren(root.querySelector('#ks-'+current+'-b').content.cloneNode(true));const i=order.indexOf(current);root.querySelector('#ks-position').textContent=String(i+1).padStart(2,'0')+' / '+names[i];root.querySelector('#ks-next').textContent=names[(i+1)%order.length]+' →';root.querySelectorAll('header > nav [data-page]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.page===current)))}
 const photos={...{"profile-0": "assets/images/asset-3efa55912d60.webp", "profile-1": "assets/images/asset-081cc36cc8a5.webp", "profile-2": "assets/images/asset-af245e29e6cd.webp", "film-0": "assets/images/asset-567ae60138e5.webp", "film-1": "assets/images/asset-8a42bb9e1565.webp", "film-2": "assets/images/asset-eff95d69a1c5.webp", "store-0": "assets/images/asset-3efa55912d60.webp", "store-1": "assets/images/asset-081cc36cc8a5.webp"}},links={whatsapp:'https://wa.me/6282211229579',social:'https://www.facebook.com/share/1CpNwSedoo/',youtube:'',tiktok:'https://www.tiktok.com/@kris_spt?_r=1&_t=ZS-99qbvmblxZM',lynk:'https://lynk.id/kris1495',product0:'',product1:''};
 for(const key of Object.keys(photos))if(cms['photo-'+key])photos[key]=PortfolioBackend.safeUrl(cms['photo-'+key])||photos[key];
 for(const key of Object.keys(links))if(typeof cms['link-'+key]==='string')links[key]=PortfolioBackend.safeUrl(cms['link-'+key]);
 function hydrate(){window.portfolioCMS?.apply(root);spread.querySelectorAll('[data-photo]').forEach(el=>el.src=photos[el.dataset.photo]);spread.querySelectorAll('[data-contact]').forEach(el=>{const href=links[el.dataset.contact];el.hidden=el.dataset.contact==='youtube'&&!href;if(href){el.href=href;el.target='_blank';el.rel='noopener noreferrer';el.removeAttribute('aria-disabled')}else{el.removeAttribute('href');el.setAttribute('aria-disabled','true')}const small=el.querySelector('small');if(small)small.textContent=href?(el.dataset.contact==='whatsapp'?href.split('/').pop():new URL(href).pathname.replace(/^\//,'')||'Buka profil ↗'):'Belum diisi'})}
 let busy=false,pending=null,leaf=null,leafAnimation=null;
 function applyPage(page){
  current=page;
  layout();
  paint();
  hydrate();
  if(page==='work'){const p=projects.kelas;['title','copy','note'].forEach((key,i)=>b.querySelector('#ks-project-'+key).textContent=p[i])}
  root.dispatchEvent(new CustomEvent('ks-pagechange',{detail:page}));
 }
 async function show(page){
  if(!order.includes(page))return;
  if(busy){pending=page;return}
  if(page===current)return;

  busy=true;
  pending=null;

  const previous=current;
  const dashboardTransition=previous==='dashboard'||page==='dashboard';
  const rotating=(page==='work')!==(previous==='work');

  try{
   if(reduce.matches){
    spread.classList.remove('concealed');
    spread.inert=false;
    applyPage(page);
   }
   else if(dashboardTransition){
    /* Dashboard bukan halaman binder biasa.
       Jangan gunakan turn-leaf karena saat Dashboard aktif sheet memang disembunyikan. */
    spread.classList.add('concealed');
    spread.inert=true;

    await new Promise(resolve=>setTimeout(resolve,180));
    applyPage(page);

    /* Tunggu satu frame agar class is-dashboard / is-work benar-benar terpasang
       sebelum elemen ditampilkan kembali. */
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

    spread.classList.remove('concealed');
    spread.inert=false;
   }
   else if(rotating){
    /* Masuk/keluar Karya: tetap gunakan transisi rotate binder. */
    spread.classList.add('concealed');
    spread.inert=true;

    await new Promise(resolve=>setTimeout(resolve,180));
    applyPage(page);

    await new Promise(resolve=>setTimeout(resolve,840));
    spread.classList.remove('concealed');
    spread.inert=false;
   }
   else{
    /* Page-turn hanya untuk halaman binder normal. */
    const forward=order.indexOf(page)>order.indexOf(previous);
    const source=forward?b:a;
    const sourceRect=source.getBoundingClientRect();
    const stageRect=stage.getBoundingClientRect();

    leaf=document.createElement('div');
    leaf.className='turn-leaf';
    leaf.style.cssText=`left:${sourceRect.left-stageRect.left}px;top:${sourceRect.top-stageRect.top}px;width:${sourceRect.width}px;height:${sourceRect.height}px;transform-origin:${forward?'left':'right'} center`;

    const front=document.createElement('div');
    front.className='leaf-face';
    front.append(...Array.from(source.childNodes).map(n=>n.cloneNode(true)));
    front.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));

    const back=document.createElement('div');
    back.className='leaf-face leaf-back';

    leaf.append(front,back);
    stage.append(leaf);

    applyPage(page);

    const destination=forward?a:b;
    back.append(...Array.from(destination.childNodes).map(n=>n.cloneNode(true)));
    back.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));

    spread.inert=true;
    leafAnimation=leaf.animate(
     [
      {transform:'rotateY(0deg)',filter:'brightness(1)'},
      {transform:`rotateY(${forward?-85:85}deg)`,filter:'brightness(.87)',offset:.5},
      {transform:`rotateY(${forward?-180:180}deg)`,filter:'brightness(1)'}
     ],
     {duration:760,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}
    );

    try{await leafAnimation.finished}catch{}

    leaf.remove();
    leaf=null;
    leafAnimation=null;
    spread.inert=false;
   }
  }finally{
   /* Pastikan state visual tidak pernah tertinggal walaupun animasi terputus. */
   layout();
   spread.classList.remove('concealed');
   spread.inert=false;

   if(leaf){
    leaf.remove();
    leaf=null;
   }
   leafAnimation=null;

   busy=false;

   root.dispatchEvent(new CustomEvent('ks-navigation-end',{detail:current}));
   const next=pending;
   pending=null;
   if(next&&next!==current)show(next);
  }
 }
 function safeLink(value,key){if(!value.trim())return '';if(key==='whatsapp'){let number=value.replace(/[^0-9]/g,'');if(number.startsWith('0'))number='62'+number.slice(1);return /^\d{8,15}$/.test(number)?'https://wa.me/'+number:null}try{const url=new URL(value);if(url.protocol!=='https:')return null;if(['lynk','product0','product1'].includes(key)&&!['lynk.id','www.lynk.id'].includes(url.hostname))return null;return url.href}catch{return null}}
 root.addEventListener('click',event=>{const contact=event.target.closest('[data-contact]');if(contact&&!links[contact.dataset.contact]){event.preventDefault();contact.setAttribute('aria-disabled','true')}const card=event.target.closest('[data-store]');if(card){const href=links['product'+card.dataset.store]||links.lynk;if(href){const anchor=document.createElement('a');anchor.href=href;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.click()}else{const notice=root.querySelector('#store-notice');if(notice)notice.textContent='Isi tautan Lynk.id atau produk di pengaturan pratinjau.'}}});

 const projects={kelas:['KelasKu','Aplikasi untuk membantu administrasi guru dan kegiatan pembelajaran: data siswa, absensi QR, nilai, jurnal mengajar, serta tugas.','Berangkat dari kebutuhan pekerjaan guru sehari-hari. Dikembangkan dengan bantuan AI.'],rapot:['RapotKu','Aplikasi pengolahan nilai, rekap dan leger, serta pratinjau dan pencetakan rapor.','Proyek terpisah dari KelasKu, dengan fokus pada penyusunan rapor yang lebih praktis bagi guru.'],wonder:['Wonderplay','Salah satu karya pendidikan yang akan ditampilkan dalam portofolio.','Deskripsi fitur, gambar aplikasi, dan tahap pengembangan masih menunggu konfirmasi.'],tour:['Step by Steph Tour','Website tur yang sedang saya garap sebagai eksplorasi pengembangan web di luar pendidikan.','Status: dalam pengembangan.']};
 for(const [key,item] of Object.entries(window.STUDIO_CONTENT.projects))projects[key]=[item.title,cms[`project-${key}-1`],cms[`project-${key}-2`]];
 for(const [key,items] of Object.entries(projects))items.forEach((v,i)=>{if(typeof cms[`project-${key}-${i}`]==='string')items[i]=cms[`project-${key}-${i}`]});
 root.addEventListener('click',event=>{const target=event.target.closest('button');if(!target)return;if(target.dataset.page)show(target.dataset.page);if(target.dataset.filter){a.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===target)));a.querySelectorAll('[data-kind]').forEach(el=>el.hidden=target.dataset.filter!=='all'&&el.dataset.kind!==target.dataset.filter)}if(target.dataset.project){const p=projects[target.dataset.project];b.querySelector('#ks-project-title').textContent=p[0];b.querySelector('#ks-project-copy').textContent=p[1];b.querySelector('#ks-project-note').textContent=p[2]}});
 root.querySelector('#ks-next').addEventListener('click',()=>show(order[(order.indexOf(current)+1)%order.length]));root.querySelector('#ks-prev').addEventListener('click',()=>show(order[(order.indexOf(current)+order.length-1)%order.length]));let resizeFrame=0;
 const scheduleLayout=()=>{if(resizeFrame)return;resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;layout()})};
 root.addEventListener('ks-refresh',()=>{for(const [key,items] of Object.entries(projects))items.forEach((v,i)=>{items[i]=cms[`project-${key}-${i}`]||v});paint();hydrate();layout();if(current==='work'){const p=projects.kelas;['title','copy','note'].forEach((key,i)=>b.querySelector('#ks-project-'+key).textContent=p[i])}root.dispatchEvent(new CustomEvent('ks-pagechange',{detail:current}))});
 new ResizeObserver(scheduleLayout).observe(root);
 paint();hydrate();layout();
})();
