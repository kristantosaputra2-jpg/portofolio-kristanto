/* =====================================================================
   STORAGE — tempat admin menyimpan perubahan.
   SEKARANG  : mode "local"  → draf disimpan di browser, "Terbitkan" =
               mengunduh data.js baru untuk diganti/di-upload manual.
   NANTI ONLINE: ganti isi fungsi di bawah (lihat contoh Supabase di
               README) — admin.js & main.js TIDAK perlu diubah.
   ===================================================================== */
(function(){
  var KEY = 'folio-draft-v1';

  function toDataJs(data){
    return '/* DATA ISI WEB — dibuat oleh Admin pada ' + new Date().toLocaleString('id-ID') + ' */\n' +
           'window.SITE = ' + JSON.stringify(data, null, 2) + ';\n';
  }

  window.STORE = {
    mode: 'local',

    /* Ambil draf terakhir (null jika tidak ada) */
    loadDraft: function(){
      try { var t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch(e){ return null; }
    },

    /* Simpan draf otomatis. Mengembalikan false bila gagal (mis. foto terlalu besar). */
    saveDraft: function(data){
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch(e){ return false; }
    },

    clearDraft: function(){ try { localStorage.removeItem(KEY); } catch(e){} },

    /* Terbitkan. Mode lokal: unduh data.js. Mengembalikan Promise<{ok, message}> */
    publish: function(data){
      return new Promise(function(resolve){
        try {
          var blob = new Blob([toDataJs(data)], {type:'text/javascript'});
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = 'data.js';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
          resolve({ ok:true, message:'File data.js sedang diunduh. Ganti file js/data.js dengan file ini.' });
        } catch(e){
          resolve({ ok:false, message:'Unduhan diblokir di tempat ini. Pakai tombol "Salin data".' });
        }
      });
    },

    toDataJs: toDataJs
  };
})();
