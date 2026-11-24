# Portofolio Mr.K — Kristanto Saputra

Web portofolio gaya **scrapbook** dengan efek gerak dan **panel admin** untuk mengubah isi tanpa coding.
Domain tujuan: **kristantosaputra.my.id** (file `CNAME` sudah disiapkan).

## Isi terbaru (audit 23 Nov 2026)
- 13 karya (9 tampil dulu, sisanya lewat tombol **Tampilkan semua**) dengan **label status berwarna**: ✅ hijau = terpakai/terpasang · 🧪 kuning = prototipe · 🛠️ biru = dikembangkan · 📝 abu = konsep/rancangan.
- Detail proyek (klik kartu): Masalah · Solusi · Untuk siapa · Platform · Teknologi · AI di produk · Catatan jujur.
- Seksi **Alat yang dipakai**: 91 alat dalam 12 kelompok sticky note (atur di admin tab Teknologi).
- Proses 6 langkah: Masalah → Ide → Sketsa → Bangun → Uji → Serahkan.
- **Konteks kerja** dibagi 2 kelompok: *Sekolah, instansi & klien* dan *Program, pelatihan & komunitas* (atur di admin tab Proses).
- Foto asli di `assets/foto-kristanto.jpg` (ganti lewat admin tab Tentang, atau timpa file ini dengan nama sama).

## Struktur folder
```
index.html        ← kerangka halaman (jarang diubah)
CNAME             ← nama domain untuk GitHub Pages
css/style.css     ← tampilan + semua efek gerak
css/admin.css     ← tampilan panel admin
js/data.js        ← ⭐ SEMUA ISI WEB (teks, foto, link). Ini yang diganti oleh admin.
js/thumbs.js      ← ilustrasi bawaan (gambar proyek, avatar, ikon)
js/storage.js     ← tempat admin menyimpan (sekarang lokal; nanti bisa diganti ke server)
js/main.js        ← menyusun halaman dari data.js + efek scroll, kursor, dll.
js/admin.js       ← panel admin
assets/           ← foto & gambar (foto-kristanto.jpg)
```

## Cara menjalankan di laptop
- Klik dua kali `index.html`. Langsung jalan, tanpa install apa pun.
- Atau (disarankan, supaya mirip online): buka terminal di folder ini → `python -m http.server 8000` → buka `http://localhost:8000`.

Tanpa internet, web tetap jalan; hanya font Google dan scroll halus (Lenis) yang tidak termuat, otomatis pakai cadangan.

## Panel Admin
**Membuka:** tambahkan `#admin` di akhir alamat (contoh `kristantosaputra.my.id/#admin`), **atau** klik logo nama di kiri atas **5 kali** cepat.
**PIN awal:** `mrk123` → segera ganti di tab **💾 Simpan → PIN admin**.

| Tab | Yang bisa diubah |
|---|---|
| Umum | Nama, peran, tombol menu, kata-kata & **kecepatan pita berjalan**, footer, judul & deskripsi Google |
| Hero | Isi 4 sticky note, daftar to-do (bisa dicoret), 3 catatan tulisan tangan, lencana berputar |
| Tentang | **Foto profil**, keterangan foto, bio, tag, alat, angka statistik |
| Proyek | Tambah/hapus/urutkan proyek, **label status**, platform, **gambar/screenshot**, kategori, detail (masalah, solusi, pengguna, teknologi, AI di produk, catatan), tombol saring |
| Keahlian | 3 kartu: ikon, judul, deskripsi, daftar centang, tujuan link |
| Teknologi | 3 kelompok: alat bangun, AI di produk, AI rekan kerja |
| Proses | Langkah kerja (maks 6), daftar konteks kerja |
| Kontak | Email, **Instagram, TikTok, YouTube, WhatsApp, Facebook, LinkedIn, website** (kosong = ikon hilang), pilihan formulir |
| 💾 Simpan | Terbitkan, salin, buka data lain, buang perubahan, ganti PIN |

- Setiap ketikan **langsung tampil** di halaman kiri.
- Perubahan **tersimpan otomatis sebagai draf** di browser yang sama (tutup lalu buka lagi = draf masih ada).
- Foto otomatis **dikecilkan** di browser (maks ±900–1000 px, JPEG) agar web tetap ringan. Usahakan total data di bawah 1,5 MB.
- Tombol 👁 = sembunyikan panel untuk melihat hasil penuh; ✏️ Admin (kanan bawah) = buka lagi. Tombol ⏻ = keluar.

