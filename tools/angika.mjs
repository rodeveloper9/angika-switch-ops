#!/usr/bin/env node
/**
 * Angika Switch tools — mock or UAT.
 *
 * Catalog uses public **online offer prices** (shopper-visible, no admin token).
 *
 * Usage:
 *   node tools/angika.mjs health
 *   node tools/angika.mjs catalog-list
 *   node tools/angika.mjs catalog-combo --target 329
 *   node tools/angika.mjs propose-rollback
 *   node tools/angika.mjs order-status --q <orderOrPhone>
 *
 * Env:
 *   ANGIKA_TOOLS_MODE=mock|uat
 *   ANGIKA_API_BASE_URL=https://uat.angikafoods.com
 *   ANGIKA_API_TOKEN=   # only for order-status in uat mode
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvFile() {
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const MODE = (process.env.ANGIKA_TOOLS_MODE || "mock").toLowerCase();
const BASE = (process.env.ANGIKA_API_BASE_URL || "https://uat.angikafoods.com").replace(/\/$/, "");
const TOKEN = process.env.ANGIKA_API_TOKEN || "";

function out(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

function fail(message, code = 1) {
  out({ ok: false, error: message, mode: MODE });
  process.exit(code);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) args[key] = true;
      else {
        args[key] = next;
        i++;
      }
    } else args._.push(a);
  }
  return args;
}

function loadMockOnline() {
  return JSON.parse(readFileSync(join(__dirname, "mock", "online-prices.json"), "utf8"));
}

async function fetchJson(path, { auth = false } = {}) {
  const headers = { Accept: "application/json" };
  if (auth) {
    if (!TOKEN) {
      fail("ANGIKA_API_TOKEN missing (needed for order-status in uat mode).");
    }
    headers.Authorization = `Bearer ${TOKEN}`;
  }
  const res = await fetch(`${BASE}${path}`, { headers });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    fail(`HTTP ${res.status} ${path}: ${body.error || text || res.statusText}`);
  }
  return body;
}

/** Public shopper catalogue → online offer prices (verifiable on the website). */
function catalogRowsFromProducts(products) {
  const rows = [];
  for (const p of products || []) {
    const variants = p.variants?.length
      ? p.variants
      : [{ weight: "Standard", offerPrice: p.price, mrp: p.mrp, stock: p.stock }];
    for (const v of variants) {
      const onlinePrice = Number(v.offerPrice ?? p.price);
      if (!Number.isFinite(onlinePrice) || onlinePrice <= 0) continue;
      rows.push({
        id: p.id,
        name: p.name,
        category: p.category || "",
        weight: v.weight || "Standard",
        onlinePrice,
        mrp: v.mrp !== undefined ? Number(v.mrp) : p.mrp !== undefined ? Number(p.mrp) : null,
        stock: v.stock !== undefined ? Number(v.stock) : p.stock !== undefined ? Number(p.stock) : null,
        active: p.active !== false,
        priceType: "online",
        verifyHint: "Match offer price on the Angika products page",
      });
    }
  }
  rows.sort((a, b) => a.onlinePrice - b.onlinePrice || a.name.localeCompare(b.name));
  return rows;
}

async function getCatalogRows() {
  if (MODE === "mock") {
    const mock = loadMockOnline();
    return mock.variants.map((v) => ({
      id: null,
      name: v.name,
      category: "",
      weight: v.weight,
      onlinePrice: Number(v.onlinePrice),
      mrp: v.mrp ?? null,
      stock: v.stock ?? null,
      active: true,
      priceType: "online",
      verifyHint: mock.verifyUrl || "https://uat.angikafoods.com/products",
    }));
  }
  if (MODE !== "uat") fail(`Unknown ANGIKA_TOOLS_MODE=${MODE}. Use mock or uat.`);
  const data = await fetchJson("/api/products");
  const products = data.products || data;
  return catalogRowsFromProducts(products);
}

function findCombos(rows, target, maxItems = 3) {
  const usable = rows.filter((r) => r.active && r.onlinePrice > 0);
  const exact = [];
  const near = [];

  for (const r of usable) {
    const diff = Math.abs(r.onlinePrice - target);
    const pack = { total: r.onlinePrice, diff, items: [r] };
    if (diff < 0.01) exact.push(pack);
    else near.push(pack);
  }

  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      const total = usable[i].onlinePrice + usable[j].onlinePrice;
      const diff = Math.abs(total - target);
      const pack = { total, diff, items: [usable[i], usable[j]] };
      if (diff < 0.01) exact.push(pack);
      else near.push(pack);
    }
  }

  if (maxItems >= 3) {
    for (let i = 0; i < usable.length; i++) {
      for (let j = i + 1; j < usable.length; j++) {
        for (let k = j + 1; k < Math.min(usable.length, j + 8); k++) {
          const total =
            usable[i].onlinePrice + usable[j].onlinePrice + usable[k].onlinePrice;
          const diff = Math.abs(total - target);
          const pack = { total, diff, items: [usable[i], usable[j], usable[k]] };
          if (diff < 0.01) exact.push(pack);
          else if (diff <= 30) near.push(pack);
        }
      }
    }
  }

  const fmt = (p) => ({
    total: p.total,
    diff: p.diff,
    priceType: "online",
    items: p.items.map((it) => ({
      name: it.name,
      weight: it.weight,
      onlinePrice: it.onlinePrice,
      mrp: it.mrp,
      stock: it.stock,
    })),
  });

  near.sort((a, b) => a.diff - b.diff || a.items.length - b.items.length);
  return {
    target,
    priceType: "online",
    note: "Prices are website offer prices — verify on the Angika storefront.",
    exact: exact.slice(0, 5).map(fmt),
    closest: near.slice(0, 5).map(fmt),
  };
}

