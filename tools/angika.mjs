#!/usr/bin/env node
/**
 * Angika Switch tools — mock or UAT (admin API).
 *
 * Usage:
 *   node tools/angika.mjs health
 *   node tools/angika.mjs stall-list
 *   node tools/angika.mjs stall-combo --target 329
 *   node tools/angika.mjs propose-rollback
 *   node tools/angika.mjs order-status --q <orderOrPhone>
 *
 * Env (from .env in repo root):
 *   ANGIKA_TOOLS_MODE=mock|uat
 *   ANGIKA_API_BASE_URL=https://uat.angikafoods.com
 *   ANGIKA_API_TOKEN=<admin Cognito JWT>   # required for uat stall/order reads
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

function loadMockStall() {
  const path = join(__dirname, "mock", "stall-prices.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

async function fetchJson(path, { auth = false } = {}) {
  const headers = { Accept: "application/json" };
  if (auth) {
    if (!TOKEN) {
      fail(
        "ANGIKA_API_TOKEN missing. Set a UAT admin Bearer token in .env (from admin login)."
      );
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

function variantsFromProducts(products) {
  const rows = [];
  for (const p of products || []) {
    const variants = p.variants?.length
      ? p.variants
      : [{ weight: "Standard", stallPrice: p.price, stallStock: p.stock }];
    for (const v of variants) {
      if (v.stallPrice === undefined || v.stallPrice === null) continue;
      rows.push({
        id: p.id,
        name: p.name,
        category: p.category || "",
        weight: v.weight || "Standard",
        stallPrice: Number(v.stallPrice),
        stallStock: v.stallStock !== undefined ? Number(v.stallStock) : null,
        active: p.active !== false,
      });
    }
  }
  rows.sort((a, b) => a.stallPrice - b.stallPrice || a.name.localeCompare(b.name));
  return rows;
}

async function getStallRows() {
  if (MODE === "mock") {
    const mock = loadMockStall();
    return mock.variants.map((v) => ({
      id: null,
      name: v.name,
      category: "",
      weight: v.weight,
      stallPrice: v.stallPrice,
      stallStock: v.stallStock ?? null,
      active: true,
    }));
  }
  if (MODE !== "uat") fail(`Unknown ANGIKA_TOOLS_MODE=${MODE}. Use mock or uat.`);
  const data = await fetchJson("/api/admin/products", { auth: true });
  return variantsFromProducts(data.products);
}

function findCombos(rows, target, maxItems = 3) {
  const usable = rows.filter((r) => r.active && r.stallPrice > 0);
  const exact = [];
  const near = [];

  // singles
  for (const r of usable) {
    const diff = Math.abs(r.stallPrice - target);
    const pack = { total: r.stallPrice, diff, items: [r] };
    if (diff < 0.01) exact.push(pack);
    else near.push(pack);
  }

  // pairs
  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      const total = usable[i].stallPrice + usable[j].stallPrice;
      const diff = Math.abs(total - target);
      const pack = { total, diff, items: [usable[i], usable[j]] };
      if (diff < 0.01) exact.push(pack);
      else near.push(pack);
    }
  }

  // triples (limited)
  if (maxItems >= 3) {
    for (let i = 0; i < usable.length; i++) {
      for (let j = i + 1; j < usable.length; j++) {
        for (let k = j + 1; k < Math.min(usable.length, j + 8); k++) {
          const total = usable[i].stallPrice + usable[j].stallPrice + usable[k].stallPrice;
          const diff = Math.abs(total - target);
          const pack = { total, diff, items: [usable[i], usable[j], usable[k]] };
          if (diff < 0.01) exact.push(pack);
          else if (diff <= 20) near.push(pack);
        }
      }
    }
  }

  const fmt = (p) => ({
    total: p.total,
    diff: p.diff,
    items: p.items.map((it) => ({
      name: it.name,
      weight: it.weight,
      stallPrice: it.stallPrice,
      stallStock: it.stallStock,
    })),
  });

  near.sort((a, b) => a.diff - b.diff || a.items.length - b.items.length);
  return {
    target,
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
      tip: "Set ANGIKA_TOOLS_MODE=uat and ANGIKA_API_TOKEN for live UAT.",
    });
    return;
  }
  const started = Date.now();
  const data = await fetchJson("/api/products");
  const count = Array.isArray(data.products) ? data.products.length : Array.isArray(data) ? data.length : null;
  out({
    ok: true,
    mode: "uat",
    baseUrl: BASE,
    publicProductsOk: true,
    productCount: count,
    latencyMs: Date.now() - started,
    adminTokenPresent: Boolean(TOKEN),
  });
}

async function cmdStallList() {
  const rows = await getStallRows();
  out({
    ok: true,
    mode: MODE,
    count: rows.length,
    variants: rows,
  });
}

async function cmdStallCombo(args) {
  const target = Number(args.target ?? args.t ?? 329);
  if (!Number.isFinite(target) || target <= 0) fail("--target must be a positive number");
  const rows = await getStallRows();
  const result = findCombos(rows, target);
  out({ ok: true, mode: MODE, ...result });
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
        "Human posts: Approved",
        "Only then run the approved UAT rollback playbook",
      ],
      requiresHumanApproval: true,
      approvalPhrase: "Approved",
      createdAt: now,
    },
    message:
      "Do not execute. Wait for a human message containing Approved, then confirm in the room.",
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
          total: 328,
          note: "Mock order — switch to uat for live data",
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
      "node tools/angika.mjs stall-list",
      "node tools/angika.mjs stall-combo --target 329",
      "node tools/angika.mjs propose-rollback",
      "node tools/angika.mjs order-status --q <orderOrPhone>",
    ],
    mode: MODE,
    baseUrl: BASE,
  });
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];

try {
  if (!cmd || cmd === "help") usage();
  else if (cmd === "health") await cmdHealth();
  else if (cmd === "stall-list") await cmdStallList();
  else if (cmd === "stall-combo") await cmdStallCombo(args);
  else if (cmd === "propose-rollback") await cmdProposeRollback();
  else if (cmd === "order-status") await cmdOrderStatus(args);
  else fail(`Unknown command: ${cmd}`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
