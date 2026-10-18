(() => {
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
    book:'<path d="M4 3h14a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2zm0 14h16M8 3v14m3-9h5"/>',
    person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
    lab:'<path d="M9 3h6m-5 0v6L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M7 14h10"/>',
    play:'<path d="m9 5 11 7-11 7z"/>',
    pause:'<path d="M8 5v14M16 5v14"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    sync:'<path d="M20 8a9 9 0 0 0-15-3L2 8m0-6v6h6M4 16a9 9 0 0 0 15 3l3-3m0 6v-6h-6"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    lynk:'<path d="m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
    whatsapp:'<path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.4-5A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1a8 8 0 0 0 4 4l1-1 3 2c-1 3-4 2-7 0s-5-5-3-8z"/>',
    social:'<path d="M14 21v-8h3l.5-4H14V7c0-1 1-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
    tiktok:'<path d="M14 3v12a5 5 0 1 1-5-5v4a2 2 0 1 0 2 2V3h3c0 4 3 6 6 6V6c-3 0-5-2-5-3"/>',
    github:'<path d="M9 20c-5 1-5-3-7-3m14 5v-4c0-1-.3-2-1-2 4-.5 6-2 6-6 0-1-.5-3-1-4 0-1 0-3-.5-4-2 0-3 1-4 2a13 13 0 0 0-7 0C7 3 5 2 4 2c-.5 1-.5 3 0 4-1 1-1 3-1 4 0 4 2 6 6 6-.5.5-1 1-1 2v4"/>',
    spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>'
  };
  const icon = key => `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] || paths.code}</svg>`;
  window.STUDIO_UI = {
    icon,
    hero({data,t,esc,say,button,p}) {
      const socialLinks = [['whatsapp','WhatsApp'],['social','Facebook'],['tiktok','TikTok'],['lynk','Lynk.id']].map(([key,name]) => `<a class="console-social" href="${esc(data.contact[key])}" target="_blank" rel="noopener noreferrer" aria-label="${name}" title="${name}">${icon(key)}</a>`).join('');
      return `<div class="portrait-console">
        <div class="console-topline"><span>Mr. K / Personal Digital Studio</span><span class="console-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
        <div class="console-sculpture" aria-hidden="true"></div>
        <div class="console-identity"><span class="hand-note">${say('Halo, saya', 'Hello, I’m')}</span><h1>Kristanto<br>Saputra<span class="name-period">.</span></h1><p class="console-role">${esc(t(data.role))}</p>${p(data.narrative)}<div class="console-cta">${button('work','Jelajahi karya','Explore work')}${button('contact','Mari berkolaborasi','Let’s collaborate','text-button')}</div></div>
        <div class="console-profile"><div class="console-avatar"><img src="${esc(data.media.formalPortrait)}" alt="${say('Portrait formal Kristanto Saputra, latar dihapus','Formal portrait of Kristanto Saputra, background removed')}" width="80" height="80"></div><div class="console-socials">${socialLinks}</div><span class="hand-note">${say('Temui saya', 'Find me here')}</span></div>
        <div class="portrait-layer"><img class="editorial-portrait" src="${esc(data.media.editorialPortrait)}" data-original="${esc(data.media.portrait)}" data-editorial="${esc(data.media.editorialPortrait)}" alt="${say('Portrait editorial Kristanto Saputra, diolah dengan AI dari foto asli', 'Editorial portrait of Kristanto Saputra, AI-edited from the original photograph')}" width="1024" height="1536" fetchpriority="high"></div>
        <div class="portrait-caption"><span class="portrait-chip">${say('Pendidik & pembuat karya', 'Educator & maker')}</span><button data-portrait-toggle aria-pressed="false" title="${say('Bandingkan foto asli dan olahan AI', 'Compare the original and AI-edited portrait')}">${say('Lihat foto asli', 'View original photo')}</button></div>
        <nav class="console-dock" aria-label="${say('Jelajahi studio', 'Explore the studio')}">${[['home','person','Tentang','About'],['work','book','Karya','Works'],['code','code','Code Lab','Code Lab'],['learning','lab','Education Lab','Education Lab']].map(([page,key,id,en])=>`<button data-page="${page}" aria-label="${say(id,en)}" title="${say(id,en)}">${icon(key)}</button>`).join('')}<span class="dock-rule"></span><button data-motion-toggle aria-pressed="false" aria-label="${say('Jeda motion', 'Pause motion')}" title="${say('Jeda motion', 'Pause motion')}">${icon('pause')}</button></nav>
        <div class="console-code-panel"><div class="code-panel-heading">${icon('code')}<span>Code Lab</span><span class="code-panel-led" aria-hidden="true"></span></div><div class="code-languages"><span>HTML</span><span>CSS</span><span>JS</span></div><p>${say('Dari repository, untuk dipelajari.', 'From the repository, ready to explore.')}</p><button class="console-code-open" data-page="code">${say('Buka kode', 'Explore code')}${icon('arrow')}</button><svg class="circuit-trace" viewBox="0 0 270 40" aria-hidden="true"><path d="M0 30H70L90 10H170L190 30H270"/></svg></div>
        <button class="journal-launch" data-page="home"><img src="assets/images/dashboard-cover.webp" width="180" height="135" alt="${say('Binder tertutup Kristanto Saputra', 'Kristanto Saputra’s closed binder')}"><span>${icon('book')}${say('Buka jurnal saya', 'Open my journal')}</span></button>
        <div class="console-bottomline"><span>${say('Pendidikan. Teknologi. Persoalan nyata.', 'Education. Technology. Real problems.')}</span><span class="hand-note">${say('Mari membuat sesuatu yang berguna.', 'Let’s make something useful.')}</span></div>
      </div>`;
    }
  };
  const root = document.querySelector('#ks-journal');
  let frame = 0, motionPaused = false;
  function paintMotion(){const toggle=root.querySelector('[data-motion-toggle]');if(!toggle)return;const en=document.documentElement.lang==='en',label=motionPaused?(en?'Resume motion':'Lanjutkan motion'):(en?'Pause motion':'Jeda motion');toggle.setAttribute('aria-pressed',String(motionPaused));toggle.setAttribute('aria-label',label);toggle.title=label;toggle.innerHTML=icon(motionPaused?'play':'pause');}
  root.addEventListener('ks-pagechange',paintMotion);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), pointer = matchMedia('(hover: hover) and (pointer: fine)');
  root.addEventListener('pointermove', event => {
    const hero = event.target.closest('.portrait-console');
    if (!hero || reduced.matches || !pointer.matches || motionPaused || frame) return;
    frame = requestAnimationFrame(() => { const r=hero.getBoundingClientRect();hero.style.setProperty('--look-x',((event.clientX-r.left)/r.width-.5)*8+'px');hero.style.setProperty('--look-y',((event.clientY-r.top)/r.height-.5)*5+'px');frame=0; });
  });
  root.addEventListener('pointerleave',()=>{root.querySelector('.portrait-console')?.style.removeProperty('--look-x');root.querySelector('.portrait-console')?.style.removeProperty('--look-y')});
  root.addEventListener('click', event => {
    const en=document.documentElement.lang==='en';
    const compare=event.target.closest('[data-portrait-toggle]');
    if(compare){const image=root.querySelector('.editorial-portrait'),original=compare.getAttribute('aria-pressed')!=='true';image.src=original?image.dataset.original:image.dataset.editorial;image.alt=original?'Kristanto Saputra':en?'AI-edited editorial portrait of Kristanto Saputra':'Portrait editorial Kristanto Saputra, diolah dengan AI';compare.setAttribute('aria-pressed',String(original));compare.textContent=original?(en?'View editorial portrait':'Lihat portrait editorial'):(en?'View original photo':'Lihat foto asli');}
    const toggle=event.target.closest('[data-motion-toggle]');
    if(toggle){motionPaused=!motionPaused;root.classList.toggle('motion-paused',motionPaused);paintMotion();}
  });
})();
