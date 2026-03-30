#!/bin/bash
# Output formatting for agent consumption

KNOWLEDGE_BASE_DIR="${COMPANY_DOCS_HOME:-.}/knowledge-base"

format_for_agent() {
    local file="$1"

    if [ ! -f "$file" ]; then
        # Try relative to knowledge base
        file="$KNOWLEDGE_BASE_DIR/$1"
    fi

    if [ ! -f "$file" ]; then
        echo "Error: file not found: $1" >&2
        return 1
    fi

    local rel_path="${file#$KNOWLEDGE_BASE_DIR/}"

    echo "=== FILE: $rel_path ==="
    echo "--- METADATA ---"
    sed -n '/^---$/,/^---$/p' "$file" | head -20
    echo "--- CONTENT ---"
    # Content without front-matter
    awk 'BEGIN{fm=0} /^---$/{fm++; next} fm>=2{print}' "$file"
    echo "=== END ==="
}

format_search_results() {
    local query="$1"
    shift
    local files=("$@")

    echo "SEARCH RESULTS FOR: \"$query\""
    echo "MATCHES: ${#files[@]}"
    echo ""

    local i=1
    for file in "${files[@]}"; do
        local rel_path="${file#$KNOWLEDGE_BASE_DIR/}"
        local updated
        updated=$(sed -n 's/^last_updated: *"\(.*\)"/\1/p' "$file" | head -1)

        echo "--- MATCH $i ---"
        echo "FILE: $rel_path"
        echo "LAST UPDATED: ${updated:-unknown}"
        echo "RELEVANT SECTION:"
        # Show first 10 content lines (skip front-matter)
        awk 'BEGIN{fm=0} /^---$/{fm++; next} fm>=2{print}' "$file" | head -10
        echo ""
        i=$((i + 1))
    done
}
