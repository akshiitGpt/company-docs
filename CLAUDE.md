# Company Docs Suite

Ruh AI's grep-able markdown knowledge base + CLI tool + sync scripts + web UI.

## Project Structure

```
company-docs/
├── knowledge-base/          # Markdown documentation store (git-tracked)
│   ├── index.md             # Global map — agents start here
│   ├── navigation.md        # Agent navigation instructions
│   ├── glossary.md          # Company terminology
│   ├── architecture/        # System-level: overview, service map, data flow, communication
│   ├── services/            # Per-service deep dives (overview, api, database, events, dependencies)
│   │   ├── agent-platform/  # Core AI agent execution engine (Python)
│   │   ├── agent-gateway/   # Sandbox orchestrator (TypeScript/Docker)
│   │   ├── communication-service/
│   │   └── ai-gateway/
│   ├── repos/               # Code-level repo guides (directory structure, local dev)
│   ├── data/                # Schemas, events, pipelines
│   │   ├── schemas/         # conversations.md, agents.md
│   │   ├── events/          # redis-streams.md, kafka-events.md, websocket-events.md
│   │   └── pipelines/       # analytics.md
│   ├── infra/               # kubernetes, ci-cd, environments, observability
│   ├── workflows/           # End-to-end request flows (agent-chat-flow, agent-creation-flow)
│   ├── runbooks/            # deployments, debugging, incident-response
│   └── references/          # api-endpoints, environment-variables, feature-flags
├── cli/                     # docs-query CLI tool (bash + ripgrep)
│   ├── bin/docs-query       # Main executable
│   └── lib/                 # search.sh, index.sh, format.sh
├── sync/                    # Data sync scripts (Linear, GitHub, git logs)
└── web/                     # Next.js web UI
    └── src/
        ├── app/             # Pages + API routes
        ├── components/      # FileTree, FileEditor, MarkdownPreview, CreateModal
        └── lib/             # git.ts (server-side git ops), auth.ts, types.ts
```

## Key Commands

```bash
# CLI tool — works from any directory
docs-query search "query"                    # Multi-word OR search across all docs
docs-query search "deploy" --category runbooks  # Filter by category
docs-query search --tag kubernetes           # Tag search
docs-query search "auth" --json              # JSON output
docs-query get services/agent-platform/overview.md  # Get specific doc
docs-query list                              # List all docs
docs-query list --category services --json   # Filtered list
docs-query meta services/agent-platform/overview.md --json  # Metadata only
docs-query reindex                           # Rebuild INDEX.md

# Web UI
cd web && npm run dev                        # Dev server on :3000
cd web && npx next build && npx next start   # Production

# Sync
./sync/sync-all.sh                           # Full sync (Linear + GitHub + git logs + reindex)
./sync/linear-sync.sh                        # Linear only (requires LINEAR_API_KEY)
./sync/repo-sync.sh                          # GitHub repos only (requires GITHUB_TOKEN)
./sync/index-rebuild.sh                      # Rebuild INDEX.md
```

## Environment Variables

- `COMPANY_DOCS_HOME` — absolute path to this project root (set in .claude/settings.json and ~/.bashrc)
- `LINEAR_API_KEY` — for Linear sync
- `GITHUB_TOKEN` — for GitHub repo sync

## Conventions

### Knowledge Base Files

Every `.md` file in `knowledge-base/` MUST start with YAML front-matter:

```yaml
---
title: "Document Title"
category: architecture    # architecture | services | repos | data | infra | workflows | runbooks | references
tags: [tag1, tag2]
owner: "@username"
last_updated: "YYYY-MM-DD"
source: manual            # manual | linear-sync | repo-sync | git-sync | external-link
---
```

- File names: lowercase, hyphens, no spaces (e.g., `agent-chat-flow.md`)
- One topic per file, 100–300 lines max
- Every doc ends with a `See Also:` section linking related files
- Cross-link between documents rather than duplicating content

### Knowledge Base Navigation

Agents should follow this search order:

```
1. index.md → find the right section
2. architecture/service-map.md → which services are involved
3. services/<name>/overview.md → service details
4. workflows/<flow>.md → how pieces connect
5. data/events/ or data/schemas/ → data contracts
6. repos/<name>.md → code navigation
```

### Search Behavior

The CLI splits multi-word queries into OR regex: `"redis streams"` becomes `redis|streams` matching any word. Results are not ranked — all matches returned flat.

### Web UI

- Next.js 14 App Router + Tailwind CSS
- Light theme with Instrument Serif / Outfit / IBM Plex Mono fonts
- Server-side git operations via `simple-git` (reads `COMPANY_DOCS_HOME`)
- File CRUD auto-commits and pushes to GitHub
- API routes: `/api/tree`, `/api/files`, `/api/directories`, `/api/git`, `/api/chat`

## GitHub

- Repo: github.com/akshiitGpt/company-docs
- Branch: master
- Git identity configured per-repo (akshiitGpt)
