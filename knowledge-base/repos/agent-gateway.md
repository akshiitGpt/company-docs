---
title: "agent-gateway (ruhclaw) Repo"
category: repos
tags: [repo, agent-gateway, ruhclaw, typescript, bun, elysia]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
repo_url: "https://github.com/akshiitGpt/ruhclaw"
---

# agent-gateway (ruhclaw)

GitHub: `github.com/akshiitGpt/ruhclaw`

## Directory Structure

```
ruhclaw/
  start.sh                         # Starts both backend + frontend
  backend/
    package.json                   # Bun + Elysia + ws + noble/ed25519
    .env.example
    src/
      index.ts                     # Entry point (Elysia on port 3000)
      routes/
        agents.ts                  # Agent CRUD + WebSocket chat handler
        files.ts                   # File tree + file read from containers
      services/
        docker.ts                  # Container lifecycle (build, create, exec, remove)
        openclaw-ws.ts             # OpenClaw WebSocket client (Ed25519 auth)
        file-watcher.ts            # TCP client for file-change sidecar
    docker/
      Dockerfile                   # Node 22 + openclaw global install
      entrypoint.sh                # Starts gateway + 3 sidecars
      openclaw.json                # OpenClaw config (model, gateway, tools)
      ws-proxy.mjs                 # TCP proxy: 0.0.0.0:18790 → 127.0.0.1:18789
      file-watcher.mjs             # fs.watch → newline-delimited JSON on :18791
      preview-proxy.mjs            # HTTP reverse proxy on :18792
  frontend/
    package.json                   # React 19 + Vite 8 + Tailwind 4
    src/
      App.tsx                      # Routes: / (Home), /chat/:agentId
      types.ts                     # Agent, Message, ToolCall, FileNode, WS types
      lib/api.ts                   # REST + WS URL helpers
      hooks/
        useChat.ts                 # WebSocket chat hook (streaming + tool calls)
        useFileExplorer.ts         # File tree polling + file-change handling
      pages/
        Home.tsx                   # Agent list + create
        Chat.tsx                   # Chat + code viewer + web preview
      components/                  # ChatMessage, ChatInput, FileTree, CodeViewer, WebPreview
```

## Entry Points

- **Backend**: `backend/src/index.ts` — Elysia server on port 3000
- **Frontend**: `frontend/src/main.tsx` — Vite dev server on port 5173
- **Start script**: `start.sh` — runs both with `bun run dev`
- **Docker entrypoint**: `backend/docker/entrypoint.sh`

## Local Development

```bash
git clone https://github.com/akshiitGpt/ruhclaw
cd ruhclaw

# Backend
cd backend
cp .env.example .env              # Add OPENROUTER_API_KEY
bun install
bun run dev                       # Port 3000

# Frontend (separate terminal)
cd frontend
bun install
bun run dev                       # Port 5173

# Or use start.sh to run both
./start.sh
```

Requires Docker running locally for agent container creation.

## Key Files to Read

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Server setup and route mounting |
| `backend/src/routes/agents.ts` | Agent CRUD + WebSocket handler |
| `backend/src/services/docker.ts` | Docker container management |
| `backend/src/services/openclaw-ws.ts` | OpenClaw WebSocket client |
| `backend/docker/openclaw.json` | OpenClaw agent configuration |
| `frontend/src/hooks/useChat.ts` | Client-side chat logic |

## See Also

- [services/agent-gateway/overview.md](../services/agent-gateway/overview.md) — Service-level docs
