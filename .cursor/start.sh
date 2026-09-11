#!/usr/bin/env bash
# Cloud Agent start phase — per-boot runtime reconciliation. Must be idempotent,
# reach a ready state, and then return (the dev server runs as a terminal).
set -euo pipefail

PGVER="$(ls /usr/lib/postgresql/ 2>/dev/null | sort -n | tail -1)"
if [ -z "${PGVER:-}" ]; then
  echo "[start] PostgreSQL not installed; run .cursor/install.sh first" >&2
  exit 1
fi

# --- Start the local Postgres cluster (idempotent) --------------------------
sudo pg_ctlcluster "$PGVER" main start 2>/dev/null || true
for _ in $(seq 1 30); do
  sudo -u postgres pg_isready -q 2>/dev/null && break
  sleep 1
done

# --- Ensure the dev role + database exist (idempotent) ----------------------
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='aibm'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE aibm LOGIN PASSWORD 'aibm' CREATEDB SUPERUSER;"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='aibm'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE aibm OWNER aibm;"

# --- Local dev environment file (LOCAL values only — never real secrets) -----
# .env.local is gitignored. The dev server auto-loads it; the worker reads the
# same vars. Replace RESEND/AIBY values with real ones only if you need to
# exercise email sending or the Comunidad dashboard.
DB_URL="postgres://aibm:aibm@127.0.0.1:5432/aibm"
if [ ! -f .env.local ]; then
  cat > .env.local <<EOF
DATABASE_URL=${DB_URL}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_local_dev_dummy_key
NEWSLETTER_FROM=The Build Log <hola@aibuilders.mx>
NEWSLETTER_REPLY_TO=
ADMIN_SEED_EMAIL=admin@aibuilders.mx
ADMIN_SEED_PASSWORD=dev-admin-password
AIBY_API_BASE=
AIBY_API_KEY=
EOF
fi

# --- Schema migrations + admin seed (idempotent) ----------------------------
export DATABASE_URL="${DB_URL}"
pnpm db:migrate
ADMIN_SEED_EMAIL="admin@aibuilders.mx" ADMIN_SEED_PASSWORD="dev-admin-password" \
  pnpm db:seed-admin || true

echo "[start] ready — Postgres up, schema migrated, admin seeded"
