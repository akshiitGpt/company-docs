#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export COMPANY_DOCS_HOME="${COMPANY_DOCS_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"

echo "[sync] Starting full sync — $(date)"

echo "[sync] Linear data..."
"$SCRIPT_DIR/linear-sync.sh" || echo "[sync] WARNING: Linear sync failed (check LINEAR_API_KEY)"

echo "[sync] GitHub repos..."
"$SCRIPT_DIR/repo-sync.sh" || echo "[sync] WARNING: Repo sync failed (check GITHUB_TOKEN)"

echo "[sync] Git logs..."
"$SCRIPT_DIR/git-log-sync.sh" || echo "[sync] WARNING: Git log sync failed (check local-repos.conf)"

echo "[sync] Rebuilding index..."
"$SCRIPT_DIR/index-rebuild.sh"

echo "[sync] Committing changes..."
cd "$COMPANY_DOCS_HOME/knowledge-base"
if git rev-parse --git-dir >/dev/null 2>&1; then
    git add -A
    git diff --cached --quiet || git commit -m "sync: auto-update $(date +%Y-%m-%d-%H%M)"
    echo "[sync] Changes committed."
else
    echo "[sync] WARNING: knowledge-base is not a git repo, skipping commit."
fi

echo "[sync] Done — $(date)"
