# angika-switch-ops

**Angika ops teammates in Telegram**, powered by **[Switch](https://github.com/sandbox-quantum/switch)**.

Floor staff and AI agents (Ops, Catalog, Release) share one room for **online catalogue** pricing, UAT health, and rollback proposals. Risky actions need **admin Approve / Reject**.

## Demo video

**Watch:** [https://www.youtube.com/watch?v=k1gaMo8v6J8](https://www.youtube.com/watch?v=k1gaMo8v6J8)

Walkthrough script: [docs/DEMO.md](docs/DEMO.md).

## Why Switch is required (not optional)

| With Switch | Without Switch |
|-------------|----------------|
| Telegram group becomes a shared **room** with Rules | No room, no shared agent context |
| Cursor agents join as named teammates | Agents stay in a local IDE only |
| Humans + agents + handoffs in one thread | Copy-paste between tools |
| Trust rules (who may instruct; admin-only Approve) | No shared approval trail |

**If you remove Switch, this project stops working as designed** — the chat bridge, room Rules, and agent sessions disappear.

## Stack

| Layer | Choice |
|--------|--------|
| Bridge | **Switch Rooms** (mandatory) |
| Chat | Telegram |
| Agents | Cursor — `ops.rohit`, `catalog.rohit`, `release.rohit` |
| Data | `node tools/angika.mjs` → **mock** (default) or **UAT** |

## Reproduce in ~10 minutes

```bash
git clone https://github.com/rodeveloper9/angika-switch-ops.git
cd angika-switch-ops
cp .env.example .env          # ANGIKA_TOOLS_MODE=mock
chmod +x scripts/smoke.sh
./scripts/smoke.sh            # must print "smoke passed"
open web/index.html           # website-reuse stub
```

Then (Switch + Telegram — required for the full product):

1. Install [Switch Console](https://docs.switchagents.ai/switch-rooms/getting-started); **Settings → Agent providers → Cursor** signed in.  
2. Connect [Telegram](https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/telegram); group `angika_ops` + bot.  
3. Onboard agents from `agents/*.md` (**Directory** = this repo).  
4. Paste `rooms/angika-ops/RULES.md` into room Instructions.  
5. Run the live script in [docs/DEMO.md](docs/DEMO.md).

Live catalogue (optional): set `ANGIKA_TOOLS_MODE=uat` — **catalog tools use the public API (no token)**. `order-status` still needs `ANGIKA_API_TOKEN`. See [tools/README.md](tools/README.md).

## What it does

- **Catalog** — online offer-price combos near a ₹ target (`catalog-combo`) — verifiable on the website  
- **Ops** — UAT `health` / `order-status`, then hands off to Release  
- **Release** — `propose-rollback` only; non-admin Approve/Reject → tags owner + **Admin permission required**  
- **web/** — same collaboration story for a future website entry point  

## Tools

```bash
./scripts/smoke.sh
node tools/angika.mjs catalog-combo --target 329
node tools/angika.mjs propose-rollback
```

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/DEMO.md](docs/DEMO.md) | What to record in the demo video |
| [docs/TESTING.md](docs/TESTING.md) | CLI + Telegram scenarios |
| [docs/AGENTS.md](docs/AGENTS.md) | Providers (Cursor, etc.) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How pieces connect |
| [rooms/angika-ops/RULES.md](rooms/angika-ops/RULES.md) | Paste into Switch room |

## Security

- Default demo uses **mock** (no secrets).  
- Never commit `.env` / tokens.  
- UAT token is short-lived (~1 hour); refresh from admin login when needed.  
- No deploy/write without **admin** **Approved**.

## License

MIT
