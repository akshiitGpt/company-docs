#!/bin/bash
set -euo pipefail

echo "=== Company Docs Suite Setup ==="

# 1. Check dependencies
echo "[1/6] Checking dependencies..."
MISSING=()
command -v rg    >/dev/null 2>&1 || MISSING+=("ripgrep (rg)")
command -v jq    >/dev/null 2>&1 || MISSING+=("jq")
command -v git   >/dev/null 2>&1 || MISSING+=("git")
command -v curl  >/dev/null 2>&1 || MISSING+=("curl")

# Optional deps
if ! command -v yq >/dev/null 2>&1; then
    echo "  NOTE: yq not found (optional). JSON metadata will use fallback parser."
fi
if ! command -v node >/dev/null 2>&1; then
    echo "  NOTE: node not found. Required only for OpenClaw gateway."
fi

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "Missing required dependencies: ${MISSING[*]}"
    echo "Install them and re-run this script."
    exit 1
fi

echo "  All required dependencies found."

# 2. Initialize knowledge base git repo
echo "[2/6] Initializing knowledge base..."
mkdir -p knowledge-base/{architecture/adr,repos,linear,runbooks,team}
if [ ! -d knowledge-base/.git ]; then
    cd knowledge-base && git init && cd ..
    echo "  Initialized git repo in knowledge-base/"
else
    echo "  Git repo already exists in knowledge-base/"
fi

# 3. Verify templates exist
echo "[3/6] Verifying templates..."
for template in knowledge-base/architecture/adr/TEMPLATE.md knowledge-base/repos/TEMPLATE.md; do
    if [ -f "$template" ]; then
        echo "  Found: $template"
    else
        echo "  WARNING: Missing template: $template"
    fi
done

# 4. Install CLI
echo "[4/6] Installing docs-query CLI..."
chmod +x cli/bin/docs-query
chmod +x cli/lib/*.sh

INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"

if [ -L "$INSTALL_DIR/docs-query" ] || [ -e "$INSTALL_DIR/docs-query" ]; then
    rm "$INSTALL_DIR/docs-query"
fi
ln -sf "$(pwd)/cli/bin/docs-query" "$INSTALL_DIR/docs-query"
echo "  Linked: $INSTALL_DIR/docs-query"

# 5. Check env vars
echo "[5/6] Checking environment..."
if [ -z "${LINEAR_API_KEY:-}" ]; then
    echo "  WARNING: LINEAR_API_KEY not set. Linear sync will not work."
fi
if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "  WARNING: GITHUB_TOKEN not set. Repo sync will not work."
fi

# Make sync scripts executable
chmod +x sync/*.sh

# 6. Build initial index
echo "[6/6] Building initial index..."
export COMPANY_DOCS_HOME="$(pwd)"
source cli/lib/index.sh
rebuild_index

echo ""
echo "=== Setup Complete ==="
echo "Knowledge base: $(pwd)/knowledge-base"
echo "CLI tool: docs-query (check: docs-query list)"
echo "OpenClaw config: $(pwd)/openclaw/openclaw.json"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and fill in your API keys"
echo "  2. Add COMPANY_DOCS_HOME=\"$(pwd)\" to your shell profile"
echo "  3. Add ~/.local/bin to your PATH if not already there"
echo "  4. Write your first docs in knowledge-base/"
echo "  5. Start OpenClaw: cd openclaw && openclaw gateway"
