#!/bin/bash
set -euo pipefail

echo "=== Company Docs Suite Setup ==="

# 1. Check dependencies
echo "[1/4] Checking dependencies..."
MISSING=()
command -v rg    >/dev/null 2>&1 || MISSING+=("ripgrep (rg)")
command -v jq    >/dev/null 2>&1 || MISSING+=("jq")
command -v git   >/dev/null 2>&1 || MISSING+=("git")

# Optional deps
if ! command -v node >/dev/null 2>&1; then
    echo "  NOTE: node not found. Required only for the web UI."
fi

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "Missing required dependencies: ${MISSING[*]}"
    echo "Install them and re-run this script."
    exit 1
fi

echo "  All required dependencies found."

# 2. Verify knowledge base structure
echo "[2/4] Verifying knowledge base..."
EXPECTED_DIRS=(architecture services repos data infra workflows runbooks references)
for dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d "knowledge-base/$dir" ]; then
        echo "  Found: knowledge-base/$dir"
    else
        echo "  WARNING: Missing directory: knowledge-base/$dir"
    fi
done

# 3. Check env vars
echo "[3/4] Checking environment..."
if [ -z "${COMPANY_DOCS_HOME:-}" ]; then
    echo "  WARNING: COMPANY_DOCS_HOME not set. Add to your shell profile:"
    echo "    export COMPANY_DOCS_HOME=\"$(pwd)\""
fi
if [ -z "${LINEAR_API_KEY:-}" ]; then
    echo "  WARNING: LINEAR_API_KEY not set. Linear sync will not work."
fi
if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "  WARNING: GITHUB_TOKEN not set. Repo sync will not work."
fi

# Make sync scripts executable
chmod +x sync/*.sh

# 4. Verify search works
echo "[4/4] Verifying search..."
DOC_COUNT=$(find knowledge-base -name '*.md' -type f | wc -l)
echo "  Found $DOC_COUNT documents in knowledge-base/"
echo "  Test search: rg -i 'agent-platform' knowledge-base/ -l"
rg -i 'agent-platform' knowledge-base/ -l 2>/dev/null | head -5 | sed 's/^/    /'

echo ""
echo "=== Setup Complete ==="
echo "Knowledge base: $(pwd)/knowledge-base"
echo "Documents: $DOC_COUNT"
echo ""
echo "Search with:"
echo "  rg -i \"query\" knowledge-base/"
echo "  find knowledge-base -name '*.md' | sort"
echo ""
echo "Next steps:"
echo "  1. Add COMPANY_DOCS_HOME=\"$(pwd)\" to your shell profile"
echo "  2. Start browsing: cat knowledge-base/index.md"
