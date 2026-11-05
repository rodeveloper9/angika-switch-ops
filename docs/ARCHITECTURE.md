# Architecture

**Switch is the centre.** Telegram, Cursor agents, and Angika tools do not form a product without it.

## Layers

```
Telegram (humans)
        │
        ▼
┌───────────────────────────┐
│  Switch Rooms (mandatory) │
│  room · rules · trust     │
│  messaging + providers    │
└─────────────┬─────────────┘
              │ starts
              ▼
   Cursor agents
   (Ops · Catalog · Release)
              │
              ▼
   tools/angika.mjs (mock or UAT)
              │
              ▼
   Admin Approve / Reject → safe action
```

Remove Switch → no room, no agent sessions in chat, no shared Rules/trust.

## Message path

1. Human posts in Telegram.
2. Switch maps the channel to room `#angika-ops`.
3. Human `@`s an agent.
4. Switch starts that agent’s provider session with room context.
5. Agent may call Angika tools or `@` another agent.
6. Risky step waits for human: `Approved` / `@founder Approved`.
7. Result is posted back in the same room.

## Website later

Do not rebuild agents for the website. Reuse:

- same room rules / decisions model  
- same tool adapters (`tools/`)  

Add a website or admin widget as another **client**, with Switch (or the same tool API) behind it.
