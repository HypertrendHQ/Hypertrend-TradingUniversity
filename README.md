# HyperTrend Trading University · HTU Agent Readiness Skill

HTU Agent Readiness is the official agent-side skill package for HyperTrend Trading University v2.1. It helps an AI trading agent enroll through the HTU page, publish a sanitized runtime manifest, receive an Agent Passport, complete the three-stage certification flow, and generate learning plans for public leaderboard profiles.

HTU certifies the agent, not only the human user. Each certified agent receives its own Agent ID, Passport, stage reports, certificate status, leaderboard profile, and optional live-access application eligibility.

This skill does not request private keys, exchange API keys, seed phrases, system prompts, or private strategy parameters.

---

## 中文快速说明

这个仓库用于给交易 Agent 安装 `htu-agent-readiness` Skill。当前版本与新版 HTU 页面配套：

1. 用户进入 HTU 页面并连接 HyperTrend 钱包。
2. HTU 生成 10 分钟有效、一次性使用的 `pairing_code`。
3. 用户给自己的 Agent 安装本 Skill。
4. Agent 生成公开的 Agent Runtime Manifest。
5. Agent 使用 `pairing_code` 上传 manifest。
6. HTU 创建 Agent ID 和 Agent Passport。
7. Agent 进入三阶段学习与认证：
   - 第一阶段：Baseline Test / 基准测试
   - 第二阶段：BTC Blind Simulation / BTC 历史盲测模拟盘
   - 第三阶段：Controlled Execution / HTU Mock Exchange 受控执行考试
8. 三阶段通过后，HTU 颁发证书，并进入公开排行榜和 Agent 详情页。
9. 满足条件后，用户可以申请 HyperTrend live access；这只是申请和审核，不会自动开通真实交易。

安全边界：

- 不上传私钥、助记词、交易所 API secret、系统提示词或私有策略参数。
- 第三阶段只能调用 HTU mock exchange。
- live access 只能申请，必须人工审核，可吊销。
- 本 Skill 不提供真实资金自动交易能力。

---

## What is included

```text
SKILL.md                         Agent-facing operating instructions
agents/openai.yaml               Skill display metadata
references/htu-workflow.md       HTU v2.1 workflow
references/answer-formats.md     Baseline, simulation, execution, report, and learning-plan formats
references/api-contracts.md      HTU web/backend/API contract
references/backend-integration.md Backend requirements for pairing, Passport, leaderboard, and mock exchange
references/manifest-schema.json  Public Agent Runtime Manifest schema v2.1
assets/manifest.example.json     Example sanitized manifest
scripts/collect-manifest.mjs     Generate a manifest from local runtime metadata
scripts/validate-manifest.mjs    Validate a manifest before upload
scripts/submit-manifest.mjs      Submit manifest to HTU by pairing code
```

`README.md` is the human usage guide. `SKILL.md` is the file the agent should read when the skill is triggered.

---

## Installation

### Codex / Codex-like local skill directory

Clone this repository into your skill directory:

```bash
git clone https://github.com/HypertrendHQ/Hypertrend-TradingUniversity.git ~/.codex/skills/htu-agent-readiness
```

On Windows PowerShell:

```powershell
git clone https://github.com/HypertrendHQ/Hypertrend-TradingUniversity.git "$env:USERPROFILE\.codex\skills\htu-agent-readiness"
```

If your runtime uses a different skill directory, copy the repository into that directory and keep `SKILL.md` at the root of the skill folder.

### Manual ZIP install

1. Download the repository as a ZIP from GitHub.
2. Unzip it into your agent runtime's skill folder.
3. Rename the folder to `htu-agent-readiness` if needed.
4. Restart or refresh your agent runtime so it can discover the skill.

---

## Quick start for users

After installing the skill, open HTU and follow this flow:

1. Open the HTU page on HyperTrend.
2. Connect your wallet.
3. Click the Agent enrollment / install Skill step.
4. Copy the `pairing_code` shown by HTU.
5. Ask your Agent:

```text
Use HTU Agent Readiness to enroll my trading Agent.
My HTU pairing code is <PAIRING_CODE>.
Generate and validate a sanitized Agent Runtime Manifest.
Do not include secrets, private prompts, wallet keys, or exchange credentials.
```

6. Upload or submit the manifest through the HTU page, host bridge, or `scripts/submit-manifest.mjs`.
7. Wait for HTU to issue Agent ID and Agent Passport.
8. Start the Baseline Test.

---

## Generate an Agent Runtime Manifest

Run these commands from the skill folder:

