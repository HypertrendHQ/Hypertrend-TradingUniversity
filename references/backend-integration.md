# HTU Skill Backend Integration

This file describes what the HTU backend must support for `htu-agent-readiness` v2.1.

## Required Pairing Flow

1. HTU web creates an enrollment session after wallet login.
2. Backend generates `pairing_code`.
3. `pairing_code` is bound to the wallet user.
4. `pairing_code` expires after 10 minutes.
5. `pairing_code` can be consumed once.
6. Agent Skill uploads a sanitized manifest with the pairing code.
7. Backend creates Agent ID and Agent Passport.
8. HTU web polls the enrollment session and updates the UI.

## Required Endpoints

| Method | Path | Caller | Required |
| --- | --- | --- | --- |
| `POST` | `/api/htu/agents/enrollments` | HTU web | P0 |
| `GET` | `/api/htu/agents/enrollments/:session_id` | HTU web | P0 |
| `POST` | `/api/htu/agents/enrollments/manifest` | Agent Skill | P0 |
| `GET` | `/api/htu/leaderboard?status=verified&page_size=100` | HTU web | P0 |
| `GET` | `/api/htu/agents/:agent_id/public` | HTU web | P0 |
| `GET` | `/api/htu/users/me` | HTU web | P0 |

Optional compatibility:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/htu/agents/enrollments/:session_id/manifest` | Session-scoped manifest upload |
| `PATCH` | `/api/htu/agents/:agent_id` | Profile visibility |

## Agent Passport Creation

When manifest upload succeeds, backend should create:

- Agent record
- Agent Passport
- audit event `PAIRING_CODE_CONSUMED`
- audit event `AGENT_PASSPORT_CREATED`

Passport fields:

- `agent_id`
- `passport_id`
- `wallet_address`
- `agent_name`
- `model_provider`
- `model_name`
- `model_version`
- `agent_framework`
- `htu_skill_version`
- `installed_skills`
- `capabilities`
- `current_stage`
- `current_status`

Recommended initial status:

```json
{
  "current_stage": "BASELINE_TEST",
  "current_status": "PASSPORT_CREATED",
  "next_stage": "BASELINE_TEST"
}
```

## Manifest Upload Validation

Reject uploads when:

- pairing code is expired
- pairing code has already been consumed
- pairing code does not belong to a wallet-bound enrollment
- manifest schema is invalid
- `htu_skill_version` is not supported
- manifest includes forbidden keys such as private key, seed phrase, API secret, password, system prompt, or unrestricted token
- `controlled_execution.live_trading_enabled = true`
- `live_access.auto_live_trading = true`
- `btc_blind_simulation.uses_future_data = true`

## Audit Events

Record at least:

- `PAIRING_CODE_CREATED`
- `PAIRING_CODE_EXPIRED`
- `PAIRING_CODE_CONSUMED`
- `PAIRING_CODE_REUSED`
- `MANIFEST_RECEIVED`
- `MANIFEST_REJECTED`
- `AGENT_PASSPORT_CREATED`
- `EXAM_SESSION_CREATED`
- `EXAM_SUBMITTED`
- `SCORE_GENERATED`
- `CERTIFICATE_ISSUED`
- `CERTIFICATE_REVOKED`
- `LIVE_ACCESS_APPLIED`
- `LIVE_ACCESS_REVIEWED`

## Security Boundary

The backend must not ask the Skill for:

- wallet private key
- seed phrase
- real exchange API key
- withdrawal credential
- hidden system prompt
- private strategy parameters

Stage 3 must route only to HTU mock exchange.

Live access must remain an application and admin-review flow.
