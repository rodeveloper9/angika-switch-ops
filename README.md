# angika-switch-ops

**Angika ops teammates in chat**, powered by **[Switch](https://github.com/sandbox-quantum/switch)**.

Humans and AI agents share one Telegram room (`#angika-ops`). Agents use live **UAT tools** (or mock) for stall prices, health, and orders. Risky actions wait for **human approval**.

> Switch does **not** ship a model — it starts an agent provider you already use (Cursor recommended).

## Stack

| Layer | Choice |
|--------|--------|
| Bridge | Switch Rooms |
| Chat | Telegram |
| Agents | Cursor — Ops / Catalog / Release (aliases `ops`, `cat`, `rel`) |
| Data | `node tools/angika.mjs` → mock or UAT admin API |

## Quick start

1. Install [Switch Console](https://docs.switchagents.ai/switch-rooms/getting-started); sign in **Cursor** under Agent providers.
2. Connect [Telegram](https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/telegram); use room `#angika-ops`.
3. Onboard agents from `agents/*.md` with **Directory** = this repo. Set short aliases `ops`, `cat`, `rel` if Switch offers them.
4. Paste [rooms/angika-ops/RULES.md](rooms/angika-ops/RULES.md) into room Rules.
5. Copy `.env.example` → `.env`. Start with `ANGIKA_TOOLS_MODE=mock`, then switch to `uat` + `ANGIKA_API_TOKEN` for live stall data (see [tools/README.md](tools/README.md)).
6. Open [web/index.html](web/index.html) for the website-reuse story.
7. Follow [docs/TESTING.md](docs/TESTING.md) for every scenario.

## Tools

```bash
node tools/angika.mjs health
node tools/angika.mjs stall-list
node tools/angika.mjs stall-combo --target 329
node tools/angika.mjs propose-rollback
node tools/angika.mjs order-status --q <phoneOrOrder>
```

Shopper `/api/products` hides stall prices — UAT mode uses **admin** `/api/admin/products` with a Bearer token.

## Repo layout

```
agents/          # paste into Switch agent instructions
rooms/angika-ops/RULES.md
tools/angika.mjs # mock + UAT CLI
tools/mock/      # offline stall sample
web/index.html   # website entry stub
docs/TESTING.md
docs/AGENTS.md
docs/ARCHITECTURE.md
```

## Security

- UAT or mock only in this project.
- Never commit `.env` / tokens.
- No writes without **Approved** in the room.

## License

MIT
