#!/bin/sh
set -e

echo "Starting Kestrel Finance Corporate Lending Platform..."

# Ensure document storage folder exists
mkdir -p /app/storage/documents

# Cloud Run injects $PORT (e.g. 8080)
PORT="${PORT:-3000}"
export PORT
export HOSTNAME="0.0.0.0"

echo "Kestrel server listening on port $PORT..."
exec node server.js
