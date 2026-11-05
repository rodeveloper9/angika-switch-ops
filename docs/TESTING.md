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
node tools/angika.mjs stall-list
node tools/angika.mjs stall-combo --target 329
node tools/angika.mjs propose-rollback
node tools/angika.mjs order-status --q test
```

Expect `"ok": true`. Closest to 329 ≈ ₹328 (honey pack).

### Live UAT

```bash
ANGIKA_TOOLS_MODE=uat
ANGIKA_API_BASE_URL=https://uat.angikafoods.com
ANGIKA_API_TOKEN=<uat-admin-bearer-token>
```

Then the same commands. `stall-list` needs a valid token (~1 hour). `health` works without a token.

## B. Telegram scenarios (needs Switch)

Agent **Directory** = this repo. Prefer full names if aliases are unset.

| # | You send | Pass if |
|---|----------|---------|
| 1 | `catalog.rohit What stall pack is closest to 329? Use the angika tool.` | Runs tool; ₹ packs |
| 2 | `ops.rohit Check UAT/mock health with the tool.` | Summarizes health |
| 3 | `ops.rohit … then ask release.rohit for a UAT rollback proposal.` | Handoff → proposal |
| 4 | Teammate: `Rejected` | Tags owner + Admin permission required |
| 5 | Owner: `Approved` or `Rejected` | Decision accepted |
| 6 | Open `web/index.html` | Page loads |

Full recording order: [DEMO.md](DEMO.md).
