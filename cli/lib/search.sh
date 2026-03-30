#!/bin/bash
# Core search functions — wraps ripgrep for knowledge base queries

KNOWLEDGE_BASE_DIR="${COMPANY_DOCS_HOME:-.}/knowledge-base"

# Convert multi-word query into regex OR pattern
# "onboarding setup info" → "onboarding|setup|info"
to_or_pattern() {
    local query="$1"
    # Trim whitespace, replace spaces with |
    echo "$query" | sed 's/^ *//;s/ *$//' | sed 's/  */ /g' | tr ' ' '|'
}

search_docs() {
    local query="$1"
    local category="$2"
    local search_path="$KNOWLEDGE_BASE_DIR"

    if [ -n "$category" ]; then
        search_path="$KNOWLEDGE_BASE_DIR/$category"
    fi

    if [ ! -d "$search_path" ]; then
        echo "Error: directory not found: $search_path" >&2
        return 1
    fi

    local pattern
    pattern=$(to_or_pattern "$query")

    rg -i --type md -C 3 --heading --line-number "$pattern" "$search_path"
}

search_by_tag() {
    local tag="$1"
    rg -l "tags:.*${tag}" "$KNOWLEDGE_BASE_DIR" --type md
}

search_json() {
    local query="$1"
    local category="$2"
    local search_path="$KNOWLEDGE_BASE_DIR"

    if [ -n "$category" ]; then
        search_path="$KNOWLEDGE_BASE_DIR/$category"
    fi

    if [ ! -d "$search_path" ]; then
        echo '[]'
        return 1
    fi

    local pattern
    pattern=$(to_or_pattern "$query")

    rg -i --type md --json "$pattern" "$search_path" 2>/dev/null | \
        jq -s '[.[] | select(.type == "match") | {
            file: .data.path.text,
            line: .data.line_number,
            content: (.data.lines.text | gsub("\\n$"; "")),
            match: .data.submatches[0].match.text
        }]'
}

list_docs() {
    local category="$1"
    local search_path="$KNOWLEDGE_BASE_DIR"

    if [ -n "$category" ]; then
        search_path="$KNOWLEDGE_BASE_DIR/$category"
    fi

    find "$search_path" -name '*.md' -not -name 'INDEX.md' -type f | sort | while read -r file; do
        local rel_path="${file#$KNOWLEDGE_BASE_DIR/}"
        local title
        title=$(sed -n 's/^title: *"\(.*\)"/\1/p; s/^title: *\([^"]\)/\1/p' "$file" | head -1)
        local category_val
        category_val=$(sed -n 's/^category: *\(.*\)$/\1/p' "$file" | head -1)
        local tags
        tags=$(sed -n 's/^tags: *\(.*\)$/\1/p' "$file" | head -1)

        if [ -n "$title" ]; then
            printf "%-50s  %-15s  %s\n" "$rel_path" "${category_val:-—}" "${tags:-—}"
        fi
    done
}

list_docs_json() {
    local category="$1"
    local search_path="$KNOWLEDGE_BASE_DIR"

    if [ -n "$category" ]; then
        search_path="$KNOWLEDGE_BASE_DIR/$category"
    fi

    local results="[]"
    while IFS= read -r file; do
        local rel_path="${file#$KNOWLEDGE_BASE_DIR/}"
        local title
        title=$(sed -n 's/^title: *"\(.*\)"/\1/p' "$file" | head -1)
        local category_val
        category_val=$(sed -n 's/^category: *\(.*\)$/\1/p' "$file" | head -1)
        local tags
        tags=$(sed -n 's/^tags: *\(.*\)$/\1/p' "$file" | head -1)
        local owner
        owner=$(sed -n 's/^owner: *"\(.*\)"/\1/p' "$file" | head -1)
        local updated
        updated=$(sed -n 's/^last_updated: *"\(.*\)"/\1/p' "$file" | head -1)

        results=$(echo "$results" | jq --arg path "$rel_path" \
            --arg title "${title:-}" \
            --arg cat "${category_val:-}" \
            --arg tags "${tags:-}" \
            --arg owner "${owner:-}" \
            --arg updated "${updated:-}" \
            '. + [{path: $path, title: $title, category: $cat, tags: $tags, owner: $owner, last_updated: $updated}]')
    done < <(find "$search_path" -name '*.md' -not -name 'INDEX.md' -type f | sort)

    echo "$results" | jq .
}

get_doc() {
    local filepath="$1"
    local full_path="$KNOWLEDGE_BASE_DIR/$filepath"

    if [ ! -f "$full_path" ]; then
        echo "Error: file not found: $full_path" >&2
        return 1
    fi

    cat "$full_path"
}

get_meta() {
    local filepath="$1"
    local full_path="$KNOWLEDGE_BASE_DIR/$filepath"

    if [ ! -f "$full_path" ]; then
        echo "Error: file not found: $full_path" >&2
        return 1
    fi

    # Extract YAML front-matter (between --- markers)
    sed -n '/^---$/,/^---$/p' "$full_path" | sed '1d;$d'
}

get_meta_json() {
    local filepath="$1"
    local full_path="$KNOWLEDGE_BASE_DIR/$filepath"

    if [ ! -f "$full_path" ]; then
        echo '{}' >&2
        return 1
    fi

    local yaml_content
    yaml_content=$(sed -n '/^---$/,/^---$/p' "$full_path" | sed '1d;$d')

    if command -v yq >/dev/null 2>&1; then
        echo "$yaml_content" | yq -o=json '.'
    else
        # Fallback: basic parsing without yq
        local title category tags owner updated source
        title=$(echo "$yaml_content" | sed -n 's/^title: *"\(.*\)"/\1/p')
        category=$(echo "$yaml_content" | sed -n 's/^category: *\(.*\)$/\1/p')
        tags=$(echo "$yaml_content" | sed -n 's/^tags: *\(.*\)$/\1/p')
        owner=$(echo "$yaml_content" | sed -n 's/^owner: *"\(.*\)"/\1/p')
        updated=$(echo "$yaml_content" | sed -n 's/^last_updated: *"\(.*\)"/\1/p')
        source=$(echo "$yaml_content" | sed -n 's/^source: *\(.*\)$/\1/p')

        jq -n --arg title "$title" \
              --arg category "$category" \
              --arg tags "$tags" \
              --arg owner "$owner" \
              --arg updated "$updated" \
              --arg source "$source" \
              '{title: $title, category: $category, tags: $tags, owner: $owner, last_updated: $updated, source: $source}'
    fi
}
