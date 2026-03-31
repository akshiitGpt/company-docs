---
title: "Agent Gateway — Events"
category: services
tags: [agent-gateway, events, websocket]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# Agent Gateway — Events

## WebSocket Events (Server → Client)

### Text Streaming

```
chunk → chunk → chunk → ... → done
```

Each `chunk` event contains a text delta. Concatenate all chunks to build the full response.

### Tool Calls

```
tool_call_start → tool_call_update* → tool_call_result
```

Tool calls may interleave with text chunks. The frontend renders them as expandable panels.

### File Changes

```
file_change { event: "create", path: "/workspace/src/App.tsx" }
file_change { event: "modify", path: "/workspace/src/App.tsx" }
```

Emitted by the file-watcher sidecar inside the Docker container. The frontend uses these to refresh the file tree and code viewer.

## File Watcher TCP Events

Internal protocol between the file-watcher sidecar (port 18791) and the backend.

Format: Newline-delimited JSON over TCP.

```json
{ "event": "create", "path": "/workspace/src/App.tsx", "ts": 1711900000 }
{ "event": "modify", "path": "/workspace/src/App.tsx", "ts": 1711900005 }
{ "event": "delete", "path": "/workspace/old-file.ts", "ts": 1711900010 }
```

## See Also

- [data/events/websocket-events.md](../../data/events/websocket-events.md) — Full schema
- [services/agent-gateway/api.md](api.md) — WebSocket endpoint details
