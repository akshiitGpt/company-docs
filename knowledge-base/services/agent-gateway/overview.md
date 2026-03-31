---
title: "Agent Gateway — Overview"
category: services
tags: [agent-gateway, ruhclaw, typescript, docker, openclaw]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# Agent Gateway (ruhclaw)

Type: API + WebSocket server
Repo: [repos/agent-gateway.md](../../repos/agent-gateway.md)
Language: TypeScript
Runtime: Bun
Framework: Elysia
Frontend: React 19 + Vite 8 + Tailwind CSS 4

## What It Does

The agent-gateway (codename: ruhclaw) is the **agent sandbox orchestrator**. It:

1. Creates isolated Docker containers, each running an OpenClaw AI agent
2. Manages WebSocket connections for real-time chat streaming
3. Provides a split-pane UI: chat + code viewer + live web preview
4. Handles file watching and preview proxying inside containers

## How It Works

```
User (browser)
  │
  ├── REST → Elysia API (port 3000) → Create/list agents
  │
  └── WebSocket → Elysia WS → OpenClaw gateway inside Docker container
                                  │
                                  ├── LLM calls (via OpenRouter)
                                  ├── Tool execution (file ops, bash, dev server)
                                  └── Response streaming back to client
```

Each agent container runs:
- **OpenClaw gateway** — AI agent runtime (port 18789)
- **WS proxy** — Exposes gateway WebSocket externally (port 18790)
- **File watcher** — Monitors workspace filesystem changes (port 18791)
- **Preview proxy** — Reverse proxy to agent's dev server (port 18792)

## Key Design Choices

1. **No database** — All state is in-memory (`Map<string, AgentRecord>`). Agents are ephemeral.
2. **Container isolation** — Each agent gets its own Docker container with filesystem and network.
3. **OpenClaw as runtime** — Uses OpenClaw (installed globally in container image) for agent logic.
4. **Ed25519 auth** — WebSocket connections to OpenClaw are authenticated using Ed25519 device signing.

## Limitations

- State is lost on server restart (in-memory only)
- No persistent storage for agent workspaces
- Single-server — no horizontal scaling (Docker socket is local)

## See Also

- [services/agent-gateway/api.md](api.md) — REST + WebSocket endpoints
- [services/agent-gateway/events.md](events.md) — WebSocket event contracts
- [services/agent-gateway/dependencies.md](dependencies.md) — External dependencies
- [workflows/agent-creation-flow.md](../../workflows/agent-creation-flow.md) — Container provisioning flow
