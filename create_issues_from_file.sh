#!/usr/bin/env zsh
# create_issues_from_file.sh
# Usage: ./create_issues_from_file.sh github_issues.md owner/repo
# Requires: gh CLI (https://cli.github.com/) already authenticated (gh auth login)

INPUT_FILE="${1:-github_issues.md}"
REPO="${2:?Usage: $0 <input-file> <owner/repo>}"

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "File not found: $INPUT_FILE"
  exit 1
fi
 # More robust: split by lines starting with 'Issue:' (fallback) and by '---' separators.
TMPDIR="$(mktemp -d)"
awk -v outdir="$TMPDIR" '
  /^---[[:space:]]*$/ {next} 
  /^Issue:/ { if (f) close(f); f = outdir "/issue_" ++i; print > f; next } 
  { if (f) print >> f }
' "$INPUT_FILE"

COUNT=$(ls -1 "$TMPDIR" | wc -l)
if [[ "$COUNT" -eq 0 ]]; then
  echo "No issue blocks found in $INPUT_FILE"
  rm -rf "$TMPDIR"
  exit 0
fi

echo "Found $COUNT issue blocks. Creating issues in $REPO..."

for f in "$TMPDIR"/issue_*; do
  # Clean file and ensure it starts with Issue:
  sed -n '1,$p' "$f" > "$f.cleaned"

  title=$(grep -m1 '^Issue:' "$f.cleaned" | sed 's/^Issue:[[:space:]]*//; s/[[:space:]]*$//')
  if [[ -z "$title" ]]; then
    # fallback: first non-empty line
    title=$(grep -m1 -v '^[[:space:]]*$' "$f.cleaned")
  fi

  # Body: everything except the first line if it started with Issue:
  if grep -q '^Issue:' "$f.cleaned"; then
    body=$(sed '1d' "$f.cleaned")
  else
    body=$(cat "$f.cleaned")
  fi

  if [[ -z "$title" ]]; then
    echo "Skipping block $f: could not determine title."
    continue
  fi

  echo "Creating issue: $title"
  gh issue create --repo "$REPO" --title "$title" --body "$body" --label "P0"
  rc=$?
  if [[ $rc -ne 0 ]]; then
    echo "Failed to create issue: $title (exit $rc)"
  fi

  if [[ $rc -ne 0 ]]; then
    echo "Failed to create issue: $title (exit $rc)"
  fi
done

# Clean up
rm -rf "$TMPDIR"
echo "Done."
