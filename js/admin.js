/* =====================================================================
   ADMIN — panel untuk mengubah isi web tanpa coding.
   Buka: tambahkan #admin di alamat web, atau klik logo 5x → masukkan PIN.
   Perubahan langsung tampil (preview) + tersimpan otomatis sebagai draf
   di browser ini. "Terbitkan" → lihat js/storage.js.
   Catatan: PIN hanya penghalang ringan (web statis). Perubahan baru
   tayang untuk pengunjung setelah data.js baru diunggah.
   ===================================================================== */
(function(){
  'use strict';
  var D = document, W = window;
  var $ = function(s,c){ return (c||D).querySelector(s); };
  var ORIG = JSON.parse(JSON.stringify(W.SITE));
  var data = null, panel, body, tab = 'umum', renderT, built = false;

  /* ---------- skema form tiap tab ---------- */
  function thumbOpts(){ return Object.keys(W.THUMB_LABEL).map(function(k){ return [k, W.THUMB_LABEL[k]]; }); }
  function iconOpts(){ return Object.keys(W.ICON_LABEL).map(function(k){ return [k, W.ICON_LABEL[k]]; }); }
  function goOpts(){ return data.work.filters.map(function(f){ return [f.key, 'Saring: ' + f.label]; }).concat([['contact','Ke bagian Kontak']]); }

  var TABS = [
    { id:'umum', label:'Umum', fields:[
      { h:'Identitas' },
      { k:'brand.first', t:'text', l:'Nama depan' },
      { k:'brand.last', t:'text', l:'Nama belakang', d:'Tampil merah di sticky note.' },
      { k:'brand.degree', t:'text', l:'Gelar (opsional)', d:'Tampil kecil setelah nama di bagian Tentang. Tulis persis sesuai ijazah.' },
      { k:'brand.tag', t:'text', l:'Teks kecil di bawah logo' },
      { k:'brand.role', t:'text', l:'Peran (tulisan tangan di hero)' },
      { k:'brand.cta', t:'text', l:'Tombol di menu atas' },
      { h:'Pita berjalan' },
      { k:'ticker.words', t:'list', l:'Pita hitam (satu kata per baris)' },
      { k:'ticker.phrases', t:'list', l:'Pita kuning (satu kalimat per baris)' },
      { k:'ticker.speed', t:'range', l:'Kecepatan pita', min:40, max:160, step:5, d:'Detik per putaran. Makin besar = makin lambat.' },
      { h:'Footer & Google' },
      { k:'footer.copy', t:'text', l:'Teks hak cipta' },
      { k:'footer.base', t:'text', l:'Slogan paling bawah' },
      { k:'meta.title', t:'text', l:'Judul tab browser' },
      { k:'meta.description', t:'textarea', l:'Deskripsi untuk Google', d:'1–2 kalimat, muncul di hasil pencarian.' }
    ]},
    { id:'hero', label:'Hero', fields:[
      { k:'hero.nameSub', t:'text', l:'Sticky kuning (nama): teks kecil' },
      { k:'hero.todoTitle', t:'text', l:'Sticky to-do: judul' },
      { k:'hero.todo', t:'repeat', l:'Daftar to-do', max:4, title:'text', make:function(){ return { text:'tugas baru', done:false }; },
        fields:[ { k:'text', t:'text', l:'Tugas' }, { k:'done', t:'check', l:'Sudah dicoret ✓' } ] },
      { k:'hero.quote', t:'textarea', l:'Sticky biru: kutipan' },
      { k:'hero.quoteBy', t:'text', l:'Sticky biru: sumber' },
      { k:'hero.openTitle', t:'text', l:'Sticky pink: judul' },
      { k:'hero.openSub', t:'textarea', l:'Sticky pink: teks kecil' },
      { k:'hero.annos', t:'repeat', l:'3 catatan tulisan tangan', fixed:true, title:'title',
        fields:[ { k:'title', t:'text', l:'Judul' }, { k:'text', t:'text', l:'Keterangan' } ] },
      { k:'hero.badge', t:'text', l:'Teks lencana berputar', d:'Ideal ±35 huruf.' },
      { k:'hero.scroll', t:'text', l:'Tombol gulir' }
    ]},
    { id:'tentang', label:'Tentang', fields:[
      { k:'about.photo', t:'image', l:'Foto profil', max:900, d:'Kosongkan untuk memakai ilustrasi avatar.' },
      { k:'about.caption', t:'text', l:'Tulisan di bawah foto' },
      { k:'about.label', t:'text', l:'Label kecil' },
      { k:'about.hello', t:'text', l:'Sapaan baris 1' },
      { k:'about.prefix', t:'text', l:'Sapaan baris 2 (sebelum nama)' },
      { k:'about.bio', t:'list', l:'Bio (satu paragraf per baris)', rows:6 },
      { k:'about.tags', t:'list', l:'Tag keahlian (satu per baris)' },
      { k:'about.tools', t:'list', l:'Alat yang dipakai (satu per baris)' },
      { k:'about.stats', t:'repeat', l:'Angka', max:4, title:'value', make:function(){ return { value:'1', label:'keterangan' }; },
        fields:[ { k:'value', t:'text', l:'Angka', d:'Contoh: 5, 10+, 2026. Tulis yang benar-benar faktual.' }, { k:'label', t:'text', l:'Keterangan' } ] }
    ]},
    { id:'proyek', label:'Proyek', fields:[
      { k:'work.label', t:'text', l:'Label kecil' },
      { k:'work.title', t:'text', l:'Judul' },
      { k:'work.titleHl', t:'text', l:'Judul (bagian berstabilo)' },
      { k:'work.intro', t:'textarea', l:'Pengantar' },
      { k:'work.projects', t:'repeat', l:'Daftar proyek', title:'title', make:function(){ return { title:'Proyek baru', sub:'Keterangan singkat', cats:[], thumb:'ide', image:'', deco:'tape', statusType:'dev', status:'Dikembangkan', platform:'', problem:'', solution:'', users:'', stack:'', ai:'', note:'', link:'' }; },
        fields:[
          { k:'title', t:'text', l:'Nama proyek' },
          { k:'sub', t:'text', l:'Keterangan singkat' },
          { k:'statusType', t:'select', l:'Jenis status (warna label)', opts:function(){ return [['live','✅ Terpakai / terpasang (hijau)'],['proto','🧪 Prototipe (kuning)'],['dev','🛠️ Dikembangkan (biru)'],['concept','📝 Konsep / rancangan (abu)']]; } },
          { k:'status', t:'text', l:'Teks label status', d:'Contoh: Pernah dipakai, APK terpasang, Prototipe fungsional. Tulis apa adanya.' },
          { k:'platform', t:'text', l:'Platform', p:'Web / Android / Windows / LAN' },
          { k:'cats', t:'cats', l:'Kategori (untuk tombol saring)' },
          { k:'image', t:'image', l:'Gambar/screenshot', max:1000, d:'Kosongkan untuk memakai gambar bawaan. Samarkan data siswa!' },
          { k:'images', t:'repeat', l:'Gambar tambahan slideshow', title:'alt', make:function(){ return {src:'',alt:''}; }, fields:[
            { k:'src', t:'image', l:'Gambar', max:1600 },
            { k:'alt', t:'text', l:'Keterangan gambar' }
          ] },
          { k:'thumb', t:'select', l:'Gambar bawaan', opts:thumbOpts },
          { k:'deco', t:'select', l:'Hiasan', opts:function(){ return [['tape','Selotip'],['pin','Pin merah']]; } },
          { k:'problem', t:'textarea', l:'Masalah (1 kalimat)' },
          { k:'solution', t:'textarea', l:'Solusi (1–2 kalimat)' },
          { k:'users', t:'text', l:'Untuk siapa' },
          { k:'stack', t:'text', l:'Teknologi yang terbukti dipakai' },
          { k:'ai', t:'text', l:'AI di dalam produk (kosongkan jika tidak ada)', d:'Bukan AI yang membantu menulis kode.' },
          { k:'note', t:'textarea', l:'Catatan jujur (yang belum selesai)' },
          { k:'link', t:'text', l:'Link demo/proyek (opsional)' }
        ] },
      { k:'work.filters', t:'repeat', l:'Tombol saring', title:'label', make:function(){ return { key:'baru', label:'Baru' }; },
        fields:[ { k:'label', t:'text', l:'Nama tombol' }, { k:'key', t:'text', l:'Kode (huruf kecil, tanpa spasi)', d:'Dipakai untuk mencentang kategori proyek.' } ] },
      { k:'work.initial', t:'range', l:'Jumlah kartu yang langsung tampil', min:3, max:30, step:3, unit:'kartu', d:'Sisanya muncul setelah tombol "Tampilkan semua" diklik.' },
      { k:'work.moreAll', t:'text', l:'Teks tombol "Tampilkan semua"' },
      { k:'work.moreLabel', t:'text', l:'Tombol bawah: teks' },
      { k:'work.moreLink', t:'text', l:'Tombol bawah: link' }
    ]},
    { id:'keahlian', label:'Keahlian', fields:[
      { k:'expertise.title', t:'text', l:'Judul' },
      { k:'expertise.intro', t:'textarea', l:'Pengantar' },
      { k:'expertise.cards', t:'repeat', l:'3 kartu keahlian', fixed:true, title:'title',
        fields:[
          { k:'icon', t:'select', l:'Ikon', opts:iconOpts },
          { k:'title', t:'text', l:'Judul' },
          { k:'desc', t:'textarea', l:'Deskripsi' },
          { k:'items', t:'list', l:'Daftar centang (satu per baris)' },
          { k:'link', t:'text', l:'Teks link' },
          { k:'go', t:'select', l:'Link menuju', opts:goOpts }
        ] }
    ]},
    { id:'teknologi', label:'Teknologi', fields:[
      { k:'stack.label', t:'text', l:'Label kecil' },
      { k:'stack.titleHl', t:'text', l:'Judul (bagian berstabilo)' },
      { k:'stack.title', t:'text', l:'Judul (lanjutan)' },
      { k:'stack.intro', t:'textarea', l:'Pengantar (opsional)', d:'Kosongkan bila tidak perlu.' },
      { k:'stack.groups', t:'repeat', l:'Kelompok', max:16, title:'title', make:function(){ return { title:'Kelompok baru', note:'', items:[], foot:'' }; },
        fields:[ { k:'title', t:'text', l:'Judul' }, { k:'note', t:'text', l:'Keterangan kecil' }, { k:'items', t:'list', l:'Isi (satu per baris)' }, { k:'foot', t:'text', l:'Catatan bawah (opsional)' } ] }
    ]},
    { id:'proses', label:'Proses', fields:[
      { k:'process.label', t:'text', l:'Label kecil' },
      { k:'process.titleHl', t:'text', l:'Judul (bagian berstabilo)' },
      { k:'process.title', t:'text', l:'Judul (lanjutan)' },
      { k:'process.steps', t:'repeat', l:'Langkah', max:6, title:'title', make:function(){ return { title:'Langkah', sub:'keterangan', text:'' }; },
        fields:[ { k:'title', t:'text', l:'Judul' }, { k:'sub', t:'text', l:'Subjudul (merah)' }, { k:'text', t:'textarea', l:'Penjelasan' } ] },
      { k:'process.workedGroups', t:'repeat', l:'Konteks kerja (kelompok nama)', max:4, title:'label', make:function(){ return { label:'Kelompok baru', items:[] }; },
        fields:[ { k:'label', t:'text', l:'Judul kelompok' }, { k:'items', t:'list', l:'Nama (satu per baris)', rows:6, d:'Tulis nama lembaga persis sesuai ejaan resminya.' } ] }
    ]},
    { id:'kontak', label:'Kontak', fields:[
      { k:'contact.label', t:'text', l:'Label kecil' },
      { k:'contact.title', t:'textarea', l:'Judul besar', d:'Enter = pindah baris. Tanda "?" merah otomatis.' },
      { k:'contact.lead', t:'textarea', l:'Pengantar' },
      { k:'contact.email', t:'text', l:'Email' },
      { h:'Media sosial', d:'Kosongkan yang tidak dipakai, ikonnya otomatis hilang.' },
      { k:'contact.socials.instagram', t:'text', l:'Instagram (link)', p:'https://instagram.com/namamu' },
      { k:'contact.socials.tiktok', t:'text', l:'TikTok (link)', p:'https://tiktok.com/@namamu' },
      { k:'contact.socials.youtube', t:'text', l:'YouTube (link)', p:'https://youtube.com/@namamu' },
      { k:'contact.socials.whatsapp', t:'text', l:'WhatsApp (nomor)', p:'0812xxxx', d:'Nomor akan tampil publik. Pertimbangkan dulu.' },
      { k:'contact.socials.facebook', t:'text', l:'Facebook (link)' },
      { k:'contact.socials.linkedin', t:'text', l:'LinkedIn (link)' },
      { k:'contact.socials.website', t:'text', l:'Website lain (link)' },
      { h:'Formulir' },
      { k:'contact.formTitle', t:'text', l:'Judul formulir' },
      { k:'contact.purposes', t:'list', l:'Pilihan keperluan (satu per baris)' }
    ]},
    { id:'simpan', label:'💾 Simpan', fields:null }
  ];

  /* ---------- util path ---------- */
  function get(o, p){ return p.split('.').reduce(function(a,k){ return a == null ? a : a[k]; }, o); }
  function set(o, p, v){ var ks = p.split('.'), last = ks.pop(); var t = ks.reduce(function(a,k){ if (a[k] == null) a[k] = {}; return a[k]; }, o); t[last] = v; }
  function el(tag, cls, html){ var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function txt(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------- perubahan → preview + draf ---------- */
  function changed(immediate){
    clearTimeout(renderT);
    var run = function(){
      W.Folio.set(data);
      var ok = W.STORE.saveDraft(data);
      setStatus(ok ? 'Draf tersimpan otomatis ✓' : '⚠️ Draf gagal disimpan (foto terlalu besar?). Segera Terbitkan.', !ok);
    };
    if (immediate) run(); else renderT = setTimeout(run, 280);
  }
  function setStatus(m, warn){ var s = $('#adm-status'); if (s){ s.textContent = m; s.classList.toggle('warn', !!warn); } }

  /* ---------- builder field ---------- */
  function field(f, obj){
    if (f.h) return el('div', 'adm-h', '<b>' + txt(f.h) + '</b>' + (f.d ? '<small>' + txt(f.d) + '</small>' : ''));
    var wrap = el('div', 'adm-f'), id = 'af-' + Math.random().toString(36).slice(2,8);
    var lab = '<label for="' + id + '">' + txt(f.l) + '</label>';
    var hint = f.d ? '<small class="adm-hint">' + txt(f.d) + '</small>' : '';
    var v = get(obj, f.k), input;

    switch (f.t){
      case 'text':
        wrap.innerHTML = lab; input = el('input'); input.id = id; input.value = v || ''; if (f.p) input.placeholder = f.p;
        input.addEventListener('input', function(){ set(obj, f.k, input.value); changed(); });
        wrap.appendChild(input); break;
      case 'textarea':
        wrap.innerHTML = lab; input = el('textarea'); input.id = id; input.value = v || ''; input.rows = f.rows || 3;
        input.addEventListener('input', function(){ set(obj, f.k, input.value); changed(); });
        wrap.appendChild(input); break;
      case 'list':
        wrap.innerHTML = lab; input = el('textarea'); input.id = id; input.value = (v || []).join('\n'); input.rows = f.rows || Math.max(3, (v || []).length + 1);
        input.addEventListener('input', function(){ set(obj, f.k, input.value.split('\n').map(function(s){ return s.trim(); }).filter(Boolean)); changed(); });
        wrap.appendChild(input); break;
      case 'range':
        wrap.innerHTML = lab; input = el('input'); input.type = 'range'; input.id = id; input.min = f.min; input.max = f.max; input.step = f.step; input.value = v || f.min;
        var unit = f.unit || 'dtk', out = el('output', 'adm-out', (v || f.min) + ' ' + unit);
        input.addEventListener('input', function(){ set(obj, f.k, +input.value); out.textContent = input.value + ' ' + unit; changed(); });
        var row = el('div', 'adm-row'); row.appendChild(input); row.appendChild(out); wrap.appendChild(row); break;
      case 'check':
        wrap.className = 'adm-f adm-check'; input = el('input'); input.type = 'checkbox'; input.id = id; input.checked = !!v;
        input.addEventListener('change', function(){ set(obj, f.k, input.checked); changed(); });
        wrap.appendChild(input); wrap.appendChild(el('label', '', txt(f.l))); wrap.lastChild.htmlFor = id; break;
      case 'select':
        wrap.innerHTML = lab; input = el('select'); input.id = id;
        f.opts().forEach(function(o){ var op = el('option', '', txt(o[1])); op.value = o[0]; if (o[0] === v) op.selected = true; input.appendChild(op); });
        input.addEventListener('change', function(){ set(obj, f.k, input.value); changed(); });
        wrap.appendChild(input); break;
      case 'cats':
        wrap.innerHTML = '<label>' + txt(f.l) + '</label>';
        var box = el('div', 'adm-cats'), cur = v || [];
        data.work.filters.forEach(function(fl){
          var l = el('label', 'adm-chip'), cb = el('input'); cb.type = 'checkbox'; cb.checked = cur.indexOf(fl.key) > -1;
          cb.addEventListener('change', function(){
            var arr = (get(obj, f.k) || []).filter(function(x){ return x !== fl.key; });
            if (cb.checked) arr.push(fl.key);
            set(obj, f.k, arr); changed();
          });
          l.appendChild(cb); l.appendChild(D.createTextNode(fl.label)); box.appendChild(l);
        });
        wrap.appendChild(box); break;
      case 'image':
        wrap.innerHTML = '<label>' + txt(f.l) + '</label>';
        var prev = el('div', 'adm-img'), pick = el('input'); pick.type = 'file'; pick.accept = 'image/*'; pick.id = id;
        var btns = el('div', 'adm-row'), up = el('label', 'adm-btn', '📷 Pilih foto'), rm = el('button', 'adm-btn ghost', 'Hapus');
        up.htmlFor = id; rm.type = 'button';
        function show(){ var s = get(obj, f.k); prev.innerHTML = s ? '<img src="' + s + '" alt=""><span>' + Math.round(s.length * .75 / 1024) + ' KB</span>' : '<em>Belum ada foto</em>'; rm.style.display = s ? '' : 'none'; }
        pick.addEventListener('change', function(){
          var file = pick.files[0]; if (!file) return;
          prev.innerHTML = '<em>Memproses foto....</em>';
          shrink(file, f.max || 900, function(url){ set(obj, f.k, url); show(); changed(true); pick.value = ''; });
        });
        rm.addEventListener('click', function(){ set(obj, f.k, ''); show(); changed(true); });
        btns.appendChild(up); btns.appendChild(rm); wrap.appendChild(prev); wrap.appendChild(pick); wrap.appendChild(btns); show(); break;
      case 'repeat':
        return repeater(f, obj);
    }
    if (hint) wrap.insertAdjacentHTML('beforeend', hint);
    return wrap;
  }

  function repeater(f, obj){
    var wrap = el('div', 'adm-rep'), arr = get(obj, f.k);
    if (!Array.isArray(arr)){ arr = []; set(obj, f.k, arr); }
    wrap.appendChild(el('div', 'adm-h', '<b>' + txt(f.l) + '</b>' + (f.fixed ? '' : '<small>' + arr.length + ' item' + (f.max ? ' (maks ' + f.max + ')' : '') + '</small>')));
    arr.forEach(function(item, i){
      var d = el('details', 'adm-item'); if (item.__open){ d.open = true; delete item.__open; }
      var sum = el('summary', '', '<span>' + (i+1) + '. ' + txt(item[f.title] || 'Item') + '</span>');
      if (!f.fixed){
        var tools = el('span', 'adm-tools');
        [['↑','Naik',-1],['↓','Turun',1]].forEach(function(b){
          var bt = el('button', '', b[0]); bt.type = 'button'; bt.title = b[1];
          bt.disabled = (b[2] < 0 && i === 0) || (b[2] > 0 && i === arr.length - 1);
          bt.addEventListener('click', function(e){ e.preventDefault(); var j = i + b[2]; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; changed(true); draw(); });
          tools.appendChild(bt);
        });
        var del = el('button', 'del', '✕'); del.type = 'button'; del.title = 'Hapus';
        del.addEventListener('click', function(e){
          e.preventDefault();
          if (del.dataset.sure){ arr.splice(i, 1); changed(true); draw(); }
          else { del.dataset.sure = 1; del.textContent = 'Hapus?'; del.classList.add('sure'); setTimeout(function(){ if (del.isConnected){ delete del.dataset.sure; del.textContent = '✕'; del.classList.remove('sure'); } }, 2500); }
        });
        tools.appendChild(del); sum.appendChild(tools);
      }
      d.appendChild(sum);
      var inner = el('div', 'adm-item-body');
      f.fields.forEach(function(sf){
        var fe = field(sf, item);
        if (sf.k === f.title){ var inp = fe.querySelector('input'); if (inp) inp.addEventListener('input', function(){ sum.firstChild.textContent = (i+1) + '. ' + (inp.value || 'Item'); }); }
        inner.appendChild(fe);
      });
      d.appendChild(inner); wrap.appendChild(d);
    });
    if (!f.fixed && (!f.max || arr.length < f.max)){
      var add = el('button', 'adm-btn add', '+ Tambah'); add.type = 'button';
      add.addEventListener('click', function(){ var n = f.make(); n.__open = true; arr.push(n); changed(true); draw(); });
      wrap.appendChild(add);
    }
    return wrap;
  }

  /* foto: kecilkan di browser agar web tetap ringan */
  function shrink(file, max, cb){
    var r = new FileReader();
    r.onload = function(){
      var im = new Image();
      im.onload = function(){
        var k = Math.min(1, max / Math.max(im.width, im.height));
        var c = D.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', .8));
      };
      im.onerror = function(){ alertBox('File itu bukan gambar yang bisa dibaca.'); };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }

  /* ---------- tab Simpan ---------- */
  function saveTab(box){
    var json = JSON.stringify(data), kb = Math.round(json.length / 1024);
    var ph = (json.match(/\[ganti/gi) || []).length;
    box.innerHTML =
      '<div class="adm-h"><b>Terbitkan perubahan</b><small>Ukuran data: ' + kb + ' KB' + (kb > 1500 ? ' — agak besar, kurangi/kecilkan foto.' : '') + '</small></div>' +
      (ph ? '<p class="adm-warn">⚠️ Masih ada ' + ph + ' isian contoh bertanda [Ganti...]. Ganti dulu sebelum terbit.</p>' : '') +
      '<ol class="adm-steps"><li>Tekan <b>Terbitkan</b>, file <code>data.js</code> akan terunduh.</li><li>Buka repo GitHub → folder <code>js</code> → <i>Add file → Upload files</i> → pilih <code>data.js</code> tadi → <i>Commit</i>.</li><li>Tunggu 1–2 menit, lalu web online ikut berubah.</li></ol>' +
      '<div class="adm-col"><button class="adm-btn big" id="adm-pub">🚀 Terbitkan (unduh data.js)</button>' +
      '<button class="adm-btn ghost" id="adm-copy">📋 Salin isi data.js</button>' +
      '<label class="adm-btn ghost" for="adm-imp">📂 Buka data.js lain</label><input type="file" id="adm-imp" accept=".js,.json,text/javascript,application/json" hidden>' +
      '<button class="adm-btn danger" id="adm-reset">↺ Buang semua perubahan</button></div>' +
      '<p class="adm-msg" id="adm-msg" role="status"></p>' +
      '<div class="adm-h" style="margin-top:22px"><b>Keamanan</b></div>';
    box.appendChild(field({ k:'admin.pin', t:'text', l:'PIN admin', d:'Ingat PIN baru sebelum Terbitkan. PIN hanya penghalang ringan, bukan pengaman penuh.' }, data));
    var msg = $('#adm-msg', box);
    $('#adm-pub', box).onclick = function(){ W.STORE.publish(data).then(function(r){ msg.textContent = r.message; msg.className = 'adm-msg ' + (r.ok ? 'ok' : 'bad'); }); };
    $('#adm-copy', box).onclick = function(){
      var t = W.STORE.toDataJs(data);
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ msg.textContent = 'Tersalin ✓ Tempel ke file js/data.js (ganti seluruh isinya).'; msg.className = 'adm-msg ok'; }, function(){ msg.textContent = 'Gagal menyalin di sini.'; msg.className = 'adm-msg bad'; });
    };
    $('#adm-imp', box).onchange = function(){
      var f = this.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function(){
        try { var t = String(r.result); var obj = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
          if (!obj.brand || !obj.work) throw 0; data = obj; changed(true); draw(); msgBox('Data berhasil dibuka ✓'); }
        catch(e){ msg.textContent = 'File tidak dikenali. Pilih file data.js dari web ini.'; msg.className = 'adm-msg bad'; }
      };
      r.readAsText(f);
    };
    var rs = $('#adm-reset', box);
    rs.onclick = function(){
      if (!rs.dataset.sure){ rs.dataset.sure = 1; rs.textContent = 'Yakin? Klik sekali lagi'; setTimeout(function(){ if (rs.isConnected){ delete rs.dataset.sure; rs.textContent = '↺ Buang semua perubahan'; } }, 3000); return; }
      W.STORE.clearDraft(); data = JSON.parse(JSON.stringify(ORIG)); changed(true); draw(); msgBox('Kembali ke data asli.');
    };
  }
  function msgBox(m){ setTimeout(function(){ var x = $('#adm-msg'); if (x){ x.textContent = m; x.className = 'adm-msg ok'; } }, 30); }
  function alertBox(m){ setStatus('⚠️ ' + m, true); }

  /* ---------- panel ---------- */
  function draw(){
    var sc = body.scrollTop;
    $$('.adm-tabs button').forEach(function(b){ b.setAttribute('aria-selected', b.dataset.t === tab); });
    body.innerHTML = '';
    var t = TABS.filter(function(x){ return x.id === tab; })[0];
    if (!t.fields) saveTab(body);
    else t.fields.forEach(function(f){ body.appendChild(field(f, data)); });
    body.scrollTop = sc;
  }
  function $$(s,c){ return [].slice.call((c||D).querySelectorAll(s)); }

  function build(){
    if (built) return; built = true;
    panel = el('aside', 'adm-panel'); panel.setAttribute('aria-label', 'Panel admin'); panel.setAttribute('data-lenis-prevent', '');
    panel.innerHTML =
      '<div class="adm-top"><div><b>✏️ Admin</b><small id="adm-status">Perubahan langsung tampil di kiri</small></div>' +
      '<div class="adm-row"><button class="adm-ic" id="adm-min" title="Lihat hasil penuh">👁</button><button class="adm-ic" id="adm-out" title="Keluar admin">⏻</button></div></div>' +
      '<div class="adm-tabs" role="tablist">' + TABS.map(function(t){ return '<button role="tab" data-t="' + t.id + '">' + t.label + '</button>'; }).join('') + '</div>' +
      '<div class="adm-body"></div>';
    D.body.appendChild(panel);
    body = $('.adm-body', panel);
    $$('.adm-tabs button', panel).forEach(function(b){ b.onclick = function(){ tab = b.dataset.t; body.scrollTop = 0; draw(); }; });
    var fab = el('button', 'adm-fab', '✏️ Admin'); fab.type = 'button'; D.body.appendChild(fab);
    $('#adm-min', panel).onclick = function(){ D.body.classList.add('admin-min'); W.Folio.render(); };
    fab.onclick = function(){ D.body.classList.remove('admin-min'); W.Folio.render(); };
    $('#adm-out', panel).onclick = close;
  }

  function open(){
    build();
    var draft = W.STORE.loadDraft();
    data = draft ? fill(draft, W.SITE) : JSON.parse(JSON.stringify(W.SITE));
    D.body.classList.add('admin-on', 'intro-done'); D.body.classList.remove('admin-min');
    if (W.__lenis) W.__lenis.stop();
    W.Folio.set(data); draw();
    setStatus(draft ? 'Draf terakhir dimuat ✓' : 'Perubahan langsung tampil di kiri');
  }
  function close(){
    D.body.classList.remove('admin-on', 'admin-min');
    if (W.__lenis) W.__lenis.start();
    try { sessionStorage.removeItem('folio-admin'); } catch(e){}
    if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
    W.Folio.render();
  }

  /* draf lama: lengkapi bagian baru dari data.js agar tidak error */
  function fill(d, base){
    Object.keys(base).forEach(function(k){
      if (d[k] === undefined) d[k] = JSON.parse(JSON.stringify(base[k]));
      else if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof d[k] === 'object') fill(d[k], base[k]);
    });
    return d;
  }

  /* ---------- PIN ---------- */
  function ask(){
    try { if (sessionStorage.getItem('folio-admin') === '1') return open(); } catch(e){}
    if ($('.adm-lock')) return;
    var o = el('div', 'adm-lock',
      '<form class="adm-lock-box"><span class="tape"></span><b>Masuk Admin</b><label for="adm-pin">PIN</label>' +
      '<input id="adm-pin" type="password" inputmode="numeric" autocomplete="off"><p class="adm-err" role="alert"></p>' +
      '<div class="adm-row"><button type="submit" class="adm-btn big">Masuk</button><button type="button" class="adm-btn ghost" id="adm-cancel">Batal</button></div></form>');
    D.body.appendChild(o);
    var inp = $('#adm-pin', o); setTimeout(function(){ inp.focus(); }, 50);
    $('#adm-cancel', o).onclick = function(){ o.remove(); if (location.hash === '#admin') history.replaceState(null, '', location.pathname); };
    $('form', o).onsubmit = function(e){
      e.preventDefault();
      var pin = (W.STORE.loadDraft() || W.SITE).admin.pin;
      if (inp.value === String(pin)){ try { sessionStorage.setItem('folio-admin', '1'); } catch(x){} o.remove(); open(); }
      else { $('.adm-err', o).textContent = 'PIN salah.'; inp.select(); $('form', o).classList.remove('shake'); void o.offsetWidth; $('form', o).classList.add('shake'); }
    };
  }

  D.addEventListener('folio:admin', ask);
  W.addEventListener('hashchange', function(){ if (location.hash === '#admin') ask(); });
  if (location.hash === '#admin') ask();
})();
