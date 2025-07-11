#!/bin/bash
set -e
pkill -f runtime/server.go || true
sleep 1
nohup ./launch_gateway.sh >/dev/null 2>&1 &
