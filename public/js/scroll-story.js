/* =====================================================================
   REDAKSI SCROLL "TENTANG SAYA"
   Edit teks di sini. Setiap blok = satu langkah saat di-scroll.
   - *kata*  → diberi stabilo kuning
   - layout  → bentuk tata letak (hello, role, offline, build, final)
   Angka di langkah terakhir diambil dari 'stats' di bawah.
   Tag tetap diambil dari data About (dashboard admin).
   ===================================================================== */
window.SCROLL_STORY = [
  {
    layout: 'hello',
    code: '// tentang-saya',
    kicker: 'Halo, saya',
    big: 'Kristanto\nSaputra',
    note: 'S.Pd.',
    text: 'Saya *membangun web*: dari halaman profil yang rapi sampai sistem yang dipakai setiap hari.'
  },
  {
    layout: 'role',
    code: '<role>',
    big: ['Web', 'Developer'],
    note: 'sekaligus guru di pedalaman Kalimantan',
    text: 'Saya Guru Pendidikan Agama Kristen, namun di SMP Negeri 5 Sanaman Mantikei saya mengajar *Matematika* serta *Koding & Kecerdasan Artifisial*. Di luar kelas, saya merancang, menulis kode, dan merilis aplikasi.'
  },
  {
    layout: 'offline',
    code: '// dari pedalaman Kalimantan Tengah',
    lines: ['Ringan.', 'Cepat.', 'Tetap jalan tanpa sinyal.'],
    text: 'Di tempat saya bekerja, listrik bisa padam dan sinyal bisa hilang kapan saja. Karena itu setiap web yang saya buat harus kuat di kondisi paling sulit, dan hasilnya terasa makin enak di kondisi normal.'
  },
  {
    layout: 'build',
    code: '// yang saya bangun',
    title: 'Bukan cuma untuk *sekolah*.',
    items: [
      { k: 'Website bisnis & wisata', v: 'Step by Steph Tour, dwibahasa' },
      { k: 'Layanan publik',          v: 'SIAP Kelurahan, antrean warga' },
      { k: 'Agen AI & otomasi',       v: 'Q-Sat Edu, PenaPintar AI' },
      { k: 'Aplikasi Android',        v: 'MyStep, Lab Maya' },
      { k: 'Sistem sekolah',          v: 'Kelasku, SIMFONI, LEWU CBT' },
      { k: 'Game & media interaktif', v: 'Math Strike Force, BlockKode' }
    ],
    foot: 'Ada yang sudah dipakai, ada yang masih prototipe. Statusnya saya tulis apa adanya di setiap karya.'
  },
  {
    layout: 'final',
    lines: ['Guru di kelas.', 'Developer di layar.'],
    stats: [
      { value: '2025', label: 'Gemini Educator' },
      { value: '2026', label: 'ZEP Quiz Global Ambassador' },
      { value: '25+',  label: 'Proyek & rancangan digital' },
      { value: '5',    label: 'Tahun memimpin sekolah (2020–2025)' }
    ],
    cta: { text: 'Lihat karya saya', href: '#work' }
  }
];
