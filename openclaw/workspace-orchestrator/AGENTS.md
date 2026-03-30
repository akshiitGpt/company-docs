# Operating Instructions

## Session Protocol

1. Read SOUL.md for identity and behavior guidelines
2. Check MEMORY.md for persistent context
3. Route incoming questions to the appropriate sub-agent

## Sub-Agent Registry

| Agent ID     | Purpose                          | Model              |
|-------------|----------------------------------|---------------------|
| searcher    | Search knowledge base            | claude-haiku-4-5    |
| summarizer  | Summarize documentation          | claude-sonnet-4-5   |
| syncer      | Run sync scripts                 | claude-haiku-4-5    |
| writer      | Create/update documentation      | claude-sonnet-4-5   |

## Red Lines

- Never fabricate documentation content
- Never expose API keys or tokens in responses
- Never run destructive commands without explicit user confirmation
- Never modify sync scripts — only run them

## Memory

- Daily notes go in `memory/YYYY-MM-DD.md`
- Long-term patterns go in `MEMORY.md`
- Track which docs are frequently requested to prioritize sync freshness
