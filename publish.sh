#!/usr/bin/env bash
# Commit and push. GitHub Actions builds and deploys.
set -euo pipefail
MSG="${1:-new entry}"
git add -A
git commit -m "$MSG"
git push
echo "Pushed. Watch the build: repo -> Actions tab. Live in ~1 minute."
