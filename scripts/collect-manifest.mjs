#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const cwd = resolve(args.cwd || process.cwd());
const agentName = args["agent-name"] || readPackageName(cwd) || "Unnamed HTU Agent";
const skillDirs = []
  .concat(args["skill-dir"] || [])
  .flatMap((value) => String(value).split(","))
  .map((value) => resolve(cwd, value.trim()))
  .filter(Boolean);

const manifest = {
  schema_version: "2.1.0",
  agent_name: agentName,
  runtime_id: args["runtime-id"] || stableRuntimeId(cwd, agentName),
  model: {
    provider: args["model-provider"] || "unknown",
    name: args["model-name"] || "unknown",
    version: args["model-version"] || "unknown"
  },
  framework: {
    name: args["framework-name"] || "unknown",
    version: args["framework-version"] || "unknown"
  },
  htu_skill_version: args["htu-skill-version"] || "2.1.0",
  profile_visibility: args["profile-visibility"] || "public",
  trading_skills: collectSkills(skillDirs),
  safety_boundaries: [
    "no_private_keys",
    "no_seed_phrases",
    "no_exchange_api_secrets",
    "no_real_fund_execution",
    "no_future_data",
    "mock_exchange_only_for_stage_3",
    "live_access_application_only",
    "respect_user_mandate_limits",
    "audit_log_ready"
  ],
  capabilities: [
    "agent_passport_enrollment",
    "baseline_test",
    "blind_btc_simulation",
    "controlled_execution_mock_exchange",
    "readiness_reporting",
    "learning_plan_followup",
    "public_profile_learning"
  ],
  btc_blind_simulation: {
    supported_actions: ["NO_TRADE", "OPEN_LONG", "OPEN_SHORT", "CLOSE_POSITION", "REDUCE_POSITION", "ADD_POSITION"],
    uses_future_data: false
  },
  controlled_execution: {
    target: "htu_mock_exchange",
    live_trading_enabled: false,
    supports_account_reconciliation: true,
    supports_order_cancellation: true,
    supports_risk_limits: true,
    supports_execution_log: true
  },
  live_access: {
    can_request_access: true,
    auto_live_trading: false,
    requested_scopes_supported: ["READ_ONLY", "PAPER_TRADING", "LIMITED_LIVE"]
  },
  created_at: new Date().toISOString()
};

manifest.manifest_hash = `sha256:${sha256(stableJson(manifest))}`;

const output = JSON.stringify(manifest, null, 2);
if (args.out) {
  writeFileSync(resolve(cwd, args.out), `${output}\n`, "utf8");
} else {
  process.stdout.write(`${output}\n`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    const value = !next || next.startsWith("--") ? true : next;
    if (value !== true) i += 1;
    if (parsed[key]) parsed[key] = [].concat(parsed[key], value);
    else parsed[key] = value;
  }
  return parsed;
}

function readPackageName(root) {
  const path = join(root, "package.json");
  if (!existsSync(path)) return null;
  try {
    const pkg = JSON.parse(readFileSync(path, "utf8"));
    return pkg.name || null;
  } catch {
    return null;
  }
}

function stableRuntimeId(root, name) {
  return `runtime_${sha256(`${basename(root)}:${name}`).slice(0, 20)}`;
}

function collectSkills(dirs) {
  const found = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillPath = join(dir, entry.name, "SKILL.md");
      if (!existsSync(skillPath)) continue;
      const text = readFileSync(skillPath, "utf8");
      const meta = parseFrontmatter(text);
      const description = meta.description || "";
      const category = categorize(`${entry.name} ${description}`);
      if (category === "other" && !isTradingRelated(`${entry.name} ${description}`)) continue;
      found.push({
        slug: meta.name || entry.name,
        name: titleCase(meta.name || entry.name),
        version: "unknown",
        category,
        capabilities: inferCapabilities(`${entry.name} ${description}`),
        visibility: "public"
      });
    }
  }
  return found;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split("\n")) {
    const parts = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!parts) continue;
    meta[parts[1]] = parts[2].replace(/^["']|["']$/g, "");
  }
  return meta;
}

function categorize(text) {
  const value = text.toLowerCase();
  if (/(risk|drawdown|leverage|stop|guard|limit)/.test(value)) return "risk_control";
  if (/(execution|order|fill|cancel|trade)/.test(value)) return "execution";
  if (/(market|trend|signal|analysis|indicator|btc|kline|candle)/.test(value)) return "market_analysis";
  if (/(simulation|backtest|paper)/.test(value)) return "simulation";
  if (/(portfolio|position|allocation)/.test(value)) return "portfolio";
  if (/(reflect|journal|review|learning)/.test(value)) return "reflection";
  return "other";
}

function isTradingRelated(text) {
  return /(trade|trading|market|risk|portfolio|order|signal|btc|execution|backtest|simulation|position|leverage)/i.test(text);
}

function inferCapabilities(text) {
  const value = text.toLowerCase();
  const capabilities = [];
  if (/(risk|drawdown|stop|limit)/.test(value)) capabilities.push("risk_control");
  if (/(order|execution|fill|cancel)/.test(value)) capabilities.push("order_execution");
  if (/(market|trend|signal|analysis|indicator)/.test(value)) capabilities.push("market_analysis");
  if (/(backtest|paper|simulation)/.test(value)) capabilities.push("simulation");
  if (/(journal|reflect|review)/.test(value)) capabilities.push("reflection");
  return capabilities.length ? capabilities : ["metadata_declared"];
}

function titleCase(value) {
  return String(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
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
