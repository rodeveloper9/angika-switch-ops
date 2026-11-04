# Angika tools

CLI that Switch agents run from the repo working directory.

```bash
node tools/angika.mjs health
node tools/angika.mjs stall-list
node tools/angika.mjs stall-combo --target 329
node tools/angika.mjs propose-rollback
node tools/angika.mjs order-status --q 9876543210
```

## Modes

| `ANGIKA_TOOLS_MODE` | Behaviour |
|---------------------|-----------|
| `mock` | Reads `tools/mock/*.json` (no network, no token) |
| `uat` | Live UAT. Public `health` needs no token. Stall/orders need `ANGIKA_API_TOKEN` |

## UAT token

Stall prices are **admin-only** (shopper `/api/products` hides them).

1. Sign in to https://uat.angikafoods.com/admin  
2. DevTools → Application → Local Storage → copy the Cognito / auth **access token** (or whatever the admin app stores as Bearer)  
3. Put it in `.env` as `ANGIKA_API_TOKEN=...`  
4. Set `ANGIKA_TOOLS_MODE=uat`

Never commit `.env`.

## Agent contract

- Catalog: always prefer `stall-list` / `stall-combo` over guessing.  
- Ops: `health`, `order-status`.  
- Release: `propose-rollback` only; execute nothing until the room has **Approved**.
