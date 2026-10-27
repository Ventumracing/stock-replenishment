// Encrypts the stock check result for the replenishment page.
// Usage: REPLEN_PASSWORD=... node tools/encrypt.mjs <input.json> <output data.json>
// input.json: {"checked_at": ISO, "status": "OK"|..., "message": "", "target_set": ISO, "tracked": n, "rows": [...]}
// Output: {"v":1,"kdf":"PBKDF2-SHA256","iter":250000,"salt":b64,"iv":b64,"ct":b64,"checked_at":ISO,"status":...}
// Only checked_at and status are left readable (so the page can say when it last updated before unlocking).
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [, , inPath, outPath] = process.argv;
const password = process.env.REPLEN_PASSWORD;
if (!inPath || !outPath || !password) {
  console.error('usage: REPLEN_PASSWORD=... node tools/encrypt.mjs input.json data.json');
  process.exit(1);
}
const payload = JSON.parse(readFileSync(inPath, 'utf8'));
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const iter = 250000;
const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
  baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload))));
const b64 = (u) => Buffer.from(u).toString('base64');
writeFileSync(outPath, JSON.stringify({
  v: 1, kdf: 'PBKDF2-SHA256', iter, salt: b64(salt), iv: b64(iv), ct: b64(ct),
  checked_at: payload.checked_at, status: payload.status
}));
console.log(`encrypted ${payload.rows ? payload.rows.length : 0} rows -> ${outPath}`);
