# Agents for Angika Switch

Switch does **not** include its own AI. It starts an **agent provider** on your laptop or a host you onboard.

## Official providers Switch can start

From [Switch docs](https://docs.switchagents.ai/switch-rooms/getting-started/set-up-agent-providers):

1. **Claude Code**
2. **OpenCode**
3. **Codex**
4. **Cursor** — Cursor provides agents Switch can run
5. **Antigravity**

In Switch Console: **Settings → Agent providers**. Ready when the line under the name says **Signed in** (OpenCode: **Backend connected**).

## Recommended providers

| Priority | Provider | Why |
|----------|----------|-----|
| **1** | **Cursor** | Already on your machine; Switch supports it; one account for coding + room agents |
| **2** | **OpenCode** | Flexible if you plug in your own model/API key |
| 3 | Claude Code / Codex | Strong quality; usually paid subscriptions |

Switch and Telegram are free; the *model/agent plan* is what you pay for. Cursor plan limits apply to agent usage the same way they do in the IDE.

## Angika roles (invite into `#angika-ops`)

Use one provider (e.g. Cursor) and register **three agents** with different instructions:

| Agent | File | Job |
|-------|------|-----|
| Ops | [agents/ops.md](../agents/ops.md) | Diagnose checkout / errors; read logs & UAT health |
| Catalog | [agents/catalog.md](../agents/catalog.md) | Stall prices, combos (e.g. near ₹329) |
| Release | [agents/release.md](../agents/release.md) | Last deploy / propose rollback — **never execute without human approval** |

## Setup steps (Cursor)

1. Install Cursor CLI if Switch says **CLI not installed** (see provider details in Console).
2. Sign in with the command Switch shows (Copy → terminal).
3. **Recheck** until **Signed in**.
4. **Onboard agents** in Switch → create Ops, Catalog, Release using the markdown briefs in `/agents`.
5. Invite all three into the Telegram room.

If Cursor CLI path is wrong: quit Switch Console fully and reopen so it rereads `PATH`.
