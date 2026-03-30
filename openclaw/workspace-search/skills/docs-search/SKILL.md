---
name: docs-search
description: Search the company knowledge base using docs-query CLI. Finds relevant documentation by keyword, tag, or category.
requires:
  bins: [docs-query, rg]
---

# Docs Search

## Usage

When given a search task, execute these commands:

### Step 1: Try direct search
```bash
docs-query search "<query>" --json
```

### Step 2: If no results, try category-specific search
```bash
docs-query search "<query>" --category architecture --json
docs-query search "<query>" --category repos --json
docs-query search "<query>" --category runbooks --json
```

### Step 3: If still no results, try tag search
```bash
docs-query search --tag "<relevant-tag>" --json
```

### Step 4: If a specific doc is found, get full content
```bash
docs-query get <filepath>
```

## Output Format

Return results as structured text:

```
SEARCH RESULTS FOR: "<query>"
MATCHES: <count>

--- MATCH 1 ---
FILE: knowledge-base/architecture/system-overview.md
LAST UPDATED: 2026-03-28
RELEVANT SECTION:
<matched content with context>

--- MATCH 2 ---
...
```

## Important
- Never fabricate results. If nothing matches, say "NO RESULTS FOUND".
- Include enough context (3-5 lines around each match) for the orchestrator
  to understand the result without reading the full file.
- If a query is ambiguous, search multiple interpretations.
