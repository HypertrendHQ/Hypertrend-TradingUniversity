#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-manifest.mjs <manifest.json>");
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(file, "utf8"));
const errors = [];
const warnings = [];

requireString("agent_name");
requireString("schema_version");
requireString("runtime_id");
requireString("model.provider");
requireString("model.name");
requireString("model.version");
requireString("framework.name");
requireString("framework.version");
requireString("htu_skill_version");
requireString("profile_visibility");
requireArray("trading_skills");
requireArray("safety_boundaries");
requireArray("capabilities");
requireString("created_at");

if (manifest.manifest_hash) {
  const expected = `sha256:${sha256(stableJson(manifest))}`;
  if (manifest.manifest_hash !== expected) {
    errors.push(`manifest_hash mismatch: expected ${expected}`);
  }
}

const serialized = JSON.stringify(manifest);
const forbiddenKeys = /(private[_-]?key|seed[_-]?phrase|mnemonic|api[_-]?secret|secret[_-]?key|withdraw|password|token|system[_-]?prompt)/i;
scanObject(manifest, []);
if (/0x[a-fA-F0-9]{64}/.test(serialized)) warnings.push("manifest contains a 64-hex value that resembles a private key");

if (!manifest.trading_skills?.length) {
  warnings.push("no trading_skills found; HTU may accept the manifest but leaderboard learning value will be low");
}

if (manifest.controlled_execution?.live_trading_enabled === true) {
  errors.push("controlled_execution.live_trading_enabled must be false for HTU Skill enrollment");
}

if (manifest.live_access?.auto_live_trading === true) {
  errors.push("live_access.auto_live_trading must be false; HTU only supports application and review");
}

if (manifest.btc_blind_simulation?.uses_future_data === true) {
  errors.push("btc_blind_simulation.uses_future_data must be false");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, warnings }, null, 2));

function requireString(path) {
  const value = get(path);
  if (typeof value !== "string" || !value.trim()) errors.push(`missing string: ${path}`);
}

function requireArray(path) {
  if (!Array.isArray(get(path))) errors.push(`missing array: ${path}`);
}

function get(path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), manifest);
}

function scanObject(value, path) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const nextPath = path.concat(key);
    if (forbiddenKeys.test(key)) errors.push(`forbidden manifest key: ${nextPath.join(".")}`);
    if (typeof child === "string" && forbiddenKeys.test(child)) warnings.push(`suspicious string at ${nextPath.join(".")}`);
    scanObject(child, nextPath);
  }
}

function stableJson(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      if (key !== "manifest_hash") acc[key] = sortKeys(value[key]);
      return acc;
    }, {});
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
