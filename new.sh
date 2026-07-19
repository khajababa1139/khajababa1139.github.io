#!/usr/bin/env bash
# Create a new log entry.  Usage: ./new.sh my-post-slug
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./new.sh <slug>    e.g. ./new.sh reading-serial-data" >&2
  exit 1
fi

SLUG=$(echo "$1" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')
DIR="content/posts/$SLUG"

if [ -d "$DIR" ]; then
  echo "$DIR already exists." >&2
  exit 1
fi

hugo new content "posts/$SLUG/index.md"

cat <<MSG

Created $DIR/index.md

  1. Drop images into  $DIR/
       cover.jpg        -> showcase card + social preview
       anything.png     -> {{< img src="anything.png" alt="..." >}}
       gallery-01.jpg   -> {{< gallery >}}
  2. Write. Fill in 'summary'. Add 'tags'.
  3. Set  draft = false
  4. ./publish.sh "short commit message"

MSG
