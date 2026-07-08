#!/bin/sh
set -eu

CONTENT_DIR="${DOCS_CONTENT_DIR:-/app/content}"
DEFAULT_CONTENT_DIR="${DOCS_DEFAULT_CONTENT_DIR:-/app/default-content}"

mkdir -p "$CONTENT_DIR"

if [ -d "$DEFAULT_CONTENT_DIR" ] && ! find "$CONTENT_DIR" -type f -name '*.mdx' -print -quit | grep -q .; then
  echo "Seeding Kaya documentation content into $CONTENT_DIR"
  cp -R "$DEFAULT_CONTENT_DIR"/. "$CONTENT_DIR"/
fi

exec "$@"
