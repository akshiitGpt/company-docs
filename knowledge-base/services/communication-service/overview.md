---
title: "Communication Service — Overview"
category: services
tags: [communication-service, messaging, telegram, slack, email]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# Communication Service

Type: API server
Repo: [repos/communication-service.md](../../repos/communication-service.md)
Language: <!-- TBD — fill in from repo -->
Framework: <!-- TBD -->

## What It Does

The communication service handles **cross-platform message delivery** for Ruh AI agents. It:

1. Receives send requests from Agent Platform (HTTP)
2. Routes messages to the appropriate channel (Telegram, Slack, Email)
3. Handles channel-specific formatting and delivery

## Supported Channels

| Channel | Protocol | Status |
|---------|----------|--------|
| Telegram | Bot API | Active |
| Slack | Slack API | Active |
| Email | SMTP | Active |

## Integration Point

Agent Platform calls this service when an agent needs to deliver a message outside the primary chat interface:

```
Agent Platform → POST {COMMUNICATION_CHANNEL_MANAGER_URL}/send
```

<!-- TODO: Fill in API details, database schema, events, and dependencies from the actual repo -->

## See Also

- [architecture/service-map.md](../../architecture/service-map.md) — Where this fits
- [services/agent-platform/dependencies.md](../agent-platform/dependencies.md) — How agent-platform calls this
