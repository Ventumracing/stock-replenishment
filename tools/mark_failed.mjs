// Marks the latest check as failed without touching the encrypted stock list,
// so the page keeps showing the last good figures with a warning.
// Usage: node tools/mark_failed.mjs data.json STATUS "message"
import { readFileSync, writeFileSync } from 'node:fs';
const [, , path, status, message] = process.argv;
const env = JSON.parse(readFileSync(path, 'utf8'));
env.status = status || 'FAILED';
env.message = message || '';
env.checked_at = new Date().toISOString();
writeFileSync(path, JSON.stringify(env));
console.log('marked', env.status);
