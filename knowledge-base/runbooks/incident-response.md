---
title: "Incident Response"
category: runbooks
tags: [incident, oncall, runbook]
owner: "@devops"
last_updated: "2026-03-30"
source: manual
---

# Incident Response

## Severity Levels
- **SEV1** — Complete outage, all users affected
- **SEV2** — Partial outage or major feature broken
- **SEV3** — Minor feature broken, workaround available
- **SEV4** — Cosmetic or low-impact issue

## Response Protocol

### 1. Acknowledge
Claim the incident in the alerting channel within 5 minutes.

### 2. Assess
Determine severity and affected systems.

### 3. Communicate
Post status update in #incidents channel.

### 4. Mitigate
Focus on restoring service first, root cause later.

### 5. Resolve
Confirm the issue is fixed and monitoring is stable.

### 6. Post-Mortem
Schedule a blameless post-mortem within 48 hours.

## Escalation Path
1. On-call engineer
2. Team lead
3. Engineering manager
4. CTO
