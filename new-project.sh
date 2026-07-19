#!/usr/bin/env bash
# Create a new project.  Usage: ./new-project.sh my-project-slug
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./new-project.sh <slug>    e.g. ./new-project.sh mars-rover-autonomy" >&2
  exit 1
fi

SLUG=$(echo "$1" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')
DIR="content/projects/$SLUG"

if [ -d "$DIR" ]; then
  echo "$DIR already exists." >&2
  exit 1
fi

hugo new content "projects/$SLUG/index.md"

cat <<MSG

Created $DIR/index.md

  1. Drop images into  $DIR/
       cover.jpg        -> the card thumbnail on the home + /projects pages
       anything.png     -> {{< img src="anything.png" alt="..." >}}
  2. Write it. Fill in 'summary' and 'tech'. Add 'repo' for a GitHub button.
  3. Set  weight  to order it (lower = earlier), and  draft = false
  4. ./publish.sh "short commit message"

MSG
