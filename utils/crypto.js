// Encryption utilities using Web Crypto API

export async function encrypt(text, key) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await deriveKey(key, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(text));
  const out = new Uint8Array(28 + ct.byteLength);
  out.set(salt, 0);
  out.set(iv, 16);
  out.set(new Uint8Array(ct), 28);
  return btoa(String.fromCharCode(...out));
}

export async function decrypt(b64, key) {
  const raw = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
  const k = await deriveKey(key, raw.slice(0, 16));
  const iv = raw.slice(16, 28);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, raw.slice(28));
  return new TextDecoder().decode(pt);
}

export function obfuscate(text, ratio = 0.6) {
  const chars = '▓░▒░█░▒▓░▒░█▓░▒░▓█▓░▒░▓░▒▓░';
  return text.split('').map(c => {
    if (c === ' ') return ' ';
    return chars[Math.floor(Math.random() * chars.length)];
  }).join('');
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
