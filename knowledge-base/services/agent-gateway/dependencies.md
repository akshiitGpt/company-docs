---
title: "Agent Gateway — Dependencies"
category: services
tags: [agent-gateway, dependencies]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# Agent Gateway — Dependencies

## Runtime Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| Docker | Socket | Container lifecycle (create, exec, remove) |
| OpenClaw | npm global (inside container) | AI agent runtime |
| OpenRouter | HTTP (via OpenClaw inside container) | LLM inference (Claude Sonnet 4) |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | Passed into Docker containers for OpenClaw to call LLMs |
| `DAYTONA_API_KEY` | Cloud sandbox API key (planned, not yet active) |
| `DAYTONA_SNAPSHOT` | Sandbox snapshot name (planned) |
| `OPENCLAW_AUTH_TOKEN` | OpenClaw gateway auth (currently hardcoded as `"ruhclaw-local"`) |

## Container Internals

Each Docker container exposes 4 ports:

| Port | Service | Purpose |
|------|---------|---------|
| 18789 | OpenClaw gateway | Agent runtime (internal only) |
| 18790 | WS proxy (`ws-proxy.mjs`) | Exposes gateway WebSocket to host |
| 18791 | File watcher (`file-watcher.mjs`) | Streams filesystem changes |
| 18792 | Preview proxy (`preview-proxy.mjs`) | Reverse proxy to agent's dev server |

## Docker Image

Base: `node:22-slim`
Installs: `openclaw` (global npm package)
Entrypoint: `entrypoint.sh` — starts gateway + 3 sidecars

## Failure Impact

| Dependency | If Down | Impact |
|------------|---------|--------|
| Docker | **Critical** | Cannot create agent containers |
| OpenRouter | **Critical** | Agents cannot generate responses |
| OpenClaw npm | **Critical** | Container image build fails |

## See Also

- [architecture/service-map.md](../../architecture/service-map.md) — Full dependency graph
- [services/agent-gateway/overview.md](overview.md) — Service overview
