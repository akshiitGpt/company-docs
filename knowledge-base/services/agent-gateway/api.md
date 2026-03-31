---
title: "Agent Gateway — API"
category: services
tags: [agent-gateway, api, rest, websocket]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# Agent Gateway — API

Base URL: `http://localhost:3000` (Elysia on Bun)

## REST Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/agents` | List all agents (sanitized records) | No |
| `POST` | `/api/agents` | Create a new agent (spins up Docker container async) | No |
| `GET` | `/api/agents/:id` | Get single agent status | No |
| `POST` | `/api/agents/:id/preview-target` | Set preview proxy target port | No |
| `GET` | `/api/agents/:id/files` | List file tree inside agent's workspace | No |
| `GET` | `/api/agents/:id/file?path=...` | Read file content from workspace | No |
| `GET` | `/docs` | Swagger UI | No |

### POST /api/agents — Create Agent

Request:
```json
{
  "name": "My Agent"
}
```

Response:
```json
{
  "id": "uuid",
  "name": "My Agent",
  "status": "creating",
  "createdAt": "2026-03-31T..."
}
```

The container is created asynchronously. Poll `GET /api/agents/:id` until `status` is `"running"`.

### POST /api/agents/:id/preview-target

Sets which port inside the container the preview proxy should forward to.

```json
{
  "port": 5173
}
```

## WebSocket Endpoint

`ws://host/ws/chat/:agentId`

### Client → Server

```json
{
  "type": "message",
  "content": "Create a React todo app"
}
```

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `chunk` | `{ content: "..." }` | Streaming text delta |
| `tool_call_start` | `{ name: "...", args: {...} }` | Tool invocation started |
| `tool_call_update` | `{ content: "..." }` | Partial tool output |
| `tool_call_result` | `{ name: "...", result: "...", error?: "..." }` | Tool complete |
| `file_change` | `{ event: "create\|modify\|delete", path: "..." }` | Workspace file changed |
| `done` | `{}` | Agent turn complete |
| `error` | `{ message: "..." }` | Error occurred |

## See Also

- [services/agent-gateway/events.md](events.md) — Full event details
- [data/events/websocket-events.md](../../data/events/websocket-events.md) — Event schemas
