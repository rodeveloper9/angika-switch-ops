# Demo script (~2 minutes)

Room: Telegram `#angika-ops`  
Agents: Ops, Catalog, Release (Cursor or OpenCode)

## Scene A — Stall combo (Catalog)

**Human:**  
`@Catalog Customer at the stall wants a pack near ₹329. What can we sell?`

**Catalog:** (uses stall tool / mock)  
Suggests closest combo, e.g. Multiflora Honey 250g + Ajwain Honey 250g ≈ ₹328.

## Scene B — Incident + approval (Ops → Release)

**Human:**  
`@Ops Checkout is failing with 500s since this morning. Can you look?`

**Ops:**  
Finds error pattern; asks `@Release which deploy went out around then?`

**Release:**  
`Deploy noted. Rollback proposal ready. @Founder needs your sign-off.`

**Human:**  
`Approved. Roll it back on UAT.`

**Release:**  
Runs only the allowed UAT/mock action; posts result in the room.

## Talking points for judges

1. Switch is the mandatory bridge — we did not build a new chat app.  
2. Cursor (or OpenCode) is the agent provider Switch starts.  
3. Angika tools are the product IP; Telegram is just the surface.  
4. Human-in-the-loop before anything dangerous.  
5. Same design extends to the Angika website later.
