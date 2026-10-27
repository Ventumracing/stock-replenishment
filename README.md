# Stock replenishment — Ventum House

Password-protected page showing which store products are below their floor target, how many units the warehouse (Sentinel K6) can cover, and how many need a PO.

- `index.html` — the page (GitHub Pages).
- `data.json` — the latest Cin7 stock check, AES-GCM encrypted with the team password (PBKDF2-SHA256). Only the check time and status are readable without it.
- `tools/encrypt.mjs` — used by the scheduled stock check to encrypt each new result.

Updated by the scheduled checks around 07:15 and 12:45 Dubai time.
