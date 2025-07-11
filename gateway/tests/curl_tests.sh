#!/bin/bash
set -e
BASE_URL="http://localhost:8080/voulezvous/ping_app"

echo "Starting gateway..."
../launch_gateway.sh &
PID=$!
sleep 2

function cleanup {
  kill $PID
}
trap cleanup EXIT

curl -H "Authorization: Bearer abc123" "$BASE_URL" && echo
curl -H "Authorization: Bearer bad" "$BASE_URL" && echo

kill $PID
sleep 1

echo "Simulating app error"
mkdir -p tmp
mv ../apps/ping_app/handle_request.sh tmp/
../launch_gateway.sh &
PID=$!
sleep 2
curl -H "Authorization: Bearer abc123" "$BASE_URL" && echo
kill $PID
mv tmp/handle_request.sh ../apps/ping_app/
rm -r tmp