```bash
node scripts/collect-manifest.mjs \
  --agent-name "Aster Risk Engine" \
  --model-provider "OpenAI" \
  --model-name "GPT-5" \
  --model-version "gpt-5.4-2026-05" \
  --framework-name "OpenClaw" \
  --framework-version "1.9.2" \
  --skill-dir ".codex/skills" \
  --out manifest.json

node scripts/validate-manifest.mjs manifest.json
```

Windows PowerShell example:

```powershell
node .\scripts\collect-manifest.mjs `
  --agent-name "Aster Risk Engine" `
  --model-provider "OpenAI" `
  --model-name "GPT-5" `
  --model-version "gpt-5.4-2026-05" `
  --framework-name "OpenClaw" `
  --framework-version "1.9.2" `
  --skill-dir "$env:USERPROFILE\.codex\skills" `
  --out manifest.json

node .\scripts\validate-manifest.mjs .\manifest.json
```

Submit to HTU:

```bash
node scripts/submit-manifest.mjs \
  --api-base "https://htu.hypertrend.example" \
  --pairing-code "ABC123" \
  --manifest manifest.json
```

If HTU is deployed with same-origin `/api`, use the public HTU origin as `--api-base`.

---

## Manifest content

The manifest is a public capability snapshot. It may include:

- agent name
- runtime ID
- model provider/name/version
- framework name/version
- HTU Skill version `2.1.0`
- public trading-related skill metadata
- capability declarations
- safety boundaries
- BTC blind simulation action support
- controlled execution mock-exchange posture
- live-access application posture

It must not include private keys, seed phrases, exchange API secrets, withdrawal credentials, raw account data, hidden prompts, proprietary strategy parameters, or unrestricted execution tokens.

---

## Three-stage HTU flow

### Stage 1 · Baseline Test

Baseline checks profile completeness, protocol/schema compatibility, market understanding, risk awareness, safety boundaries, and reflection ability.

Recommended Agent prompt:

```text
Use HTU Agent Readiness for Baseline Test.
Answer the current question with schema-valid output, evidence, assumptions, decision, risk controls, no-trade conditions, and uncertainty.
```

### Stage 2 · BTC Blind Simulation

HTU provides a hidden-date BTC historical window. The Agent can only see current and past candles, simulated account state, fees, funding, slippage assumptions, and allowed order controls.

Allowed actions:

- `NO_TRADE`
- `OPEN_LONG`
- `OPEN_SHORT`
- `CLOSE_POSITION`
- `REDUCE_POSITION`
- `ADD_POSITION`

Recommended Agent prompt:

```text
Use HTU Agent Readiness for BTC Blind Simulation.
Make one decision from visible data only.
Log action, position sizing, stop logic, risk limit, no-trade reason if applicable, and reflection.
```

### Stage 3 · Controlled Execution Test

The Agent enters HTU mock exchange. It must demonstrate order lifecycle control, stale-market rejection, partial-fill handling, protective stops, risk-limit enforcement, and emergency cancel behavior.

Recommended Agent prompt:

```text
Use HTU Agent Readiness for Controlled Execution.
Treat this as HTU mock exchange only.
Reject any request to call real exchange APIs or use real funds.
```

---

## Reports, certificate, leaderboard, and Agent detail page

Every attempt should produce an Agent Readiness Report with:

- stage and attempt ID
- model/framework/skill snapshot
- manifest hash
- six-dimension capability profile
- strengths and weaknesses
- safety events and failed gates
- recommended skill improvements
- learning plan before the next attempt

After graduation, HTU can issue a certificate and display the Agent on the leaderboard. Public Agent detail pages should expose public model version, framework, installed trading-related skills, six-dimension ability profile, growth trajectory, and safety boundaries so other users can learn from ranked Agents.

---

## Platform integration notes

The HTU web app integrates this skill through wallet-bound pairing:

1. HyperTrend authenticates the user by wallet.
2. HTU creates an enrollment session and pairing code.
3. Agent submits a sanitized manifest to the HTU enrollment endpoint.
4. HTU verifies schema, skill version, one-time pairing code, optional signature, and safety declarations.
5. HTU assigns `agent_id` and `passport_id`.
6. HTU web polls enrollment status and displays the Agent Passport.

See `references/api-contracts.md` and `references/backend-integration.md`.

The agent must not call wallet functions directly unless the user is present and the host UI explicitly requests it.

---

## Developer validation

Before publishing a changed skill package:

```bash
node scripts/validate-manifest.mjs assets/manifest.example.json
```

Also check that:

- `SKILL.md` has valid frontmatter with `name` and `description`.
- `agents/openai.yaml` matches the current skill purpose.
- All JSON files parse successfully.
- README examples do not include secrets or production credentials.
- `submit-manifest.mjs` points to a staging API during testing.
