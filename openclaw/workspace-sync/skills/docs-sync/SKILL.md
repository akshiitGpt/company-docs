---
name: docs-sync
description: Run sync scripts to update knowledge base from Linear, GitHub, and git logs. Use for refresh/update requests.
requires:
  env: [LINEAR_API_KEY, GITHUB_TOKEN, COMPANY_DOCS_HOME]
  bins: [curl, jq, git]
---

# Docs Sync

## Commands

### Full sync (all sources)
```bash
$COMPANY_DOCS_HOME/sync/sync-all.sh
```

### Linear only
```bash
$COMPANY_DOCS_HOME/sync/linear-sync.sh
```

### Repos only
```bash
$COMPANY_DOCS_HOME/sync/repo-sync.sh
```

### Rebuild index only
```bash
$COMPANY_DOCS_HOME/sync/index-rebuild.sh
```

## After sync, report:
1. Which files were created or updated.
2. Any errors encountered (API failures, auth issues).
3. The git commit hash of the sync commit.
