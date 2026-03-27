// NOETICA — Crypto utilities (inline from main.js)
export async function encryptData(text, key) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const k = await _deriveKey(key, salt)
  const ct = await crypto.subtle.encrypt({name:'AES-GCM',iv}, k, new TextEncoder().encode(text))
  const out = new Uint8Array(28 + ct.byteLength)
  out.set(salt,0); out.set(iv,16); out.set(new Uint8Array(ct),28)
  return btoa(String.fromCharCode(...out))
}
export async function decryptData(b64, key) {
  const raw = new Uint8Array(atob(b64).split('').map(c=>c.charCodeAt(0)))
  const salt = raw.slice(0,16)
  const iv = raw.slice(16,28)
  const ct = raw.slice(28)
  const k = await _deriveKey(key, salt)
  const pt = await crypto.subtle.decrypt({name:'AES-GCM',iv}, k, ct)
  return new TextDecoder().decode(pt)
}
async function _deriveKey(pw, salt) {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), {name:'PBKDF2'}, false, ['deriveKey'])
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'}, keyMaterial, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt'])
}
export function obfuscate(str, amt=0.6) {
  return str.split('').map((c,i) => Math.random()>amt?'*':c).join('')
}