async function cmdHealth() {
  if (MODE === "mock") {
    out({
      ok: true,
      mode: "mock",
      message: "Mock mode — no network call.",
      tip: "Set ANGIKA_TOOLS_MODE=uat for live public catalogue (no token needed for catalog-*).",
    });
    return;
  }
  const started = Date.now();
  const data = await fetchJson("/api/products");
  const products = data.products || data;
  const count = Array.isArray(products) ? products.length : null;
  out({
    ok: true,
    mode: "uat",
    baseUrl: BASE,
    publicProductsOk: true,
    productCount: count,
    latencyMs: Date.now() - started,
    catalogNeedsToken: false,
    orderStatusNeedsToken: true,
  });
}

async function cmdCatalogList() {
  const rows = await getCatalogRows();
  out({
    ok: true,
    mode: MODE,
    priceType: "online",
    verifyUrl: `${BASE}/products`,
    count: rows.length,
    variants: rows,
  });
}

async function cmdCatalogCombo(args) {
  const target = Number(args.target ?? args.t ?? 329);
  if (!Number.isFinite(target) || target <= 0) fail("--target must be a positive number");
  const rows = await getCatalogRows();
  const result = findCombos(rows, target);
  out({
    ok: true,
    mode: MODE,
    verifyUrl: `${BASE}/products`,
    ...result,
  });
}

async function cmdProposeRollback() {
  const now = new Date().toISOString();
  out({
    ok: true,
    mode: MODE,
    status: "proposal_only",
    proposal: {
      action: "rollback_uat",
      environment: "uat",
      reason: "Agent-detected incident — human approval required before execute.",
      suggestedSteps: [
        "Confirm last good UAT deploy in room Decisions",
        "Admin posts: Approved",
        "Only then run the approved UAT rollback playbook",
      ],
      requiresHumanApproval: true,
      approvalPhrase: "Approved",
      createdAt: now,
    },
    message:
      "Do not execute. Wait for admin Approved, then confirm in the room.",
  });
}

async function cmdOrderStatus(args) {
  const q = String(args.q || args.query || "").trim();
  if (!q) fail("Usage: order-status --q <orderNumber|phone|email>");
  if (MODE === "mock") {
    out({
      ok: true,
      mode: "mock",
      query: q,
      orders: [
        {
          orderNumber: "AF-MOCK-1001",
          status: "processing",
          total: 329,
          note: "Mock order — switch to uat + token for live data",
        },
      ],
    });
    return;
  }
  const data = await fetchJson(
    `/api/admin/orders?search=${encodeURIComponent(q)}&pageSize=5`,
    { auth: true }
  );
  const orders = (data.orders || data.items || []).slice(0, 5).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber || o.publicOrderNumber || o.id,
    status: o.status,
    total: o.total ?? o.grandTotal,
    createdAt: o.createdAt,
    customer: o.customerName || o.email || o.phone,
  }));
  out({ ok: true, mode: "uat", query: q, count: orders.length, orders });
}

function usage() {
  out({
    ok: true,
    usage: [
      "node tools/angika.mjs health",
      "node tools/angika.mjs catalog-list",
      "node tools/angika.mjs catalog-combo --target 329",
      "node tools/angika.mjs propose-rollback",
      "node tools/angika.mjs order-status --q <orderOrPhone>",
    ],
    note: "catalog-* uses public online offer prices (no admin token).",
    mode: MODE,
    baseUrl: BASE,
  });
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];

try {
  if (!cmd || cmd === "help") usage();
  else if (cmd === "health") await cmdHealth();
  else if (cmd === "catalog-list" || cmd === "stall-list") await cmdCatalogList();
  else if (cmd === "catalog-combo" || cmd === "stall-combo") await cmdCatalogCombo(args);
  else if (cmd === "propose-rollback") await cmdProposeRollback();
  else if (cmd === "order-status") await cmdOrderStatus(args);
  else fail(`Unknown command: ${cmd}`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
