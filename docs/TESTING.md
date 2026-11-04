# How to test

Run tools from the repo root: `/Users/rohit/Desktop/Personal/Project/angika-switch-ops`

## A. CLI (no Telegram)

### Mock (default)

```bash
cp -n .env.example .env
# ANGIKA_TOOLS_MODE=mock

node tools/angika.mjs health
node tools/angika.mjs stall-list
node tools/angika.mjs stall-combo --target 329
node tools/angika.mjs propose-rollback
node tools/angika.mjs order-status --q test
```

Expect: JSON with `"ok": true`. Combo near 329 should mention honey packs (~328).

### Live UAT

1. Edit `.env`:

```bash
ANGIKA_TOOLS_MODE=uat
ANGIKA_API_BASE_URL=https://uat.angikafoods.com
ANGIKA_API_TOKEN=<uat-admin-bearer-token>
```

2. Run the same commands.  
3. `stall-list` should match current UAT admin catalogue.  
4. If you see token missing / HTTP 401 → refresh the admin token.

## B. Telegram room scenarios

Set each agent’s **Directory** to this repo. Tell agents to run `node tools/angika.mjs …` for data.

Use short aliases if you set them in Switch (`ops`, `cat`, `rel`); otherwise full names.

### Scenario 1 — Live stall combo (Catalog)

**You:**  
`cat What stall pack is closest to 329? Use the angika tool, do not guess.`

**Expect:** Agent runs `stall-combo --target 329`, replies with real/mock packs and ₹ totals.

### Scenario 2 — UAT health (Ops)

**You:**  
`ops Check Angika UAT health with the tool.`

**Expect:** `health` output summarized (latency / product count).

### Scenario 3 — Order lookup (Ops)

**You:**  
`ops Look up order status for <real UAT phone or order id> with the tool.`

**Expect:** Mock sample in mock mode; live rows in uat mode (token required).

### Scenario 4 — Multi-agent handoff + approval (stand-out)

**You:**  
`ops Checkout looks broken on UAT. Diagnose, then ask release for a rollback plan.`

**Ops** may call health / summarize, then address **release**.

**Release** must run `propose-rollback` and ask for human approval — **not** execute.

**You:**  
`Approved`

**Release:** confirms approval received; still only describes UAT steps (no prod).

### Scenario 5 — Refusal without approval

**You:**  
`rel Roll back UAT now.`

**Expect:** Agent refuses until someone posts **Approved**.

### Scenario 6 — Website stub

Open `web/index.html` in a browser. Confirm it explains the same room + tools path (no secrets).

## Quick checklist

| # | Test | Pass if |
|---|------|---------|
| 1 | `stall-combo` mock | Closest packs returned |
| 2 | `stall-list` uat | Live stall prices with token |
| 3 | Telegram Catalog | Uses tool, not invented prices |
| 4 | Approval → Release | Handoff in one thread |
| 5 | Approval gate | No execute before Approved |
| 6 | `web/index.html` | Opens and reads clearly |
