# How to test

From the repo root:

```bash
cp -n .env.example .env
./scripts/smoke.sh
```

## A. CLI

### Mock (default — best for reproduce)

```bash
# ANGIKA_TOOLS_MODE=mock in .env
node tools/angika.mjs health
node tools/angika.mjs catalog-list
node tools/angika.mjs catalog-combo --target 329
node tools/angika.mjs propose-rollback
node tools/angika.mjs order-status --q test
```

Expect `"ok": true` and `priceType: "online"`. ₹329 often **exact** (Moringa 100gm + Sattu 500gm).

### Live UAT

```bash
ANGIKA_TOOLS_MODE=uat
ANGIKA_API_BASE_URL=https://uat.angikafoods.com
# ANGIKA_API_TOKEN=   # only needed for order-status
```

`catalog-*` and `health` use the **public** API (no token). Cross-check https://uat.angikafoods.com/products  
`order-status` needs an admin token (~1 hour).

## B. Telegram scenarios (needs Switch)

Agent **Directory** = this repo. Prefer full names if aliases are unset.

| # | You send | Pass if |
|---|----------|---------|
| 1 | `catalog.rohit What online pack is closest to 329? Use catalog-combo.` | Online prices; often exact ₹329 |
| 2 | `ops.rohit Check UAT/mock health with the tool.` | Summarizes health |
| 3 | `ops.rohit … then ask release.rohit for a UAT rollback proposal.` | Handoff → proposal |
| 4 | Teammate: `Rejected` | Tags owner + Admin permission required |
| 5 | Owner: `Approved` or `Rejected` | Decision accepted |
| 6 | Open `web/index.html` | Page loads |

Full recording order: [DEMO.md](DEMO.md).
