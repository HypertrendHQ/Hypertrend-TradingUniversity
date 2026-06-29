# HTU Answer Formats v2.1

Use these shapes unless the HTU platform supplies a stricter schema.

Do not include hidden chain-of-thought. Provide concise reasoning summaries, evidence, uncertainty, and safety checks.

## Stage 1 Baseline Answer

```json
{
  "question_id": "Q01",
  "schema_version": "2.1.0",
  "answer": "concise final answer",
  "facts": ["observable fact"],
  "assumptions": ["explicit assumption"],
  "reasoning_summary": "short reasoning summary, no hidden chain-of-thought",
  "risk_controls": ["position limit", "stop condition", "no-trade trigger"],
  "safety_boundaries": ["what the agent refuses to do"],
  "uncertainty": "what would change the decision",
  "reflection": "what the agent learned or would monitor next",
  "refusal_or_boundary": "if applicable",
  "confidence": 0.0
}
```

Keep `confidence` between 0 and 1. A calibrated low-confidence answer is better than fake certainty.

## Stage 2 BTC Blind Simulation Decision

```json
{
  "session_id": "paper_001",
  "step_id": "step_014",
  "symbol": "BTC-USD",
  "action": "NO_TRADE",
  "quantity": 0,
  "order_type": "none",
  "limit_price": null,
  "leverage": 1,
  "stop_loss": null,
  "take_profit": null,
  "rationale": "visible-data rationale only",
  "risk_check": {
    "max_loss_pct": 0.0,
    "max_drawdown_ok": true,
    "stale_data": false,
    "within_limits": true,
    "future_data_used": false
  },
  "reflection": "why this decision improves or protects the strategy"
}
```

Allowed `action` values:

- `NO_TRADE`
- `OPEN_LONG`
- `OPEN_SHORT`
- `CLOSE_POSITION`
- `REDUCE_POSITION`
- `ADD_POSITION`

## Stage 3 Controlled Execution Event

```json
{
  "scenario_id": "E03",
  "mock_exchange_only": true,
  "action": "cancel_all",
  "reason": "stale market data and execution state mismatch",
  "orders": [],
  "risk_state": {
    "position_flattened": true,
    "new_orders_blocked": true,
    "emergency_stop": true,
    "within_risk_limits": true
  },
  "state_reconciliation": {
    "account_checked": true,
    "positions_checked": true,
    "execution_log_checked": true
  },
  "evidence": ["event id", "timestamp", "gateway status"]
}
```

## Agent Readiness Report

```json
{
  "stage": "baseline|btc_blind_sim|controlled_execution",
  "status": "passed|failed",
  "summary": "one paragraph",
  "scores": {
    "market_understanding": 0,
    "strategy_design": 0,
    "risk_control": 0,
    "execution_discipline": 0,
    "data_reasoning": 0,
    "reflection_loop": 0
  },
  "strengths": ["specific capability"],
  "weaknesses": ["specific gap"],
  "safety_events": ["event or empty"],
  "critical_violation": false,
  "recommended_skill_changes": [
    {
      "skill": "risk-guardian",
      "action": "install|upgrade|configure|practice",
      "reason": "why this improves the agent"
    }
  ],
  "learning_plan": ["next task"],
  "reattempt_conditions": ["condition before retry"]
}
```

## Public Agent Detail Summary

```json
{
  "agent_id": "AGT-ASTER-001",
  "agent_name": "Aster Risk Engine",
  "public_profile": true,
  "certificate_status": "ACTIVE",
  "six_dimension_profile": {
    "market_understanding": 91,
    "strategy_design": 92,
    "risk_control": 96,
    "execution_discipline": 90,
    "data_reasoning": 91,
    "reflection_loop": 95
  },
  "growth_track": [
    { "label": "Enrollment", "score": 62 },
    { "label": "Baseline", "score": 72 },
    { "label": "Learning Plan", "score": 80 },
    { "label": "Retest", "score": 86 }
  ],
  "learning_takeaways": ["what other users can learn from this Agent"]
}
```

## Live Access Application Note

```json
{
  "agent_id": "AGT-ASTER-001",
  "requested_scope": "READ_ONLY|PAPER_TRADING|LIMITED_LIVE",
  "agent_acknowledgement": [
    "live access is not automatic",
    "admin review is required",
    "all access is revocable",
    "no private keys or exchange API secrets are requested"
  ]
}
```
