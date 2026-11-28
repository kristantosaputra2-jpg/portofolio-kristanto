/* =====================================================================
   SCROLL ABOUT — video frame-per-frame di bagian "Tentang saya"
   - 192 frame WebP di assets/scroll-about/ digambar ke <canvas>
   - nomor frame & teks yang tampil ditentukan oleh posisi scroll
   - frame baru dimuat saat bagian About hampir terlihat (hemat kuota)
   Dipanggil dari js/main.js setelah halaman selesai dirender.
   ===================================================================== */
(function (W, D) {
  var TOTAL = 192;
  var src = function (i) { return 'assets/scroll-about/frame_' + String(i + 1).padStart(4, '0') + '.webp'; };

  var frames = [], loadingStarted = false, st = null, queued = false;
  var reduce = W.matchMedia('(prefers-reduced-motion: reduce)');

  function loadFrames() {
    if (loadingStarted) return;
    loadingStarted = true;
    for (var i = 0; i < TOTAL; i++) {
      (function (i) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () {
          if (!st) return;
          if (i === 0 || i === st.want) draw(st.want);
        };
        img.src = src(i);
        frames[i] = img;
      })(i);
    }
  }

  function ready(i) { var f = frames[i]; return f && f.complete && f.naturalWidth > 0; }

  // gambar frame i; kalau belum termuat, pakai frame terdekat yang sudah ada
  function draw(i) {
    if (!st) return;
    st.want = i;
    var j = i;
    while (j > 0 && !ready(j)) j--;
    if (!ready(j) || j === st.drawn) return;
    st.ctx.drawImage(frames[j], 0, 0, st.canvas.width, st.canvas.height);
    st.drawn = j;
  }

  function update() {
    queued = false;
    if (!st || !D.body.contains(st.section)) return;
    if (reduce.matches) { draw(TOTAL - 1); return; }

    var r = st.track.getBoundingClientRect();
    var dist = r.height - W.innerHeight;
    var p = dist > 0 ? Math.min(Math.max(-r.top / dist, 0), 1) : 1;

    draw(Math.min(TOTAL - 1, Math.floor(p * TOTAL)));

    var n = st.steps.length, idx = Math.min(n - 1, Math.floor(p * n));
    if (idx !== st.idx) {
      st.idx = idx;
      st.steps.forEach(function (s, k) { s.classList.toggle('on', k === idx); s.classList.toggle('past', k < idx); });
      st.dots.forEach(function (d, k) { d.classList.toggle('on', k <= idx); });
      st.num.textContent = String(idx + 1).padStart(2, '0');
      st.section.classList.toggle('sa-end', idx === n - 1);
    }
    st.bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  function onScroll() { if (!queued) { queued = true; W.requestAnimationFrame(update); } }

  W.initScrollAbout = function () {
    var section = D.querySelector('#about.sa');
    if (!section) return;
    var canvas = section.querySelector('.sa-canvas');
    st = {
      section: section,
      track: section.querySelector('.sa-track'),
      canvas: canvas,
      ctx: canvas.getContext('2d'),
      steps: Array.prototype.slice.call(section.querySelectorAll('.sa-step')),
      dots: Array.prototype.slice.call(section.querySelectorAll('.sa-dots i')),
      num: section.querySelector('.sa-num'),
      bar: section.querySelector('.sa-bar'),
      idx: -1, drawn: -1, want: 0
    };
    section.classList.toggle('sa-static', reduce.matches);

    // mulai memuat frame ketika About tinggal ±1,5 layar lagi
    if ('IntersectionObserver' in W) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { loadFrames(); io.disconnect(); }
      }, { rootMargin: '150% 0px' });
      io.observe(section);
    } else loadFrames();

    update();
  };

  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', onScroll);
  reduce.addEventListener && reduce.addEventListener('change', function () { if (st) { st.section.classList.toggle('sa-static', reduce.matches); st.idx = -1; update(); } });
})(window, document);
