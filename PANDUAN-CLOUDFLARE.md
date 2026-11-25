# Penyambungan Cloudflare — untuk tahap selanjutnya


Belum ada deployment, perubahan DNS, resource database, atau pengaturan akun Cloudflare yang dilakukan pada pekerjaan ini. Instruksi ini untuk persiapan operator saat pemilik meminta penerbitan nanti.

## Tetap gunakan hosting lama

Repository portofolio sebelumnya: `kristantosaputra2-jpg/portofolio-kristanto`, branch produksi `main`. Pemeriksaan sebelumnya menunjukkan dua proyek Pages terhubung. Pastikan lewat dashboard proyek mana yang saat itu memiliki custom domain `kristantosaputra.my.id`; jangan menghapus atau mengganti proyek lain berdasarkan nama saja.

## Struktur deployment

- Root repository: `package.json`, `backend/`, `functions/`, `scripts/`, `public/`.
- Build command: `npm run build` (Node 24 LTS).
- Build output directory: **public**.
- `functions/api/[[path]].js` menyediakan API; `backend/service.mjs` adalah logika bersama tanpa modul Node khusus.
- `backend/server.mjs` hanya untuk server lokal dan tidak dijalankan oleh Pages.
- Folder `private/` **jangan** di-commit, diunggah, atau dimasukkan output build.

## Penyimpanan dan akun

1. Siapkan D1 khusus konten portofolio, tanpa mengubah database aplikasi lain.
2. Jalankan `backend/schema.sql` pada D1, kemudian impor `backend/seed.sql` untuk isi awal. Keduanya memakai CREATE IF NOT EXISTS/INSERT OR IGNORE.
3. Hubungkan D1 ke proyek Pages yang benar dengan binding **MRK_DB**. Pisahkan database preview dan produksi bila memakai keduanya; jangan membiarkan preview menulis database produksi.
4. Tambahkan konfigurasi server: **ADMIN_EMAIL**, **ADMIN_SALT**, **ADMIN_HASH**, **SITE_ORIGIN**. Tiga nilai akun diambil dari `private/admin.json` milik pemilik; jadikan hash dan salt sebagai secret server, bukan variabel JavaScript publik. Tidak diperlukan sandi asli di source/deployment.
5. Set SITE_ORIGIN ke `https://kristantosaputra.my.id` tanpa garis miring penutup; preview perlu origin preview sendiri. Akun adalah satu email pemilik, tanpa signup.
6. Pastikan public output hanya folder `public/`, lalu deploy ke proyek yang sama setelah diminta pemilik.
7. Verifikasi HTTPS, login salah/benar, draf privat, publikasi lintas browser, batalkan publikasi, pemulihan versi, gambar, dan video sebelum menyatakan produksi siap.

Pilihan menyimpan gambar kecil di D1 dipakai agar paket tidak memerlukan layanan upload tambahan. Gambar dibatasi 500 KB; video dan installer tidak masuk database. Jika koleksi gambar menjadi besar, pindahkan penyimpanan media ke R2 dengan API dan pemeriksaan hak akses yang sama. Periksa biaya/kuota akun sebelum menambah layanan.

Paket lokal menggunakan SQLite dengan skema yang sama. Bila ingin membawa perubahan yang telah dibuat secara lokal ke D1, lakukan ekspor/migrasi database terkontrol. `seed.sql` hanya berisi isi awal dan tidak membawa draf, unggahan, atau riwayat yang dibuat setelah paket dijalankan.

Dokumentasi resmi: https://developers.cloudflare.com/pages/functions/bindings/ dan https://developers.cloudflare.com/d1/ . Adapter Cloudflare belum diuji dalam deployment nyata karena pemilik meminta ZIP dahulu.
