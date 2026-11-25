import {safeURL} from './cms-common.js';
export const defaultSupport={enabled:false,mode:'link',title:'Traktir Kopi',message:'Jika catatan dan karya ini bermanfaat, kamu bisa mendukung pengembangannya dengan traktir kopi. Dukungan sepenuhnya sukarela.',buttonLabel:'Traktir Kopi ☕',url:''};
export function supportConfig(value) {
 const config={...defaultSupport,...value};
 const url=safeURL(config.url);
 return config.enabled === true && /^https:\/\//.test(url) ? {...config,url} : null;
}
export function mountSupport(value,before) {
 const config=supportConfig(value);document.getElementById('coffee-support')?.remove();
 if(!config || !before)return;
 const section=document.createElement('section');section.id='coffee-support';section.className='coffee-support wrap';
 const note=document.createElement('span');note.className='share-note';note.textContent='Boleh ikut menyemangati.';
 const heading=document.createElement('h2');heading.textContent=config.title;
 const text=document.createElement('p');text.textContent=config.message;
 const link=document.createElement('a');link.className='btn';link.href=config.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=config.buttonLabel;
 const small=document.createElement('small');small.textContent='Tautan membuka halaman dukungan. Materi tetap bisa diakses tanpa memberi dukungan.';
 section.append(note,heading,text,link,small);before.before(section);
}
