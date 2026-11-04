# Angika tools

Thin adapters for Switch agents. Use **mock** when UAT is unreachable.

## Modes

| `ANGIKA_TOOLS_MODE` | Behaviour |
|---------------------|-----------|
| `mock` | Read `tools/mock/*.json` |
| `uat` | HTTP GET against `ANGIKA_API_BASE_URL` (read-only) |

## Suggested tools for agents

1. `list_stall_prices` — name, weight, stallPrice, stock  
2. `suggest_stall_combo` — target total (e.g. 329) → closest packs  
3. `uat_health` — simple ping / products list head  
4. `propose_rollback` — returns a proposal object; execute only after approval  

Wire these via MCP or shell helpers your Cursor/OpenCode agent can call. Keep secrets in `.env` only.
