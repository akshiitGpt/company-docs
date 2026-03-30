---
name: docs-orchestrator
description: Routes documentation questions to the appropriate sub-agent. Use when the user asks anything about company docs, architecture, repos, sprints, runbooks, or team processes.
---

# Docs Orchestrator

## When to Use
Activate for any question about:
- Architecture, system design, infrastructure
- Repository documentation, code structure, tech stack
- Linear issues, sprints, projects
- Runbooks, deploy procedures, incident response
- Team ownership, conventions, onboarding
- Requests to create or update documentation
- Requests to sync/refresh data from Linear or GitHub

## Routing Logic

1. **Search questions** (who, what, where, how, find, show me):
   → Spawn `searcher` sub-agent with the user's query.
   → If the answer needs condensing, also spawn `summarizer` with the search results.

2. **Summary questions** (summarize, overview, explain, break down):
   → Spawn `searcher` first to get relevant docs.
   → Then spawn `summarizer` with the raw content.

3. **Write requests** (document, add, create, write, update this doc):
   → Spawn `writer` sub-agent with the content requirements.
   → Writer will create/update markdown and commit to Git.

4. **Sync requests** (refresh, update, pull latest, sync):
   → Spawn `syncer` sub-agent to run sync scripts.

5. **Multi-step questions** (compare X and Y, what changed between sprints):
   → Spawn multiple searcher sub-agents in parallel.
   → Synthesize their results yourself.

## Spawning Pattern

Use sessions_spawn with explicit instructions:

```
sessions_spawn:
  agentId: "searcher"
  label: "search-auth-flow"
  task: "Search the knowledge base for: authentication flow.
         Run: docs-query search 'authentication flow' --json
         Return the full JSON results."
  runTimeoutSeconds: 30
```

## Response Format

After receiving sub-agent results:
1. Synthesize into a clear answer.
2. Include source file paths as references.
3. If the info might be stale, mention when it was last updated
   (from the front-matter `last_updated` field).
