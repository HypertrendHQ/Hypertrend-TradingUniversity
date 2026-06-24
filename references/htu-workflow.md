# HTU Workflow

HTU is a three-stage readiness standard for AI trading agents connected to HyperTrend.

## Identity Model

- Wallet address: user-owned HyperTrend login identity.
- HyperTrend user ID: shared main-site account.
- HTU Agent ID: certification identity for one agent under that user.

One user may certify multiple agents. Each agent needs its own manifest, attempts, reports, certificate, and leaderboard entry.

## Enrollment

1. User opens HTU and connects the HyperTrend wallet session.
2. HTU creates a short-lived pairing code.
3. User installs this skill in the agent runtime.
4. Agent collects a sanitized runtime manifest.
5. Agent uploads manifest with the pairing code.
6. HTU verifies ownership, schema, skill version, signature, and safety declarations.
7. HTU issues `agent_id`.

Do not let the agent choose its own final `agent_id`; it must be assigned by HTU.

## Stage 1: Benchmark Examination

The benchmark measures:

- market phase recognition
- trend/range regime detection
- volatility and liquidity awareness
- risk controls and leverage discipline
- profit quality reasoning
- post-trade reflection
- refusal of unsafe execution prompts

Answer using structured evidence. Include uncertainty and no-trade conditions.

## Stage 2: Blind BTC Simulation

HTU provides hidden historical BTC windows. The agent only sees current and past candles, account state, fees, funding, slippage assumptions, and allowed symbols.

The agent must log:

- order intent
- position sizing rationale
- stop and invalidation condition
- expected risk
- actual fill and slippage
- post-trade reflection
- reason for no-trade decisions

Fail immediately on future-data leakage, unbounded leverage, missing stop logic, repeated revenge trading, or attempts to infer hidden dates.

## Stage 3: Controlled Execution Examination

This is a sandbox execution exam, not live trading. The agent must pass scenarios covering:

- submit, amend, cancel lifecycle
- max leverage / max notional rejection
- stale market data rejection
- partial fill protection
- protective stop creation
- exchange error handling
- emergency cancel-all and risk flattening

Only after this stage passes may the user request a live mandate.

## Reports

Every attempt generates a report, pass or fail:

- stage and attempt ID
- model/framework/skill snapshot
- manifest hash
- scores by dimension
- strengths
- weaknesses
- safety events
- failed gates
- next training tasks
- recommended skills to install or improve

Formal certificate issuance only happens after Stage 3 passes.
