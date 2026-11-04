# Room rules — #angika-ops

Paste into the Switch room Rules. Set room aliases: `ops`, `cat`, `rel`.

## Purpose

Coordinate Angika stall floor, checkout incidents, and UAT ops between humans and AI teammates.

## Members

- Humans: founder / ops (approval authority)
- Agents: Ops (`ops`), Catalog (`cat`), Release (`rel`)

## Behaviour

1. Prefer live tools (`node tools/angika.mjs …`) over memory. Use UAT when configured; otherwise mock.
2. Never invent stall prices, order status, or deploy history.
3. Catalog may answer stall/price questions without approval.
4. Ops may diagnose and summarize without approval.
5. Release may **propose** rollback/deploy only via `propose-rollback`.
6. Any write (deploy, refund, stock change) needs an explicit human message containing **Approved**.
7. Agents address each other with short aliases when set (`ops`, `cat`, `rel`).
8. Keep answers short; record approvals in Decisions.

## Out of scope

- Production payment capture
- Sharing `.env` secrets in chat
- Running agents without Switch
