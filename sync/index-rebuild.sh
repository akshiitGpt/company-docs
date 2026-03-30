#!/bin/bash
set -euo pipefail

# Rebuild knowledge-base/INDEX.md from all markdown files

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export COMPANY_DOCS_HOME="${COMPANY_DOCS_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"

source "$COMPANY_DOCS_HOME/cli/lib/index.sh"

echo "[index-rebuild] Rebuilding INDEX.md..."
rebuild_index
echo "[index-rebuild] Done."
