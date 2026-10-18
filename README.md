# Kristanto Saputra / Mr. K

Portofolio pribadi pendidik, pengembang, dan inovator digital. Dibangun dengan HTML, CSS, dan JavaScript terpisah, tanpa database atau proses build.

## Fitur

- Beranda portrait dengan logo resmi Mr. K, ikon sosial dan motion ringan.
- Navigasi binder/jurnal, layout responsif, dan dukungan reduced motion.
- Konten Indonesia/English, karya digital, studi kasus, Education Lab, profil pelatihan, kontak dan Store.
- Code Lab membaca repository publik GitHub, menampilkan sumber dan menyediakan tombol salin; preview file mandiri dijalankan pada iframe terisolasi.
- Font Caveat dan Comic Neue tersimpan lokal/tertanam; lisensi font ada di `assets/fonts/`.

## Menjalankan

Buka `index.html`, atau jalankan `npm run preview` jika Python tersedia lalu buka `http://127.0.0.1:8765`.

Tidak perlu `npm install`. `npm run check` memeriksa syntax JavaScript jika Node.js tersedia.

## Hosting statis

- Branch: `main`
- Direktori proyek dan output: root repository (`.`)
- Build command: tidak diperlukan
- Entry point: `index.html`

Rute memakai hash sehingga tidak membutuhkan rewrite server. Domain pribadi dapat disambungkan setelah hosting dipilih. Repository ini tidak mengaktifkan deployment otomatis.

## Mengubah konten

- `js/content.js`: identitas, kontak, pasangan teks ID/EN, data proyek dan referensi media.
- `js/studio.js`: pembuat konten modul dan studi kasus.
- `js/interface.js`: komposisi beranda dan ikon.
- `js/github-snapshot.js`: katalog awal metadata repository publik. Tombol sinkronisasi mengambil data terbaru untuk sesi browser.
- `css/`: gaya binder, tipografi, portrait dan responsivitas.
- `assets/images/`: aset visual yang digunakan proyek.

Kosongkan link yang belum tersedia. Jangan menambahkan statistik, testimonial, kredensial atau klaim dampak sebelum diverifikasi. Portrait hasil crop/pengolahan AI bukan bukti kegiatan; logo resmi tetap utuh.

## Batasan

Sumber Code Lab membutuhkan internet dan mengikuti batas API publik GitHub. Preview mendukung file HTML/CSS/JS mandiri, bukan build React/TypeScript/Python atau bundel seluruh repository. Kredensial GitHub tidak ditanam pada situs.

Alamat email, demo beberapa produk, screenshot per produk dan bukti dampak masih perlu dilengkapi. Canonical, sitemap dan alamat Open Graph absolut menunggu domain final. Pengujian browser dasar telah dilakukan; validasi perangkat fisik dan audit aksesibilitas lengkap belum dilakukan.

Kode dan aset personal tidak diberi lisensi penggunaan ulang secara otomatis. Hormati lisensi font serta lisensi pada masing-masing repository yang ditampilkan di Code Lab.
