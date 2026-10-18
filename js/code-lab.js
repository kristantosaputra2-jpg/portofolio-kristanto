(() => {
  const root=document.querySelector('#ks-journal'), snapshot=window.GITHUB_SNAPSHOT;
  const owner=snapshot.owner, maxFileBytes=256*1024;
  const sourcePattern=/\.(html?|css|m?js|jsx|tsx?|vue|svelte|py|php|java|cs)$/i;
  let repos=snapshot.repos, syncedAt=snapshot.syncedAt, selected=null, file=null, code='', request=0, lastError='', syncBusy=false;
  const cache=new Map();
  const msg=(id,en)=>document.documentElement.lang==='en'?en:id;
  const find=selector=>root.querySelector('.spread '+selector);
  const api=async path=>{
    const response=await fetch('https://api.github.com/'+path,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error(response.status===403||response.status===429?'rate':response.status===404?'missing':'network');
    return response.json();
  };
  function renderCatalog(){
    const container=find('#github-repos');if(!container)return;
    container.replaceChildren();
    for(const repo of repos){
      const card=document.createElement('button');card.className='repo-card';card.dataset.repo=repo.name;
      card.setAttribute('aria-pressed',String(selected?.name===repo.name));
      const name=document.createElement('span');name.textContent=repo.name;
      const summary=document.createElement('small');summary.textContent=repo.language+' / '+repo.files.length+' '+msg('file kode','source files');
      card.append(name,summary);container.append(card);
    }
    const status=find('#github-sync-status');
    status.textContent=lastError||msg(`Katalog ${syncedAt}: ${repos.length} repository publik berisi kode.`, `Catalog ${syncedAt}: ${repos.length} public repositories with source code.`);
    const sync=find('[data-github-sync]');sync.disabled=syncBusy;
  }
  function message(text){const status=find('#code-status');if(status)status.textContent=text;}
  function emptyEditor(){
    file=null;code='';const source=find('#code-source');if(source)source.textContent=msg('Pilih file untuk menampilkan kode.','Choose a file to display its source.');
    for(const control of ['[data-code-copy]','[data-code-preview]'])if(find(control))find(control).disabled=true;
    const link=find('#code-source-link');if(link){link.hidden=true;link.removeAttribute('href');}
  }
  function selectRepo(name){
    request++; selected=repos.find(repo=>repo.name===name);if(!selected)return;
    emptyEditor();renderCatalog();
    find('#code-repo-title').textContent=selected.name;
    const select=find('#code-file');select.replaceChildren(new Option(msg('Pilih file…','Choose a file…'),''));
    for(const item of selected.files)select.add(new Option(item.path,item.path));
    select.disabled=false;
    const notice=selected.license?msg('Lisensi: ','License: ')+selected.license:msg('Lisensi belum dinyatakan di repository. Ikuti izin pemilik sebelum menggunakan ulang.','No license is declared in this repository. Follow the owner’s permission before reuse.');
    message(notice+(selected.truncated?msg(' Daftar file mungkin belum lengkap.',' The file listing may be incomplete.'):''));
  }
  async function loadFile(path){
    const stamp=++request,repo=selected,item=repo?.files.find(f=>f.path===path);
    emptyEditor();if(!item)return;
    if(item.size>maxFileBytes){message(msg('File terlalu besar untuk pembaca ini. Buka sumber di GitHub.','This file is too large for this reader. Open the source on GitHub.'));sourceLink(repo,item);return;}
    message(msg('Mengambil kode dari GitHub…','Loading source from GitHub…'));
    try{
      let text=cache.get(item.sha);
      if(text===undefined){
        const blob=await api(`repos/${owner}/${encodeURIComponent(repo.name)}/git/blobs/${item.sha}`);
        if(blob.encoding!=='base64'||blob.size>maxFileBytes||typeof blob.content!=='string'||blob.content.length>maxFileBytes*1.5)throw new Error('large');
        const bytes=Uint8Array.from(atob(blob.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
        text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);cache.set(item.sha,text);
      }
      if(stamp!==request||!find('#code-source'))return;
      code=text;file=item;
      find('#code-source').textContent=text;
      find('[data-code-copy]').disabled=false;
      find('[data-code-preview]').disabled=!/\.(html?|css|js)$/i.test(item.path);
      sourceLink(repo,item);
      message(msg('Kode asli GitHub. ','Original GitHub source. ')+(repo.license?repo.license:msg('Lisensi belum dinyatakan.','License not declared.')));
    }catch(error){if(stamp===request){message(error.message==='rate'?msg('Batas API GitHub tercapai. Coba lagi nanti atau buka sumber langsung.','GitHub API rate limit reached. Retry later or open the source directly.'):error.message==='large'?msg('File melewati batas 256 KB. Buka di GitHub.','File exceeds 256 KB. Open it on GitHub.'):msg('Kode belum dapat dimuat. Periksa koneksi atau buka sumber di GitHub.','Source could not be loaded. Check your connection or open it on GitHub.'));sourceLink(repo,item);}}
  }
  function sourceLink(repo,item){const link=find('#code-source-link');if(!link)return;link.href=`https://github.com/${owner}/${encodeURIComponent(repo.name)}/blob/${encodeURIComponent(repo.branch)}/${item.path.split('/').map(encodeURIComponent).join('/')}`;link.hidden=false;}
  async function sync(){
    if(syncBusy)return;syncBusy=true;lastError='';renderCatalog();
    const status=find('#github-sync-status');if(status)status.textContent=msg('Memeriksa repository publik…','Checking public repositories…');
    try{
      const all=[];let page=1;
      while(true){const batch=await api(`users/${owner}/repos?type=owner&per_page=100&page=${page++}`);if(!Array.isArray(batch))throw new Error('shape');all.push(...batch);if(batch.length<100)break;}
      const next=[];
      for(const repo of all.filter(r=>r.private===false&&r.visibility==='public'&&r.owner?.login.toLowerCase()===owner.toLowerCase()&&r.size>0)){
        const tree=await api(`repos/${owner}/${encodeURIComponent(repo.name)}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`);
        if(!Array.isArray(tree.tree))throw new Error('shape');
        const files=tree.tree.filter(f=>f.type==='blob'&&sourcePattern.test(f.path)&&!/(^|\/)(node_modules|vendor|dist|build|\.git)\//.test(f.path)).map(f=>({path:f.path,sha:f.sha,size:f.size}));
        if(files.length)next.push({name:repo.name,fullName:repo.full_name,url:repo.html_url,description:repo.description||'',branch:repo.default_branch,treeSha:tree.sha,language:repo.language||'',updatedAt:repo.pushed_at,license:repo.license?.spdx_id||null,files,truncated:tree.truncated===true});
      }
      repos=next;syncedAt=new Date().toISOString().slice(0,10);lastError='';
      if(selected&&!repos.some(r=>r.name===selected.name)){selected=null;request++;emptyEditor();const select=find('#code-file');if(select){select.replaceChildren(new Option(msg('Pilih repository','Choose a repository'),''));select.disabled=true;}}
      else if(selected){selectRepo(selected.name);}
    }catch(error){lastError=error.message==='rate'?msg('Batas API GitHub tercapai. Katalog terakhir tetap ditampilkan.','GitHub API limit reached. The last catalog is still shown.'):msg('Sinkronisasi belum berhasil. Katalog terakhir tetap ditampilkan; periksa koneksi.','Sync did not complete. The last catalog is still shown; check your connection.');}
    finally{syncBusy=false;renderCatalog();}
  }
  const preview=document.createElement('dialog');preview.className='code-preview-dialog';preview.setAttribute('aria-labelledby','code-preview-title');document.body.append(preview);
  let previewOpener=null;
  function closePreview(){preview.querySelector('iframe')?.remove();preview.close();if(previewOpener?.isConnected)previewOpener.focus();}
  function showPreview(){
    if(!file)return;
    previewOpener=find('[data-code-preview]');
    preview.replaceChildren();
    const header=document.createElement('header'),title=document.createElement('strong'),close=document.createElement('button');
    title.id='code-preview-title';title.textContent=file.path;close.className='dialog-close';close.textContent=msg('Tutup ×','Close ×');close.onclick=closePreview;header.append(title,close);
    const frame=document.createElement('iframe');frame.title=msg('Preview kode terisolasi','Isolated code preview');frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';
    const policy="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'";
    // Preview is opt-in, isolated from the parent, with external resource loading restricted by CSP.
    let body=code;
    if(/\.css$/i.test(file.path))body='<style>'+code.replace(/<\/style/gi,'<\\/style')+'</style><main><h1>CSS preview</h1><p>HTML + CSS + JavaScript</p><button>Button</button><input placeholder="Input"></main>';
    if(/\.js$/i.test(file.path))body='<main><p>JavaScript preview</p></main><script>'+code.replace(/<\/script/gi,'<\\/script')+'<\/script>';
    frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
    const note=document.createElement('p');note.textContent=msg('Preview hanya file ini. Aset/API/import dibatasi; form dan akses ke halaman induk diblokir.','This file only. Assets/APIs/imports are restricted; forms and parent-page access are blocked.');
    preview.append(header,frame,note);preview.showModal();
  }
  preview.addEventListener('cancel',event=>{event.preventDefault();closePreview();});
  async function copyCode(){
    if(!file)return;
    try{
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(code);
      else{const area=document.createElement('textarea');area.value=code;area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();find('[data-code-copy]')?.focus();if(!ok)throw new Error('copy');}
      message(msg('Kode disalin.','Code copied.'));
    }catch{const node=find('#code-source');const selection=getSelection(),range=document.createRange();range.selectNodeContents(node);selection.removeAllRanges();selection.addRange(range);message(msg('Kode dipilih. Tekan Ctrl+C atau gunakan menu Salin.','Code selected. Press Ctrl+C or use Copy from the menu.'));}
  }
  root.addEventListener('click',event=>{
    const repo=event.target.closest('[data-repo]');if(repo)selectRepo(repo.dataset.repo);
    if(event.target.closest('[data-github-sync]'))sync();
    if(event.target.closest('[data-code-copy]'))copyCode();
    if(event.target.closest('[data-code-preview]'))showPreview();
  });
  root.addEventListener('change',event=>{if(event.target.id==='code-file')loadFile(event.target.value);});
  root.addEventListener('ks-pagechange',event=>{request++;if(event.detail==='code'){renderCatalog();if(selected)selectRepo(selected.name);}});
})();
