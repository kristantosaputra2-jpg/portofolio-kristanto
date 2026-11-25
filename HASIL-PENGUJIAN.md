# Verifikasi paket tanpa pembayaran langsung

Midtrans dibatalkan oleh pemilik dan telah dihapus dari runtime, endpoint, konfigurasi, halaman dan pengujian pembayaran. Fitur dukungan hanya berupa tautan HTTPS opsional yang dikelola admin.

Pemeriksaan sintaks: 19 file runtime. Tes CMS dan HTTP lokal mencakup login, CSRF, draf, publikasi, pemulihan, konflik versi, akses media, validasi, data awal, tautan dukungan dan persistensi.

Deployment produksi menunggu login pemilik ke Cloudflare untuk menghubungkan D1, mengatur secret admin dan output public. Berkas private serta database lokal tidak boleh masuk repository atau output build.
