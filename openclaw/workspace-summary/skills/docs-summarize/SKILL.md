---
name: docs-summarize
description: Summarize documentation content into concise, accurate digests. Use when the orchestrator needs a condensed version of one or more documents.
---

# Docs Summarize

## When to Use
When given raw document content and asked to summarize.

## Rules
1. Read the full content provided.
2. Identify the key points, decisions, and action items.
3. Produce a summary in this format:

```
SUMMARY OF: <document title>
SOURCE: <file path>
LAST UPDATED: <date from front-matter>

KEY POINTS:
- Point 1
- Point 2
- Point 3

DETAILS:
<1-2 paragraph summary if the content warrants it>

RELATED DOCS:
- <any cross-references mentioned in the source>
```

4. If summarizing multiple documents, group by theme, not by file.
5. Flag any contradictions between documents.
