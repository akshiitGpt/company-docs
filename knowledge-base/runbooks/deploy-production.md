---
title: "Deploy to Production"
category: runbooks
tags: [deploy, production, runbook]
owner: "@devops"
last_updated: "2026-03-30"
source: manual
---

# Deploy to Production

## Prerequisites
- [ ] All tests passing on main branch
- [ ] PR approved and merged
- [ ] No active incidents

## Steps

### 1. Pre-Deploy Checks
Verify the build is green and staging looks good.

### 2. Deploy
Describe the deployment command/process.

### 3. Post-Deploy Verification
- [ ] Health check endpoints responding
- [ ] Key user flows working
- [ ] No error rate spike in monitoring

## Rollback Procedure
How to roll back if something goes wrong.

## Contacts
Who to reach out to if issues arise during deploy.
