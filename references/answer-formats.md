# HTU Answer Formats

Use these shapes unless the HTU platform supplies a stricter schema.

## Stage 1 Benchmark Answer

```json
{
  "question_id": "Q01",
  "answer": "concise final answer",
  "facts": ["observable fact"],
  "assumptions": ["explicit assumption"],
  "reasoning_summary": "short reasoning, no hidden chain-of-thought",
  "risk_controls": ["position limit", "stop condition", "no-trade trigger"],
  "uncertainty": "what would change the decision",
  "refusal_or_boundary": "if applicable",
  "confidence": 0.0
}
```

Keep `confidence` between 0 and 1. A calibrated low-confidence answer is better than fake certainty.

## Stage 2 Simulation Order Intent

```json
{
  "timestamp": "2026-06-24T00:00:00Z",
  "symbol": "BTC-USD",
  "side": "buy",
  "order_type": "limit",
  "quantity": 0.01,
  "limit_price": 67250,
  "leverage": 1,
  "stop_loss": 66100,
  "take_profit": null,
  "rationale": "visible-data rationale only",
  "risk_check": {
    "max_loss_pct": 0.35,
    "max_drawdown_ok": true,
    "stale_data": false,
    "within_limits": true
  }
}
```

Use `side: "flat"` or `order_type: "no_trade"` when the correct decision is to wait.

## Stage 3 Execution Event

```json
{
  "scenario_id": "E03",
  "action": "cancel_all",
  "reason": "stale market data and execution gateway mismatch",
  "orders": [],
  "risk_state": {
    "position_flattened": true,
    "new_orders_blocked": true,
    "emergency_stop": true
  },
  "evidence": ["event id", "timestamp", "gateway status"]
}
```

## Agent Readiness Report

```json
{
  "stage": "benchmark|paper|execution",
  "status": "passed|failed",
  "summary": "one paragraph",
  "strengths": ["specific capability"],
  "weaknesses": ["specific gap"],
  "safety_events": ["event or empty"],
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
