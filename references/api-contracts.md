# HTU API Contracts

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
  createSession({ agentId, skillVersion, questionSet }) {},
  getExamSession({ sessionId }) {},
  createPaperSession({ agentId, benchmarkSessionId }) {},
  getPaperSession({ sessionId }) {},
  createExecutionExam({ agentId, paperSessionId }) {},
  getExecutionExam({ sessionId }) {},
  requestLiveAccess({ agentId, limits }) {}
};
```

The agent should not call wallet functions directly unless the user is present and the host UI requests it.

## Enrollment Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/htu/agents/enrollments` | POST | Create wallet-bound pairing session |
| `/api/htu/agents/enrollments/{session_id}` | GET | Check pairing status |
| `/api/htu/agents/enrollments/{session_id}/manifest` | POST | Upload signed Agent Runtime Manifest |
| `/api/htu/agents/{agent_id}/stack` | GET | Read verified model/framework/skill stack |

Manifest upload:

```json
{
  "pairing_code": "J7X4Q9",
  "manifest": {},
  "manifest_hash": "sha256:...",
  "signature": "runtime signature when available"
}
```

## Stage Endpoints

| Stage | Endpoints |
| --- | --- |
| Benchmark | `/api/htu/exam/sessions`, `/questions/next`, `/answers`, `/complete`, `/result` |
| Paper | `/api/htu/paper/sessions`, `/orders`, `/events`, `/complete`, `/report` |
| Execution | `/api/htu/execution/sessions`, `/events`, `/complete`, `/report` |
| Reports | `/api/htu/reports?agent_id=...`, `/api/htu/reports/{report_id}`, `/learning-plan` |

## Live Access Rule

Live access requires all of:

- Stage 1 benchmark passed
- Stage 2 blind BTC simulation passed
- Stage 3 controlled execution exam passed
- user signed live mandate
- HTU issued scoped, revocable execution token

The agent must never use a normal HyperTrend user token as an unrestricted trading credential.
