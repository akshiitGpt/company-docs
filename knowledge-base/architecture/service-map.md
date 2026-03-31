---
title: "Service Map"
category: architecture
tags: [architecture, services, dependencies]
owner: "@team-lead"
last_updated: "2026-03-31"
source: manual
---

# Service Map

## Core Services

| Service | Type | Language | Repo | Status |
|---------|------|----------|------|--------|
| **agent-platform-v2** | Background worker | Python 3.11 | [repo](../repos/agent-platform-v2.md) | Active |
| **agent-gateway (ruhclaw)** | API + WebSocket server | TypeScript (Bun) | [repo](../repos/agent-gateway.md) | Active |
| **communication-service** | API server | TBD | [repo](../repos/communication-service.md) | Active |
| **ai-gateway** | Proxy server | TBD | [repo](../repos/ai-gateway.md) | Active |

## Supporting Infrastructure

| Component | Purpose | Technology |
|-----------|---------|------------|
| API Gateway (external) | HTTP/SSE client interface | Routes to internal services |
| Redis | Message broker + state cache | Redis Streams, TTL-based state |
| MongoDB | Conversation checkpoints | LangGraph checkpoint storage |
| PostgreSQL | Alternative checkpoint backend | LangGraph checkpoint storage |
| Qdrant | Vector memory | Mem0 long-term memory |
| Kafka | Event streaming | Analytics, token usage events |
| Docker | Agent sandboxes | One container per agent instance |
| Google Cloud Storage | File storage | Generated files and artifacts |

## Dependency Graph

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (external)    │
                    └────┬───────┬────┘
                         │       │
              Redis Streams     REST
                         │       │
                    ┌────▼───┐   │
                    │ Agent  │   │
                    │Platform│   │
                    │  (Py)  │   │
                    └┬──┬──┬─┘   │
                     │  │  │     │
          ┌──────────┘  │  └──────────┐
          │             │             │
     ┌────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐
     │    AI    │ │   MCP    │ │   Agent    │
     │ Gateway  │ │ Gateway  │ │  Gateway   │
     │          │ │          │ │ (ruhclaw)  │
     └────┬─────┘ └────┬─────┘ └─────┬──────┘
          │             │             │
          ▼             ▼             ▼
     LLM Providers  External     Docker
     (OpenRouter,   Tools        Containers
      OpenAI,       (Gmail,      (OpenClaw
      Anthropic)    Jira, etc.)   agents)

     ┌──────────────────┐
     │  Communication   │
     │    Service       │
     └────────┬─────────┘
              │
              ▼
     Telegram / Slack / Email
```

## Service-to-Service Dependencies

### Agent Platform depends on:

| Service | How | Purpose |
|---------|-----|---------|
| Redis | Streams (consumer) | Receives chat/workflow requests |
| Redis | Streams (producer) | Sends streamed responses |
| Redis | Key-value | Transient state (30-min TTL) |
| MongoDB | TCP | Conversation checkpoints |
| PostgreSQL | TCP | Alternative checkpoint backend |
| Qdrant | HTTP | Long-term memory (Mem0) |
| Kafka | TCP | Publishes analytics events |
| AI Gateway | HTTP | LLM request routing |
| API Gateway | HTTP | Fetches agent configurations |
| Agent Gateway | HTTP | Agent-specific gateway calls |
| MCP Gateway | HTTP | External tool execution |
| Communication Service | HTTP | Cross-platform message delivery |
| Daytona | HTTP | Cloud sandbox provisioning |
| GCS | HTTP | File storage |
| SigNoz | gRPC | OpenTelemetry traces/metrics |

### Agent Gateway depends on:

| Service | How | Purpose |
|---------|-----|---------|
| Docker | Socket | Container lifecycle management |
| OpenRouter | HTTP (via OpenClaw) | LLM inference inside containers |

### Communication Service depends on:

| Service | How | Purpose |
|---------|-----|---------|
| Telegram API | HTTP | Bot messaging |
| Slack API | HTTP | Workspace messaging |
| SMTP | TCP | Email delivery |

### AI Gateway depends on:

| Service | How | Purpose |
|---------|-----|---------|
| OpenRouter | HTTP | Primary LLM routing |
| OpenAI | HTTP | Direct provider access |
| Anthropic | HTTP | Direct provider access |

## See Also

- [architecture/communication.md](communication.md) — Protocol details
- [architecture/data-flow.md](data-flow.md) — How data moves
- [services/](../services/) — Per-service deep dives
