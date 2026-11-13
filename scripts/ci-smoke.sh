#!/usr/bin/env bash
# Runs the black-box smoke test against a production build in three configurations
# (closed signup, open signup, TRUSTED_PROXY_HOPS=2), each on its own throwaway database.
#
# Prerequisites: a built app (`npm run build`), Postgres + MailHog reachable, psql + openssl installed.
# Environment:
#   SMOKE_PG_BASE   postgres URL without a database name, e.g. postgresql://postgres:postgres@localhost:5432
#   SMOKE_MAILHOG   MailHog API base (default http://localhost:8025)
#   SMOKE_SMTP_HOST / SMOKE_SMTP_PORT   MailHog SMTP (default localhost / 1025)
# Refuses to run against anything but a localhost database.
set -euo pipefail

BASE="${SMOKE_PG_BASE:?set SMOKE_PG_BASE}"
MAILHOG="${SMOKE_MAILHOG:-http://localhost:8025}"
SMTP_HOST="${SMOKE_SMTP_HOST:-localhost}"
SMTP_PORT="${SMOKE_SMTP_PORT:-1025}"
LOG_DIR="${SMOKE_LOG_DIR:-smoke-logs}"

case "$BASE" in
  *@localhost:*|*@127.0.0.1:*|*@postgres:*) ;;
  *@"${SMOKE_ALLOW_PG_HOST:-__none__}":*) ;;
  *) echo "Refusing to run: SMOKE_PG_BASE must point at localhost or the CI postgres service (or SMOKE_ALLOW_PG_HOST)." >&2; exit 2 ;;
esac

mkdir -p "$LOG_DIR"
FAILED=0
SERVER_PID=""

cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

run_mode() {
  local name="$1" port="$2"; shift 2
  local smoke_flags=() env_extra=()
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --env) env_extra+=("$2"); shift 2 ;;
      *) smoke_flags+=("$1"); shift ;;
    esac
  done

  local db="mixtape_validation_${name}"
  local db_url="${BASE}/${db}"
  echo "::group::smoke ${name}"
  psql "${BASE}/postgres" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${db}" -c "CREATE DATABASE ${db}" >/dev/null
  DATABASE_URL="$db_url" npx prisma db push --skip-generate >/dev/null

  env NODE_ENV=production DATABASE_URL="$db_url" \
    NEXTAUTH_URL="https://localhost:${port}" NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    EMAIL_SERVER_HOST="$SMTP_HOST" EMAIL_SERVER_PORT="$SMTP_PORT" EMAIL_SERVER_USER=ci EMAIL_SERVER_PASSWORD=ci \
    EMAIL_FROM=ci@example.test "${env_extra[@]}" \
    npx next start -p "$port" >"${LOG_DIR}/server-${name}.log" 2>&1 &
  SERVER_PID=$!

  for _ in $(seq 1 60); do
    curl -fsS -o /dev/null "http://localhost:${port}/login" 2>/dev/null && break
    sleep 1
  done

  if SMOKE_PSQL_URL="$db_url" node scripts/smoke-test.mjs "http://localhost:${port}" \
       --db "$db" --mailhog "$MAILHOG" "${smoke_flags[@]}" | tee "${LOG_DIR}/smoke-${name}.log"; then
    echo "smoke ${name}: OK"
  else
    echo "::error::smoke ${name} failed"; FAILED=1
  fi

  # The server log must not contain credentials, hashes, cookies or tokens.
  if grep -E -i '\$2[aby]\$[0-9]{2}\$|__Secure-next-auth|next-auth\.session-token|NEXTAUTH_SECRET=|Bearer [A-Za-z0-9._-]{20,}|@example\.test' \
       "${LOG_DIR}/server-${name}.log" >/dev/null; then
    echo "::error::server log for ${name} contains sensitive-looking data"; FAILED=1
  else
    echo "log hygiene ${name}: OK"
  fi

  kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; SERVER_PID=""
  psql "${BASE}/postgres" -c "DROP DATABASE IF EXISTS ${db}" >/dev/null
  echo "::endgroup::"
}

run_mode closed 3103
run_mode open   3104 --public-signup --env ALLOW_PUBLIC_SIGNUP=true
run_mode hops2  3105 --hops 2 --env TRUSTED_PROXY_HOPS=2

exit "$FAILED"
