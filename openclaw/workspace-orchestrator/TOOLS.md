# Tools Reference

## Available Tools

- **sessions_spawn** — Spawn sub-agents for search, summary, sync, and write tasks
- **sessions_list** — List active sub-agent sessions
- **sessions_history** — Get history of a sub-agent session
- **read** — Read files in the workspace
- **exec** — Execute shell commands (delegates to sub-agents for docs-query)
- **memory_search** — Search persistent memory
- **memory_get** — Get specific memory entries

## docs-query CLI (used by sub-agents)

```bash
docs-query search <query> [--category <name>] [--json]
docs-query get <path>
docs-query list [--category <name>] [--json]
docs-query meta <path> [--json]
docs-query reindex
```

## Sync Scripts (used by syncer sub-agent)

```bash
$COMPANY_DOCS_HOME/sync/sync-all.sh      # Full sync
$COMPANY_DOCS_HOME/sync/linear-sync.sh    # Linear only
$COMPANY_DOCS_HOME/sync/repo-sync.sh      # GitHub repos only
$COMPANY_DOCS_HOME/sync/git-log-sync.sh   # Git logs only
$COMPANY_DOCS_HOME/sync/index-rebuild.sh  # Rebuild INDEX.md
```
