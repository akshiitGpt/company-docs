# Company Docs Suite

Ruh AI's grep-able markdown knowledge base + sync scripts + web UI.

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
├── sync/                    # Data sync scripts (Linear, GitHub, git logs)
└── web/                     # Next.js web UI
    └── src/
        ├── app/             # Pages + API routes
        ├── components/      # FileTree, FileEditor, MarkdownPreview, CreateModal
        └── lib/             # git.ts (server-side git ops), auth.ts, types.ts
```

## Searching the Knowledge Base

```bash
# Set the knowledge base path
KB="$COMPANY_DOCS_HOME/knowledge-base"

# Full-text search
rg -i "redis streams" "$KB"

# Search within a section
rg -i "deploy" "$KB/runbooks/"

# Find files by tag
rg "tags:.*kafka" "$KB"

# Find files by name
find "$KB" -name "*agent*" -type f

# Read a specific doc
cat "$KB/services/agent-platform/overview.md"

# Read just the first 50 lines (summary)
head -n 50 "$KB/services/agent-platform/overview.md"

# Read a specific line range
sed -n '30,80p' "$KB/workflows/agent-chat-flow.md"

# List all docs
find "$KB" -name '*.md' -type f | sort
```

## Key Commands

```bash
# Web UI
cd web && npm run dev                        # Dev server on :3000
cd web && npx next build && npx next start   # Production

# Sync
./sync/sync-all.sh                           # Full sync (Linear + GitHub + git logs)
./sync/linear-sync.sh                        # Linear only (requires LINEAR_API_KEY)
./sync/repo-sync.sh                          # GitHub repos only (requires GITHUB_TOKEN)
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
