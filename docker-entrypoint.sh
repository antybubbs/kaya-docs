#!/bin/sh
set -eu

CONTENT_DIR="${DOCS_CONTENT_DIR:-/app/content}"
DEFAULT_CONTENT_DIR="${DOCS_DEFAULT_CONTENT_DIR:-/app/default-content}"
DATA_DIR="${DOCS_DATA_DIR:-/app/data}"

mkdir -p "$CONTENT_DIR"
mkdir -p "$DATA_DIR"
chown -R nextjs:nodejs "$CONTENT_DIR" "$DATA_DIR"

if [ -d "$DEFAULT_CONTENT_DIR" ]; then
  echo "Syncing new Kaya documentation pages into $CONTENT_DIR"
  find "$DEFAULT_CONTENT_DIR" -type f -name '*.mdx' | while IFS= read -r source_file; do
    relative_path="${source_file#"$DEFAULT_CONTENT_DIR"/}"
    destination_file="$CONTENT_DIR/$relative_path"

    if [ ! -f "$destination_file" ]; then
      mkdir -p "$(dirname "$destination_file")"
      cp "$source_file" "$destination_file"
    fi
  done
  chown -R nextjs:nodejs "$CONTENT_DIR"
fi

exec su-exec nextjs "$@"
