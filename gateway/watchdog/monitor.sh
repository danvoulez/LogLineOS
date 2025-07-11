#!/bin/bash
# Check health of registered backends
set -e
for backend in $(find ../tenants -path '*/backend' -type d); do
  url="http://$(basename $(dirname $backend)).local/health"
  if ! curl -fs --max-time 2 "$url" >/dev/null; then
    echo "{\"app\":\"$backend\",\"status\":\"down\",\"timestamp\":\"$(date -u +%FT%T)\"}" >> $(dirname "$0")/dead_apps.jsonl
  else
    echo "{\"app\":\"$backend\",\"timestamp\":\"$(date -u +%FT%T)\"}" > $(dirname "$0")/last_heartbeat.jsonl
  fi
done
