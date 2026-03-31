---
title: "AI Gateway — Overview"
category: services
tags: [ai-gateway, llm, proxy, openrouter]
owner: "@backend"
last_updated: "2026-03-31"
source: manual
---

# AI Gateway

Type: Proxy server
Repo: [repos/ai-gateway.md](../../repos/ai-gateway.md)
Language: <!-- TBD — fill in from repo -->
Framework: <!-- TBD -->

## What It Does

The AI Gateway is a **proxy service that routes LLM requests** to providers. It:

1. Receives chat completion requests from Agent Platform
2. Routes to the appropriate LLM provider (OpenRouter, OpenAI, Anthropic, Google)
3. Handles model selection, rate limiting, and failover
4. Returns streaming or non-streaming responses

## Supported Providers

| Provider | Models | Status |
|----------|--------|--------|
| OpenRouter | Claude, GPT, Gemini, Llama, etc. | Primary |
| OpenAI | GPT-4, GPT-4o | Direct fallback |
| Anthropic | Claude Opus, Sonnet, Haiku | Direct fallback |
| Google | Gemini Pro, Flash | Direct fallback |
| Ollama | Local models | Development only |

## Integration Point

Agent Platform calls this for all LLM inference:

```
Agent Platform → POST {AI_GATEWAY_BASE_URL}/chat/completions
```

OpenRouter is the primary provider — it routes to the cheapest/fastest provider for the requested model.

<!-- TODO: Fill in API details, rate limiting config, and failover logic from the actual repo -->

## See Also

- [architecture/service-map.md](../../architecture/service-map.md) — Where this fits
- [services/agent-platform/dependencies.md](../agent-platform/dependencies.md) — How agent-platform calls this
