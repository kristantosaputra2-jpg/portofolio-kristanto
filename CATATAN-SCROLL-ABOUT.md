# Perubahan: Bagian "Tentang saya" jadi Scroll Video

Polaroid foto lama di bagian **Tentang saya** diganti dengan video frame per frame (badan berputar, jaket berganti seragam ASN). Video digambar ke `<canvas>` dan bergerak mengikuti scroll. Semua teksnya tetap ada, hanya sekarang muncul bergantian:

| Langkah | Isi |
|---|---|
| 01 | "Tentang saya", "Halo, saya Kristanto Saputra S.Pd.", keterangan foto |
| 02 | Paragraf bio 1 (guru ASN, SMPN 5 Sanaman Mantikei) |
| 03 | Paragraf bio 2 (listrik dan sinyal) |
| 04 | Paragraf bio 3 (membangun dengan AI) |
| 05 | Tag keahlian dan tiga angka statistik |

Teks tetap diambil dari data About, jadi kalau bio, tag, atau statistik diubah lewat dashboard admin, tampilan ini ikut berubah. Jumlah langkah menyesuaikan sendiri dengan jumlah paragraf bio.

## File yang berubah atau ditambah

- `public/js/main.js`: fungsi `tAbout()` diganti, dan `initScrollAbout()` dipanggil setelah render.
- `public/js/scroll-about.js` **(baru)**: memuat frame dan menghubungkan scroll ke frame serta teks.
- `public/css/scroll-about.css` **(baru)**: tampilan kartu gelap, versi HP, dan versi tanpa animasi.
- `public/index.html`: menambahkan dua baris untuk memuat CSS dan JS baru.
- `public/assets/scroll-about/` **(baru)**: 192 frame WebP, total ±2,9 MB.

Foto lama `assets/foto-kristanto.jpg` tidak dihapus, hanya tidak dipakai di bagian ini lagi.

## Cara mencoba

Jalankan seperti biasa (lihat README.md), lalu buka halaman utama dan scroll sampai bagian Tentang saya.

## Yang bisa diatur

| Mau apa | Ubah di mana |
|---|---|
| Scroll lebih panjang atau pendek | `css/scroll-about.css`, angka `85vh` di `.sa-track` |
| Posisi video di laptop | `.sa-canvas { width:66% }` dan `mask-image` |
| Ganti video | Isi ulang folder `assets/scroll-about/` (nama `frame_0001.webp` dst.), lalu ubah `TOTAL` di `js/scroll-about.js` |

Membuat frame dari video baru:

```bash
ffmpeg -i video.mp4 -an -c:v libwebp -quality 72 public/assets/scroll-about/frame_%04d.webp
```

## Catatan

- Frame baru mulai diunduh saat pengunjung mendekati bagian Tentang saya, jadi halaman awal tetap cepat terbuka.
- Pengunjung yang mematikan animasi di perangkatnya akan melihat versi diam: foto akhir (seragam ASN) dan semua teks sekaligus.
- Sudah dicek di ukuran laptop (1440px), HP (390px), dan mode tanpa animasi. `npm run check` dan `npm test` lulus.

## Update: bisa dibuka dengan klik dua kali

`public/index.html` sekarang bisa dibuka dengan klik dua kali. Kalau dibuka dari `file://`, browser memblokir `bootstrap.js`, jadi halaman tadinya berhenti di layar "Menyiapkan catatan...". Sekarang setelah ±2,5 detik, tampilan dimuat langsung dari `js/data.js`.

Dalam mode klik dua kali ini, menu Berbagi, tombol Admin, dan konten dari dashboard tidak muncul. Untuk melihat versi lengkap, tetap jalankan lewat server (`npm start` atau Live Server).

File yang berubah: `public/index.html` (skrip cadangan) dan `public/js/bootstrap.js` (penanda `window.__folioBoot`).

## Update 3: video baru, redaksi "web developer", tata letak kreatif

**Video.** Frame diganti dari video baru (0 sampai 6,4 detik, tanpa medali), sekarang 153 frame dengan total ±2,1 MB. Nilai `TOTAL` di `js/scroll-about.js` sudah disesuaikan.

**Redaksi.** Teks bagian ini sekarang ada di file tersendiri, **`public/js/scroll-story.js`**. Edit langsung di situ. Tulis `*kata*` untuk memberi stabilo kuning.

| Langkah | Tata letak | Isi |
|---|---|---|
| 01 | `hello` | "Halo, saya" (serif miring) + **Tot.** raksasa + nama lengkap tulisan tangan |
| 02 | `role` | **WEB** bergaris luar + **DEVELOPER** padat, "yang kebetulan juga guru ↘" |
| 03 | `offline` | *Ringan.* / **CEPAT.** / stiker kuning "Tetap jalan tanpa sinyal." |
| 04 | `build` | "Bukan cuma untuk sekolah." + 6 bidang karya bernomor dalam 2 kolom |
| 05 | `final` | *Guru di kelas.* **Developer di layar.**, angka statistik, tag, tombol "Lihat karya saya" |

**Font baru** (dari Google Fonts): Instrument Serif (miring elegan) dan JetBrains Mono (label bernuansa kode). Font ini dipadukan dengan Archivo, Bricolage, Hanken, dan Patrick Hand yang sudah ada.

**Yang masih dari dashboard admin:** angka statistik dan tag. Tag saat ini masih bernuansa pendidikan. Kalau mau, ganti lewat dashboard, misalnya menjadi Web App, Offline-first, Supabase, dan AI.

**Catatan:** paragraf bio lama di dashboard tidak dipakai lagi di bagian ini. Situs yang sudah online tetap mengambil teks dari `scroll-story.js`, jadi setelah file itu diedit perlu deploy ulang.

File yang berubah: `js/main.js` (`tAbout`), `js/scroll-story.js` (baru), `js/scroll-about.js`, `css/scroll-about.css`, `index.html` (font + script), dan `assets/scroll-about/` (frame baru).

Sudah dicek di laptop 1440px, HP 390px, mode tanpa animasi, dan saat dibuka dengan klik dua kali. `npm run check` dan `npm test` lulus.

## Update 4: nama asli, penghargaan, redaksi peran

- Langkah 01 sekarang menampilkan nama lengkap **KRISTANTO SAPUTRA** dengan S.Pd. tulisan tangan. Sebutan "Tot" sudah dihapus.
- Langkah 02: catatan diganti jadi "sekaligus guru di pedalaman Kalimantan". Paragrafnya: Guru Pendidikan Agama Kristen yang mengajar Matematika serta Koding & Kecerdasan Artifisial.
- Langkah 05: angkanya sekarang **2025 Gemini Educator · 2026 ZEP Quiz Global Ambassador · 25+ proyek · 5 tahun memimpin sekolah**. Angka ini disimpan di `scroll-story.js` (bagian `stats`), jadi tidak tertimpa data dashboard.
