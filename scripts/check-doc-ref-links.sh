#!/usr/bin/env bash

set -euo pipefail

repo_root="$(CDPATH='' cd "$(dirname "$0")/.." && pwd)"
docs_dir="$repo_root/docs"

if [[ ! -d "$docs_dir" ]]; then
    echo "No docs/ directory found; skipping reference-style link check."
    exit 0
fi

if ! command -v rg >/dev/null 2>&1; then
    echo "ERROR: ripgrep (rg) is required for scripts/check-doc-ref-links.sh" >&2
    exit 1
fi

doc_files=()
while IFS= read -r file; do
    doc_files+=("$file")
done < <(find "$docs_dir" -type f -name '*.md' | sort)

if [[ ${#doc_files[@]} -eq 0 ]]; then
    echo "No Markdown files found under docs/; skipping reference-style link check."
    exit 0
fi

status=0

for file in "${doc_files[@]}"; do
    tmp_output="$(mktemp)"
    if rg -nP '\[[^]]+\]\((?!https?://|mailto:|#)[^)]+\)' "$file" >"$tmp_output" 2>/dev/null; then
        echo "ERROR: inline relative Markdown links are not allowed in $file" >&2
        cat "$tmp_output" >&2
        status=1
    fi
    rm -f "$tmp_output"
done

if [[ $status -ne 0 ]]; then
    echo "Use reference-style links in docs/ Markdown files." >&2
    exit $status
fi

echo "Reference-style link check passed."
