---
name: docs-write
description: Create or update documentation files in the knowledge base. Handles ADRs, repo docs, runbooks, and any other markdown documentation.
requires:
  env: [COMPANY_DOCS_HOME]
  bins: [git]
---

# Docs Write

## Creating a New Document

1. Determine the correct category directory.
2. Check if a template exists for that category.
3. Create the file with proper front-matter.
4. Write the content.
5. Update INDEX.md by running `docs-query reindex`.
6. Commit to Git.

```bash
# Example: Create a new ADR
cat > "$COMPANY_DOCS_HOME/knowledge-base/architecture/adr/003-switch-to-redis.md" << 'EOF'
---
title: "ADR-003: Switch to Redis for Session Storage"
category: architecture
tags: [adr, redis, sessions]
owner: "@alice"
last_updated: "2026-03-30"
source: manual
status: proposed
---

# ADR-003: Switch to Redis for Session Storage
...
EOF

# Rebuild index
docs-query reindex

# Commit
cd "$COMPANY_DOCS_HOME/knowledge-base"
git add -A
git commit -m "docs: add ADR-003 switch to Redis for session storage"
```

## Updating an Existing Document

1. Read the current file.
2. Make targeted edits (don't rewrite the whole file unless asked).
3. Update the `last_updated` field in front-matter.
4. Commit with a descriptive message.

## Rules
- Every file MUST have valid YAML front-matter.
- File names: lowercase, hyphens, no spaces (e.g., `deploy-production.md`).
- ADR numbering: check existing ADRs and use the next number.
- Always set `source: manual` for human-written docs.
