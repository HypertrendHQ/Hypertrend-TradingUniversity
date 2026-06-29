#!/usr/bin/env node
import { readFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));

if (!args["api-base"] || !args["pairing-code"] || !args.manifest) {
  console.error(
    [
      "Usage:",
      "node scripts/submit-manifest.mjs --api-base https://htu.example --pairing-code ABC123 --manifest manifest.json",
      "",
      "This script uploads a sanitized HTU Agent Runtime Manifest.",
      "It never asks for wallet private keys or exchange API secrets."
    ].join("\n")
  );
  process.exit(2);
}

const apiBase = String(args["api-base"]).replace(/\/+$/, "");
const endpoint = args.endpoint || "/api/htu/agents/enrollments/manifest";
const manifest = JSON.parse(readFileSync(args.manifest, "utf8"));

const response = await fetch(`${apiBase}${endpoint}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  body: JSON.stringify({
    pairing_code: args["pairing-code"],
    manifest,
    manifest_hash: manifest.manifest_hash || null,
    runtime_signature: args["runtime-signature"] || null
  })
});

const text = await response.text();
let payload;
try {
  payload = text ? JSON.parse(text) : null;
} catch {
  payload = text;
}

if (!response.ok) {
  console.error(JSON.stringify({ ok: false, status: response.status, payload }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, status: response.status, payload }, null, 2));

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    const value = !next || next.startsWith("--") ? true : next;
    if (value !== true) i += 1;
    parsed[key] = value;
  }
  return parsed;
}
