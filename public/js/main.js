/* =====================================================================
   MAIN — menyusun halaman dari window.SITE (js/data.js) + efek gerak.
   Bagian: 1 util · 2 template tiap section · 3 render · 4 interaksi
           5 efek scroll · 6 kursor & magnet · 7 loader & intro · 8 start
   ===================================================================== */
(function(){
  'use strict';
  var S = window.SITE;
  var D = document, W = window;
  var reduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia('(pointer: fine)').matches;
  var $ = function(s,c){ return (c||D).querySelector(s); };
  var $$ = function(s,c){ return [].slice.call((c||D).querySelectorAll(s)); };

  /* ---------- 1. UTIL ---------- */
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function url(u){ u = String(u || '').trim(); return /^(https?:|mailto:|tel:|#)/i.test(u) ? esc(u) : (u ? 'https://' + esc(u.replace(/^\/+/, '')) : '#'); }
  function img(src){ if (/^\/api\/media\/[a-f0-9-]+$/.test(src || '')) return esc(src); return /^data:image\/|^(https?:)?\/\/|^[\w\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(src || '') ? esc(src) : ''; }
  var clamp = function(v,a,b){ return Math.max(a, Math.min(b, v)); };
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  var CHECK = '<svg viewBox="0 0 14 14" fill="none" stroke="#d4202a" stroke-width="2.4" stroke-linecap="round"><path d="M2 7l3.5 4L12 2"/></svg>';
  var SOC = {
    instagram:['Instagram','<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>'],
    tiktok:['TikTok','<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.3 4.2 5 4.5"/>'],
    youtube:['YouTube','<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>'],
    whatsapp:['WhatsApp','<path d="M4 20l1.3-4A8 8 0 1 1 8 19z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1.2 1.8.8c-.3 1.2-1.3 1.9-2.6 1.6-2.8-.7-5.2-3-5.9-5.9-.3-1.3.4-2.3 1.6-2.6l.8 1.8z" fill="currentColor" stroke="none"/>'],
    facebook:['Facebook','<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7h1.8V2.6A22 22 0 0 0 15 2.4c-2.6 0-4.3 1.6-4.3 4.4v2.7H7.8V13h2.9v8"/>'],
    linkedin:['LinkedIn','<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.1M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'],
    website:['Website','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'],
    email:['Email','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>']
  };
  function socHref(k, v){
    if (k === 'whatsapp'){ var n = String(v).replace(/\D/g,''); if (n.indexOf('0') === 0) n = '62' + n.slice(1); return n ? 'https://wa.me/' + n : ''; }
    if (k === 'email') return 'mailto:' + esc(v);
    return url(v);
  }
  function splitChars(word, start){
    return word.split('').map(function(c,i){ return '<span class="ch" style="--i:' + (start + i) + '">' + esc(c) + '</span>'; }).join('');
  }

  /* ---------- 2. TEMPLATE ---------- */
  var NAV = [['home','Home'],['about','About'],['work','Work'],['expertise','Expertise'],['process','Process'],['contact','Contact']];

  function tHeader(){
    return '<header class="nav" id="nav"><div class="wrap">' +
      '<a href="#home" class="logo" id="logo" aria-label="Ke beranda"><b>' + esc(S.brand.first + ' ' + S.brand.last) + '</b><small>' + esc(S.brand.tag) + '</small></a>' +
      '<nav id="menu" aria-label="Navigasi utama">' + NAV.map(function(n){ return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('') + '</nav>' +
      '<a href="#contact" class="btn cta magnetic">' + esc(S.brand.cta) + ' ' + ARROW + '</a>' +
      '<button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button></div></header>';
  }

  function tHero(){
    var h = S.hero;
    var todo = h.todo.map(function(t){ return t.done ? '<s>' + esc(t.text) + '</s> ✓' : esc(t.text); }).join('<br>');
    var str = function(d, delay){ return '<path class="str" pathLength="1" d="' + d + '" fill="none" stroke="#d4202a" stroke-width="2.2" style="--d:' + delay + 's"/>'; };
    return '<section class="hero" id="home" style="padding-bottom:0"><div class="wrap"><div class="hero-inner" id="heroInner"><div class="stage">' +
      '<svg class="strings" viewBox="0 0 1200 650" preserveAspectRatio="none" aria-hidden="true">' +
        str('M302 178 C 360 70, 560 52, 742 72', 1.5) + str('M742 72 C 790 120, 815 200, 868 252', 1.9) +
        str('M302 178 C 260 200, 240 215, 232 236', 1.7) + str('M232 236 C 215 290, 205 320, 205 350', 2.0) +
        '<g class="ann" fill="none" stroke="#161616" stroke-width="1.6"><path d="M120 195 C 200 185, 250 175, 302 178" stroke="#999" stroke-width="1.3" stroke-dasharray="4 5"/>' +
        '<path d="M58 168 C 50 190, 70 205, 105 200"/><path d="M95 192 l10 8 -12 4"/><path d="M120 470 C 135 445, 150 440, 172 436"/><path d="M160 430 l12 6 -10 8"/>' +
        '<path d="M900 400 C 880 375, 855 368, 830 370"/><path d="M842 362 l-12 8 12 6"/></g></svg>' +
      '<span class="pin" style="left:25.2%;top:27.4%;--d:1.3s"></span><span class="pin" style="left:61.8%;top:11%;--d:1.4s"></span>' +
      '<span class="pin blue" style="left:72.3%;top:38.8%;--d:1.8s"></span><span class="pin" style="left:19.3%;top:36.3%;--d:1.6s"></span><span class="pin" style="left:17.1%;top:53.8%;--d:1.9s"></span>' +
      h.annos.map(function(a,i){ return '<div class="anno a' + (i+1) + ' pop parallax" data-speed="' + [.06,-.04,.05][i] + '" style="--d:' + (1.1 + i*.15) + 's"><b>' + esc(a.title) + '</b><p>' + esc(a.text) + '</p></div>'; }).join('') +
      '<h1 class="mega" aria-label="Portfolio"><span>' + splitChars('P',0) + '<i class="o"></i>' + splitChars('RT',2) + '</span><span class="l2">' + splitChars('FOLIO',4) + '</span></h1>' +
      '<div class="note n-name pop parallax" data-speed=".12" style="--d:.7s"><b>' + esc(S.brand.first) + '<br><i>' + esc(S.brand.last) + '</i></b><small>' + esc(h.nameSub) + '</small></div>' +
      '<div class="note n-todo pop parallax" data-speed=".08" style="--d:.85s">' + esc(h.todoTitle) + '<br>' + todo + '</div>' +
      '<div class="note n-quote pop parallax" data-speed=".15" style="--d:1s">' + esc(h.quote) + '<small>' + esc(h.quoteBy) + '</small></div>' +
      '<div class="note n-open pop parallax" data-speed=".1" style="--d:1.15s">' + esc(h.openTitle) + '<small>' + esc(h.openSub) + '</small></div>' +
      '<div class="badge pop" style="--d:1.3s" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>' +
        '<text font-family="Hanken Grotesk, sans-serif" font-weight="700" font-size="9.2" letter-spacing="1" fill="#161616"><textPath href="#circ" textLength="232" lengthAdjust="spacingAndGlyphs">' + esc(h.badge) + '</textPath></text></svg></div>' +
      '<div class="role pop" style="--d:1.2s">' + esc(S.brand.role) + '<svg viewBox="0 0 220 14" preserveAspectRatio="none"><path pathLength="1" d="M4 8 C 60 2, 140 12, 216 5" fill="none" stroke="#d4202a" stroke-width="2.6" stroke-linecap="round"/><path pathLength="1" d="M10 12 C 80 6, 150 13, 200 9" fill="none" stroke="#d4202a" stroke-width="2.2" stroke-linecap="round"/></svg></div>' +
      '<a href="#about" class="scroll-pill pop" style="--d:1.7s"><i></i>' + esc(h.scroll) + '</a>' +
      '<div class="ring pop parallax" data-speed="-.06" style="--d:1.4s" aria-hidden="true"></div>' +
      '</div></div></div></section>';
  }

  function tTicker(){
    var t = S.ticker, rep = function(a){ var h = a.concat(a, a).map(function(x){ return '<span>' + esc(x) + '</span>'; }).join(''); return h + h; };
    return '<div class="ticker" aria-hidden="true" style="--dur:' + (Number(t.speed) || 90) + 's">' +
      '<div class="band black"><div class="track">' + rep(t.words) + '</div></div>' +
      '<div class="band yellow"><div class="track">' + rep(t.phrases) + '</div></div></div>';
  }

  function tAbout(){
    var a = S.about, src = img(a.photo);
    var photo = src ? '<img src="' + src + '" alt="Foto ' + esc(S.brand.first + ' ' + S.brand.last) + '">' :
      '<svg viewBox="0 0 270 320" role="img" aria-label="Ilustrasi avatar">' + W.AVATAR_SVG + '</svg>';
    return '<section id="about"><div class="wrap about">' +
      '<figure class="polaroid zoom"><span class="tape"></span>' +
        '<svg class="crown draw" viewBox="0 0 50 40" fill="none" stroke="#d4202a" stroke-width="2.4" stroke-linejoin="round"><path pathLength="1" d="M5 34 L8 10 L18 22 L25 6 L32 22 L42 10 L45 34 Z"/></svg>' +
        '<div class="ph">' + photo + '</div><figcaption>' + esc(a.caption) + '</figcaption></figure>' +
      '<div class="reveal" style="--sd:.1s"><span class="label-line">' + esc(a.label) + '</span>' +
        '<h2>' + esc(a.hello) + '<br>' + esc(a.prefix) + ' <span class="hl">' + esc(S.brand.first + ' ' + S.brand.last) + '</span>' + (S.brand.degree ? ' <span class="deg">' + esc(S.brand.degree) + '</span>' : '') + '</h2>' +
        a.bio.map(function(p){ return '<p class="bio">' + esc(p) + '</p>'; }).join('') +
        '<div class="tags"><svg viewBox="0 0 30 16" fill="none" stroke="#161616" stroke-width="1.8" stroke-linecap="round"><path d="M2 4 C 8 14, 16 12, 26 8 M20 4 l6 4 -6 5"/></svg>' +
          a.tags.map(function(t){ return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        (a.tools.length ? '<p class="tools"><b>Alat:</b>' + a.tools.map(function(t){ return '<span>' + esc(t) + '</span>'; }).join('') + '</p>' : '') +
      '</div>' +
      '<div class="stats reveal" style="--sd:.25s">' + a.stats.map(function(s){ return '<div><b class="hl count" data-v="' + esc(s.value) + '">' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></div>'; }).join('') + '</div>' +
      '</div></section>';
  }

  var ST = { live:'✅', proto:'🧪', dev:'🛠️', concept:'📝' };
  function badge(p){ return p.status ? '<span class="status s-' + esc(p.statusType || 'dev') + '">' + (ST[p.statusType] || '') + ' ' + esc(p.status) + '</span>' : ''; }

  function thumbHtml(p){
    var images = [];
    if (img(p.image)) images.push({src:p.image, alt:p.title});
    (p.images || []).forEach(function(item){
      var x = typeof item === 'string' ? {src:item, alt:p.title} : item;
      if (x && img(x.src) && !images.some(function(i){ return i.src === x.src; })) images.push(x);
    });
    if (images.length) return '<div class="project-gallery" data-slide="0" role="group" aria-label="Gambar ' + esc(p.title) + '">' + images.map(function(x,i){
      return '<img class="project-slide' + (i === 0 ? ' active' : '') + '" src="' + img(x.src) + '" alt="' + esc(x.alt || p.title) + '" aria-hidden="' + (i !== 0) + '" loading="lazy">';
    }).join('') + (images.length > 1 ? '<div class="slide-controls"><button type="button" data-slide-action="prev" aria-label="Gambar sebelumnya">‹</button><span class="slide-count">1 / ' + images.length + '</span><button type="button" data-slide-action="next" aria-label="Gambar berikutnya">›</button><button type="button" data-slide-action="pause" aria-pressed="' + reduce + '" aria-label="Jeda slideshow">' + (reduce ? '▶' : 'Ⅱ') + '</button></div>' : '') + '</div>';
    var src = img(p.image);
    if (src) return '<img src="' + src + '" alt="" loading="lazy">';
    var t = W.THUMBS[p.thumb] || W.THUMBS.ide;
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + t + '</svg>';
  }

  function tWork(){
    var w = S.work;
    var lim = +w.initial || 0;
    var cards = w.projects.map(function(p,i){
      return '<div role="button" tabindex="0" class="card zoom' + (lim && i >= lim ? ' extra' : '') + '" style="--sd:' + ((i % 3) * .12) + 's" data-c="' + esc((p.cats || []).join(' ')) + '" data-i="' + i + '" data-cursor="view" aria-label="Lihat detail ' + esc(p.title) + '">' +
        (p.deco === 'pin' ? '<span class="pin"></span>' : '<span class="tape"></span>') +
        '<div class="thumb">' + thumbHtml(p) + badge(p) + '<span class="peek">Lihat detail →</span></div>' +
        '<div class="card-foot"><span><b>' + esc(p.title) + '</b><i>' + esc(p.sub) + '</i>' + (p.platform ? '<em class="plat">' + esc(p.platform) + '</em>' : '') + '</span><span class="arrow-c">' + ARROW + '</span></div></div>';
    }).join('');
    return '<section id="work" style="padding-top:40px"><div class="wrap">' +
      '<div class="sec-top reveal"><div><span class="label-line">' + esc(w.label) + '</span>' +
        '<h2 class="h2" style="margin-top:10px">' + esc(w.title) + ' <span class="hl">' + esc(w.titleHl) + '</span></h2>' +
        '<svg class="swoosh draw" viewBox="0 0 120 12"><path pathLength="1" d="M3 8 C 40 3, 80 4, 117 7" fill="none" stroke="#d4202a" stroke-width="3" stroke-linecap="round"/></svg></div>' +
        '<p>' + esc(w.intro) + '</p></div>' +
      '<div class="filters reveal" role="group" aria-label="Saring proyek"><button data-f="all" aria-pressed="true">Semua<sup></sup></button>' +
        w.filters.map(function(f){ return '<button data-f="' + esc(f.key) + '" aria-pressed="false">' + esc(f.label) + '<sup></sup></button>'; }).join('') + '</div>' +
      '<div class="cards' + (lim && w.projects.length > lim ? ' clipped' : '') + '" id="cards">' + cards + '</div>' +
      (lim && w.projects.length > lim ? '<div class="center reveal" id="moreWrap"><button class="btn magnetic" id="moreBtn">' + esc(w.moreAll || 'Tampilkan semua') + ' (' + w.projects.length + ') <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></button></div>' : '') +
      (w.moreLabel ? '<div class="center reveal"><a href="' + url(w.moreLink) + '" target="_blank" rel="noopener" class="btn magnetic">' + esc(w.moreLabel) + ' ' + ARROW + '</a></div>' : '') +
      '</div></section>';
  }

  function tExpertise(){
    var e = S.expertise;
    return '<section id="expertise"><div class="wrap exp">' +
      '<div class="torn intro reveal"><span class="paper"></span><svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="#161616" stroke-width="1.6"><path d="M3 2 L1 17 M9 1 L7 17"/></svg>' +
        '<h2>' + esc(e.title) + '</h2><p>' + esc(e.intro) + '</p>' +
        '<svg class="doodle draw" viewBox="0 0 80 24" fill="none" stroke="#d4202a" stroke-width="2.4" stroke-linecap="round"><path pathLength="1" d="M3 18 C 20 4, 45 4, 72 12 M62 5 l10 7 -11 6"/></svg></div>' +
      e.cards.map(function(c,i){
        var href = c.go === 'contact' ? '#contact' : '#work';
        return '<div class="torn c' + (i+1) + ' reveal" style="--sd:' + ((i+1) * .12) + 's"><span class="paper"></span><span class="tape"></span><span class="num">0' + (i+1) + '</span>' +
          '<svg class="ic" viewBox="0 0 32 32" fill="none" stroke="#161616" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">' + (W.ICONS[c.icon] || W.ICONS.school) + '</svg>' +
          '<h3>' + esc(c.title) + '</h3><p class="d">' + esc(c.desc) + '</p>' +
          '<ul>' + c.items.map(function(it){ return '<li>' + CHECK + esc(it) + '</li>'; }).join('') + '</ul>' +
          (c.link ? '<a href="' + href + '" class="more" data-go="' + esc(c.go) + '">' + esc(c.link) + '</a>' : '') + '</div>';
      }).join('') + '</div></section>';
  }

  function tStack(){
    var k = S.stack; if (!k || !k.groups || !k.groups.length) return '';
    return '<section id="stack"><div class="wrap">' +
      '<div class="sec-top reveal"><div><span class="label-line">' + esc(k.label) + '</span><h2 class="h2" style="margin-top:10px"><span class="hl">' + esc(k.titleHl) + '</span> ' + esc(k.title) + '</h2></div>' + (k.intro ? '<p>' + esc(k.intro) + '</p>' : '') + '</div>' +
      '<div class="stack-grid">' + k.groups.map(function(g,i){
        return '<div class="stack-card sc' + (i % 4 + 1) + ' zoom" style="--sd:' + ((i % 4) * .1) + 's">' + (i % 2 ? '<span class="tape"></span>' : '<span class="pin" style="left:50%;top:0"></span>') +
          '<h3>' + esc(g.title) + ' <sup>' + (g.items || []).length + '</sup></h3>' + (g.note ? '<small>' + esc(g.note) + '</small>' : '') +
          '<ul>' + (g.items || []).map(function(it){ return '<li>' + esc(it) + '</li>'; }).join('') + '</ul>' +
          (g.foot ? '<p class="foot">' + esc(g.foot) + '</p>' : '') + '</div>';
      }).join('') + '</div></div></section>';
  }

  function tWorked(p){
    var groups = p.workedGroups || (p.worked ? [{ label:p.workedLabel, items:p.worked }] : []);
    groups = groups.filter(function(g){ return g.items && g.items.length; });
    if (!groups.length) return '';
    var n = 0;
    return '<div class="worked reveal">' + groups.map(function(g){
      return '<div class="wg"><span class="lbl">' + esc(g.label) + '</span><div class="wl">' +
        g.items.map(function(w){ return '<span class="w' + (n++ % 5) + '">' + esc(w) + '</span>'; }).join('') + '</div></div>';
    }).join('') + '</div>';
  }

  function tProcess(){
    var p = S.process;
    var wave = 'M0 22 C 120 40, 220 2, 330 22 S 560 40, 660 20 S 880 4, 1000 26';
    return '<section id="process"><div class="wrap">' +
      '<div class="reveal"><span class="label-line">' + esc(p.label) + '</span><h2 class="h2" style="margin-top:10px"><span class="hl">' + esc(p.titleHl) + '</span> ' + esc(p.title) + '</h2></div>' +
      '<div class="steps" id="steps" style="--n:' + p.steps.length + '"><svg class="wave" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">' +
        '<path class="bg" d="' + wave + '" fill="none" stroke-width="1.5"/><path class="fg" pathLength="1" d="' + wave + '" fill="none" stroke-width="2.2"/></svg>' +
      p.steps.map(function(s,i){ return '<div class="step reveal" style="--sd:' + (i * .12) + 's"><div class="circ">' + (i < 9 ? '0' : '') + (i+1) + '</div><h3>' + esc(s.title) + '</h3><small>' + esc(s.sub) + '</small><p>' + esc(s.text) + '</p></div>'; }).join('') +
      '</div>' +
      tWorked(p) +
      '</div></section>';
  }

  function tContact(){
    var c = S.contact, socs = [];
    Object.keys(SOC).forEach(function(k){
      var v = k === 'email' ? c.email : (c.socials || {})[k];
      if (v) socs.push('<a href="' + socHref(k, v) + '" target="_blank" rel="noopener" aria-label="' + SOC[k][0] + '" title="' + SOC[k][0] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + SOC[k][1] + '</svg></a>');
    });
    var ig = (c.socials && c.socials.instagram) ? String(c.socials.instagram).replace(/^https?:\/\/(www\.)?instagram\.com\//i,'@').replace(/\/$/,'') : '';
    return '<section id="contact"><div class="wrap contact">' +
      '<div class="reveal"><span class="label-line">' + esc(c.label) + '</span>' +
        '<h2>' + esc(c.title) + '<span class="q">?</span></h2>' +
        '<svg class="swoosh draw" viewBox="0 0 120 12" style="width:170px"><path pathLength="1" d="M3 8 C 40 3, 80 4, 117 7" fill="none" stroke="#d4202a" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="lead">' + esc(c.lead) + '</p>' +
        (c.email ? '<a href="mailto:' + esc(c.email) + '" class="email-btn torn-edge magnetic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>Email saya <small>' + esc(c.email) + '</small></a>' : '') +
        (socs.length ? '<div class="find">Temukan saya di: ' + socs.join('') + '</div>' : '') +
        (ig ? '<p style="font-size:12.5px;color:var(--muted);margin-top:10px">Instagram: ' + esc(ig) + '</p>' : '') +
      '</div>' +
      '<form class="sheet zoom" id="form" novalidate style="--sd:.15s"><span class="tape"></span><h3>' + esc(c.formTitle) + '</h3>' +
        '<label for="f-nama">Nama kamu</label><input id="f-nama" name="nama" autocomplete="name">' +
        '<label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email">' +
        '<label for="f-jenis">Keperluan</label><select id="f-jenis" name="jenis">' + c.purposes.map(function(p){ return '<option>' + esc(p) + '</option>'; }).join('') + '</select>' +
        '<label for="f-pesan">Pesan</label><textarea id="f-pesan" name="pesan" placeholder="Ceritakan kebutuhanmu...."></textarea>' +
        '<button class="btn" type="submit">Siapkan pesan ' + ARROW + '</button><div class="out" id="out" role="status" aria-live="polite"></div></form>' +
      '</div></section>';
  }

  function tFooter(){
    return '<footer id="footer"><div class="wrap"><div class="top">' +
      '<a href="#home" class="logo"><b>' + esc(S.brand.first + ' ' + S.brand.last) + '</b><small>' + esc(S.brand.tag) + '</small></a>' +
      '<nav>' + NAV.slice(1).map(function(n){ return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('') + '</nav>' +
      '<button class="up magnetic" aria-label="Kembali ke atas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></div>' +
      '<div class="giant" id="giant" aria-hidden="true">' + esc((S.brand.first + ' ' + S.brand.last).toUpperCase()) + '</div>' +
      '<p class="copy">© ' + new Date().getFullYear() + ' ' + esc(S.footer.copy) + '</p></div>' +
      '<div class="base">' + esc(S.footer.base) + '</div></footer>' +
      '<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="m-title" data-lenis-prevent>' +
        '<div class="box"><span class="tape"></span><button class="x" aria-label="Tutup">×</button><div class="thumb" id="m-thumb"></div>' +
        '<div class="inner"><h3 id="m-title"></h3><p class="sub" id="m-sub"></p><dl id="m-dl"></dl></div><div id="m-link"></div></div></div>';
  }

  /* ---------- 3. RENDER ---------- */
  function render(){
    D.title = S.meta.title || (S.brand.first + ' ' + S.brand.last);
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', S.meta.description || '');
    $('#app').innerHTML = tHeader() + '<main>' + tHero() + tTicker() + tAbout() + tWork() + tExpertise() + tStack() + tProcess() + tContact() + '</main>' + tFooter();
    bind();
  }

  /* ---------- 4. INTERAKSI (dipasang ulang setiap render) ---------- */
  var io;
  function bind(){
    var instant = D.body.classList.contains('admin-on');

    /* menu HP */
    var mb = $('.menu-btn'), menu = $('#menu');
    mb.addEventListener('click', function(){ var o = menu.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    $$('a', menu).forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); mb.setAttribute('aria-expanded', false); }); });

    /* logo diklik 5x → admin */
    var clicks = 0, timer;
    $('#logo').addEventListener('click', function(){
      clicks++; clearTimeout(timer); timer = setTimeout(function(){ clicks = 0; }, 1600);
      if (clicks >= 5){ clicks = 0; D.dispatchEvent(new CustomEvent('folio:admin')); }
    });

    /* tepi kertas sobek */
    $$('.torn .paper').forEach(function(el){ tear(el, true, true); });
    $$('.torn-edge').forEach(function(el){ tear(el, true, true); });
    tearTop($('#footer'));

    /* filter proyek */
    var cards = $$('.card'), fb = $$('.filters button');
    var grid = $('#cards'), moreBtn = $('#moreBtn');
    function expand(){ if (grid) grid.classList.remove('clipped'); if (moreBtn) moreBtn.parentNode.style.display = 'none'; }
    if (moreBtn) moreBtn.addEventListener('click', function(){
      expand();
      $$('.card.extra').forEach(function(c,i){ c.classList.remove('in'); c.style.setProperty('--sd', (i % 3 * .1) + 's'); void c.offsetWidth; c.classList.add('in'); });
    });
    function applyF(f){
      if (f !== 'all') expand();
      fb.forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.f === f); });
      cards.forEach(function(c){
        var show = f === 'all' || c.dataset.c.split(' ').indexOf(f) > -1;
        c.classList.toggle('hide', !show);
        if (show){ c.classList.remove('in'); void c.offsetWidth; c.classList.add('in'); }
      });
    }
    fb.forEach(function(b){
      var f = b.dataset.f;
      $('sup', b).textContent = f === 'all' ? cards.length : cards.filter(function(c){ return c.dataset.c.split(' ').indexOf(f) > -1; }).length;
      b.addEventListener('click', function(){ applyF(f); });
    });
    $$('[data-go]').forEach(function(a){ a.addEventListener('click', function(){ if (a.dataset.go !== 'contact') applyF(a.dataset.go); }); });

    /* modal proyek */
    var modal = $('#modal'), last;
    function openM(i){
      var p = S.work.projects[i]; last = D.activeElement;
      $('#m-thumb').innerHTML = thumbHtml(p) + badge(p); $('#m-title').textContent = p.title; $('#m-sub').textContent = p.sub;
      var dl = $('#m-dl'); dl.innerHTML = '';
      [['Masalah',p.problem || p.ctx],['Solusi',p.solution || p.role],['Untuk siapa',p.users],['Platform',p.platform],['Teknologi',p.stack],['AI di produk',p.ai],['Catatan',p.note]].forEach(function(r){
        if (!r[1]) return;
        var dt = D.createElement('dt'), dd = D.createElement('dd'); dt.textContent = r[0]; dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd);
      });
      $('#m-link').innerHTML = p.link ? '<a class="btn golink" href="' + url(p.link) + '" target="_blank" rel="noopener">Buka proyek ' + ARROW + '</a>' : '';
      modal.classList.add('open'); $('.x', modal).focus();
      if (W.__lenis) W.__lenis.stop();
    }
    function closeM(){ modal.classList.remove('open'); if (last) last.focus(); if (W.__lenis) W.__lenis.start(); }
    cards.forEach(function(c){
      c.addEventListener('click', function(e){ if (!e.target.closest('.slide-controls')) openM(+c.dataset.i); });
      c.addEventListener('keydown', function(e){ if (e.target === c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); openM(+c.dataset.i); } });
    });
    $('.x', modal).addEventListener('click', closeM);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeM(); });
    D.onkeydown = function(e){ if (e.key === 'Escape' && modal.classList.contains('open')) closeM(); };

    /* tombol ke atas */
    $('.up').addEventListener('click', function(){ if (W.__lenis) W.__lenis.scrollTo(0); else W.scrollTo({top:0, behavior:'smooth'}); });

    /* formulir: siapkan email (tanpa server → tidak diklaim "terkirim") */
    var form = $('#form'), out = $('#out'), EMAIL = S.contact.email;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var nama = form.nama.value.trim(), pesan = form.pesan.value.trim();
      out.className = 'out show';
      if (!nama || !pesan){ out.textContent = 'Nama dan pesan diisi dulu ya....'; (nama ? form.pesan : form.nama).focus(); return; }
      var subj = '[' + form.jenis.value + '] dari ' + nama;
      var body = 'Nama: ' + nama + '\nEmail: ' + (form.email.value.trim() || '-') + '\nKeperluan: ' + form.jenis.value + '\n\n' + pesan;
      out.innerHTML = '';
      var p = D.createElement('p'); p.textContent = 'Pesan sudah disiapkan. Buka aplikasi email, atau salin lalu kirim ke ' + EMAIL + '.';
      var row = D.createElement('div'); row.className = 'row';
      var a = D.createElement('a'); a.className = 'btn'; a.textContent = 'Buka email'; a.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      var c = D.createElement('button'); c.type = 'button'; c.className = 'btn'; c.textContent = 'Salin pesan';
      c.addEventListener('click', function(){
        var txt = 'Kepada: ' + EMAIL + '\nSubjek: ' + subj + '\n\n' + body;
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ c.textContent = 'Tersalin ✓'; }, function(){ c.textContent = 'Gagal, salin manual'; });
        else c.textContent = 'Salin manual ya';
      });
      row.appendChild(a); row.appendChild(c); out.appendChild(p); out.appendChild(row);
    });

    /* muncul saat terlihat */
    var els = $$('.reveal, .zoom, .draw');
    if (io) io.disconnect();
    if (instant || reduce || !('IntersectionObserver' in W)){
      els.forEach(function(el){ el.classList.add('in'); });
    } else {
      io = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return;
          e.target.classList.add('in'); io.unobserve(e.target);
          if (e.target.classList.contains('stats')) countUp(e.target);
        });
      }, {threshold:.15, rootMargin:'0px 0px -6% 0px'});
      els.forEach(function(el){ io.observe(el); });
    }

    magnets(); cursorTargets();
    cache(); onScroll();
  }

  function tear(el, top, bottom){
    var n = 26, pts = [], i;
    for (i = 0; i <= n; i++) pts.push((i/n*100).toFixed(2) + '% ' + (top ? (Math.random()*7).toFixed(1) + 'px' : '0px'));
    for (i = n; i >= 0; i--) pts.push((i/n*100).toFixed(2) + '% ' + (bottom ? 'calc(100% - ' + (Math.random()*8).toFixed(1) + 'px)' : '100%'));
    el.style.clipPath = 'polygon(' + pts.join(',') + ')';
  }
  function tearTop(el){
    var n = 30, pts = ['0% 100%'];
    for (var i = 0; i <= n; i++) pts.push((i/n*100).toFixed(2) + '% ' + (8 + Math.random()*22).toFixed(1) + 'px');
    pts.push('100% 100%'); el.style.clipPath = 'polygon(' + pts.join(',') + ')';
  }

  function countUp(box){
    $$('.count', box).forEach(function(b){
      var m = /^(\d+)(.*)$/.exec(b.dataset.v || ''); if (!m) return;
      var to = +m[1], from = to >= 1000 ? to - 30 : 0, suf = m[2], t0 = null, dur = 1400;
      function step(t){
        if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        b.textContent = Math.round(from + (to - from) * e) + suf;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- 5. EFEK SCROLL ---------- */
  var C = {}, lastY = 0, ticking = false;
  function cache(){
    C.nav = $('#nav'); C.hero = $('#home'); C.heroInner = $('#heroInner'); C.par = $$('.parallax');
    C.links = $$('#menu a'); C.secs = C.links.map(function(a){ return $(a.getAttribute('href')); });
    C.steps = $('#steps'); C.stepEls = $$('.step'); C.fg = $('.wave .fg'); C.giant = $('#giant'); C.footer = $('#footer');
    C.bar = $('#progress');
  }
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var y = W.scrollY, vh = W.innerHeight, docH = D.documentElement.scrollHeight - vh;
      var wide = W.innerWidth > 760, admin = D.body.classList.contains('admin-on');
      if (C.bar) C.bar.style.width = (docH > 0 ? y / docH * 100 : 0) + '%';

      /* nav sembunyi saat turun, muncul saat naik */
      if (C.nav){ C.nav.classList.toggle('hide', y > 500 && y > lastY + 2 && !$('#menu').classList.contains('open')); if (y < lastY - 2) C.nav.classList.remove('hide'); }
      lastY = y;

      /* link aktif */
      var idx = 0; C.secs.forEach(function(s,i){ if (s && s.getBoundingClientRect().top < vh * .35) idx = i; });
      C.links.forEach(function(a,i){ a.classList.toggle('active', i === idx); });

      if (!reduce){
        /* hero: kamera mundur (zoom out + pudar) */
        if (C.heroInner && C.hero){
          var hp = clamp(y / (C.hero.offsetHeight || 1), 0, 1);
          if (wide && !admin){
            C.heroInner.style.scale = (1 - hp * .14).toFixed(4);
            C.heroInner.style.opacity = (1 - hp * .85).toFixed(3);
            C.heroInner.style.translate = '0 ' + (hp * 70).toFixed(1) + 'px';
            C.heroInner.style.filter = hp > .02 ? 'blur(' + (hp * 3).toFixed(2) + 'px)' : '';
            C.par.forEach(function(el){ el.style.translate = '0 ' + (-y * (+el.dataset.speed || 0)).toFixed(1) + 'px'; });
          } else {
            C.heroInner.style.scale = C.heroInner.style.opacity = C.heroInner.style.translate = C.heroInner.style.filter = '';
            C.par.forEach(function(el){ el.style.translate = ''; });
          }
        }
        /* proses: garis merah tergambar mengikuti scroll, lingkaran menyala */
        if (C.steps){
          var r = C.steps.getBoundingClientRect();
          var p = clamp((vh * .85 - r.top) / (r.height + vh * .25), 0, 1);
          if (C.fg) C.fg.style.setProperty('--p', (1 - p).toFixed(3));
          C.stepEls.forEach(function(s,i){ s.classList.toggle('on', p > (i / C.stepEls.length) + .04); });
        }
        /* footer: nama raksasa membesar */
        if (C.giant && C.footer){
          var fr = C.footer.getBoundingClientRect(), fp = clamp((vh - fr.top) / (fr.height || 1), 0, 1);
          C.giant.style.transform = 'scale(' + (.78 + fp * .22).toFixed(4) + ') translateX(' + ((1 - fp) * 6).toFixed(2) + '%)';
        }
      } else if (C.stepEls){ C.stepEls.forEach(function(s){ s.classList.add('on'); }); if (C.fg) C.fg.style.setProperty('--p', 0); }
    });
  }
  W.addEventListener('scroll', onScroll, {passive:true});
  W.addEventListener('resize', onScroll);

  /* ---------- 6. KURSOR KHUSUS & TOMBOL MAGNETIK (laptop saja) ---------- */
  var cur = { x:-100, y:-100, rx:-100, ry:-100 }, dot, ring, cursorOn = fine && !reduce;
  function cursorLoop(){
    cur.rx += (cur.x - cur.rx) * .25; cur.ry += (cur.y - cur.ry) * .25;
    ring.style.left = cur.rx + 'px'; ring.style.top = cur.ry + 'px';
    requestAnimationFrame(cursorLoop);
  }
  if (cursorOn){
    D.body.classList.add('has-cursor');
    dot = $('.c-dot'); ring = $('.c-ring');
    W.addEventListener('mousemove', function(e){ cur.x = e.clientX; cur.y = e.clientY; }, {passive:true});
    D.addEventListener('mouseleave', function(){ cur.x = cur.y = -100; });
    requestAnimationFrame(cursorLoop);
  }
  function cursorTargets(){
    if (!cursorOn) return;
    var c = $('#cursor');
    $$('[data-cursor="view"]').forEach(function(el){
      el.addEventListener('mouseenter', function(){ c.classList.add('big'); });
      el.addEventListener('mouseleave', function(){ c.classList.remove('big'); });
    });
    $$('#app a, #app button:not(.card), #app input, #app select, #app textarea').forEach(function(el){
      el.addEventListener('mouseenter', function(){ c.classList.add('link'); });
      el.addEventListener('mouseleave', function(){ c.classList.remove('link'); });
    });
  }
  function magnets(){
    if (!cursorOn) return;
    $$('.magnetic').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        el.style.translate = ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + 'px';
      });
      el.addEventListener('mouseleave', function(){ el.style.transition = 'translate .5s cubic-bezier(.3,1.5,.5,1), box-shadow .15s'; el.style.translate = ''; setTimeout(function(){ el.style.transition = ''; }, 500); });
    });
  }

  /* scroll halus (Lenis) — opsional; kalau gagal dimuat, web tetap normal */
  function smooth(){
    if (!fine || reduce) return;
    var s = D.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.onload = function(){
      if (!W.Lenis) return;
      try {
        var l = new W.Lenis({ lerp:.1, anchors:{ offset:-70 } });
        W.__lenis = l;
        (function raf(t){ l.raf(t); requestAnimationFrame(raf); })(0);
      } catch(e){}
    };
    D.head.appendChild(s);
  }

  /* ---------- 7. LOADER & INTRO ---------- */
  function start(){
    var t0 = performance.now();
    function go(){
      var wait = Math.max(0, 900 - (performance.now() - t0));
      setTimeout(function(){
        D.body.classList.remove('loading');
        D.body.classList.add('ready');
        setTimeout(function(){ D.body.classList.add('intro-done'); }, 3800);
      }, reduce ? 0 : wait);
    }
    if (D.fonts && D.fonts.ready) Promise.race([D.fonts.ready, new Promise(function(r){ setTimeout(r, 1800); })]).then(go);
    else go();
  }

  /* Slideshow: shared by cards and project details; no nested buttons. */
  function changeSlide(g, delta){
    var slides = $$('.project-slide',g), n = slides.length;
    if (n < 2) return;
    var current = ((+g.dataset.slide || 0) + delta + n) % n;
    g.dataset.slide = current;
    slides.forEach(function(slide,i){ slide.classList.toggle('active',i === current); slide.setAttribute('aria-hidden',i !== current); });
    $('.slide-count',g).textContent = (current + 1) + ' / ' + n;
  }
  D.addEventListener('click',function(e){
    var b = e.target.closest('[data-slide-action]'); if (!b) return;
    var g = b.closest('.project-gallery');
    if (b.dataset.slideAction === 'pause'){
      var paused = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed',paused); b.textContent = paused ? '▶' : 'Ⅱ'; b.setAttribute('aria-label',paused ? 'Putar slideshow' : 'Jeda slideshow');
    } else changeSlide(g,b.dataset.slideAction === 'next' ? 1 : -1);
  });
  setInterval(function(){
    if (D.hidden) return;
    $$('.project-gallery').forEach(function(g){
      var pause = $('[data-slide-action="pause"]',g), box = g.getBoundingClientRect();
      if (!pause || pause.getAttribute('aria-pressed') === 'true' || !g.getClientRects().length || box.bottom < 0 || box.top > W.innerHeight || g.matches(':hover') || g.contains(D.activeElement)) return;
      if ($('#modal.open') && !g.closest('#modal')) return;
      changeSlide(g,1);
    });
  },5000);

  /* ---------- 8. START ---------- */
  W.Folio = {
    render: render,
    get: function(){ return S; },
    set: function(data){ S = data; W.SITE = data; render(); },
    tear: tear
  };
  render();
  start();
  smooth();
})();
