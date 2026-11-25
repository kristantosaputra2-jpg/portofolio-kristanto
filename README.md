# Portofolio Mr.K + Berbagi

Paket ZIP untuk ditinjau secara lokal. **Belum dideploy dan tidak mengubah website publik.**

## Mulai di laptop

1. Ekstrak seluruh ZIP ke satu folder.
2. Pastikan Node.js 24 LTS sudah terpasang. Tidak perlu `npm install` dan tidak ada paket berbayar.
3. Klik dua kali **Mulai-Portofolio.cmd**. Biarkan jendela tersebut tetap terbuka.
4. Buka **http://127.0.0.1:8787** untuk portofolio.
5. Buka **http://127.0.0.1:8787/berbagi.html** untuk koleksi publik.
6. Buka **http://127.0.0.1:8787/admin** untuk dashboard.

Gunakan email **kristantosaputra2@gmail.com** dan kata sandi yang sudah Anda tentukan di percakapan. Kata sandi tidak ditulis ulang di panduan atau file publik. Akun lokal sudah disiapkan sebagai verifier bersalt di `private/admin.json`.

Halaman admin dan konten dinamis harus dibuka melalui server lokal; jangan membuka `index.html` dengan klik ganda. Alternatif menjalankan dari terminal: `npm start`.

Jika port sedang dipakai, tutup jendela server lama. Untuk memilih port lain di PowerShell: `$env:PORT='8788'` lalu `npm start`; sesuaikan alamat browser.

## Yang tersedia

- Tampilan dan 16 karya portofolio sebelumnya dipertahankan.
- Menu Berbagi: pencarian, kategori, filter jenis, dan halaman detail dengan tautan langsung.
- Proyek: versi, status kesiapan, perangkat, lisensi, screenshot, unduh aplikasi, demo, kode sumber, dan pelaporan masalah.
- Tutorial: panduan tertulis, langkah berurutan, prompt siap salin, video YouTube yang dimuat setelah diklik.
- Prompt: koleksi prompt bertahap dan formulir penyesuaian berbasis template, tanpa biaya API AI.
- Dashboard: satu akun pemilik, tambah/edit konten, urutkan/hapus langkah, gambar, tautan, draf, pratinjau privat, terbitkan, batalkan publikasi, riwayat, dan pulihkan ke draf.
- Portofolio utama juga dapat disunting lewat formulir dashboard, bukan hanya menu Berbagi.

## Contoh isi

- Tutorial **Membuat kuis HTML dengan bantuan AI** dan **Prompt kuis HTML yang bisa disesuaikan** sudah tersedia sebagai contoh yang dapat diedit/dibatalkan publikasinya.
- Demo kuis perkalian tersedia di `public/demo/kuis.html`.
- File unduhan `public/demo/kuis-mandiri.html` adalah satu file HTML yang dapat dijalankan offline setelah diunduh; lisensi MIT khusus demo disertakan.
- LEWU CBT di katalog Berbagi masih **draf**. Catatan prototipe dari portofolio dipertahankan. Tautan rilis/source dan lisensi tidak dibuat-buat. Lengkapi dan tinjau sebelum diterbitkan.
- Tidak ada video atau repository baru yang diunggah/dibuat oleh paket ini.

## Data dan akses

Data tersimpan di `private/content.sqlite`, dibuat otomatis saat server dijalankan. Folder `private/` hanya untuk pemilik: jangan diunggah ke repository publik atau dijadikan folder situs. Server hanya melayani file dari `public/` dan mendengarkan localhost. Tidak ada pendaftaran akun umum. PIN browser lama telah dihapus dari paket ini.

Draf dan riwayat memerlukan sesi admin. Publik hanya menerima konten yang diterbitkan; mengetahui alamat dashboard saja tidak memberikan akses. Sesi memakai cookie HttpOnly, SameSite=Strict, kedaluwarsa delapan jam, dan Secure ketika memakai HTTPS. Permintaan perubahan memerlukan pemeriksaan asal serta token sesi tambahan. Percobaan login dibatasi. Kata sandi diverifikasi di server dengan salt acak dan enam putaran PBKDF2 SHA-256 masing-masing 100.000 iterasi.

Simpan cadangan folder `private/` setelah menghentikan server agar database dan unggahan lokal ikut tercadangkan. Jangan membagikan ZIP pemilik ini sebagai source proyek open source; yang dibagikan ke publik hanya repository masing-masing aplikasi.

## Sebelum online nanti

Integrasi **Cloudflare Pages Functions + D1** disertakan, tetapi belum dihubungkan atau diuji pada hosting sungguhan. Tahap penyambungan satu kali dijelaskan di **PANDUAN-CLOUDFLARE.md**. Setelah tersambung, konten di dashboard dapat diterbitkan tanpa unggah kode ulang. Tetap gunakan proyek Cloudflare/domain yang sudah ada; tidak perlu membuat website atau domain baru.

## Pemeriksaan

`npm run check` memeriksa sintaks dan pemisahan konfigurasi admin. `npm test` menjalankan tes login/CSRF, pemisahan draf-publik, konflik versi, publikasi/pemulihan, serta akses gambar. Catatan verifikasi dan batas pengujian ada di **HASIL-PENGUJIAN.md**.

## Dukungan Trakteer

Integrasi pembayaran langsung dibatalkan atas permintaan pemilik. Di dashboard, buka Portofolio utama → Traktir Kopi, isi tautan halaman Trakteer milik Anda, lalu aktifkan jika siap. Tanpa tautan tombol tetap tersembunyi. Tidak ada QRIS atau pemrosesan uang di website.
