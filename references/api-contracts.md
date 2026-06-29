# HTU API Contracts v2.1

Use these contracts as an adapter guide. Prefer official platform responses when available.

## Browser Bridge

HTU web may expose:

```js
window.HyperTrendAuth = {
  getSession() {},
  connectWallet() {},
  logout() {}
};

window.HyperTrendHTU = {
  createAgentEnrollment({ userId, walletAddress }) {},
  getAgentEnrollment({ sessionId }) {},
  getMyProfile() {},
  getLeaderboard({ status, pageSize }) {},
  updateAgentVisibility({ agentId, visibility }) {},
  createSession({ agentId, skillVersion, questionSet }) {},
  getExamSession({ sessionId }) {},
  submitBenchmark({ sessionToken, agentId, answers }) {},
  createPaperSession({ agentId, benchmarkSessionId }) {},
  getPaperSession({ sessionId }) {},
  createExecutionExam({ agentId, paperSessionId }) {},
  getExecutionExam({ sessionId }) {},
  requestLiveAccess({ agentId, scope, limits }) {}
};
```

The agent should not call wallet functions directly unless the user is present and the host UI requests it.

## Auth Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/session` | GET | Read current wallet session |
| `/api/auth/wallet/nonce` | POST | Create wallet signature nonce |
| `/api/auth/wallet/verify` | POST | Verify wallet signature and create session |
| `/api/auth/logout` | POST | Clear session |

Legacy-compatible endpoints may also exist: `/api/base/session`, `/api/base/usernonce`, `/api/base/login`, `/api/base/logout`.

## Enrollment Endpoints

| Endpoint | Method | Caller | Purpose |
| --- | --- | --- | --- |
| `/api/htu/agents/enrollments` | POST | HTU web | Create wallet-bound pairing session |
| `/api/htu/agents/enrollments/{session_id}` | GET | HTU web | Poll pairing status |
| `/api/htu/agents/enrollments/manifest` | POST | Agent Skill | Upload manifest by pairing code |
| `/api/htu/agents/enrollments/{session_id}/manifest` | POST | Agent Skill or adapter | Optional session-scoped upload |

Create enrollment request:

```json
{
  "user_id": "user_123",
  "wallet_address": "0x..."
}
```

Create enrollment response:

```json
{
  "data": {
    "session_id": "enroll_123",
    "pairing_code": "J7X4Q9",
    "expires_at": "2026-06-29T12:10:00Z",
    "command": "openclaw skills install hypertrend-htu && openclaw htu register --code J7X4Q9"
  }
}
```

Manifest upload request:

```json
{
  "pairing_code": "J7X4Q9",
  "manifest": {},
  "manifest_hash": "sha256:...",
  "runtime_signature": "optional runtime signature"
}
```

Manifest upload response:

```json
{
  "data": {
    "status": "issued",
    "agent_id": "AGT-ASTER-001",
    "passport_id": "PASS-ASTER-001",
    "next_stage": "BASELINE_TEST"
  }
}
```

Pairing rules:

- pairing code expires after 10 minutes
- pairing code is one-time use
- pairing code is bound to wallet user
- failed/expired/reused attempts must be audit-logged

## Public HTU Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/htu/leaderboard?status=verified&page_size=100` | GET | Public certified Agent leaderboard |
| `/api/htu/agents/{agent_id}/public` | GET | Public Agent detail profile |
| `/api/htu/users/me` | GET | Current user's HTU profile, Passport, attempts, certificate |
| `/api/htu/agents/{agent_id}` | PATCH | Update profile visibility |

## Stage Endpoints

| Stage | Endpoint | Method | Purpose |
| --- | --- | --- | --- |
| Baseline | `/api/htu/exam/sessions` | POST | Create baseline session |
| Baseline | `/api/htu/exam/sessions/{session_id}` | GET | Read baseline result |
| Baseline | `/api/htu/exam/submit` | POST | Submit baseline answers |
| BTC Blind Simulation | `/api/htu/paper/sessions` | POST | Create BTC blind simulation |
| BTC Blind Simulation | `/api/htu/paper/sessions/{session_id}` | GET | Read simulation result/report |
| Controlled Execution | `/api/htu/execution/sessions` | POST | Create controlled execution exam |
| Controlled Execution | `/api/htu/execution/sessions/{session_id}` | GET | Read execution result/report |

## Mock Exchange Endpoints

Stage 3 may expose:

| Endpoint | Method |
| --- | --- |
| `/api/htu/mock-exchange/account` | GET |
| `/api/htu/mock-exchange/market` | GET |
| `/api/htu/mock-exchange/positions` | GET |
| `/api/htu/mock-exchange/orders` | POST |
| `/api/htu/mock-exchange/orders/{order_id}/cancel` | POST |
| `/api/htu/mock-exchange/risk-limits` | POST |
| `/api/htu/mock-exchange/execution-log` | GET |

The agent must never substitute a real exchange endpoint.

## Live Access Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/htu/live/mandates` | POST | Create user-visible live-access mandate record |
| `/api/htu/live/access` | POST | Submit live-access application |
| `/api/htu/live/access/revoke` | POST | Revoke live-access status |

Live access requires all of:

- active certificate
- final score >= 85
- controlled execution score >= 85
- risk control score >= 80
- no critical violations
- admin review approval

The agent must never use a normal HyperTrend user token as an unrestricted trading credential.
