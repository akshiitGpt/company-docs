---
title: "Environment Variables"
category: references
tags: [reference, env-vars, configuration]
owner: "@devops"
last_updated: "2026-03-31"
source: manual
---

# Environment Variables

## Agent Platform (168+ vars)

### Core

| Variable | Required | Description |
|----------|----------|-------------|
| `ENV` | Yes | Environment: `dev`, `qa`, `main` — prefixes all Redis streams |
| `MODEL_PROVIDER` | Yes | LLM provider: `openrouter`, `openai`, `anthropic` |
| `CHECKPOINTER_BACKEND` | No | `mongodb` (default) or `postgres` |

### LLM Providers

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes (if openrouter) | OpenRouter API key |
| `OPENAI_API_KEY` | Conditional | OpenAI API key |
| `ANTHROPIC_API_KEY` | Conditional | Anthropic API key |
| `REQUESTY_API_KEY` | Conditional | Requesty API key |
| `AI_GATEWAY_BASE_URL` | Yes | AI Gateway proxy URL |

### Subagent Models

| Variable | Description |
|----------|-------------|
| `KNOWLEDGE_BASE_SUBAGENT_MODEL` | Model for KB search subagent |
| `WEB_SEARCH_SUBAGENT_MODEL` | Model for web search subagent |
| `MCP_SUBAGENT_MODEL` | Model for MCP tool subagent |
| `CODE_EXECUTOR_SUBAGENT_MODEL` | Model for code execution subagent |
| `FILE_MANAGER_SUBAGENT_MODEL` | Model for file management subagent |

### Infrastructure

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_HOST` | Yes | Redis host |
| `REDIS_PORT` | Yes | Redis port |
| `REDIS_DB` | No | Redis database number |
| `REDIS_PASSWORD` | Conditional | Redis auth password |
| `MONGO_DB_URL` | Yes (if mongodb) | MongoDB connection string |
| `POSTGRES_CHECKPOINTER_URL` | Conditional | PostgreSQL connection string |
| `QDRANT_HOST` | Yes | Qdrant vector DB host |
| `QDRANT_PORT` | Yes | Qdrant port |
| `QDRANT_API_KEY` | Conditional | Qdrant auth key |
| `KAFKA_BOOTSTRAP_SERVERS` | Yes | Kafka broker addresses |

### Service URLs

| Variable | Required | Description |
|----------|----------|-------------|
| `API_GATEWAY_URL` | Yes | External API Gateway URL |
| `MCP_GATEWAY_URL` | Yes | MCP tool gateway URL |
| `AGENT_GATEWAY_URL` | Yes | Agent Gateway (ruhclaw) URL |
| `SCHEDULER_API_BASE_URL` | No | Scheduler service URL |
| `COMMUNICATION_CHANNEL_MANAGER_URL` | No | Communication service URL |
| `WORKFLOW_API_GATEWAY_URL` | No | Workflow execution service URL |

### Sandbox

| Variable | Required | Description |
|----------|----------|-------------|
| `DAYTONA_API_URL` | No | Daytona sandbox API URL |
| `DAYTONA_API_KEY` | No | Daytona API key |

### Observability

| Variable | Required | Description |
|----------|----------|-------------|
| `OTEL_ENABLED` | No | Enable OpenTelemetry (`true`/`false`) |
| `SIGNOZ_ENDPOINT` | Conditional | SigNoz gRPC endpoint |
| `LOG_LEVEL` | No | Logging level (default: `info`) |
| `LOG_FORMAT` | No | Log format: `json` or `text` |
| `GCS_BUCKET_NAME` | No | Google Cloud Storage bucket |

## Agent Gateway (ruhclaw)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Passed into Docker containers |
| `DAYTONA_API_KEY` | No | Cloud sandbox key (planned) |
| `DAYTONA_SNAPSHOT` | No | Sandbox snapshot (planned) |
| `OPENCLAW_AUTH_TOKEN` | No | OpenClaw auth (hardcoded: `"ruhclaw-local"`) |

## See Also

- [services/agent-platform/dependencies.md](../services/agent-platform/dependencies.md) — What uses each var
- [infra/environments.md](../infra/environments.md) — Environment config
