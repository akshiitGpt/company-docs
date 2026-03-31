---
title: "Architecture Overview"
category: architecture
tags: [overview, architecture, ruh-ai]
owner: "@team-lead"
last_updated: "2026-03-31"
source: manual
---

# Architecture Overview

## What is Ruh AI?

Ruh AI is an AI agent platform that enables users to create, configure, and interact with AI assistants. Each agent can execute code, browse the web, manage files, call external tools (Gmail, Jira, Slack), and maintain long-term memory across conversations.

## Platform Components

The platform is composed of four core services:

| Service | Role | Tech |
|---------|------|------|
| **Agent Platform** | Executes AI agents — the brain | Python, LangGraph, Redis Streams |
| **Agent Gateway** | Orchestrates agent sandboxes — the runtime | TypeScript, Bun, Docker, OpenClaw |
| **AI Gateway** | Routes LLM requests to providers | Proxies to OpenRouter, OpenAI, Anthropic |
| **Communication Service** | Cross-platform messaging | Telegram, Slack, Email delivery |

Plus shared infrastructure:
- **API Gateway** (external) — HTTP/SSE interface for clients
- **Redis** — Streams for async messaging, state caching
- **MongoDB** — Conversation checkpoints
- **Qdrant** — Vector memory (Mem0)
- **Kafka** — Analytics event streaming

## How It Works (Simplified)

```
User (web/mobile/API)
  │
  ▼
API Gateway (HTTP/SSE)
  │
  ├──▶ Redis Streams ──▶ Agent Platform (Python worker)
  │                         │
  │                         ├── LangGraph supervisor agent
  │                         ├── Subagents (KB, web, code, files, MCP)
  │                         ├── LLM calls via AI Gateway
  │                         └── Response streamed back via Redis Streams
  │
  ├──▶ Agent Gateway (ruhclaw)
  │       │
  │       ├── Spins up Docker containers
  │       ├── OpenClaw agent inside each container
  │       └── WebSocket streaming to frontend
  │
  └──▶ Communication Service
          │
          └── Delivers to Telegram, Slack, Email
```

## Key Design Decisions

1. **Event-driven, not request-response** — Agent Platform has no HTTP API. All communication flows through Redis Streams, enabling horizontal scaling via consumer groups.

2. **Isolated sandboxes** — Each agent runs in its own Docker container with filesystem, dev server, and tools. No shared state between agent instances.

3. **Multi-agent architecture** — A supervisor agent delegates to specialized subagents (knowledge base search, web search, code execution, file management, MCP tools).

4. **Provider-agnostic LLM routing** — AI Gateway abstracts LLM providers. Switching models or providers doesn't require changes to agent code.

5. **Long-term memory** — Qdrant-backed Mem0 stores user and agent memories as vector embeddings, retrievable across conversations.

## See Also

- [architecture/service-map.md](service-map.md) — Detailed service relationships
- [architecture/communication.md](communication.md) — How services talk to each other
- [architecture/data-flow.md](data-flow.md) — Data lifecycle
- [workflows/agent-chat-flow.md](../workflows/agent-chat-flow.md) — End-to-end chat request
