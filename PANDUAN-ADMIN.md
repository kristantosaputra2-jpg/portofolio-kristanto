# Panduan dashboard

Klik **Admin** di footer portofolio atau halaman Berbagi untuk membuka formulir login. Tautan ini hanya membuka halaman masuk; isi dashboard tetap memerlukan akun pemilik.

## Menyiapkan tutorial

1. Masuk ke `/admin` dengan akun pemilik.
2. Pilih **Tutorial**, lalu **+ Buat**.
3. Isi judul, ringkasan, kategori, sampul, dan pengantar.
4. Pada **Video dan tautan**, tempel tautan video YouTube. Tidak perlu mengunggah MP4.
5. Pada **Langkah panduan & prompt bertahap**, tambah langkah. Isi petunjuk dan prompt opsional; pindahkan urutannya dengan panah.
6. Klik **Simpan draf**, lalu **Pratinjau**. Draf hanya terbuka setelah login.
7. Klik **Terbitkan** jika siap. Tombol ini menayangkan isi pada server yang sedang Anda jalankan; pada paket lokal, hanya situs lokal yang berubah.

## Proyek siap pakai

Isi tautan **Unduh aplikasi jadi** dengan alamat asset rilis GitHub (installer/ZIP aplikasi), bukan arsip source jika pengguna masih harus membangun aplikasinya. Isi **Kode sumber GitHub** dengan repository. Lengkapi versi, perangkat, lisensi, dan status yang sesuai kenyataan. Tautan kosong tidak ditampilkan ke publik.

File video tetap di YouTube. Paket aplikasi tetap di GitHub Releases. Dashboard ini mengelola informasi dan tautannya; dashboard tidak mengunggah ke kedua layanan itu secara otomatis.

## Prompt dan penyesuaian

Tambahkan prompt pada tiap langkah tutorial atau buat konten berjenis Prompt. Jika membutuhkan penyesuaian, buka **Penyesuai prompt**:

- Tambahkan nama isian, misalnya Topik.
- Gunakan penanda sederhana, misalnya `topik`.
- Pilih jenis Teks, Teks panjang, Pilihan, atau Angka.
- Isi nilai awal dan daftar pilihan jika perlu.
- Tulis template prompt, misalnya `Buat kuis tentang {{topik}}.`
- Tanpa template khusus, hasil memakai gabungan prompt dari langkah panduan.

Isian pengunjung hanya dirangkai di browser dan tidak dikirim ke penyedia AI. Pengunjung menyalin hasilnya sendiri. Ini bukan layanan AI pembuat kode otomatis.

## Gambar

Gunakan tombol **Unggah / ganti gambar**. Pilih JPG, PNG, atau WebP. Gambar dikecilkan menjadi maksimal sisi 1.400 piksel, lalu dikompresi; batas hasil 500 KB. Simpan draf setelah unggah. Gambar draf hanya dapat diminta dengan sesi admin; baru bisa dilihat publik ketika digunakan oleh konten terbit.

## Riwayat dan publikasi

- **Simpan draf:** menyimpan tanpa mengubah konten publik.
- **Terbitkan:** menyimpan perubahan yang belum disimpan, lalu menerbitkan draf.
- **Batalkan publikasi:** menyembunyikan konten tanpa menghapus riwayatnya.
- **Riwayat versi → Pulihkan ke draf:** mengambil isi versi lama ke draf. Periksa pratinjau lalu terbitkan jika sesuai.
- Jika tab lain sudah mengubah konten, simpan ditolak untuk mencegah penimpaan. Salin perubahan penting Anda, lalu muat ulang.

## Traktir Kopi

Buka **Portofolio utama → Traktir Kopi**. Isi tautan halaman Trakteer milik Anda beserta judul, pesan, dan teks tombol. Centang tampilkan, simpan draf, periksa pratinjau, lalu terbitkan. Tautan wajib HTTPS. Tanpa tautan tombol tersembunyi. Semua materi tetap bebas diakses dan website tidak memproses pembayaran sendiri.

## Akun dan keluar

Tidak tersedia pendaftaran umum. Email dan verifier akun berada di sisi server. Klik **Keluar** saat selesai. Sandi tidak dapat diambil dari dashboard. Untuk mengatur ulang akun lokal, pemilik menjalankan `node scripts/set-admin.mjs` dan mengisi sendiri email serta sandi baru; kemudian mulai ulang server. Ini juga membatalkan sesi sebelumnya.
