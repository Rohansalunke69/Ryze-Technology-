#!/usr/bin/env bash
set -euo pipefail

WATCH_MODE=false
INTERVAL_SECONDS="${AUTO_COMMIT_INTERVAL:-60}"

if [[ "${1:-}" == "--watch" ]]; then
  WATCH_MODE=true
fi

commit_and_push() {
  local branch
  branch="$(git branch --show-current)"

  if [[ -z "$branch" ]]; then
    echo "Could not detect the current Git branch."
    return 1
  fi

  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "No GitHub remote named 'origin' is configured."
    echo "Add one with: git remote add origin <your-github-repo-url>"
    return 1
  fi

  git add --all

  if git diff --cached --quiet; then
    echo "No changes to commit."
    return 0
  fi

  local timestamp
  timestamp="$(date '+%Y-%m-%d %H:%M:%S %z')"

  git commit -m "auto: save changes ${timestamp}"
  git push -u origin "$branch"
}

if [[ "$WATCH_MODE" == true ]]; then
  echo "Watching for changes. Interval: ${INTERVAL_SECONDS}s"
  echo "Press Ctrl+C to stop."

  while true; do
    commit_and_push || true
    sleep "$INTERVAL_SECONDS"
  done
fi

commit_and_push
