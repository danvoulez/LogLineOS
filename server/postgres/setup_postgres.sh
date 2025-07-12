#!/bin/bash
set -e
DSN="$1"
if [ -z "$DSN" ]; then
  echo "Usage: $0 <postgres-dsn>" >&2
  exit 1
fi
psql "$DSN" -f "$(dirname "$0")/schema.sql"
