#!/usr/bin/env bash
# Cloud Agent install phase — idempotent repository bootstrap.
# Runs after the repo is checked out. Prepares Node deps and a LOCAL Postgres
# (dev stand-in for the production Railway Postgres). No secrets live here.
set -euo pipefail

# --- Node dependencies (pinned via pnpm-lock.yaml) ---------------------------
# Build-script decisions for sharp/msw/unrs-resolver are declared in
# pnpm-workspace.yaml (allowBuilds), so pnpm 12 installs cleanly and does not
# rewrite that file.
corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile

# --- Local PostgreSQL server ------------------------------------------------
# Installed once; the snapshot/base keeps it. Per-boot startup lives in start.sh.
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

echo "[install] done"