### Menerbitkan perubahan (GitHub)
1. Tab **💾 Simpan → 🚀 Terbitkan** → file `data.js` terunduh.
2. Buka repo di GitHub → folder `js` → **Add file → Upload files** → pilih `data.js` → **Commit changes**.
3. Tunggu 1–2 menit → kristantosaputra.my.id ikut berubah.

> ⚠️ PIN hanya penghalang ringan karena web ini statis (orang yang paham kode bisa melihatnya). Itu aman, sebab perubahan baru tayang untuk pengunjung **setelah** kamu upload `data.js` ke GitHub. Jangan menaruh data rahasia di web.
> Di preview Claude, unduhan diblokir; pakai **📋 Salin isi data.js** lalu tempel ke file `js/data.js`.

## Efek gerak yang terpasang
- Layar pembuka singkat, sticky note **jatuh & menempel** satu per satu, huruf PORTFOLIO muncul bergantian, **benang merah tergambar** dari pin ke pin.
- **Zoom out hero** saat menggulir (seperti kamera mundur + sedikit blur), **parallax** sticky note.
- Foto & kartu proyek **zoom in** berurutan saat masuk layar; tulisan muncul halus.
- **Stabilo dan coretan merah tergambar** sendiri; angka statistik **menghitung naik**.
- **Garis proses tergambar mengikuti scroll**, lingkaran 01–04 menyala bergantian.
- Nama raksasa di footer membesar; menu atas bersembunyi saat turun, muncul saat naik; garis progres merah di atas.
- Laptop saja: **kursor pensil** (kuning biasa, merah saat bisa diklik, muncul catatan "Lihat" di kartu proyek), **tombol magnetik**, **scroll halus** (Lenis).
- Pita berjalan **diperlambat** (90 detik/putaran, bisa diatur di admin) dan **berhenti saat disorot**.
- HP: efek berat dimatikan otomatis. Pengunjung dengan setelan "kurangi gerakan" → semua animasi mati.

## Online di kristantosaputra.my.id (GitHub Pages)
1. Upload seluruh isi folder ini ke repo GitHub (mis. `kristantosaputra.my.id` atau `portfolio`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / root → Save.
3. Isian **Custom domain**: `kristantosaputra.my.id` (file CNAME sudah ada) → centang **Enforce HTTPS** setelah tersedia.
4. Di pengelola DNS domain `.my.id`: buat 4 **A record** untuk `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus **CNAME** `www` → `<username>.github.io`. (Cek ulang IP di dokumentasi GitHub Pages saat memasang.)

## Nanti kalau mau admin online (tanpa upload ulang)
Ganti isi fungsi di `js/storage.js` (`loadDraft`, `saveDraft`, `publish`) agar membaca/menulis ke Supabase. `admin.js` dan `main.js` tidak perlu diubah. Saat itu juga perlu login sungguhan (Supabase Auth) menggantikan PIN.

## Catatan isi
- Angka & status proyek hanya fakta. Jangan isi angka karangan.
- Nomor WhatsApp yang diisi akan tampil publik.


## Pembaruan gambar dan proyek — 24 November 2026

- Aset asli dipasang pada kartu proyek yang cocok; proyek tanpa aset tetap memakai ilustrasi sebelumnya.
- Screenshot terbaru Kelasku, Lab Maya, dan SIAP Kelurahan dipakai. Screenshot SMPN 7 sudah masuk.
- Tiga proyek ditambahkan dengan komponen polaroid yang sama: Cepat Tepat Pangkat, Math Strike Force, dan website SMPN 5 Sanaman Mantikei. Klik Tampilkan semua untuk melihat seluruh 16 proyek.
- Slideshow otomatis setiap 5 detik, tombol sebelumnya/berikutnya/jeda, serta slideshow dalam detail proyek. Berhenti saat disorot, difokuskan, atau tab tidak aktif; mengikuti preferensi pengurangan animasi.
- Gambar tampil utuh (contain), tanpa crop atau peregangan. Status bar pada screenshot asli dipertahankan.
- Admin > Proyek > Gambar tambahan slideshow untuk menambah/menghapus/mengurutkan gambar. Gambar utama tetap tersedia seperti sebelumnya.
- Unggah semua isi ZIP, termasuk assets/projects, bukan hanya data.js.
