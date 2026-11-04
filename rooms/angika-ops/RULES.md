# Room rules — #angika-ops

Paste into the Switch room Rules. Set room aliases: `ops`, `cat`, `rel`.

## Purpose

Coordinate Angika stall floor, checkout incidents, and UAT ops between humans and AI teammates.

## Members

- **Admin / approval authority:** room owner only (the human who owns the agents — e.g. Rohit / linked Switch owner)
- Other humans: may ask questions and discuss; **cannot** Approve or Reject releases
- Agents: Ops (`ops`), Catalog (`cat`), Release (`rel`)

## Behaviour

1. Prefer live tools (`node tools/angika.mjs …`) over memory. Use UAT when configured; otherwise mock.
2. Never invent stall prices, order status, or deploy history.
3. Catalog may answer stall/price questions without approval.
4. Ops may diagnose and summarize without approval.
5. Release may **propose** rollback/deploy only via `propose-rollback`.
6. **Approve / Reject are admin-only.**
   - Valid **Approved** or **Rejected** (or “do not roll back”) counts **only** if posted by the **admin / agent owner**.
   - If any other member posts Approved or Rejected, agents must reply: **Admin permission required** — only the room owner can Approve or Reject — and must **not** treat it as a decision.
7. Agents address each other with short aliases when set (`ops`, `cat`, `rel`).
8. Keep answers short; record admin decisions in Decisions.

## Out of scope

- Production payment capture
- Sharing `.env` secrets in chat
- Running agents without Switch
