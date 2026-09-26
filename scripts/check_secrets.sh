#!/usr/bin/env bash
# Scan tracked files for anything that looks like a real credential.
# Run before every commit, and again before submitting.
set -uo pipefail

cd "$(dirname "$0")/.."

# A keyword followed by an assignment and a non-trivial value, or a key block.
ASSIGNED='(api[_-]?key|apikey|secret|passwd|password|token|access[_-]?key)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9._/+-]{8,}'
BLOCKS='(BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|ghp_[A-Za-z0-9]{20,})'

echo "Scanning for credentials..."
hits=$(grep -rIniE "$ASSIGNED|$BLOCKS" . \
  --exclude-dir=.git --exclude-dir=__pycache__ --exclude-dir=.venv \
  --exclude-dir=.pytest_cache \
  --exclude=check_secrets.sh --exclude=.env.example --exclude-dir=sample_app || true)

if [ -n "$hits" ]; then
  echo "POSSIBLE CREDENTIALS FOUND -- review each line before committing:"
  echo "$hits"
  exit 1
fi

if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo ".env is tracked by git. Remove it."
  exit 1
fi

echo "Clean."
