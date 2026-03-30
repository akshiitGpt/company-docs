# Company Docs Suite

A grep-able markdown knowledge base + CLI tool + sync scripts + OpenClaw multi-agent system + web UI.

## Project Structure

```
company-docs/
├── knowledge-base/          # Markdown documentation store (git-tracked)
│   ├── architecture/        # System design, infrastructure, tech stack, ADRs
│   ├── repos/               # Per-repo documentation (auto-synced from GitHub)
│   ├── linear/              # Sprint data, projects (auto-synced from Linear)
│   ├── runbooks/            # Operational procedures
│   ├── team/                # Ownership, conventions
│   └── INDEX.md             # Auto-generated table of contents
├── cli/                     # docs-query CLI tool (bash + ripgrep)
│   ├── bin/docs-query       # Main executable
│   └── lib/                 # search.sh, index.sh, format.sh
├── sync/                    # Data sync scripts (Linear, GitHub, git logs)
├── openclaw/                # OpenClaw agent workspaces and config
│   ├── openclaw.json        # Main config (5 agents: orchestrator, searcher, summarizer, syncer, writer)
│   └── workspace-*/         # Each agent's SOUL.md, skills/, etc.
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
docs-query get runbooks/deploy-production.md # Get specific doc
docs-query list                              # List all docs
docs-query list --category repos --json      # Filtered list
docs-query meta architecture/system-overview.md --json  # Metadata only
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
category: architecture    # architecture | repos | linear | runbooks | team
tags: [tag1, tag2]
owner: "@username"
last_updated: "YYYY-MM-DD"
source: manual            # manual | linear-sync | repo-sync | git-sync | external-link
---
```

- File names: lowercase, hyphens, no spaces (e.g., `deploy-production.md`)
- ADR numbering: sequential in `architecture/adr/`
- External links have `external_url` and `external_type` in front-matter

### Search Behavior

The CLI splits multi-word queries into OR regex: `"onboarding setup"` becomes `onboarding|setup` matching any word. Results are not ranked — all matches returned flat.

### Web UI

- Next.js 14 App Router + Tailwind CSS
- Light theme with Instrument Serif / Outfit / IBM Plex Mono fonts
- Server-side git operations via `simple-git` (reads `COMPANY_DOCS_HOME`)
- File CRUD auto-commits and pushes to GitHub
- API routes: `/api/tree`, `/api/files`, `/api/directories`, `/api/git`, `/api/chat`

### OpenClaw Agents

5 agents in orchestrator pattern:
- **orchestrator** (opus) — routes questions to sub-agents
- **searcher** (haiku) — runs docs-query, returns raw results
- **summarizer** (sonnet) — condenses documents
- **syncer** (haiku) — runs sync scripts
- **writer** (sonnet) — creates/updates docs, commits to git

Config at `openclaw/openclaw.json`. Each agent has a workspace with `SOUL.md` and `skills/`.

## GitHub

- Repo: github.com/akshiitGpt/company-docs
- Branch: master
- Git identity configured per-repo (akshiitGpt)
