#!/bin/bash
set -e
cd "$(dirname "$0")"
if [ ! -f timeline/requests.jsonl ]; then
  mkdir -p timeline
  touch timeline/requests.jsonl
fi
exec go run ./runtime/server.go
