export const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const clone = v => JSON.parse(JSON.stringify(v));
export const date = v => new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'});
export function safeURL(v, image=false) {
 const s=String(v||'').trim();
 if (!image && /^\/demo\/[a-zA-Z0-9_./-]+(?:\?download=1)?$/.test(s) && !s.includes('..')) return s;
 if (/^https:\/\//i.test(s)) { try { return new URL(s).href; } catch { return ''; } }
 if (image && /^(\/api\/media\/[a-f0-9-]+|assets\/[\w./-]+)$/.test(s)) return s;
 return '';
}
export function videoID(value) {
 try { const u=new URL(value); if(u.protocol!=='https:') return ''; let id='';
 if(u.hostname==='youtu.be') id=u.pathname.slice(1);
 if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)) id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]||'';
 return /^[\w-]{11}$/.test(id)?id:''; } catch { return ''; }
}
export async function request(path, options={}) {
 const response=await fetch(path,{credentials:'same-origin',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
 let data; try { data=await response.json(); } catch { throw new Error('Server tidak dapat dihubungi. Jalankan paket melalui Mulai-Portofolio.cmd.'); }
 if(!response.ok) throw Object.assign(new Error(data.error||'Permintaan gagal.'),{status:response.status});
 return data;
}
export async function copy(text, button) {
 try { await navigator.clipboard.writeText(text); const original=button.textContent;button.textContent='Tersalin ✓';setTimeout(()=>button.textContent=original,1800); }
 catch { const box=document.createElement('textarea');box.value=text;document.body.append(box);box.select(); const success=document.execCommand('copy');box.remove();if(!success) alert('Pilih teks prompt lalu salin secara manual.'); }
}
export function fillPrompt(template, values) { return String(template||'').replace(/\{\{([a-z][a-z0-9_]*)\}\}/g,(all,key)=>Object.hasOwn(values,key)?values[key]:all); }
