#!/bin/bash
set -euo pipefail

echo "=== docs-query CLI installer ==="

# Check dependencies
MISSING=()
command -v rg  >/dev/null 2>&1 || MISSING+=("ripgrep (rg) — install: apt install ripgrep / brew install ripgrep")
command -v jq  >/dev/null 2>&1 || MISSING+=("jq — install: apt install jq / brew install jq")
command -v git >/dev/null 2>&1 || MISSING+=("git — install: apt install git / brew install git")

# yq is optional but recommended
if ! command -v yq >/dev/null 2>&1; then
    echo "WARNING: yq not found. JSON metadata output will use fallback parser."
    echo "  Install: brew install yq / snap install yq / go install github.com/mikefarah/yq/v4@latest"
fi

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "ERROR: Missing required dependencies:"
    for dep in "${MISSING[@]}"; do
        echo "  - $dep"
    done
    echo ""
    echo "Install the missing dependencies and re-run this script."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLI_BIN="$SCRIPT_DIR/bin/docs-query"

# Make executable
chmod +x "$CLI_BIN"

# Determine install location
INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"

# Create symlink
if [ -L "$INSTALL_DIR/docs-query" ] || [ -e "$INSTALL_DIR/docs-query" ]; then
    rm "$INSTALL_DIR/docs-query"
fi
ln -sf "$CLI_BIN" "$INSTALL_DIR/docs-query"

echo "Linked: $INSTALL_DIR/docs-query -> $CLI_BIN"

# Check if install dir is in PATH
if ! echo "$PATH" | tr ':' '\n' | grep -qx "$INSTALL_DIR"; then
    echo ""
    echo "WARNING: $INSTALL_DIR is not in your PATH."
    echo "Add this to your shell profile (~/.bashrc, ~/.zshrc):"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

# Set COMPANY_DOCS_HOME
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
echo ""
echo "Set COMPANY_DOCS_HOME in your shell profile:"
echo "  export COMPANY_DOCS_HOME=\"$PROJECT_ROOT\""

# Run initial index build
echo ""
echo "Building initial index..."
export COMPANY_DOCS_HOME="$PROJECT_ROOT"
source "$SCRIPT_DIR/lib/index.sh"
rebuild_index

echo ""
echo "=== Installation complete ==="
echo "Try: docs-query list"
