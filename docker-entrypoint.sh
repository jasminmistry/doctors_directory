#!/bin/sh
set -e

# Volume mount replaces /app/uploads at runtime. Recreate writable dirs for appuser.
mkdir -p /app/uploads/images /app/uploads/verification

npm run db:migrate

exec "$@"
