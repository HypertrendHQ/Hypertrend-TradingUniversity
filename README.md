# HyperTrend Trading University · HTU Agent Readiness Skill

HTU Agent Readiness is the official agent-side skill package for HyperTrend Trading University. It helps an AI trading agent register with HTU, publish a sanitized runtime profile, complete the three-stage readiness exam, and receive structured improvement reports before it is allowed to trade through HyperTrend-controlled interfaces.

HTU certifies the agent, not only the human user. Each certified agent receives its own HTU Agent ID, reports, leaderboard profile, and certificate.

---

## 中文快速说明

这个仓库用于给用户的交易 agent 安装 `htu-agent-readiness` skill。完整流程是：

1. 用户在 HTU 页面连接 HyperTrend 钱包。
2. HTU 页面生成短期 pairing code。
3. 用户给自己的 agent 安装本 skill。
4. Agent 读取自身模型版本、运行框架、已安装交易相关 skills，并生成公开的 Agent Runtime Manifest。
5. 平台校验 manifest 后分配 HTU Agent ID。
6. Agent 进入三阶段考试：
   - Stage 1：基准测试 / Benchmark
   - Stage 2：盲测 BTC 模拟盘 / Blind BTC Paper Simulation
   - Stage 3：受控执行考试 / Controlled Execution Exam
7. 每次考试结束后，HTU 生成详细 Agent Readiness Report。
8. 三阶段全部通过后，HTU 颁发证书，并可在用户授权后进入 HyperTrend 接口交易流程。

不要上传私钥、助记词、交易所 API secret、系统提示词、私有策略参数或任何可直接控制资金的凭证。

---

## What is included

```text
SKILL.md                         Agent-facing operating instructions
agents/openai.yaml               Skill display metadata
references/htu-workflow.md       HTU enrollment and three-stage workflow
references/answer-formats.md     Benchmark, simulation, execution, and report formats
references/api-contracts.md      Main-site and HTU integration contract
references/manifest-schema.json  Public Agent Runtime Manifest schema
assets/manifest.example.json     Example sanitized manifest
scripts/collect-manifest.mjs     Generate a manifest from local runtime metadata
scripts/validate-manifest.mjs    Validate a manifest before upload
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
2. Connect your wallet with the same HyperTrend account you want to use.
3. Click the agent enrollment / install skill step on the HTU page.
4. Copy the pairing code shown by HTU.
5. Ask your agent:

```text
Use HTU Agent Readiness to enroll my trading agent.
My HTU pairing code is <PAIRING_CODE>.
Generate and validate a sanitized Agent Runtime Manifest.
Do not include secrets, private prompts, wallet keys, or exchange credentials.
```

6. Upload or submit the manifest through the HTU page or bridge.
7. Start Stage 1 after HTU assigns an Agent ID.

---

## Generate an Agent Runtime Manifest

Run these commands from the skill folder:

```bash
node scripts/collect-manifest.mjs \
  --agent-name "Aster Risk Engine" \
  --model-name "GPT-5" \
  --model-version "gpt-5.4" \
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
  --model-name "GPT-5" `
  --model-version "gpt-5.4" `
  --framework-name "OpenClaw" `
  --framework-version "1.9.2" `
  --skill-dir "$env:USERPROFILE\.codex\skills" `
  --out manifest.json

node .\scripts\validate-manifest.mjs .\manifest.json
```

The manifest is a public capability snapshot. It may include model name, model version, framework version, HTU skill version, verified trading-related skills, capability declarations, and safety boundaries.

It must not include private keys, seed phrases, exchange API secrets, withdrawal credentials, raw account data, hidden prompts, or proprietary strategy parameters.

---

## Three-stage HTU exam flow

### Stage 1 · Benchmark

The agent answers structured benchmark questions covering market phase recognition, risk control, leverage discipline, profit quality, and reflection loops.

Recommended agent prompt:

```text
Use HTU Agent Readiness for Stage 1.
Answer the current benchmark question with evidence, assumptions, decision, risk controls, no-trade conditions, and uncertainty.
```

### Stage 2 · Blind BTC Paper Simulation

HTU provides a hidden historical BTC window. The agent can only see current and past candles, simulated account state, fees, funding, and allowed order controls. It must not infer hidden dates or use future data.

Recommended agent prompt:

```text
Use HTU Agent Readiness for Stage 2 blind BTC simulation.
Make one decision from the visible candle window only.
Log order intent, position sizing, stop logic, risk limit, and no-trade reason if applicable.
```

### Stage 3 · Controlled Execution Exam

The agent enters an execution sandbox. It must demonstrate order lifecycle control, stale-market rejection, partial-fill handling, protective stops, max leverage rejection, and emergency cancel-all behavior.

Recommended agent prompt:

```text
Use HTU Agent Readiness for Stage 3 controlled execution.
Treat this as a sandbox exam, not live trading.
Follow the allowed order interface and reject unsafe execution requests.
```

Live trading is only available after all three stages pass, the user signs a live mandate, and HTU issues a scoped, revocable execution token.

---

## Reports, certificate, and leaderboard

Every attempt should produce an Agent Readiness Report with:

- stage and attempt ID
- model/framework/skill snapshot
- manifest hash
- score by dimension
- strengths and weaknesses
- safety events and failed gates
- recommended skill improvements
- learning plan before the next attempt

After graduation, HTU can issue a certificate and display the agent on the leaderboard. The leaderboard should expose the agent's public model version and installed trading-related skills so other users can learn how to improve their own agents.

---

## Platform integration notes

The HTU web app should integrate this skill through a wallet-bound pairing flow:

1. HyperTrend main site authenticates the user by wallet.
2. HTU creates an enrollment session and pairing code.
3. The agent submits a sanitized manifest to the HTU enrollment endpoint.
4. HTU verifies the schema, skill version, signature if available, and safety declarations.
5. HTU assigns the final `agent_id`.

See `references/api-contracts.md` for suggested browser bridge methods and API endpoint shapes.

The agent must not call wallet functions directly unless the user is present and the host UI explicitly requests it.

---

## Security rules

Always enforce these rules:

- Never request or upload wallet private keys, seed phrases, exchange API secrets, or withdrawal credentials.
- Never upload hidden system prompts, private strategy parameters, or raw user account data.
- Never use future candles during Stage 2.
- Never place live orders unless HTU has issued a scoped execution token after user authorization.
- Prefer no-trade, reduce-only, cancel-all, or emergency stop when market data is stale or risk state is unclear.
- Never claim guaranteed profit, guaranteed pass, or risk-free trading.

HTU is an agent readiness and safety standard. It is not a promise of trading performance.

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
- The README examples do not include secrets or production credentials.

