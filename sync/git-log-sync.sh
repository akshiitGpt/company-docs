#!/bin/bash
set -euo pipefail

# Sync git log summaries for locally cloned repos

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPANY_DOCS_HOME="${COMPANY_DOCS_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"
REPOS_DIR="$COMPANY_DOCS_HOME/knowledge-base/repos"
LOCAL_REPOS_CONF="$SCRIPT_DIR/local-repos.conf"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%d")

if [ ! -f "$LOCAL_REPOS_CONF" ]; then
    echo "[git-log-sync] WARNING: $LOCAL_REPOS_CONF not found."
    echo "Create it with one local repo path per line. Format:"
    echo "  /path/to/repo  repo-name"
    exit 0
fi

while IFS= read -r line || [ -n "$line" ]; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue

    local_path=$(echo "$line" | awk '{print $1}')
    repo_name=$(echo "$line" | awk '{print $2}')

    if [ -z "$repo_name" ]; then
        repo_name=$(basename "$local_path")
    fi

    if [ ! -d "$local_path/.git" ]; then
        echo "[git-log-sync] WARNING: Not a git repo: $local_path"
        continue
    fi

    echo "[git-log-sync] Processing $repo_name ($local_path)..."

    doc_file="$REPOS_DIR/$repo_name.md"

    # Get recent commits
    commits=$(cd "$local_path" && git log --oneline --since="7 days ago" --no-merges 2>/dev/null | head -20)

    if [ -z "$commits" ]; then
        echo "[git-log-sync] No recent commits for $repo_name"
        continue
    fi

    # If doc file exists, append/update the Recent Commits section
    if [ -f "$doc_file" ]; then
        # Remove old Recent Commits section if present
        if grep -q "## Recent Commits" "$doc_file"; then
            sed -i '/## Recent Commits/,$d' "$doc_file"
        fi

        {
            echo "## Recent Commits (Last 7 Days)"
            echo ""
            echo "Updated: $NOW"
            echo ""
            echo '```'
            echo "$commits"
            echo '```'
        } >> "$doc_file"

        echo "[git-log-sync] Updated: $doc_file"
    else
        # Create a minimal doc
        {
            cat << EOF
---
title: "$repo_name"
category: repos
tags: [repo]
owner: "system"
last_updated: "$NOW"
source: git-sync
---

# $repo_name

## Recent Commits (Last 7 Days)

Updated: $NOW

\`\`\`
$commits
\`\`\`
EOF
        } > "$doc_file"
        echo "[git-log-sync] Created: $doc_file"
    fi

done < "$LOCAL_REPOS_CONF"

echo "[git-log-sync] Done."
