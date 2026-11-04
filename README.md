# angika-switch-ops

Hackathon project: **Angika ops teammates in chat**, powered by **[Switch](https://github.com/sandbox-quantum/switch)** (mandatory).

Humans and AI agents share one Telegram room (`#angika-ops`). Agents diagnose stall/checkout issues using Angika UAT tools. Risky actions wait for **human approval**.

> Switch is free and open source. It does **not** ship a model — it starts an agent provider you already use.

## Stack (fixed for this repo)

| Layer | Choice |
|--------|--------|
| Bridge | **Switch Rooms** (mandatory) |
| Chat | **Telegram** |
| Agents | See [docs/AGENTS.md](docs/AGENTS.md) — **Cursor is supported** |
| Data | Angika **UAT** (or built-in mock tools) |

## Does Cursor provide agents?

**Yes.** Switch lists **Cursor** as an official agent provider (along with Claude Code, Codex, OpenCode, Antigravity). Switch starts the Cursor agent CLI under *your* Cursor account on a machine you control.

| Provider | Switch support | Cost notes |
|----------|----------------|------------|
| **Cursor** | Yes | Uses your Cursor plan / credits — good default if you already use Cursor |
| **OpenCode** | Yes | Often cheapest to experiment; bring your own model/API key |
| Claude Code | Yes | Usually needs Anthropic / Claude subscription |
| Codex | Yes | Usually needs OpenAI subscription |
| Antigravity | Yes | Provider’s own billing |

**Recommended for this hackathon:** start with **Cursor** (you already have it). Add a second role (Catalog / Release) as another onboarded agent or the same provider with different room instructions.

Switch itself: free. Telegram bot: free. You still need whatever auth your chosen provider requires.

## Quick start (judges & teammates)

1. Install [Switch Console](https://docs.switchagents.ai/switch-rooms/getting-started) and create/join a Switch server.
2. **Settings → Agent providers** → install + sign in **Cursor** (or OpenCode).
3. Connect **Telegram** per [Switch Telegram docs](https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/telegram).
4. Create a Telegram group → turn it into a Switch **room** (`#angika-ops`).
5. Onboard agents and invite them into the room (see [docs/AGENTS.md](docs/AGENTS.md)).
6. Paste room rules from [rooms/angika-ops/RULES.md](rooms/angika-ops/RULES.md).
7. Copy `.env.example` → `.env`. Use `ANGIKA_TOOLS_MODE=mock` if UAT is unreachable.
8. Run the [demo script](docs/DEMO_SCRIPT.md).

Official Switch docs MCP (optional): `https://docs.switchagents.ai/mcp`

## Repo layout

```
angika-switch-ops/
├── README.md
├── .env.example
├── docs/
│   ├── AGENTS.md          # providers, free options, Cursor
│   ├── ARCHITECTURE.md
│   ├── DEMO_SCRIPT.md
│   └── SETUP_CHECKLIST.md
├── rooms/angika-ops/
│   └── RULES.md           # paste into Switch room rules
├── agents/
│   ├── ops.md
│   ├── catalog.md
│   └── release.md
└── tools/
    ├── README.md
    └── mock/
        └── stall-prices.json
```

## Website later

Same Switch rooms + tool adapters. A future Angika website / admin “Ask Ops” surface becomes another client — not a second chatbot stack. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Security

- Demo against **UAT** or **mock** only.
- No production Razorpay / Cognito secrets in this repo.
- Writes (deploy, refund, stock) require an explicit human approval message in the room.

## License

MIT — built for hackathon evaluation with Switch.
