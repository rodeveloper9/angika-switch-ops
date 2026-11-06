# Demo walkthrough (record this)

Record **2–3 minutes**. Say Switch by name in the first 15 seconds.

## What to show on camera

1. **Switch Console** — room `angika_ops`, agents listed, Rules visible  
2. **Telegram** — same room, live messages  
3. Optional: terminal `./scripts/smoke.sh` (tools work) + `web/index.html` (website reuse)

## Script (say / type)

**Open:**  
“This is Angika ops in Telegram. **Switch** is the bridge — without Switch, these agents are not in our chat and there is no shared room.”

### Beat 1 — Catalog (real work)

```text
catalog.rohit What online pack is closest to 329? Use catalog-combo — website offer prices only.
```

Show the tool-backed **online** answer (e.g. closest may be Tulsi Honey 250gm ₹320). Tell viewers to verify the same offer price on https://uat.angikafoods.com/products.

### Beat 2 — Multi-agent handoff (Switch diagram)

```text
ops.rohit Checkout looks broken on UAT. Check health with the tool, then ask release.rohit for a UAT rollback proposal.
```

Let **ops** run → **release** propose → needs admin **Approved**.

### Beat 3 — Trust (admin-only)

Have a teammate (or a second account) send:

```text
Rejected
```

Show release reply: tags **owner**, **Admin permission required**, no action.

Then **you** send:

```text
Approved
```

Show only the owner’s Approve counts.

**Close:**  
“Same agents and tools can sit behind our website later — Switch stays the collaboration layer.”

## After recording

1. Upload the video (YouTube unlisted / Drive / Loom).  
2. Put the link in README under **Demo video**.  
3. Keep the recording under 3 minutes.
