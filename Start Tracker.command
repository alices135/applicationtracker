#!/bin/bash
cd "$(dirname "$0")"
PORT=8420

if ! lsof -i tcp:$PORT >/dev/null 2>&1; then
  python3 -m http.server $PORT >/dev/null 2>&1 &
  sleep 1
fi

open "http://localhost:$PORT"
