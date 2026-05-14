#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"
WEB_DIR="$ROOT_DIR/apps/web"
SERVER_ADDR="${EASEFTP_SERVER_ADDR:-:8080}"
WEB_PORT="${EASEFTP_WEB_PORT:-5173}"
STORAGE_ROOT="${EASEFTP_STORAGE_ROOT:-$ROOT_DIR/data/storage}"
SERVER_URL="http://localhost${SERVER_ADDR}"

server_pid=""
web_pid=""

cleanup() {
  trap - EXIT INT TERM

  for pid in "$web_pid" "$server_pid"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd "$SERVER_DIR"
EASEFTP_SERVER_ADDR="$SERVER_ADDR" EASEFTP_STORAGE_ROOT="$STORAGE_ROOT" go run ./cmd/easeftp-server &
server_pid=$!

cd "$WEB_DIR"
npm run dev -- --host 0.0.0.0 --port "$WEB_PORT" &
web_pid=$!

echo "EaseFTP preview is running."
echo "Frontend: http://localhost:$WEB_PORT"
echo "Backend:  $SERVER_URL"
echo "Storage:  $STORAGE_ROOT"
echo "Press Ctrl+C to stop."

wait -n "$server_pid" "$web_pid"
