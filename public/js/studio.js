(() => {
  const data = window.STUDIO_CONTENT, root = document.querySelector('#ks-journal');
  const pages = ['dashboard', 'home', 'work', 'code', 'talk', 'learning', 'contact', 'store'];
  let locale = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'id';
  let current = 'dashboard', selected = 'kelas', dialogOpener = null;
  const t = pair => Array.isArray(pair) ? pair[locale === 'en' ? 1 : 0] : pair;
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const say = (id, en) => esc(t([id, en]));
  const p = pair => `<p>${esc(t(pair))}</p>`;
  const img = (key, alt, cls = '') => `<img class="${cls}" src="${esc(data.media[key])}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  const button = (page, id, en, cls = 'studio-button') => `<button class="${cls}" data-page="${page}">${say(id, en)}</button>`;
  // All editable URLs are validated before becoming a navigation destination.
  function safeURL(value, email = false) {
    try { const u = new URL(value); return (u.protocol === 'https:' || (email && u.protocol === 'mailto:')) ? u.href : ''; } catch { return ''; }
  }
  window.PORTFOLIO_VALUES = {};
  window.STUDIO_NAMES = [];
  window.portfolioCMS = {apply() {}};
  const stage = root.querySelector('.stage');
  stage.tabIndex = -1;
  const layout = document.createElement('main'); layout.className = 'journal-layout';
  layout.id = 'main-content'; layout.tabIndex = -1;
  stage.before(layout);
  const intro = document.createElement('section'); intro.className = 'dashboard-intro';
  layout.append(intro, stage);
  const homeSections = document.createElement('div'); homeSections.className = 'home-sections'; layout.append(homeSections);
  const language = document.createElement('div'); language.className = 'language-switch';
  root.querySelector('header').append(language);
  const dialog = document.createElement('dialog'); dialog.className = 'case-dialog';
  dialog.setAttribute('aria-labelledby', 'case-title'); document.body.append(dialog);
  const missing = ['Dokumentasi belum tersedia. Akan dilengkapi setelah verifikasi.', 'Documentation is not yet available. To be added after verification.'];

  function contactLink(kind, id, en, message) {
    const raw = kind === 'email' && data.contact.email ? `mailto:${data.contact.email}` : data.contact[kind];
    let href = safeURL(raw, kind === 'email');
    if (!href) return `<p class="content-note">${say('Alamat email belum tersedia.', 'Email address is not yet available.')}</p>`;
    if (message) { const url = new URL(href); url.searchParams.set('text', t(message)); href = url.href; }
    const social = ['social','tiktok','lynk'].includes(kind), label = say(id,en);
    return `<a class="${social ? 'social-icon-link' : 'studio-button'}" href="${esc(href)}" aria-label="${label}" title="${label}" ${kind === 'email' ? '' : 'target="_blank" rel="noopener noreferrer"'}>${window.STUDIO_UI.icon(kind)}<span class="${social ? 'sr-only' : ''}">${label}</span></a>`;
  }
  function projectCards() {
    return Object.entries(data.projects).map(([key, item]) => `<button class="project" data-project="${key}" data-kind="${item.category}" aria-pressed="${key === selected}"><span class="cover">${esc(item.title)}</span><small>${esc(t(item.description))}</small><span class="project-status">${esc(t(item.status))}</span></button>`).join('');
  }
  function screenshotCards() {
    return data.screenshots.map(s => `<figure class="evidence-card">${img(s.key, s.title)}<figcaption><strong>${esc(s.title)}</strong>${p(s.text)}</figcaption></figure>`).join('');
  }
  function template(page, side, content) { root.querySelector(`#ks-${page}-${side}`).innerHTML = content; }
  function updateTemplates() {
    const values = window.PORTFOLIO_VALUES;
    Object.entries(data.projects).forEach(([key, item]) => [item.title, t(item.description), t(item.context || missing)].forEach((value, i) => values[`project-${key}-${i}`] = value));
    template('code', 'a', `<div class="section-label">GitHub / Code Lab</div><h1>${say('Buka karya. Pelajari kodenya.', 'Open the work. Explore the code.')}</h1><p>${say('Repository publik dari kristantosaputra2-jpg. Pilih repository untuk membaca dan menyalin file sumber.', 'Public repositories by kristantosaputra2-jpg. Choose a repository to read and copy source files.')}</p><div class="code-toolbar"><button class="studio-button" data-github-sync>${window.STUDIO_UI.icon('sync')}${say('Sinkronkan GitHub', 'Sync GitHub')}</button><a class="social-icon-link" href="https://github.com/kristantosaputra2-jpg" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">${window.STUDIO_UI.icon('github')}</a></div><p class="content-note" id="github-sync-status" role="status"></p><div id="github-repos" class="github-repos"></div>`);
    template('code', 'b', `<div class="section-label">${say('File sumber', 'Source files')}</div><h2 id="code-repo-title">Code Lab</h2><label class="code-file-label" for="code-file">${say('Pilih file', 'Choose a file')}</label><select id="code-file" disabled><option>${say('Pilih repository terlebih dahulu', 'Choose a repository first')}</option></select><div class="code-actions"><button class="text-button" data-code-copy disabled>${window.STUDIO_UI.icon('copy')}${say('Salin kode', 'Copy code')}</button><button class="text-button" data-code-preview disabled>${window.STUDIO_UI.icon('play')}${say('Preview HTML', 'Preview HTML')}</button><a id="code-source-link" target="_blank" rel="noopener noreferrer" hidden>GitHub</a></div><p class="content-note" id="code-status" role="status"></p><pre class="source-code" tabindex="0" aria-label="${say('Isi kode sumber', 'Source code content')}"><code id="code-source">${say('Kode akan muncul setelah kamu memilih file.', 'Choose a file to display its source code.')}</code></pre><p class="content-note">${say('Preview terisolasi hanya untuk HTML/CSS/JS mandiri. Proyek React, Python, import, dan aset eksternal memerlukan lingkungan proyek aslinya.', 'The isolated preview supports standalone HTML/CSS/JS. React, Python, imports and external assets require their original project environment.')}</p>`);
    template('home', 'a', `<div class="section-label">${say('Tentang saya', 'About / The person behind the work')}</div><h1>${say('Pendidikan bertemu teknologi.', 'Where education meets technology.')}</h1><figure class="cutout-frame casual-frame">${img('casualPortrait',t(['Portrait kasual Kristanto Saputra, latar dihapus dari foto unggahan','Casual portrait of Kristanto Saputra, background removed from the supplied photo']),'personal-cutout')}<figcaption>${say('Di balik layar, tetap jadi diri sendiri.', 'Behind the screen, still myself.')}</figcaption><span class="portrait-doodle" aria-hidden="true">✦</span></figure>`);
    template('home', 'b', `<h2>Kristanto Saputra</h2>${p(data.narrative)}${p(['Saya mengajar Matematika serta Koding dan Kecerdasan Artifisial di SMP Negeri 5 Sanaman Mantikei, Kabupaten Katingan.', 'I teach Mathematics, Coding and Artificial Intelligence at SMP Negeri 5 Sanaman Mantikei, Katingan.'])}<h3>${say('Cara saya bekerja', 'How I work')}</h3>${p(['Mulai dari persoalan nyata, merancang alat yang berguna, lalu mendokumentasikan proses dan refleksinya.', 'Start with a real problem, design a useful tool, then document the process and reflect.'])}<p class="content-note">${say('Riwayat profesi dan kredensial terperinci menunggu dokumentasi pendukung.', 'A detailed career timeline and credentials await supporting documentation.')}</p>${button('talk', 'Berbagi & pelatihan', 'Speaking & training')}`);
    template('work', 'a', `<div class="work-tabs" aria-label="${say('Kategori karya', 'Work categories')}"><button data-filter="all" aria-pressed="true">${say('Semua', 'All')}</button><button data-filter="education" aria-pressed="false">${say('Pendidikan', 'Education')}</button><button data-filter="tour" aria-pressed="false">${say('Web tur', 'Tour web')}</button></div><h1>${say('Karya Digital', 'Digital Works')}</h1><p class="content-note">${say('Produk dan eksplorasi dari catatan proyek.', 'Products and explorations from the project archive.')}</p><div class="projects">${projectCards()}</div>`);
    template('work', 'b', `<div class="details"><span class="section-label">${say('Di balik karya', 'Behind the work')}</span><h2 id="ks-project-title">KelasKu</h2><p id="ks-project-copy"></p><p class="content-note" id="ks-project-note"></p><button class="studio-button" data-case="kelas">${say('Baca studi kasus', 'Read case study')}</button></div><div class="media-pending">${say('Screenshot produk akan ditambahkan setelah diverifikasi dan disanitasi.', 'Product screenshots will be added after verification and sanitization.')}</div><h3>${say('Eksplorasi visual', 'Visual explorations')}</h3><div class="filmstrip">${img('power', 'Cepat Tepat Pangkat')}${img('math', 'Math Strike Force')}${img('school', 'SMP Negeri 5 Sanaman Mantikei')}</div><p class="content-note">${say('Dokumentasi terpisah; bukan screenshot empat produk di atas.', 'Separate documentation; these are not screenshots of the four products above.')}</p>`);
    template('learning', 'a', `<span class="section-label">Education Lab</span><h1>${say('Dari ruang kelas menuju inovasi.', 'From the classroom to innovation.')}</h1><div class="education-note"><p>${say('Ruang eksplorasi pembelajaran interaktif, STEM, debugging matematis, dan AI dalam pendidikan.', 'A space for exploring interactive learning, STEM, mathematical debugging and AI in education.')}</p><figure class="cutout-frame educator-frame">${img('educatorPortrait',t(['Kristanto Saputra mengenakan seragam pendidik, latar dihapus','Kristanto Saputra in his teacher uniform, background removed']),'personal-cutout')}</figure></div><div class="topic-list"><span>PIJAR</span><span>Lab Maya Air & Api</span><span>STEM</span><span>${say('AI dalam pendidikan', 'AI in education')}</span></div><p class="content-note">${say('Topik dari brief. Rincian metode, demo, dan bukti penerapan belum tersedia dalam paket ini.', 'Topics from the brief. Method details, demos and implementation evidence are not yet included in this package.')}</p>`);
    template('learning', 'b', `<h2>${say('Dokumentasi & eksplorasi', 'Documentation & exploration')}</h2><div class="lab-media">${img('power', 'Cepat Tepat Pangkat')}${img('math', 'Math Strike Force')}</div>${p(['Aset asli memperlihatkan eksplorasi permainan matematika. Tangkapan layar tidak membuktikan pelaksanaan di kelas atau dampak belajar.', 'Original assets show mathematics game explorations. Screenshots do not establish classroom implementation or learning impact.'])}${button('talk', 'Diskusi pelatihan', 'Discuss training')}`);
    template('talk', 'a', `<span class="section-label">${say('Berbagi praktik', 'Sharing practice')}</span><h1>${say('Belajar bersama. Membangun bersama.', 'Learn together. Build together.')}</h1><figure class="cutout-frame speaker-frame">${img('speakerPortrait',t(['Portrait Kristanto Saputra dengan batik biru dan peci, latar dihapus','Portrait of Kristanto Saputra in blue batik and peci, background removed']),'personal-cutout')}<figcaption>${say('Mari belajar & bertukar ide.', 'Let’s learn & exchange ideas.')}</figcaption><span class="portrait-doodle" aria-hidden="true">✧</span></figure>`);
    template('talk', 'b', `<h2>${say('Ruang diskusi pelatihan', 'Training conversation starters')}</h2><ul class="studio-list"><li>${say('AI untuk pekerjaan dan pembelajaran guru', 'AI for teaching workflows and learning')}</li><li>${say('Membangun alat digital dari persoalan sekolah', 'Building digital tools around school needs')}</li><li>${say('Pembelajaran interaktif & asesmen formatif', 'Interactive learning & formative assessment')}</li></ul><p class="content-note">${say('Topik dapat didiskusikan sesuai kebutuhan penyelenggara; bukan daftar kegiatan yang diklaim sudah terlaksana.', 'Topics can be discussed around the organizer’s needs; this is not a list of claimed past engagements.')}</p><details class="talk-record"><summary>${say('Catatan berbagi sebelumnya', 'Earlier sharing notes')}</summary><h3>The Teachers’ Lounge</h3>${p(['Merangkai Pembelajaran Interaktif dengan ZEP Board, ZEP Quiz, dan Zelly. Komunitas Belajar Tabalien, Kabupaten Katingan.', 'Interactive learning with ZEP Board, ZEP Quiz and Zelly. Tabalien Learning Community, Katingan.'])}<p class="content-note">${say('Tercatat dalam portofolio sebelumnya. Tanggal dan dokumentasi lengkap belum tersedia.', 'Recorded in the existing portfolio. Date and complete documentation are not yet available.')}</p></details>${contactLink('whatsapp', 'Undang untuk berbagi', 'Discuss a speaking invitation', ['Halo Pak Kristanto, saya ingin berdiskusi tentang undangan pelatihan. Instansi: ... Topik: ... Tanggal: ...', 'Hello Kristanto, I would like to discuss a training invitation. Organization: ... Topic: ... Date: ...'])}`);
    template('contact', 'a', `<span class="section-label">${say('Kolaborasi', 'Collaboration')}</span><h1>${say('Mari wujudkan ide menjadi solusi.', 'Let’s turn ideas into solutions.')}</h1>${p(['Ceritakan persoalan, kebutuhan pengguna, dan rencana Anda. Kita mulai dari percakapan.', 'Tell me about the problem, the people involved and your plans. Let’s start with a conversation.'])}${contactLink('whatsapp', 'Diskusikan proyek digital', 'Discuss a digital project', ['Halo Pak Kristanto, saya ingin berdiskusi tentang proyek digital. Nama / instansi: ... Kebutuhan: ...', 'Hello Kristanto, I would like to discuss a digital project. Name / organization: ... Needs: ...'])}${contactLink('email', 'Kirim email', 'Send an email')}`);
    template('contact', 'b', `<h2>${say('Berbagi & terhubung', 'Share & connect')}</h2>${contactLink('whatsapp', 'Undangan narasumber / pelatihan', 'Speaking / training invitation', ['Halo Pak Kristanto, saya ingin mengundang Bapak berbagi. Instansi: ... Topik: ... Tanggal: ...', 'Hello Kristanto, I would like to invite you to speak. Organization: ... Topic: ... Date: ...'])}<div class="contact-network">${contactLink('social', 'Facebook', 'Facebook')}${contactLink('tiktok', 'TikTok', 'TikTok')}${contactLink('lynk', 'Lynk.id', 'Lynk.id')}</div><p class="content-note">${say('Tautan kontak dipertahankan dari proyek sebelumnya.', 'Contact links retained from the existing project.')}</p>`);
    template('store', 'a', `<span class="section-label">Store</span><h1>${say('Sudut karya & materi.', 'A corner for resources & creations.')}</h1>${p(['Kunjungi halaman Lynk.id untuk melihat materi yang tersedia. Katalog produk khusus belum disediakan dalam paket portofolio ini.', 'Visit Lynk.id for available resources. A dedicated product catalog is not included in this portfolio package.'])}${contactLink('lynk', 'Buka Lynk.id', 'Open Lynk.id')}`);
    template('store', 'b', `<h2>${say('Dibangun dari praktik.', 'Built from practice.')}</h2>${p(data.narrative)}${button('work', 'Jelajahi karya digital', 'Explore digital works')}${button('contact', 'Diskusi kebutuhan Anda', 'Discuss your needs')}`);
  }
  function renderChrome() {
    document.documentElement.lang = locale;
    window.STUDIO_NAMES.splice(0, window.STUDIO_NAMES.length, ...data.names.map(t));
    root.querySelector('.signature').innerHTML = `${img('logo', 'Mr. K — logo resmi', 'official-logo')}<span>Kristanto Saputra<small>Mr. K / Personal Digital Studio</small></span>`;
    root.querySelector('.signature').dataset.page = 'dashboard';
    root.querySelector('nav').setAttribute('aria-label', t(['Navigasi utama', 'Main navigation']));
    root.querySelectorAll('header > nav [data-page]').forEach((el, i) => el.textContent = window.STUDIO_NAMES[i]);
    language.innerHTML = `<button data-locale="id" aria-pressed="${locale === 'id'}" lang="id">ID</button><button data-locale="en" aria-pressed="${locale === 'en'}" lang="en">EN</button>`;
    language.setAttribute('aria-label', t(['Bahasa', 'Language']));
    root.querySelector('#ks-prev').textContent = t(['← Sebelumnya', '← Previous']);
    root.querySelector('#ks-prev').setAttribute('aria-label', t(['Modul sebelumnya', 'Previous section']));
    root.querySelector('#ks-next').setAttribute('aria-label', t(['Modul berikutnya', 'Next section']));
    root.querySelector('.dashboard-hero img').alt = t(['Sampul binder Kristanto Saputra', 'Kristanto Saputra’s closed binder']);
    intro.innerHTML = window.STUDIO_UI.hero({data,t,esc,say,button,p});
    homeSections.innerHTML = `<section class="expertise"><h2>${say('Dua bidang, satu semangat inovasi.', 'Two disciplines, one drive to innovate.')}</h2><div class="expertise-grid"><article><h3>Digital Works</h3>${p(['Aplikasi web, produk digital, dan solusi untuk pekerjaan nyata.', 'Web applications, digital products and solutions for real work.'])}${button('work', 'Buka karya digital', 'Explore digital works', 'text-button')}</article><article><h3>Education Lab</h3>${p(['Eksplorasi pembelajaran interaktif, teknologi, dan praktik berbagi.', 'Exploring interactive learning, technology and shared practice.'])}${button('learning', 'Masuk lab pendidikan', 'Explore education lab', 'text-button')}</article></div></section><section><div class="section-heading"><h2>${say('Karya pilihan', 'Selected work')}</h2>${button('work', 'Semua karya', 'All work', 'text-button')}</div><div class="featured-grid">${['kelas','rapot'].map(key => `<article class="featured-project"><span class="project-status">${esc(t(data.projects[key].status))}</span><h3>${data.projects[key].title}</h3>${p(data.projects[key].description)}<button class="text-button" data-case="${key}">${say('Baca studi kasus', 'Read case study')}</button></article>`).join('')}</div></section><section><h2>${say('Dari ruang kelas menuju inovasi.', 'From the classroom to innovation.')}</h2>${p(data.narrative)}<div class="evidence-grid">${screenshotCards()}</div>${button('learning', 'Jelajahi Education Lab', 'Explore Education Lab', 'text-button')}</section><section class="journey"><h2>${say('Perjalanan profesional', 'Professional journey')}</h2><div class="journey-grid"><article><h3>${say('Pendidikan', 'Education')}</h3>${p(['Mengajar Matematika serta Koding dan KA di SMP Negeri 5 Sanaman Mantikei.', 'Teaching Mathematics, Coding and AI at SMP Negeri 5 Sanaman Mantikei.'])}</article><article><h3>${say('Pengembangan digital', 'Digital development')}</h3>${p(['Mengembangkan KelasKu dan RapotKu dari kebutuhan pekerjaan guru.', 'Developing KelasKu and RapotKu around teaching workflows.'])}</article><article><h3>${say('Berbagi praktik', 'Sharing practice')}</h3>${p(['The Teachers’ Lounge, Komunitas Belajar Tabalien.', 'The Teachers’ Lounge, Tabalien Learning Community.'])}</article></div><p class="content-note">${say('Tanggal perjalanan dan kredensial belum dilengkapi bukti pada paket ini.', 'Milestone dates and credentials await supporting evidence in this package.')}</p></section><section class="collaboration-panel"><h2>${say('Punya persoalan untuk dipecahkan bersama?', 'Have a problem we can solve together?')}</h2>${p(['Untuk proyek digital, undangan berbagi, dan kolaborasi pendidikan.', 'For digital projects, speaking invitations and education collaborations.'])}${button('contact', 'Mulai percakapan', 'Start a conversation')}</section>`;
    root.querySelector('footer').innerHTML = `<span>© 2026 Kristanto Saputra / Mr. K</span><span>${say('Pendidikan, teknologi, dan persoalan nyata.', 'Education, technology and real problems.')}</span>`;
    updateTemplates(); updateMeta();
  }
  function updateMeta() {
    const name = window.STUDIO_NAMES[pages.indexOf(current)];
    document.title = `${name} | Kristanto Saputra — Mr. K`;
    document.querySelector('meta[name="description"]').content = t(data.narrative);
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = t(data.narrative);
  }
  function writeRoute(page, caseId = '') {
    const url = new URL(location.href); url.searchParams.set('lang', locale); url.hash = `/${page}${caseId ? '/' + caseId : ''}`;
    if (url.href !== location.href) history.pushState(null, '', url);
  }
  function closeCase() { dialog.close(); writeRoute(current); if (dialogOpener?.isConnected) dialogOpener.focus(); }
  function openCase(key, trigger) {
    const item = data.projects[key]; if (!item) return;
    selected = key; dialogOpener = trigger || document.activeElement;
    const sections = [item.description, item.context, item.challenge, item.role, item.process, item.solution, item.decision, item.evidence, item.reflection];
    dialog.innerHTML = `<button class="dialog-close">${say('Tutup', 'Close')} ×</button><div class="case-header"><span class="project-status">${esc(t(item.status))}</span><h1 id="case-title">${esc(item.title)}</h1>${p(item.description)}</div><div class="case-body">${sections.map((value, i) => `<section><h2>${esc(t(data.caseSections[i]))}</h2>${p(value || missing)}</section>`).join('')}<section><h2>${esc(t(data.caseSections[9]))}</h2>${safeURL(item.demo) ? `<a href="${esc(safeURL(item.demo))}" target="_blank" rel="noopener noreferrer">${say('Buka demo', 'Open demo')}</a>` : p(['Demo publik belum tersedia. Hubungi saya untuk mendiskusikan proyek ini.', 'A public demo is not yet available. Contact me to discuss this project.'])}</section><div class="media-pending">${say('Screenshot proyek belum tersedia; tidak diganti dengan gambar produk lain.', 'Project screenshots are not yet available; images of other products are not substituted.')}</div>${button('contact', 'Diskusikan proyek ini', 'Discuss this project')}</div>`;
    if (/^assets\/images\/[\w -]+\.(png|webp|jpe?g)$/i.test(item.image || '')) {
      const screenshot = new Image(); screenshot.src = item.image;
      screenshot.alt = t(['Tangkapan layar ', 'Screenshot of ']) + item.title;
      screenshot.style.cssText = 'width:100%;height:auto;object-fit:contain';
      dialog.querySelector('.media-pending').replaceWith(screenshot);
    }
    dialog.querySelector('.dialog-close').onclick = closeCase;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    writeRoute(current, key);
    document.title = `${item.title} | ${t(['Studi kasus', 'Case study'])} — Kristanto Saputra`;
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeCase(); });
  dialog.addEventListener('click', event => {
    const target = event.target.closest('[data-page]');
    if (target) { closeCase(); root.querySelector(`header > nav [data-page="${target.dataset.page}"]`).click(); }
  });
  root.addEventListener('ks-pagechange', event => {
    current = event.detail;
    root.querySelectorAll('header > nav [data-page]').forEach(el => {
      if (el.dataset.page === current) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    root.querySelectorAll('.sheet').forEach((el, i) => el.setAttribute('aria-label', t(i ? ['Lanjutan konten', 'Continued content'] : ['Konten', 'Content'])));
    updateMeta();
    if (!readingRoute && current !== routeTarget) writeRoute(current, dialog.open ? selected : '');
    if (current === routeTarget) routeTarget = null;
    if (dialog.open) document.title = `${data.projects[selected].title} | ${t(['Studi kasus', 'Case study'])} — Kristanto Saputra`;
    if (!dialog.open) selected = 'kelas';
  });
  root.addEventListener('ks-navigation-end', () => {
    const heading = root.querySelector('.sheet-a h1') || intro.querySelector('h1');
    heading.tabIndex = -1; heading.focus({preventScroll:true});
  });
  root.addEventListener('click', event => {
    const lang = event.target.closest('[data-locale]');
    if (lang) { locale = lang.dataset.locale; renderChrome(); root.dispatchEvent(new Event('ks-refresh')); writeRoute(current); root.querySelector(`[data-locale="${locale}"]`).focus(); }
    const card = event.target.closest('[data-project]');
    if (card) {
      selected = card.dataset.project;
      root.querySelectorAll('[data-project]').forEach(el => el.setAttribute('aria-pressed', String(el === card)));
      const action = root.querySelector('.sheet [data-case]'); if (action) action.dataset.case = selected;
    }
    const study = event.target.closest('[data-case]'); if (study) openCase(study.dataset.case, study);
  });
  let readingRoute = false, routeTarget = null;
  function readRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const requestedLocale = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'id';
    if (requestedLocale !== locale) { locale = requestedLocale; renderChrome(); root.dispatchEvent(new Event('ks-refresh')); }
    const page = pages.includes(parts[0]) ? parts[0] : 'dashboard';
    readingRoute = true;
    if (dialog.open) dialog.close();
    if (page !== current) {routeTarget = page;root.querySelector(`header > nav [data-page="${page}"]`).click();}
    if (data.projects[parts[1]]) openCase(parts[1]);
    readingRoute = false;
  }
  window.addEventListener('popstate', readRoute);
  window.addEventListener('hashchange', () => { if (location.hash === '#main-content') layout.focus(); else readRoute(); });
  renderChrome();
  // App initializes synchronously after this file; restore routes once its handlers exist.
  window.addEventListener('load', readRoute, {once:true});
})();
