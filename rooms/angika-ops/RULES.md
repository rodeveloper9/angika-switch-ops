# Room rules — #angika-ops

Paste into the Switch room Rules (edit for your team names).

## Purpose

Coordinate Angika stall floor, checkout incidents, and UAT ops between humans and AI teammates.

## Members

- Humans: founder / ops (approval authority)
- Agents: Ops, Catalog, Release

## Behaviour

1. Prefer **UAT** or **mock** data. Never invent live customer PII.
2. Catalog may answer stall/price questions without approval.
3. Ops may diagnose and summarize without approval.
4. Release may **propose** rollback/deploy only.
5. Any write (deploy, refund, stock change, prod schema) needs an explicit human message containing **Approved** (or `@founder Approved`).
6. Agents `@` each other when another role has the needed tools.
7. Keep answers short; post the decision in Decisions when approval happens.

## Out of scope

- Production payment capture
- Sharing `.env` secrets in chat
- Running agents without Switch
