#!/usr/bin/env bash
# Build and run the production standalone server.
# next.config.ts uses output: 'standalone', so "next start" is unsupported and
# static/public assets must be copied into .next/standalone before starting.
set -euo pipefail

cd "$(dirname "$0")"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5433/cv_maker}"
export JWT_SECRET="${JWT_SECRET:-dev-local-secret-key-change-me-0123456789abcdef}"
export JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"
export NODE_ENV=production
export PORT="${PORT:-3100}"
# Bash presets HOSTNAME to the machine name, so take the bind address from HOST
# and forward it as HOSTNAME, which is what the standalone server reads.
export HOSTNAME="${HOST:-0.0.0.0}"

npm run build

rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

exec node .next/standalone/server.js