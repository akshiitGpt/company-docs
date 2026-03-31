---
title: "Agent Gateway — Database"
category: services
tags: [agent-gateway, database, state]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# Agent Gateway — Database

The agent-gateway has **no persistent database**. All state is in-memory.

## In-Memory State

```typescript
// Map<string, AgentRecord> — stored in process memory
{
  id: string            // UUID
  name: string          // User-provided name
  status: "creating" | "running" | "stopped" | "error"
  containerId: string   // Docker container ID
  gatewayUrl: string    // OpenClaw gateway URL inside container
  previewPort: number   // Preview proxy target port
  openclawClient: OpenClawClient | null
  fileWatcher: FileWatcherClient | null
  createdAt: string     // ISO timestamp
}
```

## Implications

- **No persistence** — All agent state is lost on server restart
- **No scaling** — Cannot share state across multiple server instances
- **No history** — No conversation history stored (OpenClaw handles in-container state)

## Future Considerations

If persistence is needed:
- Add Redis or PostgreSQL for AgentRecord storage
- Store container mapping for reconnection after restart
- Consider Daytona for persistent cloud workspaces

## See Also

- [services/agent-gateway/overview.md](overview.md) — Design decisions
