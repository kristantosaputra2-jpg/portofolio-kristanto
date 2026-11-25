const enc = new TextEncoder();
export const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
export const random = (size = 32) => hex(crypto.getRandomValues(new Uint8Array(size)));
export async function digest(text) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(text))); }
// Six independent 100k rounds remain compatible with Workers' per-call PBKDF2 limit.
export async function passwordHash(password, salt, rounds = 6) {
  let value = enc.encode(password);
  for (let i = 0; i < rounds; i++) {
    const key = await crypto.subtle.importKey('raw', value, 'PBKDF2', false, ['deriveBits']);
    value = new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:enc.encode(salt + ':' + i), iterations:100000}, key, 256));
  }
  return hex(value);
}
export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
export const headers = {
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'SAMEORIGIN',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Content-Security-Policy':"default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.youtube-nocookie.com; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'"
};
