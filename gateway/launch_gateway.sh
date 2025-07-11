#!/bin/bash
set -e
(cd gateway/watchdog && ./monitor.sh &)
logline run gateway/contracts/gateway_router.logline
