# Angika tools

```bash
node tools/angika.mjs health
node tools/angika.mjs catalog-list
node tools/angika.mjs catalog-combo --target 329
node tools/angika.mjs propose-rollback
node tools/angika.mjs order-status --q 9876543210
```

## Catalogue = online prices

`catalog-list` / `catalog-combo` use **public offer prices** from `/api/products` (same numbers shoppers see).  
No admin token required. Cross-check on https://uat.angikafoods.com/products

| Mode | Catalogue source |
|------|------------------|
| `mock` | `tools/mock/online-prices.json` |
| `uat` | Live `GET /api/products` |

`order-status` in `uat` mode still needs `ANGIKA_API_TOKEN` (admin).

## Agent contract

- Catalog → `catalog-*` only (online prices)  
- Ops → `health`, `order-status`  
- Release → `propose-rollback`; wait for admin **Approved**
