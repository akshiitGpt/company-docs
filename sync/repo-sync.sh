#!/bin/bash
set -euo pipefail

# Sync GitHub repo data into knowledge-base/repos/

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPANY_DOCS_HOME="${COMPANY_DOCS_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"
REPOS_DIR="$COMPANY_DOCS_HOME/knowledge-base/repos"
REPOS_CONF="$SCRIPT_DIR/repos.conf"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%d")

if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "[repo-sync] ERROR: GITHUB_TOKEN not set" >&2
    exit 1
fi

if [ ! -f "$REPOS_CONF" ]; then
    echo "[repo-sync] WARNING: $REPOS_CONF not found. Create it with one repo per line (e.g., org/repo-name)"
    exit 0
fi

GITHUB_API="https://api.github.com"

gh_api() {
    local endpoint="$1"
    curl -sS -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$GITHUB_API/$endpoint"
}

mkdir -p "$REPOS_DIR"

while IFS= read -r repo || [ -n "$repo" ]; do
    # Skip empty lines and comments
    [[ -z "$repo" || "$repo" =~ ^# ]] && continue

    repo_name=$(basename "$repo")
    echo "[repo-sync] Syncing $repo..."

    # Fetch repo metadata
    repo_data=$(gh_api "repos/$repo")
    description=$(echo "$repo_data" | jq -r '.description // "No description"')
    language=$(echo "$repo_data" | jq -r '.language // "Unknown"')
    default_branch=$(echo "$repo_data" | jq -r '.default_branch // "main"')
    html_url=$(echo "$repo_data" | jq -r '.html_url // ""')

    # Fetch README
    readme_content=""
    readme_data=$(gh_api "repos/$repo/readme" 2>/dev/null || echo '{}')
    readme_b64=$(echo "$readme_data" | jq -r '.content // ""' | tr -d '\n')
    if [ -n "$readme_b64" ]; then
        readme_content=$(echo "$readme_b64" | base64 -d 2>/dev/null || echo "")
    fi

    # Fetch last 10 merged PRs
    prs_data=$(gh_api "repos/$repo/pulls?state=closed&sort=updated&direction=desc&per_page=10")

    # Fetch topics/tags
    topics=$(echo "$repo_data" | jq -r '(.topics // []) | join(", ")')
    [ -z "$topics" ] && topics="$language"

    # Build the doc file
    doc_file="$REPOS_DIR/$repo_name.md"

    {
        cat << EOF
---
title: "$repo_name"
category: repos
tags: [$(echo "$topics" | sed 's/, /,/g' | sed 's/,/, /g')]
owner: "system"
last_updated: "$NOW"
source: repo-sync
repo_url: "$html_url"
---

# $repo_name

## Overview
$description

## Tech Stack
- Language: $language
- Default Branch: $default_branch

EOF

        # Include README overview if available (first 30 lines, skip title)
        if [ -n "$readme_content" ]; then
            echo "## README (excerpt)"
            echo ""
            echo "$readme_content" | head -30
            echo ""
            echo "---"
            echo ""
        fi

        echo "## Recent Pull Requests"
        echo ""

        echo "$prs_data" | jq -r '.[]? | select(.merged_at != null) | "- **#\(.number)** \(.title) — @\(.user.login) — merged \(.merged_at | split("T")[0])"' | head -10

        if [ "$(echo "$prs_data" | jq '[.[]? | select(.merged_at != null)] | length')" = "0" ]; then
            echo "No recent merged PRs."
        fi

        echo ""
        echo "## Recent Activity"
        echo "<!-- Auto-populated by repo-sync.sh -->"
    } > "$doc_file"

    echo "[repo-sync] Written: $doc_file"

done < "$REPOS_CONF"

echo "[repo-sync] Done."
