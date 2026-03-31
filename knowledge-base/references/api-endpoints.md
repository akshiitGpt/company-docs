---
title: "API Endpoints"
category: references
tags: [reference, api, endpoints]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# API Endpoints

## Agent Gateway (ruhclaw) — Port 3000

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/agents` | List all agents |
| `POST` | `/api/agents` | Create new agent (starts Docker container) |
| `GET` | `/api/agents/:id` | Get agent status |
| `POST` | `/api/agents/:id/preview-target` | Set preview proxy port |
| `GET` | `/api/agents/:id/files` | List workspace file tree |
| `GET` | `/api/agents/:id/file?path=...` | Read workspace file |
| `WS` | `/ws/chat/:agentId` | WebSocket chat |
| `GET` | `/docs` | Swagger UI |

## Agent Platform — Port 6000

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Kubernetes health check (only endpoint) |

All other communication via Redis Streams. See [data/events/redis-streams.md](../data/events/redis-streams.md).

## AI Gateway

<!-- TODO: Add endpoints from actual repo -->

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat/completions` | LLM inference (OpenAI-compatible) |

## Communication Service

<!-- TODO: Add endpoints from actual repo -->

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/send` | Send message to external channel |

## See Also

- [services/agent-gateway/api.md](../services/agent-gateway/api.md) — Detailed Agent Gateway API
- [services/agent-platform/api.md](../services/agent-platform/api.md) — Redis Streams interface
