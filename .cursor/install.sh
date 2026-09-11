#!/usr/bin/env bash
# Cloud Agent install phase — idempotent repository bootstrap.
# Runs after the repo is checked out. Prepares Node deps and a LOCAL Postgres
# (dev stand-in for the production Railway Postgres). No secrets live here.
set -euo pipefail

# --- Node dependencies (pinned via pnpm-lock.yaml) ---------------------------
# CI=1 keeps pnpm from writing "approve builds" placeholders into the tracked
# pnpm-workspace.yaml, so the working tree stays clean.
corepack enable >/dev/null 2>&1 || true
CI=1 pnpm install --frozen-lockfile

# --- Local PostgreSQL server ------------------------------------------------
# Installed once; the snapshot/base keeps it. Per-boot startup lives in start.sh.
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

echo "[install] done"
