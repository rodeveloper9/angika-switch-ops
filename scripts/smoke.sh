#!/usr/bin/env bash
# One-command reproduce check (mock mode — no secrets).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export ANGIKA_TOOLS_MODE="${ANGIKA_TOOLS_MODE:-mock}"

echo "==> angika-switch-ops smoke (mode=$ANGIKA_TOOLS_MODE)"
node tools/angika.mjs health >/tmp/angika-smoke-health.json
node tools/angika.mjs catalog-list >/tmp/angika-smoke-catalog.json
node tools/angika.mjs catalog-combo --target 329 >/tmp/angika-smoke-combo.json
node tools/angika.mjs propose-rollback >/tmp/angika-smoke-rollback.json
node tools/angika.mjs order-status --q smoke-test >/tmp/angika-smoke-order.json

node -e '
const fs = require("fs");
for (const f of ["health","catalog","combo","rollback","order"]) {
  const j = JSON.parse(fs.readFileSync("/tmp/angika-smoke-" + f + ".json","utf8"));
  if (!j.ok) { console.error("FAIL", f, j); process.exit(1); }
  console.log("ok", f);
}
const combo = JSON.parse(fs.readFileSync("/tmp/angika-smoke-combo.json","utf8"));
if (combo.priceType !== "online") { console.error("FAIL expected online prices"); process.exit(1); }
const best = combo.exact?.[0] || combo.closest?.[0];
if (!best) { console.error("FAIL combo empty"); process.exit(1); }
console.log("smoke passed — online combo for 329:", best.total, "INR", best.diff === 0 ? "(exact)" : "(Δ "+best.diff+")");
'

echo "==> open web stub: open web/index.html"
echo "==> Switch is required for the Telegram room demo (see docs/DEMO.md)"
