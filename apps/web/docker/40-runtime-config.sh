#!/bin/sh

set -eu

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

app_env="$(json_escape "${APP_ENV:-production}")"
base_url="$(json_escape "${BASE_URL:-}")"
api_base_url="$(json_escape "${API_BASE_URL:-}")"

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__ONBOARDING_RUNTIME_CONFIG__ = {
  APP_ENV: "${app_env}",
  BASE_URL: "${base_url}",
  API_BASE_URL: "${api_base_url}"
};
EOF
