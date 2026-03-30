#!/bin/bash
set -euo pipefail

# Sync Linear data into knowledge-base/linear/

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPANY_DOCS_HOME="${COMPANY_DOCS_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"
LINEAR_DIR="$COMPANY_DOCS_HOME/knowledge-base/linear"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%d")
TODAY=$(date +"%Y-%m-%d")
SEVEN_DAYS_AGO=$(date -d "7 days ago" +"%Y-%m-%dT00:00:00.000Z" 2>/dev/null || date -v-7d +"%Y-%m-%dT00:00:00.000Z" 2>/dev/null || echo "")

if [ -z "${LINEAR_API_KEY:-}" ]; then
    echo "[linear-sync] ERROR: LINEAR_API_KEY not set" >&2
    exit 1
fi

LINEAR_API="https://api.linear.app/graphql"

linear_query() {
    local query="$1"
    curl -sS -X POST "$LINEAR_API" \
        -H "Content-Type: application/json" \
        -H "Authorization: $LINEAR_API_KEY" \
        -d "{\"query\": $(echo "$query" | jq -Rs .)}"
}

mkdir -p "$LINEAR_DIR"

echo "[linear-sync] Fetching current sprint..."

SPRINT_DATA=$(linear_query '{
  cycles(filter: { isActive: { eq: true } }) {
    nodes {
      name
      startsAt
      endsAt
      issues {
        nodes {
          identifier
          title
          state { name }
          assignee { name }
          priority
          labels { nodes { name } }
        }
      }
    }
  }
}')

# Generate current-sprint.md
SPRINT_NAME=$(echo "$SPRINT_DATA" | jq -r '.data.cycles.nodes[0].name // "Unknown Sprint"')
SPRINT_START=$(echo "$SPRINT_DATA" | jq -r '.data.cycles.nodes[0].startsAt // ""' | cut -d'T' -f1)
SPRINT_END=$(echo "$SPRINT_DATA" | jq -r '.data.cycles.nodes[0].endsAt // ""' | cut -d'T' -f1)

{
    cat << EOF
---
title: "Current Sprint"
category: linear
tags: [sprint, active]
owner: "system"
last_updated: "$NOW"
source: linear-sync
---

# Current Sprint: $SPRINT_NAME ($SPRINT_START – $SPRINT_END)

EOF

    # Group issues by state
    for state in "In Progress" "Todo" "Done" "Backlog"; do
        issues=$(echo "$SPRINT_DATA" | jq -r --arg s "$state" \
            '.data.cycles.nodes[0].issues.nodes[] | select(.state.name == $s) | "- **\(.identifier)** — \(.title) — @\(.assignee.name // "unassigned") — Priority: \(if .priority == 1 then "Urgent" elif .priority == 2 then "High" elif .priority == 3 then "Medium" else "Low" end)"')

        if [ -n "$issues" ]; then
            echo "## $state"
            echo "$issues"
            echo ""
        fi
    done

    # Stats
    total=$(echo "$SPRINT_DATA" | jq '.data.cycles.nodes[0].issues.nodes | length')
    done_count=$(echo "$SPRINT_DATA" | jq '[.data.cycles.nodes[0].issues.nodes[] | select(.state.name == "Done")] | length')
    in_progress=$(echo "$SPRINT_DATA" | jq '[.data.cycles.nodes[0].issues.nodes[] | select(.state.name == "In Progress")] | length')
    todo=$(echo "$SPRINT_DATA" | jq '[.data.cycles.nodes[0].issues.nodes[] | select(.state.name == "Todo")] | length')

    if [ "$total" != "null" ] && [ -n "$total" ]; then
        pct=0
        [ "$total" -gt 0 ] && pct=$(( done_count * 100 / total ))
        echo "## Stats"
        echo "- Total: $total issues"
        echo "- Completed: $done_count ($pct%)"
        echo "- In Progress: $in_progress"
        echo "- Todo: $todo"
    fi
} > "$LINEAR_DIR/current-sprint.md"

echo "[linear-sync] Fetching active projects..."

PROJECT_DATA=$(linear_query '{
  projects(filter: { state: { eq: "started" } }) {
    nodes {
      name
      description
      state
      progress
      targetDate
      lead { name }
      issues {
        nodes {
          identifier
          title
          state { name }
        }
      }
    }
  }
}')

{
    cat << EOF
---
title: "Active Projects"
category: linear
tags: [projects, active]
owner: "system"
last_updated: "$NOW"
source: linear-sync
---

# Active Projects

EOF

    echo "$PROJECT_DATA" | jq -r '.data.projects.nodes[]? | "## \(.name)\n\n\(.description // "No description.")\n\n- **Lead:** @\(.lead.name // "unassigned")\n- **Progress:** \((.progress // 0) * 100 | floor)%\n- **Target:** \(.targetDate // "No target date")\n- **Issues:** \(.issues.nodes | length)\n"'
} > "$LINEAR_DIR/active-projects.md"

echo "[linear-sync] Fetching recently completed..."

COMPLETED_DATA=$(linear_query "{
  issues(filter: {
    completedAt: { gte: \"${SEVEN_DAYS_AGO:-$TODAY}\" }
  }, first: 50) {
    nodes {
      identifier
      title
      completedAt
      assignee { name }
      project { name }
    }
  }
}")

{
    cat << EOF
---
title: "Recently Completed"
category: linear
tags: [completed, recent]
owner: "system"
last_updated: "$NOW"
source: linear-sync
---

# Recently Completed Issues (Last 7 Days)

EOF

    echo "$COMPLETED_DATA" | jq -r '.data.issues.nodes[]? | "- **\(.identifier)** — \(.title) — @\(.assignee.name // "unassigned") — Completed \(.completedAt | split("T")[0]) — Project: \(.project.name // "none")"'

    total=$(echo "$COMPLETED_DATA" | jq '.data.issues.nodes | length')
    echo ""
    echo "**Total completed:** $total issues"
} > "$LINEAR_DIR/recent-completed.md"

echo "[linear-sync] Done. Updated 3 files in $LINEAR_DIR"
