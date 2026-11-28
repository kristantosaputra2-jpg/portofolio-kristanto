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
