#!/bin/sh
set -e

echo "Starting Kestrel Finance Corporate Lending Platform..."

# Ensure document storage folder exists
mkdir -p /app/storage/documents

# Ensure database is present in both root and prisma directories
if [ -f /app/prisma/dev.db ] && [ ! -f /app/dev.db ]; then
  cp /app/prisma/dev.db /app/dev.db
elif [ -f /app/dev.db ] && [ ! -f /app/prisma/dev.db ]; then
  cp /app/dev.db /app/prisma/dev.db
fi

# Cloud Run injects $PORT (e.g. 8080)
PORT="${PORT:-3000}"
export PORT
export HOSTNAME="0.0.0.0"

echo "Kestrel server listening on port $PORT..."
exec node server.js
